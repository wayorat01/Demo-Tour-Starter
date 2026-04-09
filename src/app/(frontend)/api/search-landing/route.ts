import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * GET /api/search-landing?slug=xxx&pagesize=12&pagenumber=1&sortby=...
 *
 * ดึง ProgramTours ที่เชื่อมกับ Custom Landing Page (by slug)
 * แล้วแปลงเป็น CMS TourItem format (เดียวกับ proxy-tour-products?format=cms)
 * เพื่อให้ CountrySearchResults component ใช้ได้ตรงๆ
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const slug = searchParams.get('slug') || ''
    const pagesize = Number(searchParams.get('pagesize') || '12')
    const pagenumber = Number(searchParams.get('pagenumber') || '1')
    const sortby = searchParams.get('sortby') || ''

    if (!slug) {
      return NextResponse.json({ success: false, data: [], error: 'Missing slug' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

    // 1. Find the landing page by slug
    const landingResult = await payload.find({
      collection: 'custom-landing-pages',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0, // programs จะเป็น ID array
    })

    const landingPage = landingResult.docs[0]
    if (!landingPage) {
      return NextResponse.json(
        { success: false, data: [], error: 'Landing page not found' },
        { status: 404 },
      )
    }

    // 2. Get program IDs
    const programIds = (landingPage.programs || []) as (string | number)[]
    if (programIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: { page: 1, limit: pagesize, totalResults: 0, totalPeriods: 0, totalPages: 0 },
      })
    }

    // 3. Query ProgramTours with pagination
    const offset = (pagenumber - 1) * pagesize

    // Build sort option
    let sortField = '-priceProduct' // default: price high to low
    if (sortby === 'price') sortField = 'priceProduct'
    if (sortby === 'periodlowtohight') sortField = 'periodStart'

    const programResult = await payload.find({
      collection: 'program-tours',
      where: {
        id: { in: programIds.map(String) },
      },
      limit: pagesize,
      page: pagenumber,
      sort: sortField,
      depth: 0,
    })

    // 4. Map ProgramTour DB records → CMS TourItem format
    const mappedData = programResult.docs.map((doc: any) => {
      const hasDiscount =
        (doc.productDiscountDisplay || 0) > 0 &&
        (doc.productPriceBeforeDiscount || 0) > (doc.priceProduct || 0)

      const fakeMedia = (url: string | null | undefined, alt: string) =>
        url ? { url, alt, width: 800, height: 600 } : null

      const wrapLink = (url: string | null | undefined) =>
        url ? { type: 'url' as const, url, file: null } : null

      const dlBtn = doc.urlPdf ? 'pdf' : doc.urlWord ? 'word' : doc.urlBanner ? 'banner' : 'none'

      return {
        id: String(doc.productId || doc.id),
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
          hasDiscount && doc.productDiscountDisplay > 0 ? doc.productDiscountDisplay : null,
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
          startDate: p.periodStartValue || '',
          endDate: p.periodEndValue || '',
          price: p.price || 0,
          priceAdultTwin: p.priceAdultsDouble || 0,
          priceAdultSingle: p.priceAdultsSingle || 0,
          priceAdultTriple: p.priceAdultsTriple || 0,
          priceChildWithBed: p.priceChildWithbed || 0,
          priceChildNoBed: p.priceChildNobed || 0,
          availableSeats: p.seatremain ?? p.numberSeats ?? 0,
          groupSize: p.groupsize || 0,
          isSoldOut: p.periodSoldout === 'true',
        })),
        highlights: { accommodation: [], food: [] },
        tags: [],
        itinerary: (doc.itinerary || []).map((it: any) => ({
          dayTitle: it.dayTitle || '',
          dayContent: it.dayContent || '',
        })),
      }
    })

    // Count total periods
    let totalPeriods = 0
    for (const item of mappedData) {
      totalPeriods += item.travelPeriods.length
    }

    return NextResponse.json({
      success: true,
      data: mappedData,
      pagination: {
        page: pagenumber,
        limit: pagesize,
        totalResults: programResult.totalDocs,
        totalPeriods,
        totalPages: programResult.totalPages,
      },
    })
  } catch (error) {
    console.error('[search-landing] Error:', error)
    return NextResponse.json({ success: false, data: [], error: 'Internal error' }, { status: 500 })
  }
}
