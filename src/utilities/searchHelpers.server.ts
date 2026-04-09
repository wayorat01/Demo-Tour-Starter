import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
// ⚡ Re-export the cached version — replaces the old duplicate getSearchOptionsServer()
export { getCachedSearchOptions as getSearchOptionsServer } from './getSearchOptions'

export function mapProgramTourToCard(doc: any) {
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

export async function searchProgramToursServer(sp: URLSearchParams) {
  const getCachedSearch = unstable_cache(
    async (searchParamsStr: string) => {
      try {
        const payload = await getPayload({ config: configPromise })
        const parsedSp = new URLSearchParams(searchParamsStr)
        const country = parsedSp.get('country') || ''
        const countrySlug = parsedSp.get('countrySlug') || ''
        const city = parsedSp.get('city') || ''
        const citySlug = parsedSp.get('citySlug') || ''
        const airline = parsedSp.get('airline') || ''
        const tourCode = parsedSp.get('tourCode') || ''
        const priceMin = Number(parsedSp.get('priceMin') || '0')
        const priceMax = Number(parsedSp.get('priceMax') || '0')
        const sortby = parsedSp.get('sortby') || parsedSp.get('sort') || ''
        const pagesize = Number(parsedSp.get('pagesize') || '12')
        const pagenumber = Number(parsedSp.get('pagenumber') || parsedSp.get('page') || '1')
        const festival = parsedSp.get('festival') || ''
        const month = parsedSp.get('month') || ''
        const dateFrom = parsedSp.get('dateFrom') || ''
        const dateTo = parsedSp.get('dateTo') || ''
        const wholesale = parsedSp.get('wholesale') || ''

        const where: any = {}
        const andConds: any[] = []

        // Country filter: slug takes priority, then name
        if (countrySlug) {
          andConds.push({ countrySlug: { equals: countrySlug } })
        } else if (country) {
          andConds.push({ countryName: { contains: country } })
        }
        // City filter
        if (citySlug) {
          andConds.push({ citySlug: { equals: citySlug } })
        } else if (city) {
          andConds.push({ cityName: { contains: city } })
        }
        // Airline filter: search box sends airline NAME
        if (airline) {
          andConds.push({ airlineName: { contains: airline } })
        }
        if (tourCode) {
          andConds.push({
            or: [
              { productCode: { contains: tourCode } },
              { productName: { contains: tourCode } },
              { titlePackage: { contains: tourCode } },
              { highlight: { contains: tourCode } },
              { destination: { contains: tourCode } },
              { food: { contains: tourCode } },
            ],
          })
        }
        if (priceMin > 0) andConds.push({ priceProduct: { greater_than_equal: priceMin } })
        if (priceMax > 0) andConds.push({ priceProduct: { less_than_equal: priceMax } })
        // Festival filter (single, from search box) — look up slug from name
        if (festival && !parsedSp.get('festivals')) {
          const festivalResult = await payload.find({
            collection: 'festivals',
            where: { nameHoliday: { equals: festival } },
            limit: 1,
            depth: 0,
            locale: 'th' as any,
          })
          const festivalSlug = (festivalResult.docs[0] as any)?.slugHoliday
          if (festivalSlug) {
            andConds.push({ festivals: { contains: festivalSlug } })
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
            andConds.push({ periodStart: { contains: MONTHS_TH_ABBR[monthIdx] } })
          }
        }
        // Date range filter
        if (dateFrom) {
          andConds.push({ 'periods.periodStartValue': { greater_than_equal: dateFrom } })
        }
        if (dateTo) {
          andConds.push({ 'periods.periodStartValue': { less_than_equal: dateTo } })
        }
        // Wholesale filter — match against supplierName
        if (wholesale) {
          andConds.push({ supplierName: { contains: wholesale } })
        }

        // Sidebar: multiple airlines
        const airlinesArray = (parsedSp.get('airlines') || '').split(',').filter(Boolean)
        if (airlinesArray.length > 0) {
          andConds.push({ airlineCode: { in: airlinesArray } })
        }

        // Sidebar: multiple festivals
        const festivalsArray = (parsedSp.get('festivals') || '').split(',').filter(Boolean)
        if (festivalsArray.length > 0) {
          andConds.push({ or: festivalsArray.map((f) => ({ festivals: { contains: f } })) })
        }

        const categoriesArray = (parsedSp.get('categories') || '').split(',').filter(Boolean)
        if (categoriesArray.length > 0) {
          andConds.push({ 'category.id': { in: categoriesArray } })
        }

        const countriesArray = (parsedSp.get('countries') || '').split(',').filter(Boolean)
        if (countriesArray.length > 0) {
          andConds.push({ or: countriesArray.map((c) => ({ countryName: { contains: c } })) })
        }

        const citiesArray = (parsedSp.get('cities') || '').split(',').filter(Boolean)
        if (citiesArray.length > 0) {
          andConds.push({ or: citiesArray.map((c) => ({ 'cities.city': { contains: c } })) })
        }

        const durationDaysArray = (parsedSp.get('durationDays') || '')
          .split(',')
          .map(Number)
          .filter((n) => n > 0)
        if (durationDaysArray.length > 0) {
          andConds.push({ stayDay: { in: durationDaysArray } })
        }

        const hotelStarsArray = (parsedSp.get('hotelStars') || '').split(',').filter(Boolean)
        if (hotelStarsArray.length > 0) {
          andConds.push({ hotelStar: { in: hotelStarsArray } })
        }

        // Months sidebar filter
        const monthsArray = (parsedSp.get('months') || '').split(',').filter(Boolean)
        if (monthsArray.length > 0) {
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
          const monthConds = monthsArray
            .map((m) => {
              const idx = MONTHS_TH_FULL.indexOf(m)
              return idx >= 0 ? { periodStart: { contains: MONTHS_TH_ABBR[idx] } } : null
            })
            .filter(Boolean)
          if (monthConds.length > 0) {
            andConds.push({ or: monthConds })
          }
        }

        if (andConds.length > 0) where.and = andConds

        let sort = '-priceProduct'
        if (sortby === 'price') sort = 'priceProduct'
        else if (sortby === 'pricedesc') sort = '-priceProduct'

        const result = await payload.find({
          collection: 'program-tours',
          where,
          sort,
          limit: pagesize,
          page: pagenumber,
          depth: 0,
          locale: 'th' as any,
        })

        const mappedProducts = result.docs.map(mapProgramTourToCard)
        const totalPeriods = result.docs.reduce(
          (acc: number, doc: any) => acc + (doc.periods || []).length,
          0,
        )

        return {
          success: true,
          data: mappedProducts,
          pagination: {
            page: result.page,
            limit: pagesize,
            totalResults: result.totalDocs,
            totalPeriods,
            totalPages: result.totalPages,
          },
        }
      } catch (e) {
        return { success: false, data: [] }
      }
    },
    ['search_program_tours_server'],
    { tags: ['search_program_tours', 'search', 'program-tours'], revalidate: 3600 }
  )

  return getCachedSearch(sp.toString())
}
