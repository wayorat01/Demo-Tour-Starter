'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Autoplay from 'embla-carousel-autoplay'
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  FileIcon,
  ImageIcon,
  Eye,
  Hotel,
  UtensilsCrossed,
} from 'lucide-react'

import type { CarouselApi } from '@/components/ui/carousel'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { Media } from '@/components/Media'
import type { WowtourTourTypeBlock, Media as MediaType, Intertour } from '@/payload-types'
import type { PublicContextProps } from '@/utilities/publicContextProps'
import { cn } from '@/utilities/cn'
import './wowtour_tourCard6.css'

export type TourItem = any & {
  interTourSlug?: string | null
}

type WowtourTourCard6Props = Omit<WowtourTourTypeBlock, 'tourProgramRefs'> & {
  tours: TourItem[]
  apiTitle?: string | null
  publicContext: PublicContextProps
}

/** Get the URL from a link group (url or upload) */
const getLinkUrl = (
  linkGroup:
    | { type?: string | null; url?: string | null; file?: MediaType | string | null }
    | null
    | undefined,
): string | null => {
  if (!linkGroup) return null
  if (linkGroup.type === 'upload' && linkGroup.file) {
    const media = linkGroup.file as MediaType
    return media.url || null
  }
  return linkGroup.url || null
}

/** Format a number with commas */
const formatPrice = (val: string | number | null | undefined): string => {
  if (val == null || val === '') return '-'
  const num = typeof val === 'string' ? Number(val.replace(/,/g, '')) : val
  return isNaN(num) ? String(val) : num.toLocaleString('en-US')
}

/** Format date in Thai short */
const fmtDate = (d: string) => {
  const date = new Date(d)
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
}

/** Single tour card item */
export const TourCard6Item: React.FC<{
  tour: TourItem
  borderRadius: number
  footerText?: string | null
}> = ({ tour, borderRadius, footerText }) => {
  const toggle = tour.toggleSettings
  const coverImage = tour.coverImage as MediaType
  const hasPeriods = toggle?.showTravelPeriod && tour.travelPeriods && tour.travelPeriods.length > 0

  const detailUrl = tour.interTourSlug
    ? `/intertours/${tour.interTourSlug}/${tour.tourCode || tour.id}`
    : '#'

  // Count accommodation items for hotel star display
  const accommodationItems = tour.highlights?.accommodation || []
  const hotelStars = accommodationItems.length

  // Food items
  const foodItems = tour.highlights?.food || []

  // Determine which download buttons to show — Card 6 shows all 3
  const pdfUrl = getLinkUrl(tour.pdfLink)
  const wordUrl = getLinkUrl(tour.wordLink)
  const bannerUrl = getLinkUrl(tour.bannerLink)
  const hasAnyDownload = pdfUrl || wordUrl || bannerUrl

  return (
    <div className="tour6-card-wrap" style={{ borderRadius: `${borderRadius + 6}px` }}>
      <div className="tour6-card" style={{ borderRadius: `${borderRadius}px` }}>
        {/* ====== Top Section: Image + Content ====== */}
        <div className="tour6-top">
          {/* Cover Image */}
          <a href={detailUrl} className="tour6-image-wrap" style={{ textDecoration: 'none' }}>
            {coverImage && (
              <Media
                resource={coverImage}
                fill
                imgClassName="tour6-cover-img"
                size="(max-width: 768px) 100vw, 40vw"
              />
            )}
            {/* Discount Percent Badge */}
            {(tour as any).discountPercent && (
              <span
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  background: 'linear-gradient(135deg, #ff4757, #ff6b81)',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  lineHeight: 1.2,
                  zIndex: 2,
                  boxShadow: '0 2px 8px rgba(255,71,87,0.4)',
                }}
              >
                -{(tour as any).discountPercent}%
              </span>
            )}
          </a>

          {/* Content */}
          <div className="tour6-content">
            {/* Title */}
            <h3 className="tour6-title">{tour.tourTitle}</h3>

            {/* Tour Code */}
            {toggle?.showTourCode && tour.tourCode && (
              <p className="tour6-code">
                รหัสทัวร์ <strong>{tour.tourCode}</strong>
              </p>
            )}

            {/* Description */}
            {toggle?.showDescription && tour.tourDescription && (
              <p className="tour6-desc">{tour.tourDescription}</p>
            )}

            {/* Hotel rating */}
            {hotelStars > 0 && (
              <div className="tour6-hotel">
                <Hotel className="tour6-hotel-icon" />
                <span>{hotelStars} ดาว</span>
              </div>
            )}

            {/* Food highlights */}
            {foodItems.length > 0 && (
              <div className="tour6-food">
                <UtensilsCrossed className="tour6-food-icon" />
                <span>
                  {foodItems
                    .map((f) => f.item)
                    .filter(Boolean)
                    .join(', ')}
                </span>
              </div>
            )}

            {/* Summary info — inside content area (before download buttons) */}
            <div className="tour6-summary-inline">
              {toggle?.showAirline && tour.airlineLogo && (
                <div className="tour6-airline-logo">
                  <Media
                    resource={tour.airlineLogo as MediaType}
                    fill
                    imgClassName="object-contain"
                  />
                </div>
              )}
              {toggle?.showDuration && (tour.stayDay || tour.stayNight) && (
                <span className="tour6-duration">
                  {tour.stayDay && `${tour.stayDay} วัน`}
                  {tour.stayDay && tour.stayNight && ' '}
                  {tour.stayNight && `${tour.stayNight} คืน`}
                </span>
              )}
              {toggle?.showStartPrice && tour.startPrice && (
                <span className="tour6-summary-divider">/</span>
              )}
              {toggle?.showStartPrice &&
                tour.startPrice &&
                (() => {
                  const hasDiscount = toggle?.showDiscountPrice && tour.discountPrice
                  return (
                    <span>
                      <span className="tour6-summary-price-label">เริ่มเพียง </span>
                      {hasDiscount && (
                        <span className="tour6-summary-price-original">
                          {formatPrice(tour.startPrice)}
                        </span>
                      )}
                      <span className="tour6-summary-price">
                        {hasDiscount
                          ? formatPrice(tour.discountPrice!)
                          : formatPrice(tour.startPrice)}
                      </span>{' '}
                      <span className="tour6-summary-price-unit">บ.</span>
                    </span>
                  )
                })()}
              {toggle?.showDetailButton && (
                <a href={detailUrl} className="tour6-detail-btn tour6-detail-btn-top">
                  ดูรายละเอียด
                </a>
              )}
            </div>

            {/* Download Buttons / Mobile Detail Button */}
            {(hasAnyDownload || toggle?.showDetailButton) && (
              <div className="tour6-actions">
                {toggle?.showDetailButton && (
                  <a href={detailUrl} className="tour6-detail-btn tour6-detail-btn-bottom">
                    ดูรายละเอียด
                  </a>
                )}
                {pdfUrl && (
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tour6-dl-btn"
                  >
                    <FileText className="tour6-dl-icon-pdf" />
                    PDF
                  </a>
                )}
                {wordUrl && (
                  <a
                    href={wordUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tour6-dl-btn"
                  >
                    <FileIcon className="tour6-dl-icon-word" />
                    Word
                  </a>
                )}
                {bannerUrl && (
                  <a
                    href={bannerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tour6-dl-btn"
                  >
                    <ImageIcon className="tour6-dl-icon-banner" />
                    Banner
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ====== Summary Bar (mobile stacked only) ====== */}
        <div className="tour6-summary tour6-summary-mobile">
          <div className="tour6-summary-left">
            {toggle?.showAirline && tour.airlineLogo && (
              <div className="tour6-airline-logo">
                <Media
                  resource={tour.airlineLogo as MediaType}
                  fill
                  imgClassName="object-contain"
                />
              </div>
            )}
            {toggle?.showDuration && (tour.stayDay || tour.stayNight) && (
              <span className="tour6-duration">
                {tour.stayDay && `${tour.stayDay} วัน`}
                {tour.stayDay && tour.stayNight && ' '}
                {tour.stayNight && `${tour.stayNight} คืน`}
              </span>
            )}
            {toggle?.showStartPrice && tour.startPrice && (
              <span className="tour6-summary-divider">/</span>
            )}
            {toggle?.showStartPrice &&
              tour.startPrice &&
              (() => {
                const hasDiscount = toggle?.showDiscountPrice && tour.discountPrice
                return (
                  <span>
                    <span className="tour6-summary-price-label">เริ่มเพียง </span>
                    {hasDiscount && (
                      <span className="tour6-summary-price-original">
                        {formatPrice(tour.startPrice)}
                      </span>
                    )}
                    <span className="tour6-summary-price">
                      {hasDiscount
                        ? formatPrice(tour.discountPrice!)
                        : formatPrice(tour.startPrice)}
                    </span>{' '}
                    <span className="tour6-summary-price-unit">บ.</span>
                  </span>
                )
              })()}
          </div>
          {toggle?.showDetailButton && (
            <a href={detailUrl} className="tour6-detail-btn">
              ดูรายละเอียด
            </a>
          )}
        </div>

        {/* ====== Pricing Table ====== */}
        {hasPeriods && (
          <div className="tour6-table-wrap">
            <table className="tour6-table">
              <thead>
                <tr>
                  <th>วันที่เดินทาง</th>
                  <th>
                    ผู้ใหญ่
                    <br />
                    (พักคู่)
                  </th>
                  <th>
                    ผู้ใหญ่
                    <br />
                    (พักเดี่ยว)
                  </th>
                  <th>
                    ผู้ใหญ่
                    <br />
                    (พักสาม)
                  </th>
                  <th>
                    เด็ก
                    <br />
                    (2-20ปี)
                  </th>
                  <th>
                    เด็ก
                    <br />
                    (ไม่มีเตียง)
                  </th>
                  <th>รับได้</th>
                  <th>Group Size</th>
                </tr>
              </thead>
              <tbody>
                {tour.travelPeriods!.slice(0, 5).map((p, i) => {
                  const seats = p.availableSeats ?? 0
                  const isSoldOut = seats <= 0
                  const dateStr =
                    p.startDate && p.endDate
                      ? `${fmtDate(p.startDate)} - ${fmtDate(p.endDate)}`
                      : p.startDate
                        ? fmtDate(p.startDate)
                        : ''

                  return (
                    <tr key={i}>
                      <td>{dateStr}</td>
                      <td>{formatPrice(p.priceAdultTwin)}</td>
                      <td>{formatPrice(p.priceAdultSingle)}</td>
                      <td>{formatPrice(p.priceAdultTriple)}</td>
                      <td>{formatPrice(p.priceChildWithBed)}</td>
                      <td>{formatPrice(p.priceChildNoBed)}</td>
                      <td>
                        <span
                          className={
                            seats > 0
                              ? 'tour6-seats-positive'
                              : seats < 0
                                ? 'tour6-seats-negative'
                                : 'tour6-seats-zero'
                          }
                        >
                          {seats}
                        </span>
                      </td>
                      <td>
                        {isSoldOut ? (
                          <span className="tour6-sold-out">Sold out</span>
                        ) : (
                          (p.groupSize ?? '-')
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div
              style={{
                marginTop: '6px',
                fontSize: '0.72rem',
                color: '#64748b',
                textAlign: 'center',
              }}
            >
              ( {tour.travelPeriods!.length} ช่วงเวลาเดินทาง )
            </div>
            {tour.travelPeriods!.length > 5 && (
              <a
                href={detailUrl}
                style={{
                  display: 'block',
                  marginTop: '4px',
                  fontSize: '0.8rem',
                  color: 'var(--primary)',
                  textDecoration: 'none',
                  textAlign: 'center',
                }}
              >
                ดูเพิ่มเติมอีก {tour.travelPeriods!.length - 5} ช่วง →
              </a>
            )}
          </div>
        )}

        {/* ====== Footer ====== */}
        {footerText && (
          <div className="tour6-footer">
            <span className="tour6-footer-text">{footerText}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export const WowtourTourCard6: React.FC<WowtourTourCard6Props> = ({
  headingSettings,
  apiTitle,
  tours,
  cardSettings,
  columnsPerRow: columnsPerRowProp,
  columnsPerRowHorizontal: columnsPerRowHorizontalProp,
  maxItemsToShow: maxItemsToShowProp,
  displayMode: displayModeProp,
  sliderSettings,
  publicContext,
  ...rest
}) => {
  const heading = apiTitle
  const showHeadingIcon = headingSettings?.showHeadingIcon ?? false
  const headingIcon = headingSettings?.headingIcon
  const showDescription = headingSettings?.showDescription ?? false
  const description = headingSettings?.description

  const borderRadius = cardSettings?.borderRadius ?? 12
  const rawColumns = (columnsPerRowHorizontalProp as string) || (columnsPerRowProp as string) || '1'
  const columns = Math.min(parseInt(rawColumns, 10), 2)
  const displayMode = displayModeProp ?? 'showAll'
  const itemsLimit =
    maxItemsToShowProp === 'showAll' || !maxItemsToShowProp
      ? Infinity
      : parseInt(maxItemsToShowProp as string, 10)

  // Slider Settings
  const autoPlay = sliderSettings?.autoPlay ?? false
  const autoPlayDelay = Number(sliderSettings?.autoPlayDelay) || 10000
  const loop = sliderSettings?.loop ?? true

  // Get footer text from top-level block props
  const footerText = (rest as any)?.card6FooterText || null

  const [showAll, setShowAll] = useState(false)

  // Carousel state
  const [api, setApi] = useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const scrollPrev = () => api?.scrollPrev()
  const scrollNext = () => api?.scrollNext()
  const scrollTo = useCallback((index: number) => api?.scrollTo(index), [api])

  useEffect(() => {
    if (!api) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScrollSnaps(api.scrollSnapList())
    setSelectedIndex(api.selectedScrollSnap())
    api.on('select', () => {
      setSelectedIndex(api.selectedScrollSnap())
    })
  }, [api])

  if (!tours || tours.length === 0) return null

  const shouldUseSlide = displayMode === 'slide'
  const hasOverflow = tours.length > itemsLimit
  const visibleTours = showAll
    ? tours
    : tours.slice(0, itemsLimit === Infinity ? tours.length : itemsLimit)

  // Determine slide basis class based on columns
  const slideBasis = columns === 2 ? 'basis-full lg:basis-1/2' : 'basis-full'

  const renderTourCard = (tour: TourItem, index: number) => (
    <TourCard6Item key={index} tour={tour} borderRadius={borderRadius} footerText={footerText} />
  )

  const renderSlideMode = () => (
    <div
      className="tour6-slide-wrapper relative"
      style={undefined}
    >
      <Carousel
        setApi={setApi}
        opts={{
          align: 'start',
          loop,
        }}
        plugins={autoPlay ? [Autoplay({ delay: autoPlayDelay, stopOnInteraction: true })] : []}
        className="w-full"
      >
        <CarouselContent
          className={tours.length < columns ? 'tour6-slide-track justify-center py-4' : 'tour6-slide-track -ml-3 py-4 md:-ml-4'}
        >
          {tours.map((tour, index) => (
            <CarouselItem key={index} className={`pl-3 md:pl-4 flex flex-col ${slideBasis}`}>
              <div className="flex flex-col flex-1 w-full">
                {renderTourCard(tour, index)}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Navigation Arrows — only show when more items than columns */}
      {tours.length > columns && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="bg-background text-primary border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary absolute top-1/2 left-0 z-10 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-lg transition-colors md:flex"
            onClick={scrollPrev}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-background text-primary border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary absolute top-1/2 right-0 z-10 hidden h-10 w-10 translate-x-1/2 -translate-y-1/2 rounded-full shadow-lg transition-colors md:flex"
            onClick={scrollNext}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}

      {/* Dot Indicators */}
      {scrollSnaps.length > 1 && (
        <div className="mt-5 flex justify-center gap-1.5">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              className={cn(
                'h-2 cursor-pointer rounded-full border-0 p-0 transition-all duration-300',
                selectedIndex === index
                  ? 'bg-primary w-6'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2',
              )}
              onClick={() => scrollTo(index)}
            />
          ))}
        </div>
      )}
    </div>
  )

  const renderGridMode = () => (
    <>
      <div
        className={`tour6-grid${columns === 2 ? ' tour6-grid-2col' : ''}`}
        style={{
          gridTemplateColumns: `repeat(${Math.min(visibleTours.length, columns)}, 1fr)`
        } as React.CSSProperties}
      >
        {visibleTours.map((tour, index) => renderTourCard(tour, index))}
      </div>

      {/* Show more/less */}
      {hasOverflow && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-primary border-primary hover:bg-primary/5 rounded-full border px-6 py-2 text-sm font-medium transition-colors"
          >
            {showAll
              ? `ซ่อน (แสดง ${itemsLimit} รายการ)`
              : `ดูเพิ่มเติม (${tours.length - itemsLimit} รายการ)`}
          </button>
        </div>
      )}
    </>
  )

  return (
    <section className="w-full pt-[36px] pb-12 md:pb-16">
      <div className="container">
        {/* Heading */}
        {(heading || (showDescription && description)) && (
          <div className="mb-4 flex flex-col items-center text-center md:mb-6">
            <div className="mb-2 flex items-center gap-3">
              {showHeadingIcon && headingIcon && (
                <div className="relative h-8 w-8">
                  <Media resource={headingIcon as MediaType} fill imgClassName="object-contain" />
                </div>
              )}
              {heading && <h2 className="text-2xl font-medium">{heading}</h2>}
            </div>
            {showDescription && description && (
              <p className="text-muted-foreground mt-2 max-w-2xl">{description}</p>
            )}
          </div>
        )}

        {/* Tour Cards Display */}
        <div className="w-full">{shouldUseSlide ? renderSlideMode() : renderGridMode()}</div>
      </div>
    </section>
  )
}

export default WowtourTourCard6
