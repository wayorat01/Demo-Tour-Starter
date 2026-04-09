import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = req.nextUrl

    // Parse query params
    const country = searchParams.get('country') || ''
    const city = searchParams.get('city') || ''
    const tourCode = searchParams.get('tourCode') || '' // also searches tags
    const tagId = searchParams.get('tagId') || '' // filter by tag ID
    const categoryId = searchParams.get('categoryId') || '' // filter by category ID
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''
    const month = searchParams.get('month') || ''
    const priceMin = Number(searchParams.get('priceMin')) || 0
    const priceMax = Number(searchParams.get('priceMax')) || 0
    const airline = searchParams.get('airline') || ''
    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit')) || 12))
    const sort = searchParams.get('sort') || '' // 'price-asc' | 'price-desc'

    // New filter params (multi-select, comma-separated)
    const durationDays = searchParams.get('durationDays') || '' // e.g. "5,6,7"
    const hotelStar = searchParams.get('hotelStar') || '' // e.g. "3,4,5"
    const cities = searchParams.get('cities') || '' // e.g. "โตเกียว,ปารีส"
    const festival = searchParams.get('festival') || '' // festival tag name
    const months = searchParams.get('months') || '' // multi-select months e.g. "มกราคม,กุมภาพันธ์"
    const airlines = searchParams.get('airlines') || '' // multi-select airlines
    const countries = searchParams.get('countries') || '' // multi-select countries
    const categories = searchParams.get('categories') || '' // multi-select category IDs

    // Fetch all intertours with populated tags
    const whereConditions: any = {
      isActive: { equals: true },
      ...(country ? { title: { like: country } } : {}),
      ...(categoryId ? { category: { equals: categoryId } } : {}),
    }

    // Multi-select category filter
    if (categories) {
      const catIds = categories.split(',').filter(Boolean)
      if (catIds.length > 0) {
        whereConditions.category = { in: catIds }
      }
    }

    // DB-level nested filters for tourPrograms removed. Expected to query new collections appropriately.

    const result = await payload.find({
      collection: 'intertours',
      limit: 0, // get all
      depth: 1, // populate tags & category
      where: whereConditions,
      context: { skipCount: true },
    })

    // Flatten tourPrograms from all intertours
    type FlatProgram = {
      parentTitle: string
      parentSlug: string
      parentCategory: any
      parentCities: string[]
      program: any
    }

    let flatPrograms: FlatProgram[] = []

    for (const tour of result.docs) {
      const programs = (tour as any).tourPrograms || []
      const tourCities = ((tour as any).cities || [])
        .map((c: any) => (typeof c === 'object' ? c.cityName : c))
        .filter(Boolean)
      for (const program of programs) {
        flatPrograms.push({
          parentTitle: (tour as any).title || '',
          parentSlug: (tour as any).slug || '',
          parentCategory: (tour as any).category || null,
          parentCities: tourCities,
          program,
        })
      }
    }

    // Filter by tag ID
    if (tagId) {
      flatPrograms = flatPrograms.filter((item) => {
        const tags = item.program.tags || []
        return tags.some((tag: any) => {
          const id = typeof tag === 'object' ? tag.id : tag
          return id === tagId
        })
      })
    }

    // Filter by tourCode / tags
    if (tourCode) {
      const query = tourCode.toLowerCase()
      flatPrograms = flatPrograms.filter((item) => {
        const codeMatch = (item.program.tourCode || '').toLowerCase().includes(query)
        const titleMatch = (item.program.tourTitle || '').toLowerCase().includes(query)

        // Search in tags (populated objects)
        const tags = item.program.tags || []
        const tagMatch = tags.some((tag: any) => {
          const tagTitle = typeof tag === 'object' ? tag.title : ''
          return (tagTitle || '').toLowerCase().includes(query)
        })

        return codeMatch || titleMatch || tagMatch
      })
    }

    // Filter by airline (single)
    if (airline) {
      flatPrograms = flatPrograms.filter(
        (item) => (item.program.airlineName || '').toLowerCase() === airline.toLowerCase(),
      )
    }

    // Filter by airlines (multi-select)
    if (airlines) {
      const airlineList = airlines
        .split(',')
        .filter(Boolean)
        .map((a) => a.toLowerCase())
      if (airlineList.length > 0) {
        flatPrograms = flatPrograms.filter((item) =>
          airlineList.includes((item.program.airlineName || '').toLowerCase()),
        )
      }
    }

    // Filter by countries (multi-select)
    if (countries) {
      const countryList = countries
        .split(',')
        .filter(Boolean)
        .map((c) => c.toLowerCase())
      if (countryList.length > 0) {
        flatPrograms = flatPrograms.filter(
          (item) =>
            countryList.includes((item.parentTitle || '').toLowerCase()) ||
            countryList.includes((item.program.countryName || '').toLowerCase()),
        )
      }
    }

    // Filter by city (single)
    if (city) {
      flatPrograms = flatPrograms.filter((item) => {
        const programCities = item.program.cities || []
        return programCities.some((pc: any) => (pc.city || '').toLowerCase() === city.toLowerCase())
      })
    }

    // Filter by cities (multi-select)
    if (cities) {
      const cityList = cities
        .split(',')
        .filter(Boolean)
        .map((c) => c.toLowerCase())
      if (cityList.length > 0) {
        flatPrograms = flatPrograms.filter((item) => {
          const programCities = item.program.cities || []
          return programCities.some((pc: any) => cityList.includes((pc.city || '').toLowerCase()))
        })
      }
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      const from = dateFrom ? new Date(dateFrom) : null
      const to = dateTo ? new Date(dateTo) : null

      flatPrograms = flatPrograms.filter((item) => {
        const periods = item.program.travelPeriods || []
        return periods.some((period: any) => {
          const pStart = period.startDate ? new Date(period.startDate) : null
          const pEnd = period.endDate ? new Date(period.endDate) : null
          if (!pStart) return false

          // Check overlap: program period overlaps with search range
          if (from && pEnd && pEnd < from) return false
          if (to && pStart > to) return false
          return true
        })
      })
    }

    // Filter by month (single - legacy)
    if (month) {
      const MONTHS_TH = [
        'มกราคม',
        'กุมภาพันธ์',
        'มีนาคม',
        'เมษายน',
        'พฤษภาคม',
        'มิถุนายน',
        'กรกฎาคม',
        'สิงหาคม',
        'กันยายน',
        'ตุลาคม',
        'พฤศจิกายน',
        'ธันวาคม',
      ]
      const monthIndex = MONTHS_TH.indexOf(month) // 0-based
      if (monthIndex >= 0) {
        flatPrograms = flatPrograms.filter((item) => {
          const periods = item.program.travelPeriods || []
          return periods.some((period: any) => {
            if (!period.startDate) return false
            return new Date(period.startDate).getMonth() === monthIndex
          })
        })
      }
    }

    // Filter by months (multi-select)
    if (months) {
      const MONTHS_TH = [
        'มกราคม',
        'กุมภาพันธ์',
        'มีนาคม',
        'เมษายน',
        'พฤษภาคม',
        'มิถุนายน',
        'กรกฎาคม',
        'สิงหาคม',
        'กันยายน',
        'ตุลาคม',
        'พฤศจิกายน',
        'ธันวาคม',
      ]
      const monthNames = months.split(',').filter(Boolean)
      const monthIndices = monthNames.map((m) => MONTHS_TH.indexOf(m)).filter((i) => i >= 0)
      if (monthIndices.length > 0) {
        flatPrograms = flatPrograms.filter((item) => {
          const periods = item.program.travelPeriods || []
          return periods.some((period: any) => {
            if (!period.startDate) return false
            return monthIndices.includes(new Date(period.startDate).getMonth())
          })
        })
      }
    }

    // Filter by price range
    if (priceMin > 0 || priceMax > 0) {
      flatPrograms = flatPrograms.filter((item) => {
        const priceStr = (item.program.startPrice || '').replace(/[,]/g, '')
        const price = Number(priceStr)
        if (isNaN(price) || price === 0) return true // keep items without price
        if (priceMin > 0 && price < priceMin) return false
        if (priceMax > 0 && price > priceMax) return false
        return true
      })
    }

    // Filter by duration days (multi-select)
    if (durationDays) {
      const daysList = durationDays
        .split(',')
        .map(Number)
        .filter((n) => !isNaN(n) && n > 0)
      if (daysList.length > 0) {
        flatPrograms = flatPrograms.filter((item) => daysList.includes(item.program.stayDay || 0))
      }
    }

    // Filter by hotel star (multi-select)
    if (hotelStar) {
      const starList = hotelStar.split(',').filter(Boolean)
      if (starList.length > 0) {
        flatPrograms = flatPrograms.filter((item) =>
          starList.includes(item.program.hotelStar || ''),
        )
      }
    }

    // Filter by city (multi-select) — from InterTours.cities level
    if (city) {
      const cityList = city
        .split(',')
        .filter(Boolean)
        .map((c) => c.toLowerCase())
      if (cityList.length > 0) {
        flatPrograms = flatPrograms.filter((item) =>
          item.parentCities.some((c) => cityList.includes(c.toLowerCase())),
        )
      }
    }

    // Filter by festival (tag name match)
    if (festival) {
      const festivalList = festival
        .split(',')
        .filter(Boolean)
        .map((f) => f.toLowerCase())
      if (festivalList.length > 0) {
        flatPrograms = flatPrograms.filter((item) => {
          const tags = item.program.tags || []
          return tags.some((tag: any) => {
            const tagTitle = (typeof tag === 'object' ? tag.title : '').toLowerCase()
            return festivalList.some((f) => tagTitle.includes(f))
          })
        })
      }
    }

    // Sort
    if (sort === 'price-asc' || sort === 'price-desc') {
      flatPrograms.sort((a, b) => {
        const priceA = Number((a.program.startPrice || '0').replace(/[,]/g, ''))
        const priceB = Number((b.program.startPrice || '0').replace(/[,]/g, ''))
        return sort === 'price-asc' ? priceA - priceB : priceB - priceA
      })
    }

    // Pagination & Counts
    const totalResults = flatPrograms.length
    let totalPeriods = 0
    for (const item of flatPrograms) {
      const periods = item.program.travelPeriods || []
      totalPeriods += periods.length
    }
    const totalPages = Math.ceil(totalResults / limit)
    const startIndex = (page - 1) * limit
    const paginatedResults = flatPrograms.slice(startIndex, startIndex + limit)

    return NextResponse.json({
      success: true,
      data: paginatedResults,
      pagination: {
        page,
        limit,
        totalResults,
        totalPeriods,
        totalPages,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
