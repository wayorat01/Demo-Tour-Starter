'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Autoplay from 'embla-carousel-autoplay'
import { ChevronLeft, ChevronRight, Minus, Plus, Eye } from 'lucide-react'

import type { CarouselApi } from '@/components/ui/carousel'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { Media } from '@/components/Media'
import type { WowtourTourTypeBlock, Media as MediaType, Intertour } from '@/payload-types'
import type { PublicContextProps } from '@/utilities/publicContextProps'
import { cn } from '@/utilities/cn'
import './wowtour_tourCard4.css'

export type TourItem = any & {
  interTourSlug?: string | null
}
type WowtourTourCard4Props = Omit<WowtourTourTypeBlock, 'tourProgramRefs'> & {
  tours: TourItem[]
  apiTitle?: string | null
  publicContext: PublicContextProps
}

/** Horizontal card with collapsible travel periods */
export const TourCard4Item: React.FC<{
  tour: TourItem
  borderRadius: number
  columns?: number
}> = ({ tour, borderRadius, columns = 1 }) => {
  const [periodsOpen, setPeriodsOpen] = useState(false)
  const toggle = tour.toggleSettings
  const coverImage = tour.coverImage as MediaType

  const hasPeriods = toggle?.showTravelPeriod && tour.travelPeriods && tour.travelPeriods.length > 0

  const fmt = (d: string) => {
    const date = new Date(d)
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
  }

  const detailUrl = tour.interTourSlug
    ? `/intertours/${tour.interTourSlug}/${tour.tourCode || tour.id}`
    : '#'

  return (
    <div className={cn("tour4-card-wrap", columns === 2 && "tour4-type-2col")} style={{ borderRadius: `${borderRadius + 6}px` }}>
      <div className="tour4-card" style={{ borderRadius: `${borderRadius}px` }}>
        {/* Image — left */}
        <a href={detailUrl} className="tour4-image-wrap" style={{ textDecoration: 'none' }}>
          {coverImage && (
            <Media
              resource={coverImage}
              fill
              imgClassName="tour4-cover-img"
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

        {/* Right side */}
        <div className="tour4-body">
            {/* Title */}
            <h3 className="tour4-title">{tour.tourTitle}</h3>

            {/* Tour Code */}
            {toggle?.showTourCode && tour.tourCode && (
              <p className="tour4-code">
                รหัสทัวร์ <strong>{tour.tourCode}</strong>
              </p>
            )}

            {/* Description */}
            {toggle?.showDescription && tour.tourDescription && (
              <p className="tour4-desc">{tour.tourDescription}</p>
            )}

            {/* Collapsible Travel Periods */}
            {hasPeriods && (
              <div className="tour4-periods-section">
                <button
                  type="button"
                  className="tour4-periods-toggle"
                  onClick={() => setPeriodsOpen(!periodsOpen)}
                >
                  <span>( {tour.travelPeriods!.length} ช่วงเวลาเดินทาง)</span>
                  <span
                    className={cn('tour4-periods-icon', periodsOpen && 'tour4-periods-icon--open')}
                  >
                    {periodsOpen ? <Minus size={14} /> : <Plus size={14} />}
                  </span>
                </button>

                {periodsOpen && (
                  <>
                    <div className="tour4-periods-grid">
                      {tour.travelPeriods!.slice(0, 5).map((p, i) => (
                        <div key={i} className="tour4-period-item">
                          {p.startDate && p.endDate
                            ? `${fmt(p.startDate)} - ${fmt(p.endDate)}`
                            : p.startDate
                              ? fmt(p.startDate)
                              : ''}
                        </div>
                      ))}
                    </div>
                    <a href={detailUrl} className="tour4-periods-link">
                      คลิกดูรายละเอียดเพื่อดูข้อมูลเพิ่มเติม
                    </a>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="tour4-footer">
            <div className="tour4-footer-left">
              {/* Airline logo */}
              {toggle?.showAirline && tour.airlineLogo && (
                <div className="tour4-airline-logo">
                  <Media
                    resource={tour.airlineLogo as MediaType}
                    imgClassName="tour4-airline-img"
                  />
                </div>
              )}

              {/* Duration + Price */}
              <span className="tour4-footer-info">
                {toggle?.showDuration && (tour.stayDay || tour.stayNight) && (
                  <>
                    {tour.stayDay && `${tour.stayDay} วัน`}
                    {tour.stayDay && tour.stayNight && ' '}
                    {tour.stayNight && `${tour.stayNight} คืน`}
                  </>
                )}
                {toggle?.showStartPrice &&
                  tour.startPrice &&
                  (() => {
                    const formatPrice = (val: string | number) => {
                      const num = typeof val === 'string' ? Number(val.replace(/,/g, '')) : val
                      return isNaN(num) ? val : num.toLocaleString('en-US')
                    }
                    const hasDiscount = toggle?.showDiscountPrice && tour.discountPrice
                    return (
                      <>
                        <span className="tour4-slash"> / </span>
                        <span className="tour4-price-section">
                          {'เริ่มเพียง '}
                          {hasDiscount && (
                            <span className="tour4-footer-price-original">
                              {formatPrice(tour.startPrice)}
                            </span>
                          )}
                          <span className="tour4-footer-price">
                            {hasDiscount
                              ? formatPrice(tour.discountPrice!)
                              : formatPrice(tour.startPrice)}
                          </span>
                          {' บ.'}
                        </span>
                      </>
                    )
                  })()}
              </span>
            </div>

            {/* Detail button */}
            {toggle?.showDetailButton && (
              <a href={detailUrl} className="tour4-detail-btn">
                ดูรายละเอียด
              </a>
            )}
          </div>
      </div>
    </div>
  )
}

export const WowtourTourCard4: React.FC<WowtourTourCard4Props> = ({
  headingSettings,
  apiTitle,
  tours,
  cardSettings,
  sliderSettings,
  displayMode: displayModeProp,
  columnsPerRow: columnsPerRowProp,
  columnsPerRowHorizontal: columnsPerRowHorizontalProp,
  maxItemsToShow: maxItemsToShowProp,
  publicContext,
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

  const slideBasis = columns === 2 ? 'basis-full xl:basis-1/2' : 'basis-full'

  const renderTourCard = (tour: TourItem, index: number) => (
    <TourCard4Item key={index} tour={tour} borderRadius={borderRadius} columns={columns} />
  )

  const renderSlideMode = () => (
    <div
      className="relative"
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
          className={tours.length < columns ? 'justify-center py-4' : '-ml-3 py-4 md:-ml-4'}
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
        className={cn(
          "tour4-grid grid gap-6",
          columns === 2 ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1"
        )}
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

export default WowtourTourCard4
