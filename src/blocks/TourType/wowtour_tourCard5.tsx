'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Autoplay from 'embla-carousel-autoplay'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { CarouselApi } from '@/components/ui/carousel'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { Media } from '@/components/Media'
import type { WowtourTourTypeBlock, Media as MediaType, Intertour } from '@/payload-types'
import type { PublicContextProps } from '@/utilities/publicContextProps'
import { cn } from '@/utilities/cn'
import './wowtour_tourCard5.css'

export type TourItem = any & {
  interTourSlug?: string | null
}

type WowtourTourCard5Props = Omit<WowtourTourTypeBlock, 'tourProgramRefs'> & {
  tours: TourItem[]
  apiTitle?: string | null
  publicContext: PublicContextProps
}

type TabKey = 'details' | 'periods'

/** Horizontal card with tab-based detail / travel-period switching */
export const TourCard5Item: React.FC<{
  tour: TourItem
  borderRadius: number
  columns?: number
}> = ({ tour, borderRadius, columns = 1 }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('details')
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
    <div className="tour5-card-wrap" style={{ borderRadius: `${borderRadius + 6}px` }}>
      <div
        className={cn('tour5-card', columns >= 2 && 'tour5-card--compact')}
        style={{ borderRadius: `${borderRadius}px`, cursor: 'pointer' }}
        onClick={() => {
          window.location.href = detailUrl
        }}
      >
        {/* Image — left */}
        <a href={detailUrl} className="tour5-image-wrap" style={{ textDecoration: 'none' }}>
          {coverImage && (
            <Media
              resource={coverImage}
              fill
              imgClassName="tour5-cover-img"
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
        <div className="tour5-content">
          <div className="tour5-body">
            {/* Title */}
            <h3 className="tour5-title">{tour.tourTitle}</h3>

            {/* Tour Code */}
            {toggle?.showTourCode && tour.tourCode && (
              <p className="tour5-code">
                รหัสทัวร์ <strong>{tour.tourCode}</strong>
              </p>
            )}

            {/* Tabs */}
            <div className="tour5-tabs">
              <button
                type="button"
                className={cn('tour5-tab', activeTab === 'details' && 'tour5-tab--active')}
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveTab('details')
                }}
              >
                รายละเอียด
              </button>
              {hasPeriods && (
                <button
                  type="button"
                  className={cn('tour5-tab', activeTab === 'periods' && 'tour5-tab--active')}
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveTab('periods')
                  }}
                >
                  ช่วงเวลา
                </button>
              )}
            </div>

            {/* Tab content — both panels rendered, inactive hidden */}
            <div className="tour5-tab-content">
              <div
                className={cn(
                  'tour5-tab-panel',
                  activeTab === 'details' && 'tour5-tab-panel--active',
                )}
              >
                {toggle?.showDescription && tour.tourDescription && (
                  <p className="tour5-desc">{tour.tourDescription}</p>
                )}
              </div>

              {hasPeriods && (
                <div
                  className={cn(
                    'tour5-tab-panel',
                    activeTab === 'periods' && 'tour5-tab-panel--active',
                  )}
                >
                  <div className="tour5-periods-grid">
                    {tour.travelPeriods!.slice(0, 5).map((p, i) => (
                      <div key={i} className="tour5-period-item">
                        {p.startDate && p.endDate
                          ? `${fmt(p.startDate)} - ${fmt(p.endDate)}`
                          : p.startDate
                            ? fmt(p.startDate)
                            : ''}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '4px', fontSize: '0.72rem', color: '#64748b' }}>
                    ( {tour.travelPeriods!.length} ช่วงเวลาเดินทาง )
                  </div>
                  {tour.travelPeriods!.length > 5 && (
                    <a
                      href={detailUrl}
                      style={{
                        display: 'block',
                        marginTop: '4px',
                        fontSize: '0.75rem',
                        color: 'var(--primary)',
                        textDecoration: 'none',
                      }}
                    >
                      ดูเพิ่มเติมอีก {tour.travelPeriods!.length - 5} ช่วง →
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="tour5-footer">
            <div className="tour5-footer-left">
              {/* Airline logo */}
              {toggle?.showAirline && tour.airlineLogo && (
                <div className="tour5-airline-logo">
                  <Media
                    resource={tour.airlineLogo as MediaType}
                    fill
                    imgClassName="object-contain"
                  />
                </div>
              )}

              {/* Duration */}
              {toggle?.showDuration && (tour.stayDay || tour.stayNight) && (
                <span className="tour5-footer-duration">
                  {tour.stayDay && `${tour.stayDay} วัน`}
                  {tour.stayDay && tour.stayNight && ' '}
                  {tour.stayNight && `${tour.stayNight} คืน`}
                </span>
              )}
            </div>

            {/* Price */}
            {toggle?.showStartPrice &&
              tour.startPrice &&
              (() => {
                const formatPrice = (val: string | number) => {
                  const num = typeof val === 'string' ? Number(val.replace(/,/g, '')) : val
                  return isNaN(num) ? val : num.toLocaleString('en-US')
                }
                const hasDiscount = toggle?.showDiscountPrice && tour.discountPrice
                return (
                  <div className="tour5-footer-price-wrap">
                    <span className="tour5-footer-price-label">เริ่ม</span>
                    {hasDiscount && (
                      <span className="tour5-footer-price-original">
                        {formatPrice(tour.startPrice)}
                      </span>
                    )}
                    <span>
                      <span className="tour5-footer-price">
                        {hasDiscount
                          ? formatPrice(tour.discountPrice!)
                          : formatPrice(tour.startPrice)}
                      </span>{' '}
                      <span className="tour5-footer-price-unit">บ.</span>
                    </span>
                  </div>
                )
              })()}
          </div>
        </div>
      </div>
    </div>
  )
}

export const WowtourTourCard5: React.FC<WowtourTourCard5Props> = ({
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

  const slideBasis = columns === 2 ? 'basis-full lg:basis-1/2' : 'basis-full'

  const renderTourCard = (tour: TourItem, index: number) => (
    <TourCard5Item key={index} tour={tour} borderRadius={borderRadius} columns={columns} />
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
        className="tour5-grid"
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

export default WowtourTourCard5
