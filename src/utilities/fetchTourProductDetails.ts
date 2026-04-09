/**
 * Utility to fetch a single tour product detail from the external API.
 * Uses the "Product Detail" endpoint from API Setting.
 */

import type { ApiTourPeriod, ApiTourProduct } from './fetchTourProducts'

export interface ApiProductDetail extends ApiTourProduct {
  url_brochure: string
  period: ApiTourPeriod[]
  itinerary_type: string
  itinerary_summary: any
  includes: any[]
  visa: string
  freetext: any
  keyword: string
  url_multipic: any
  departureTime: string | null
  arrivalTime: string | null
  departureTime_Return: string | null
  arrivalTime_Return: string | null
  flightNumber_Departure: string | null
  flightNumber_Return: string | null
}

interface ProductDetailResponse {
  success: string
  data: ApiProductDetail
}

export interface FetchProductDetailParams {
  apiEndPoint: string
  apiKey: string
  mode?: string
  lang?: string
  product_code: string
}

/**
 * Fetch a single product's detail from the external API.
 * Uses Next.js fetch with revalidation (5 minutes cache).
 */
export async function fetchTourProductDetails(
  params: FetchProductDetailParams,
): Promise<ApiProductDetail | null> {
  const { apiEndPoint, apiKey, mode = 'productdetails', lang = 'th', product_code } = params

  const url = new URL(apiEndPoint)
  url.searchParams.set('apikey', apiKey)
  url.searchParams.set('mode', mode)
  url.searchParams.set('lang', lang)
  url.searchParams.set('product_code', product_code)

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!res.ok) {
      console.error(`[fetchTourProductDetails] API returned ${res.status}`)
      return null
    }

    const json: ProductDetailResponse = await res.json()

    if (json.success !== 'True' || !json.data) {
      console.error('[fetchTourProductDetails] API response unsuccessful')
      return null
    }

    return json.data
  } catch (error) {
    console.error('[fetchTourProductDetails] Failed to fetch:', error)
    return null
  }
}

/**
 * Map API product detail to a "program-like" shape compatible with TourDetailClient.
 * Returns an object that mirrors the CMS program structure.
 */
export function mapApiDetailToProgram(detail: ApiProductDetail) {
  const hasDiscount =
    detail.product_discount_display > 0 &&
    detail.product_price_before_discount > detail.price_product

  // Split highlight text by comma into array items
  const highlightItems = detail.highlight
    ? detail.highlight
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : []

  return {
    id: String(detail.product_id),
    tourTitle: detail.product_name,
    tourCode: detail.product_code,
    tourDescription: detail.destination || detail.highlight || '',
    destination: detail.destination || '',
    coverImageUrl: detail.url_pic_multisize?.tourdetail || detail.url_pic,
    countryName: detail.country_name,
    countrySlug: detail.country_slug,
    stayDay: detail.stay_day,
    stayNight: detail.stay_night,
    starHotel: detail.star_hotel ?? 0,
    airlineName: '', // Not in detail response as text
    airlineLogoUrl: detail.url_airline_pic || '',
    startPrice: detail.price_product,
    discountPrice: hasDiscount ? detail.price_amount_call_discount : null,
    originalPrice: hasDiscount ? detail.product_price_before_discount : null,
    pdfUrl: detail.url_brochure || detail.url_pdf || null,
    wordUrl: detail.url_word || null,
    bannerUrl: detail.url_banner || null,
    soldout: detail.soldout === 'true',
    itineraryType: detail.itinerary_type, // 'pdf' | 'content' etc.
    itinerarySummary: detail.itinerary_summary,
    itinerarySummaryText:
      typeof detail.itinerary_summary === 'string' ? detail.itinerary_summary : '',
    highlightItems, // ['เวียนนา', 'กราซ', ...]
    highlight: detail.highlight || '',
    supplierName: (detail as any).suppliername || '',
    food: detail.food || '',
    productTags: Array.isArray((detail as any).tags) ? (detail as any).tags : [],
    travelPeriods: (detail.period || []).map((p) => ({
      id: String(p.period_id),
      startDate: p.period_start_value,
      endDate: p.period_end_value,
      startDateDisplay: p.period_start,
      endDateDisplay: p.period_end,
      priceAdultTwin: p.price_adults_double,
      priceAdultSingle: p.price_adults_single,
      priceAdultTriple: p.price_adults_triple,
      priceChildWithBed: p.price_child_withbed,
      priceChildNoBed: p.price_child_nobed,
      priceJoinLand: p.price_joinland,
      availableSeats: p.number_seats,
      groupSize: p.groupsize,
      isSoldOut: p.period_soldout === 'true',
      airlineCode: p.airlinecode,
      airlineIconUrl: p.url_airline_pic_icon || '',
      deposit: p.deposit || 0,
      depositDate: p.deposit_date || '',
    })),
  }
}

export type ApiProgramDetail = ReturnType<typeof mapApiDetailToProgram>
