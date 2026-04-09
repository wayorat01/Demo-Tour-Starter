/**
 * Utility to fetch tour products from external API (cache.apiwow.softsq.com)
 * and map them to the TourItem shape used by wowtour_tourCard components.
 */

export interface ApiTourPeriod {
  period_id: number
  period_start: string
  period_start_value: string
  period_end: string
  period_end_value: string
  price: number
  price_adults_double: number
  price_adults_single: number
  price_adults_triple: number
  price_child_withbed: number
  price_child_nobed: number
  price_joinland: number
  number_seats: number
  groupsize: number
  seatremain: number
  period_soldout: string
  discount_display: number
  price_before_discount: number
  airlinecode: string
  url_airline_pic_icon: string | null
  deposit: number
  deposit_date: string
  number_deposit: number
}

export interface ApiTourProduct {
  product_id: number
  product_code: string
  product_name: string
  product_slug: string
  is_can_confirm: boolean
  title_package: string
  star_rating: number
  star_hotel: number
  url_pic: string
  url_pic_multisize: {
    tourdetail: string
    itemslide: string
    tourlist: string
  }
  highlight: string
  destination: string
  food: string
  stay_night: number
  stay_day: number
  periods: ApiTourPeriod[]
  airlinecode: string
  url_airline_pic: string
  airline_name: string
  price_product: number
  price_amount_call_discount: number
  discountpercent: string
  period_start: string
  country_name: string
  country_slug: string
  city_name: string
  city_slug: string
  url_pdf: string
  url_word: string
  url_banner: string
  soldout: string
  product_discount_display: number
  product_price_before_discount: number
  extended_properties2?: {
    visa?: string
    visaText?: string
    url_vdo?: string
    free_text?: string
    free_day?: string
  }
}

interface ApiResponse {
  success: string
  title?: string
  data:
    | {
        results: number
        results_period: number
        products: ApiTourProduct[]
      }
    | ApiTourProduct[]
}

export interface FetchTourProductsParams {
  apiEndPoint: string
  apiKey: string
  mode?: string
  lang?: string
  pagesize?: number
  pagenumber?: number
  sortby?: string
  country_slug?: string
  type?: string
}

/**
 * Fetch tour products from the external API.
 * Uses Next.js fetch with revalidation (5 minutes cache).
 * Supports both searchresultsproduct (data.products[]) and loadtourbytype (data[]) formats.
 * Returns both products and the API title (for loadtourbytype).
 */
export async function fetchTourProductsWithTitle(
  params: FetchTourProductsParams,
): Promise<{ products: ApiTourProduct[]; title: string | null }> {
  const {
    apiEndPoint,
    apiKey,
    mode = 'searchresultsproduct',
    lang = 'th',
    pagesize = 10,
    pagenumber = 1,
    sortby = 'pricehightolow',
    country_slug = '',
    type = '',
  } = params

  const url = new URL(apiEndPoint)
  url.searchParams.set('apikey', apiKey)
  url.searchParams.set('mode', mode)
  url.searchParams.set('lang', lang)
  url.searchParams.set('pagesize', String(pagesize))
  url.searchParams.set('pagenumber', String(pagenumber))
  url.searchParams.set('sortby', sortby)
  if (country_slug) url.searchParams.set('country_slug', country_slug)
  if (type) url.searchParams.set('type', type)

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      console.error(`[fetchTourProducts] API returned ${res.status}`)
      return { products: [], title: null }
    }

    const json: ApiResponse = await res.json()

    if (json.success !== 'True') {
      console.error('[fetchTourProducts] API response unsuccessful')
      return { products: [], title: null }
    }

    let products: ApiTourProduct[]
    if (Array.isArray(json.data)) {
      products = json.data
    } else if (
      json.data &&
      typeof json.data === 'object' &&
      'products' in json.data &&
      Array.isArray((json.data as any).products)
    ) {
      products = (json.data as any).products
    } else if (
      json.data == null ||
      (typeof json.data === 'object' && Object.keys(json.data).length === 0)
    ) {
      // API returned success but with no data — treat as empty result
      console.warn('[fetchTourProducts] API returned success but data is empty/null')
      return { products: [], title: json.title || null }
    } else {
      console.error(
        '[fetchTourProducts] Unexpected data format:',
        JSON.stringify(json.data).slice(0, 500),
      )
      return { products: [], title: null }
    }

    const normalized = products.map((p) => ({
      ...p,
      periods: p.periods || (p as any).period || [],
      price_product: p.price_product || p.price_amount_call_discount || 0,
      country_name: p.country_name || p.country_slug || '',
    }))

    return { products: normalized, title: json.title || null }
  } catch (error) {
    console.error('[fetchTourProducts] Failed to fetch:', error)
    return { products: [], title: null }
  }
}

/**
 * Backward-compatible wrapper: returns only products array.
 */
export async function fetchTourProducts(
  params: FetchTourProductsParams,
): Promise<ApiTourProduct[]> {
  const { products } = await fetchTourProductsWithTitle(params)
  return products
}

/**
 * A "tour item" shape compatible with the existing tour card components,
 * but using raw URLs instead of Payload Media objects.
 */
export interface ApiTourItem {
  id: string
  tourTitle: string
  coverImageUrl: string // Direct URL (not Media object)
  countryName: string
  tourCode: string
  productSlug: string
  countrySlug: string
  stayDay: number
  stayNight: number
  airlineName: string
  airlineLogoUrl: string // Direct URL (not Media object)
  startPrice: string
  discountPrice: string | null
  tourDescription: string
  pdfUrl: string | null
  wordUrl: string | null
  bannerUrl: string | null
  soldout: boolean
  travelPeriods: {
    startDate: string
    endDate: string
    price: number
    priceAdultTwin: number
    priceAdultSingle: number
    priceAdultTriple: number
    priceChildWithBed: number
    priceChildNoBed: number
    availableSeats: number
    groupSize: number
    isSoldOut: boolean
  }[]
}

/**
 * Map an API product to the ApiTourItem shape.
 */
export function mapApiProductToTourItem(product: ApiTourProduct): ApiTourItem {
  const hasDiscount =
    product.product_discount_display > 0 &&
    product.product_price_before_discount > product.price_product

  return {
    id: String(product.product_id),
    tourTitle: product.product_name,
    coverImageUrl: product.url_pic || product.url_pic_multisize?.tourdetail || '',
    countryName: product.country_name,
    tourCode: product.product_code,
    productSlug: product.product_slug,
    countrySlug: product.country_slug || '',
    stayDay: product.stay_day,
    stayNight: product.stay_night,
    airlineName: product.airline_name,
    airlineLogoUrl: product.url_airline_pic || '',
    startPrice: product.price_product.toLocaleString('en-US'),
    discountPrice: hasDiscount
      ? product.product_price_before_discount.toLocaleString('en-US')
      : null,
    tourDescription: product.highlight || product.destination || '',
    pdfUrl: product.url_pdf || null,
    wordUrl: product.url_word || null,
    bannerUrl: product.url_banner || null,
    soldout: product.soldout === 'true',
    travelPeriods: (product.periods || []).map((p) => ({
      startDate: p.period_start_value,
      endDate: p.period_end_value,
      price: p.price,
      priceAdultTwin: p.price_adults_double,
      priceAdultSingle: p.price_adults_single,
      priceAdultTriple: p.price_adults_triple,
      priceChildWithBed: p.price_child_withbed,
      priceChildNoBed: p.price_child_nobed,
      availableSeats: p.seatremain ?? p.number_seats,
      groupSize: p.groupsize,
      isSoldOut: p.period_soldout === 'true',
    })),
  }
}

/**
 * Map API product to CMS TourItem shape (compatible with Cards 1-6).
 * Creates fake Media objects, default toggleSettings (all true),
 * and wraps PDF/Word/Banner as link groups.
 */
export function mapApiProductToTourItemCMS(product: ApiTourProduct): any {
  const hasDiscount =
    product.product_discount_display > 0 &&
    product.product_price_before_discount > product.price_product

  // Capitalize country_slug as fallback for countryName
  const capitalizeSlug = (slug: string) =>
    slug ? slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ') : ''

  // Create fake Media-like object from URL
  const fakeMedia = (url: string | null | undefined, alt: string) =>
    url ? { url, alt, width: 800, height: 600 } : null

  // Wrap URL as link group
  const wrapLink = (url: string | null | undefined) =>
    url ? { type: 'url' as const, url, file: null } : null

  // Auto-detect download button based on available URLs (priority: pdf > word > banner)
  const dlBtn = product.url_pdf
    ? 'pdf'
    : product.url_word
      ? 'word'
      : product.url_banner
        ? 'banner'
        : 'none'

  return {
    id: String(product.product_id),
    tourTitle: product.product_name,
    tourCode: product.product_code,
    coverImage: fakeMedia(
      product.url_pic || product.url_pic_multisize?.tourdetail,
      product.product_name,
    ),
    countryName: product.country_name || capitalizeSlug(product.country_slug || ''),
    interTourSlug: product.country_slug || null,
    recommendedLabel: null,
    stayDay: product.stay_day,
    stayNight: product.stay_night,
    airlineName: product.airline_name,
    airlineLogo: fakeMedia(product.url_airline_pic, product.airline_name),
    startPrice: product.price_product.toLocaleString('en-US'),
    discountPrice: hasDiscount
      ? product.product_price_before_discount.toLocaleString('en-US')
      : null,
    discountPercent:
      hasDiscount && product.product_discount_display > 0 ? product.product_discount_display : null,
    tourDescription: product.highlight || product.destination || '',
    pdfLink: wrapLink(product.url_pdf),
    wordLink: wrapLink(product.url_word),
    bannerLink: wrapLink(product.url_banner),
    // Toggle settings — show everything + auto-detect download button
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
      showPdfButton: !!product.url_pdf,
      showWordButton: !!product.url_word,
      showBannerButton: !!product.url_banner,
    },
    travelPeriods: (product.periods || []).map((p) => ({
      startDate: p.period_start_value,
      endDate: p.period_end_value,
      price: p.price,
      priceAdultTwin: p.price_adults_double,
      priceAdultSingle: p.price_adults_single,
      priceAdultTriple: p.price_adults_triple,
      priceChildWithBed: p.price_child_withbed,
      priceChildNoBed: p.price_child_nobed,
      availableSeats: p.seatremain ?? p.number_seats,
      groupSize: p.groupsize,
      isSoldOut: p.period_soldout === 'true',
    })),
    // Empty highlights (Card 6 uses these)
    highlights: { accommodation: [], food: [] },
    tags: [],
    itinerary: [],
  }
}

/**
 * Map a CMS ProgramTour document to the TourItem shape used by tour card components.
 * This enables rendering tours from CMS (TourGroups) with the same cards
 * that previously only handled external API data.
 */
export function mapProgramTourToTourItemCMS(tour: any): any {
  const hasDiscount =
    tour.productDiscountDisplay > 0 && tour.productPriceBeforeDiscount > tour.priceProduct

  // Create fake Media-like object from URL
  const fakeMedia = (url: string | null | undefined, alt: string) =>
    url ? { url, alt, width: 800, height: 600 } : null

  // Wrap URL as link group
  const wrapLink = (url: string | null | undefined) =>
    url ? { type: 'url' as const, url, file: null } : null

  // Auto-detect download button
  const dlBtn = tour.urlPdf ? 'pdf' : tour.urlWord ? 'word' : tour.urlBanner ? 'banner' : 'none'

  return {
    id: String(tour.productId || tour.id),
    tourTitle: tour.productName || '',
    tourCode: tour.productCode || '',
    coverImage: fakeMedia(tour.urlPic || tour.urlPicMultisize?.tourdetail, tour.productName || ''),
    countryName: tour.countryName || '',
    interTourSlug: tour.countrySlug || null,
    recommendedLabel: null,
    stayDay: tour.stayDay || 0,
    stayNight: tour.stayNight || 0,
    airlineName: tour.airlineName || '',
    airlineLogo: fakeMedia(tour.urlAirlinePic, tour.airlineName || ''),
    startPrice: tour.priceProduct ? tour.priceProduct.toLocaleString('en-US') : '0',
    discountPrice: hasDiscount ? tour.productPriceBeforeDiscount.toLocaleString('en-US') : null,
    discountPercent:
      hasDiscount && tour.productDiscountDisplay > 0 ? tour.productDiscountDisplay : null,
    tourDescription: tour.highlight || tour.destination || '',
    pdfLink: wrapLink(tour.urlPdf),
    wordLink: wrapLink(tour.urlWord),
    bannerLink: wrapLink(tour.urlBanner),
    // Toggle settings — show everything + auto-detect download button
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
      showPdfButton: !!tour.urlPdf,
      showWordButton: !!tour.urlWord,
      showBannerButton: !!tour.urlBanner,
    },
    travelPeriods: (tour.periods || []).map((p: any) => ({
      startDate: p.periodStartValue || p.period_start_value,
      endDate: p.periodEndValue || p.period_end_value,
      price: p.price,
      priceAdultTwin: p.priceAdultsDouble || p.price_adults_double,
      priceAdultSingle: p.priceAdultsSingle || p.price_adults_single,
      priceAdultTriple: p.priceAdultsTriple || p.price_adults_triple,
      priceChildWithBed: p.priceChildWithbed || p.price_child_withbed,
      priceChildNoBed: p.priceChildNobed || p.price_child_nobed,
      availableSeats: p.seatremain ?? p.numberSeats ?? p.number_seats,
      groupSize: p.groupsize,
      isSoldOut: p.periodSoldout === 'true' || p.period_soldout === 'true',
    })),
    // Empty highlights (Card 6 uses these)
    highlights: { accommodation: [], food: [] },
    tags: [],
    itinerary: [],
  }
}
