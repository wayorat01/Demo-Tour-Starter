'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Autoplay from 'embla-carousel-autoplay'
import { ChevronLeft, ChevronRight, Plane } from 'lucide-react'

import type { CarouselApi } from '@/components/ui/carousel'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { Media } from '@/components/Media'
import type { WowtourTourTypeBlock, Media as MediaType, Intertour } from '@/payload-types'
import type { PublicContextProps } from '@/utilities/publicContextProps'
import { cn } from '@/utilities/cn'
import './wowtour_tourCard3.css'

export type TourItem = any & {
  interTourSlug?: string | null
}

type WowtourTourCard3Props = Omit<WowtourTourTypeBlock, 'tourProgramRefs'> & {
  tours: TourItem[]
  apiTitle?: string | null
  publicContext: PublicContextProps
}

/** Detailed card with airline logo, pink period, and price pill */
export const TourCard3Item: React.FC<{
  tour: TourItem
  borderRadius: number
}> = ({ tour, borderRadius }) => {
  const toggle = tour.toggleSettings
  const coverImage = tour.coverImage as MediaType

  // Format travel periods
  const formatPeriods = () => {
    if (!tour.travelPeriods || tour.travelPeriods.length === 0) return null
    const p = tour.travelPeriods[0]
    if (!p.startDate) return null
    const fmt = (d: string) => {
      const date = new Date(d)
      return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
    }
    let text = ''
    if (p.endDate) {
      text = `${fmt(p.startDate)} - ${fmt(p.endDate)}`
    } else {
      text = fmt(p.startDate)
    }
    if (tour.travelPeriods.length >= 1) {
      text += ` (${tour.travelPeriods.length} ช่วงเวลาเดินทาง)`
    }
    return text
  }

  const periodText = toggle?.showTravelPeriod ? formatPeriods() : null

  return (
    <div className="tour3-card-wrap" style={{ borderRadius: `${borderRadius + 6}px` }}>
      <div className="tour3-card" style={{ borderRadius: `${borderRadius}px` }}>
        {/* Header: Cover Image + Badges */}
        <a
          href={
            tour.interTourSlug
              ? `/intertours/${tour.interTourSlug}/${tour.tourCode || tour.id}`
              : '#'
          }
          className="tour3-header"
          style={{ display: 'block', textDecoration: 'none' }}
        >
          {coverImage && (
            <Media
              resource={coverImage}
              fill
              imgClassName="tour3-image"
              size="(max-width: 430px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}

          {/* Country tag — bottom left */}
          {toggle?.showCountryTag && tour.countryName && (
            <span className="tour3-country-tag">{tour.countryName}</span>
          )}

          {/* Recommended badge — bottom right */}
          {toggle?.showRecommendedTag && tour.recommendedLabel && (
            <span className="tour3-recommended">{tour.recommendedLabel}</span>
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

        {/* Body */}
        <div className="tour3-body">
          {/* Airline */}
          {toggle?.showAirline && (tour.airlineLogo || tour.airlineName) && (
            <div className="tour3-airline">
              {tour.airlineLogo ? (
                <div className="tour3-airline-logo-wrap">
                  <Media
                    resource={tour.airlineLogo as MediaType}
                    fill
                    imgClassName="object-contain"
                  />
                </div>
              ) : (
                <>
                  <Plane size={14} className="tour3-airline-icon" />
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{tour.airlineName}</span>
                </>
              )}
            </div>
          )}

          {/* Title */}
          <h3 className="tour3-title">{tour.tourTitle}</h3>

          {/* Travel period — pink */}
          {periodText && <span className="tour3-period">{periodText}</span>}

          {/* Divider */}
          <div className="tour3-divider" />

          {/* Description */}
          {toggle?.showDescription && tour.tourDescription && (
            <p className="tour3-desc">{tour.tourDescription}</p>
          )}
        </div>

        {/* Footer: Duration + Price pill */}
        <div className="tour3-footer">
          {toggle?.showDuration && (tour.stayDay || tour.stayNight) && (
            <span className="tour3-duration">
              {tour.stayDay && `${tour.stayDay} วัน`}
              {tour.stayDay && tour.stayNight && ' '}
              {tour.stayNight && `${tour.stayNight} คืน`}
            </span>
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
                <span
                  className={`tour3-price-pill ${hasDiscount ? 'tour3-price-pill--discount' : ''}`}
                >
                  <span className="tour3-price-pill-row1">
                    <span className="tour3-price-pill-label">เริ่ม</span>
                    {hasDiscount && (
                      <span className="tour3-price-original">{formatPrice(tour.startPrice)}</span>
                    )}
                  </span>
                  <span className="tour3-price-pill-row2">
                    <span className="tour3-price-pill-amount">
                      {hasDiscount
                        ? formatPrice(tour.discountPrice!)
                        : formatPrice(tour.startPrice)}
                    </span>
                    <span className="tour3-price-pill-unit">บ.</span>
                  </span>
                </span>
              )
            })()}
        </div>
      </div>
    </div>
  )
}

export const WowtourTourCard3: React.FC<WowtourTourCard3Props> = ({
  headingSettings,
  apiTitle,
  tours,
  cardSettings,
  sliderSettings,
  displayMode: displayModeProp,
  columnsPerRow: columnsPerRowProp,
  maxItemsToShow: maxItemsToShowProp,
  maxVisibleCards: maxVisibleCardsProp,
  publicContext,
}) => {
  const heading = apiTitle
  const showHeadingIcon = headingSettings?.showHeadingIcon ?? false
  const headingIcon = headingSettings?.headingIcon
  const showDescription = headingSettings?.showDescription ?? false
  const description = headingSettings?.description

  const borderRadius = cardSettings?.borderRadius ?? 16
  const columns = parseInt((columnsPerRowProp as string) || '2', 10)
  const displayMode = displayModeProp ?? 'slide'
  const itemsLimit =
    maxItemsToShowProp === 'showAll' || !maxItemsToShowProp
      ? Infinity
      : parseInt(maxItemsToShowProp as string, 10)

  const autoPlay = sliderSettings?.autoPlay ?? false
  const autoPlayDelay = Number(sliderSettings?.autoPlayDelay) || 10000
  const loop = sliderSettings?.loop ?? true

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

  const [showAll, setShowAll] = useState(false)
  const [windowWidth, setWindowWidth] = useState(0)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWindowWidth(window.innerWidth)
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!tours || tours.length === 0) return null

  const shouldUseSlide = displayMode === 'slide'

  // Determine effective columns based on responsive breakpoints: Match CMS settings
  const getEffectiveCols = () => {
    if (windowWidth <= 430) return 1
    if (windowWidth <= 1023) return Math.min(columns, 2)
    if (windowWidth <= 1279) return Math.min(columns, 3)
    return columns
  }
  const effectiveCols = getEffectiveCols()

  // Sizing for isolated, incomplete rows to ensure they look compact instead of stretched
  const isolatedCols = (() => {
    if (windowWidth <= 430) return 1
    if (windowWidth <= 1023) return 2
    if (windowWidth <= 1279) return 3
    return 5
  })()

  // Cap visible items to full rows only (avoid orphans)
  const effectiveLimit = (() => {
    if (itemsLimit === Infinity || showAll) return tours.length
    // Round down to nearest multiple of effectiveCols
    const fullRows = Math.floor(itemsLimit / effectiveCols) * effectiveCols
    return fullRows > 0 ? fullRows : effectiveCols
  })()

  const hasOverflow = itemsLimit !== Infinity && tours.length > itemsLimit
  const visibleTours = tours.slice(0, effectiveLimit)
  const hiddenCount = tours.length - effectiveLimit

  const slideBasis = (() => {
    switch (columns) {
      case 5:
        return 'max-[430px]:basis-full basis-1/2 lg:basis-1/3 xl:basis-1/5'
      case 4:
        return 'max-[430px]:basis-full basis-1/2 lg:basis-1/3 xl:basis-1/4'
      case 3:
        return 'max-[430px]:basis-full basis-1/2 lg:basis-1/3'
      case 2:
      default:
        return 'max-[430px]:basis-full basis-1/2'
    }
  })()

  const renderTourCard = (tour: TourItem, index: number) => (
    <TourCard3Item key={index} tour={tour} borderRadius={borderRadius} />
  )

  const renderSlideMode = () => (
    <div className="relative">
      <Carousel
        setApi={setApi}
        opts={{ align: 'start', loop }}
        plugins={autoPlay ? [Autoplay({ delay: autoPlayDelay, stopOnInteraction: true })] : []}
        className="w-full"
      >
        <CarouselContent
          className={tours.length < columns ? 'justify-center py-4' : '-ml-3 py-4 md:-ml-4'}
        >
          {tours.map((tour, index) => {
            const itemBasis = tours.length < columns 
              ? 'max-[430px]:basis-full basis-1/2 lg:basis-1/3 xl:basis-1/5' 
              : slideBasis;
            return (
              <CarouselItem key={index} className={`pl-3 md:pl-4 ${itemBasis}`} style={tours.length < columns ? { maxWidth: '280px' } : undefined}>
                {renderTourCard(tour, index)}
              </CarouselItem>
            );
          })}
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

  // For grid mode, match CMS columns
  const gridColumns = columns

  const renderGridMode = () => (
    <>
      <div
        className={cn(
          visibleTours.length < effectiveCols ? 'flex flex-wrap justify-center gap-4' : 'tour3-grid',
          gridColumns >= 4 && 'tour3-grid--many-cols',
          gridColumns >= 3 && 'tour3-grid--3plus-cols',
          gridColumns === 5 && 'tour3-grid--5cols',
          gridColumns === 2 && 'tour3-grid--2cols',
        )}
        style={visibleTours.length < effectiveCols ? undefined : { gridTemplateColumns: `repeat(${effectiveCols}, 1fr)` }}
      >
        {visibleTours.map((tour, index) => 
          visibleTours.length < effectiveCols ? (
            <div key={index} style={{ width: `calc((100% - ${(isolatedCols - 1) * 16}px) / ${isolatedCols})`, maxWidth: '280px' }}>
              {renderTourCard(tour, index)}
            </div>
          ) : (
            renderTourCard(tour, index)
          )
        )}
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
              ? `ซ่อน (แสดง ${effectiveLimit} รายการ)`
              : `ดูเพิ่มเติม (${hiddenCount} รายการ)`}
          </button>
        </div>
      )}
    </>
  )

  return (
    <section className="w-full pt-[36px] pb-12 md:pb-16">
      <div className="container">
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

        <div className="w-full">{shouldUseSlide ? renderSlideMode() : renderGridMode()}</div>
      </div>
    </section>
  )
}

export default WowtourTourCard3
