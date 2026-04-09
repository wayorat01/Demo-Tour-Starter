import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * GET /api/search-program-tours
 *
 * ดึง ProgramTours จาก Payload CMS พร้อม filter
 *
 * Query params:
 *   - country (optional): ชื่อประเทศ เช่น "ทัวร์เกาหลี"
 *   - city (optional): ชื่อเมือง
 *   - airline (optional): ชื่อสายการบิน
 *   - tourCode (optional): รหัสทัวร์ / ชื่อทัวร์ (ค้นหา)
 *   - tag (optional): ชื่อ tag (ค้นหาใน productTags JSON)
 *   - festival (optional): slug เทศกาล
 *   - priceMin (optional): ราคาต่ำสุด
 *   - priceMax (optional): ราคาสูงสุด
 *   - continent (optional): ทวีป
 *   - sortby (optional): price | pricedesc | name
 *   - pagesize (optional): default 12
 *   - pagenumber (optional): default 1
 */
export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = req.nextUrl

    const country = searchParams.get('country') || ''
    const countrySlug = searchParams.get('countrySlug') || ''
    const city = searchParams.get('city') || ''
    const citySlug = searchParams.get('citySlug') || ''
    const airline = searchParams.get('airline') || ''
    const airlines = searchParams.get('airlines') || '' // comma-separated for multiple
    const festival = searchParams.get('festival') || '' // single festival name (from search box)
    const festivals = searchParams.get('festivals') || '' // comma-separated slugHoliday (from sidebar)
    const tourCode = searchParams.get('tourCode') || ''
    const priceMin = Number(searchParams.get('priceMin') || '0')
    const priceMax = Number(searchParams.get('priceMax') || '0')
    const continent = searchParams.get('continent') || ''
    const tag = searchParams.get('tag') || ''
    const month = searchParams.get('month') || '' // Thai month name e.g. "มกราคม"
    const dateFrom = searchParams.get('dateFrom') || '' // ISO date e.g. "2026-03-01"
    const dateTo = searchParams.get('dateTo') || '' // ISO date e.g. "2026-03-31"
    const wholesale = searchParams.get('wholesale') || '' // supplier code e.g. "WFT"
    const sortby = searchParams.get('sortby') || ''
    const pagesize = Number(searchParams.get('pagesize') || '12')
    const pagenumber = Number(searchParams.get('pagenumber') || '1')

    // Build Payload where clause
    const where: any = {}
    const andConditions: any[] = []

    if (countrySlug) {
      andConditions.push({ countrySlug: { equals: countrySlug } })
    } else if (country) {
      andConditions.push({ countryName: { contains: country } })
    }
    if (citySlug) {
      andConditions.push({ citySlug: { equals: citySlug } })
    } else if (city) {
      andConditions.push({ cityName: { contains: city } })
    }
    // Airlines filter: support single or multiple (comma-separated) by airlineCode
    if (airlines) {
      const airlineList = airlines
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean)
      if (airlineList.length === 1) {
        andConditions.push({ airlineCode: { equals: airlineList[0] } })
      } else if (airlineList.length > 1) {
        andConditions.push({
          or: airlineList.map((a) => ({ airlineCode: { equals: a } })),
        })
      }
    } else if (airline) {
      // Search box sends airline NAME, so match against airlineName
      andConditions.push({ airlineName: { contains: airline } })
    }
    if (continent) {
      andConditions.push({ continent: { contains: continent } })
    }
    if (tourCode) {
      // ค้นหาจากรหัสทัวร์ หรือ ชื่อทัวร์
      andConditions.push({
        or: [
          { productCode: { contains: tourCode } },
          { productName: { contains: tourCode } },
          { destination: { contains: tourCode } },
        ],
      })
    }
    if (priceMin > 0) {
      andConditions.push({ priceProduct: { greater_than_equal: priceMin } })
    }
    if (priceMax > 0) {
      andConditions.push({ priceProduct: { less_than_equal: priceMax } })
    }
    // Festival filter (single, from search box) — look up slug from name
    if (festival && !festivals) {
      const festivalResult = await payload.find({
        collection: 'festivals',
        where: { nameHoliday: { equals: festival } },
        limit: 1,
        depth: 0,
      })
      const festivalSlug = (festivalResult.docs[0] as any)?.slugHoliday
      if (festivalSlug) {
        andConditions.push({ festivals: { contains: festivalSlug } })
      }
    }
    // Festivals filter (multiple, from sidebar): query ตรงจาก festivals field (json array)
    if (festivals) {
      const festivalSlugs = festivals
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean)
      if (festivalSlugs.length === 1) {
        andConditions.push({ festivals: { contains: festivalSlugs[0] } })
      } else if (festivalSlugs.length > 1) {
        andConditions.push({
          or: festivalSlugs.map((s) => ({ festivals: { contains: s } })),
        })
      }
    }
    // Month filter — periodStart stores Thai formatted dates like "11 เม.ย. 69"
    if (month) {
      const MONTHS_TH_FULL = [
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
      const MONTHS_TH_ABBR = [
        'ม.ค.',
        'ก.พ.',
        'มี.ค.',
        'เม.ย.',
        'พ.ค.',
        'มิ.ย.',
        'ก.ค.',
        'ส.ค.',
        'ก.ย.',
        'ต.ค.',
        'พ.ย.',
        'ธ.ค.',
      ]
      const monthIdx = MONTHS_TH_FULL.indexOf(month)
      if (monthIdx >= 0) {
        andConditions.push({ periodStart: { contains: MONTHS_TH_ABBR[monthIdx] } })
      }
    }
    // Date range filter — filter periods by periodStartValue (ISO dates in sub-array)
    if (dateFrom) {
      andConditions.push({ 'periods.periodStartValue': { greater_than_equal: dateFrom } })
    }
    if (dateTo) {
      andConditions.push({ 'periods.periodStartValue': { less_than_equal: dateTo } })
    }
    // Wholesale filter — match against supplierName
    if (wholesale) {
      andConditions.push({ supplierName: { contains: wholesale } })
    }
    // Tag filter: query ตรงจาก productTags JSON field
    if (tag) {
      andConditions.push({ productTags: { contains: tag } })
    }

    if (andConditions.length > 0) {
      where.and = andConditions
    }

    // Sort
    let sort = '-priceProduct' // default: ราคาสูงไปต่ำ
    if (sortby === 'price') sort = 'priceProduct'
    else if (sortby === 'pricedesc' || sortby === 'pricehightolow') sort = '-priceProduct'
    else if (sortby === 'name') sort = 'productName'
    else if (sortby === 'periodlowtohight') sort = 'periodStart'

    const result = await payload.find({
      collection: 'program-tours',
      where,
      sort,
      limit: pagesize,
      page: pagenumber,
      depth: 0,
    })

    // Map ProgramTour → CMS Card format
    const mappedProducts = result.docs.map(mapProgramTourToCard)

    // Count total periods
    let totalPeriods = 0
    for (const doc of result.docs) {
      totalPeriods += ((doc as any).periods || []).length
    }

    return NextResponse.json({
      success: true,
      data: mappedProducts,
      pagination: {
        page: result.page,
        limit: pagesize,
        totalResults: result.totalDocs,
        totalPeriods,
        totalPages: result.totalPages,
      },
    })
  } catch (error: any) {
    console.error('[search-program-tours] Error:', error)
    return NextResponse.json(
      { success: false, data: [], error: error.message || 'Internal error' },
      { status: 500 },
    )
  }
}

/**
 * Map ProgramTour document → CMS Card format (เหมือน mapApiProductToTourItemCMS)
 */
function mapProgramTourToCard(doc: any) {
  const hasDiscount =
    (doc.productDiscountDisplay || 0) > 0 &&
    (doc.productPriceBeforeDiscount || 0) > (doc.priceProduct || 0)

  const fakeMedia = (url: string | null | undefined, alt: string) =>
    url ? { url, alt, width: 800, height: 600 } : null

  const wrapLink = (url: string | null | undefined) =>
    url ? { type: 'url' as const, url, file: null } : null

  const dlBtn = doc.urlPdf ? 'pdf' : doc.urlWord ? 'word' : doc.urlBanner ? 'banner' : 'none'

  return {
    id: doc.id,
    tourTitle: doc.productName || '',
    tourCode: doc.productCode || '',
    coverImage: fakeMedia(doc.urlPic || doc.urlPicMultisize?.tourdetail, doc.productName || ''),
    countryName: doc.countryName || '',
    interTourSlug: doc.countrySlug || null,
    recommendedLabel: null,
    stayDay: doc.stayDay || 0,
    stayNight: doc.stayNight || 0,
    airlineName: doc.airlineName || '',
    airlineLogo: fakeMedia(doc.urlAirlinePic, doc.airlineName || ''),
    startPrice: (doc.priceProduct || 0).toLocaleString('en-US'),
    discountPrice: hasDiscount
      ? (doc.productPriceBeforeDiscount || 0).toLocaleString('en-US')
      : null,
    discountPercent:
      hasDiscount && (doc.productDiscountDisplay || 0) > 0 ? doc.productDiscountDisplay : null,
    tourDescription: doc.highlight || doc.destination || '',
    pdfLink: wrapLink(doc.urlPdf),
    wordLink: wrapLink(doc.urlWord),
    bannerLink: wrapLink(doc.urlBanner),
    toggleSettings: {
      showTourCode: true,
      showCountryTag: true,
      showRecommendedTag: false,
      showDuration: true,
      showAirline: true,
      showDescription: true,
      showTravelPeriod: true,
      showStartPrice: true,
      showDiscountPrice: hasDiscount,
      showDetailButton: true,
      cardDownloadButton: dlBtn,
      showPdfButton: !!doc.urlPdf,
      showWordButton: !!doc.urlWord,
      showBannerButton: !!doc.urlBanner,
    },
    travelPeriods: (doc.periods || []).map((p: any) => ({
      startDate: p.periodStartValue,
      endDate: p.periodEndValue,
      price: p.price,
      priceAdultTwin: p.priceAdultsDouble,
      priceAdultSingle: p.priceAdultsSingle,
      priceAdultTriple: p.priceAdultsTriple,
      priceChildWithBed: p.priceChildWithbed,
      priceChildNoBed: p.priceChildNobed,
      availableSeats: p.seatremain ?? p.numberSeats,
      groupSize: p.groupsize,
      isSoldOut: p.periodSoldout === 'true',
    })),
    highlights: { accommodation: [], food: [] },
    tags: doc.productTags || [],
    itinerary: [],
  }
}
