/**
 * Map a ProgramTour DB record to the CMS TourItem card format.
 * Shared between /api/search-landing (API) and custom-landingpage/page.tsx (SSR).
 */
export function mapProgramTourToCard(doc: any): any {
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
}
