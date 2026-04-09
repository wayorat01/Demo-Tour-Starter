/**
 * Map a ProgramTours CMS document to the ApiProgramDetail shape
 * used by TourDetailClient (and BookingClient).
 *
 * This lets us swap the data source from external API → Payload CMS
 * without touching any client components.
 */

import type { ApiProgramDetail } from './fetchTourProductDetails'

/** Minimal type for a ProgramTours document from Payload */
export interface CmsProgramTour {
  id: string | number
  productId?: number | null
  productCode?: string | null
  productName?: string | null
  productSlug?: string | null
  countryName?: string | null
  countrySlug?: string | null
  cityName?: string | null
  stayDay?: number | null
  stayNight?: number | null
  airlineCode?: string | null
  airlineName?: string | null
  urlAirlinePic?: string | null
  urlPic?: string | null
  urlPicMultisize?: {
    tourdetail?: string | null
    itemslide?: string | null
    tourlist?: string | null
  } | null
  highlight?: string | null
  destination?: string | null
  food?: string | null
  priceProduct?: number | null
  priceAmountCallDiscount?: number | null
  productDiscountDisplay?: number | null
  productPriceBeforeDiscount?: number | null
  urlPdf?: string | null
  urlWord?: string | null
  urlBanner?: string | null
  soldout?: string | null
  periods?: CmsPeriod[] | null
  supplierName?: string | null
  [key: string]: any
}

export interface CmsPeriod {
  id?: string
  periodId?: number | null
  periodStart?: string | null
  periodEnd?: string | null
  periodStartValue?: string | null
  periodEndValue?: string | null
  priceAdultsDouble?: number | null
  priceAdultsSingle?: number | null
  priceAdultsTriple?: number | null
  priceChildWithbed?: number | null
  priceChildNobed?: number | null
  priceJoinland?: number | null
  numberSeats?: number | null
  groupsize?: number | null
  periodSoldout?: string | null
  periodAirlineCode?: string | null
  urlAirlinePicIcon?: string | null
  deposit?: number | null
  depositDate?: string | null
  [key: string]: any
}

/**
 * Convert a ProgramTours CMS document into the same shape
 * that `mapApiDetailToProgram()` returns, so client components
 * can consume it without any changes.
 */
export function mapCmsProgramToDetail(doc: CmsProgramTour): ApiProgramDetail {
  const hasDiscount =
    (doc.productDiscountDisplay ?? 0) > 0 &&
    (doc.productPriceBeforeDiscount ?? 0) > (doc.priceProduct ?? 0)

  // Split highlight text by comma into array items (same logic as API mapper)
  const highlightItems = doc.highlight
    ? doc.highlight
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : []

  return {
    id: String(doc.productId ?? doc.id),
    tourTitle: doc.productName ?? '',
    tourCode: doc.productCode ?? '',
    supplierName: doc.supplierName ?? '',
    tourDescription: doc.destination || doc.highlight || '',
    destination: doc.destination ?? '',
    coverImageUrl: doc.urlPicMultisize?.tourdetail || doc.urlPic || '',
    countryName: doc.countryName ?? '',
    countrySlug: doc.countrySlug ?? '',
    stayDay: doc.stayDay ?? 0,
    stayNight: doc.stayNight ?? 0,
    starHotel: doc.starHotel ?? 0,
    airlineName: doc.airlineName ?? '',
    airlineLogoUrl: doc.urlAirlinePic ?? '',
    startPrice: doc.priceProduct ?? 0,
    discountPrice: hasDiscount ? (doc.priceAmountCallDiscount ?? null) : null,
    originalPrice: hasDiscount ? (doc.productPriceBeforeDiscount ?? null) : null,
    pdfUrl: doc.urlPdf || null,
    wordUrl: doc.urlWord || null,
    bannerUrl: doc.urlBanner || null,
    soldout: doc.soldout === 'true',
    itineraryType: Array.isArray(doc.itinerary) && doc.itinerary.length > 0 ? 'content' : '',
    itinerarySummary:
      Array.isArray(doc.itinerary) && doc.itinerary.length > 0
        ? doc.itinerary.map((item: any) => ({
            type: item.dayTitle || '',
            content: item.dayContent || '',
          }))
        : null,
    itinerarySummaryText: doc.itinerarySummary ?? '',
    highlightItems,
    highlight: doc.highlight ?? '',
    food: doc.food ?? '',
    productTags: Array.isArray(doc.productTags) ? doc.productTags : [],
    travelPeriods: (doc.periods ?? []).map((p) => ({
      id: String(p.periodId ?? p.id ?? ''),
      startDate: p.periodStartValue ?? '',
      endDate: p.periodEndValue ?? '',
      startDateDisplay: p.periodStart ?? '',
      endDateDisplay: p.periodEnd ?? '',
      priceAdultTwin: p.priceAdultsDouble ?? 0,
      priceAdultSingle: p.priceAdultsSingle ?? 0,
      priceAdultTriple: p.priceAdultsTriple ?? 0,
      priceChildWithBed: p.priceChildWithbed ?? 0,
      priceChildNoBed: p.priceChildNobed ?? 0,
      priceJoinLand: p.priceJoinland ?? 0,
      availableSeats: p.numberSeats ?? 0,
      groupSize: p.groupsize ?? 0,
      isSoldOut: p.periodSoldout === 'true',
      airlineCode: p.periodAirlineCode ?? '',
      airlineIconUrl: p.urlAirlinePicIcon ?? '',
      deposit: p.deposit ?? 0,
      depositDate: p.depositDate ?? '',
    })),
  }
}
