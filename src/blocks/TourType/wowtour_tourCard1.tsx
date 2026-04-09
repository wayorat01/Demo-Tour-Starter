'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Autoplay from 'embla-carousel-autoplay'
import { ChevronLeft, ChevronRight, FileText, FileIcon, ImageIcon, Eye } from 'lucide-react'

import type { CarouselApi } from '@/components/ui/carousel'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { Media } from '@/components/Media'
import type { WowtourTourTypeBlock, Media as MediaType, Intertour } from '@/payload-types'
import type { PublicContextProps } from '@/utilities/publicContextProps'
import { cn } from '@/utilities/cn'
import './wowtour_tourCard1.css'

export type TourItem = any & {
  interTourSlug?: string | null
}

type WowtourTourCard1Props = Omit<WowtourTourTypeBlock, 'tourProgramRefs'> & {
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

/** Sub-component: Tour Card with internal tab state */
export const TourCardItem: React.FC<{
  tour: TourItem
  borderRadius: number
}> = ({ tour, borderRadius }) => {
  const [activeTab, setActiveTab] = useState<'detail' | 'period'>('detail')
  const toggle = tour.toggleSettings
  const coverImage = tour.coverImage as MediaType

  const hasDescription = toggle?.showDescription && tour.tourDescription
  const hasPeriods = toggle?.showTravelPeriod && tour.travelPeriods && tour.travelPeriods.length > 0
  const showTabs = hasDescription || hasPeriods

  return (
    <div className="tour-card-wrap" style={{ borderRadius: `${borderRadius + 6}px` }}>
      <div className="tour-card" style={{ borderRadius: `${borderRadius}px` }}>
        {/* Header: Cover Image + Tags */}
        <a
          href={
            tour.interTourSlug
              ? `/intertours/${tour.interTourSlug}/${tour.tourCode || tour.id}`
              : '#'
          }
          className="tour-header tour-header-link"
        >
          {coverImage && (
            <Media
              resource={coverImage}
              fill
              imgClassName="tour-image"
              size="(max-width: 430px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}

          {/* Country Tag */}
          {toggle?.showCountryTag && tour.countryName && (
            <span className="tour-tag tour-tag--country">{tour.countryName}</span>
          )}

          {/* Recommended Tag */}
          {toggle?.showRecommendedTag && tour.recommendedLabel && (
            <span className="tour-tag tour-tag--recommended">
              <img
                src="/images/icons/fire-recommended.png"
                alt={tour.recommendedLabel}
                className="tour-recommended-icon"
              />
            </span>
          )}

          {/* Tour Code */}
          {toggle?.showTourCode && tour.tourCode && (
            <span className="tour-code">{tour.tourCode}</span>
          )}

          {/* Discount Percent Badge */}
          {(tour as any).discountPercent && (
            <span className="tour-discount-badge">-{(tour as any).discountPercent}%</span>
          )}
        </a>

        {/* Body */}
        <div className="tour-body">
          {/* Tour Title */}
          <h3 className="tour-title">{tour.tourTitle}</h3>

          {/* Tabs: รายละเอียด / ช่วงเวลา */}
          {showTabs && (
            <div className="tour-tabs">
              <div className="tour-tabs-header">
                <button
                  type="button"
                  className={cn('tour-tab-btn', activeTab === 'detail' && 'tour-tab-btn--active')}
                  onClick={() => setActiveTab('detail')}
                >
                  รายละเอียด
                </button>
                {hasPeriods && (
                  <button
                    type="button"
                    className={cn('tour-tab-btn', activeTab === 'period' && 'tour-tab-btn--active')}
                    onClick={() => setActiveTab('period')}
                  >
                    ช่วงเวลา
                  </button>
                )}
              </div>

              <div className="tour-tabs-content">
                {/* Tab: รายละเอียด */}
                {activeTab === 'detail' && hasDescription && (
                  <p className="tour-desc">{tour.tourDescription}</p>
                )}

                {/* Tab: ช่วงเวลา */}
                {activeTab === 'period' && hasPeriods && (
                  <div className="tour-periods">
                    {tour.travelPeriods!.slice(0, 5).map((p, i) => {
                      const fmt = (d: string) => {
                        const date = new Date(d)
                        return date.toLocaleDateString('th-TH', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })
                      }
                      return (
                        <div key={i} className="tour-period-item">
                          {p.startDate && p.endDate
                            ? `${fmt(p.startDate)} - ${fmt(p.endDate)}`
                            : p.startDate
                              ? fmt(p.startDate)
                              : ''}
                        </div>
                      )
                    })}
                    <div className="tour-period-count">
                      ( {tour.travelPeriods!.length} ช่วงเวลาเดินทาง )
                    </div>
                    {tour.travelPeriods!.length > 5 && (
                      <a
                        href={
                          tour.interTourSlug
                            ? `/intertours/${tour.interTourSlug}/${tour.tourCode || tour.id}`
                            : '#'
                        }
                        className="tour-period-count"
                        style={{ color: 'var(--primary)', textDecoration: 'none' }}
                      >
                        ดูเพิ่มเติมอีก {tour.travelPeriods!.length - 5} ช่วง →
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Duration + Price Row */}
          <div className="tour-info-row">
            {toggle?.showAirline && tour.airlineLogo && (
              <div className="tour-airline relative shrink-0" style={{ width: 28, height: 20 }}>
                <Media
                  resource={tour.airlineLogo as MediaType}
                  fill
                  imgClassName="object-contain"
                />
              </div>
            )}
            {toggle?.showDuration && (tour.stayDay || tour.stayNight) && (
              <span className="tour-duration">
                {tour.stayDay && `${tour.stayDay} วัน`}
                {tour.stayDay && tour.stayNight && ' '}
                {tour.stayNight && `${tour.stayNight} คืน`}
              </span>
            )}
            {/* Price Section */}
            {toggle?.showStartPrice &&
              tour.startPrice &&
              (() => {
                const formatPrice = (val: string | number) => {
                  const num = typeof val === 'string' ? Number(val.replace(/,/g, '')) : val
                  return isNaN(num) ? val : num.toLocaleString('en-US')
                }
                return (
                  <div className="tour-price-section">
                    {toggle?.showDiscountPrice && tour.discountPrice ? (
                      <>
                        <span className="tour-price-original">
                          {formatPrice(tour.startPrice)} บาท
                        </span>
                        <span className="tour-price">
                          เริ่ม <strong>{formatPrice(tour.discountPrice)}</strong> บาท
                        </span>
                      </>
                    ) : (
                      <span className="tour-price">
                        เริ่ม <strong>{formatPrice(tour.startPrice)}</strong> บาท
                      </span>
                    )}
                  </div>
                )
              })()}
          </div>
        </div>

        {/* Footer: Buttons */}
        <div className="tour-footer">
          {(() => {
            // New select: cardDownloadButton (pdf | word | banner | none)
            const dlBtn = (toggle as any)?.cardDownloadButton
            // Backward compat: fallback to old checkboxes
            const showPdf = dlBtn === 'pdf' || (!dlBtn && (toggle as any)?.showPdfButton)
            const showWord = dlBtn === 'word' || (!dlBtn && (toggle as any)?.showWordButton)
            const showBanner = dlBtn === 'banner' || (!dlBtn && (toggle as any)?.showBannerButton)

            return (
              <>
                {showPdf && (
                  <a
                    href={getLinkUrl(tour.pdfLink) || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tour-btn tour-btn--pdf"
                  >
                    <FileText size={14} />
                    PDF
                  </a>
                )}
                {showWord && (
                  <a
                    href={getLinkUrl(tour.wordLink) || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tour-btn tour-btn--word"
                  >
                    <FileIcon size={14} />
                    Word
                  </a>
                )}
                {showBanner && (
                  <a
                    href={getLinkUrl(tour.bannerLink) || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tour-btn tour-btn--banner"
                  >
                    <ImageIcon size={14} />
                    Banner
                  </a>
                )}
              </>
            )
          })()}
          {toggle?.showDetailButton && (
            <a
              href={
                tour.interTourSlug
                  ? `/intertours/${tour.interTourSlug}/${tour.tourCode || tour.id}`
                  : '#'
              }
              className="tour-btn tour-btn--detail"
            >
              <Eye size={14} />
              ดูรายละเอียด
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export const WowtourTourCard1: React.FC<WowtourTourCard1Props> = ({
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
  // Heading
  const heading = apiTitle
  const showHeadingIcon = headingSettings?.showHeadingIcon ?? false
  const headingIcon = headingSettings?.headingIcon
  const showDescription = headingSettings?.showDescription ?? false
  const description = headingSettings?.description

  // Card Settings
  const borderRadius = cardSettings?.borderRadius ?? 12
  const columns = parseInt((columnsPerRowProp as string) || '4', 10)
  const displayMode = displayModeProp ?? 'slide'
  const itemsLimit =
    maxItemsToShowProp === 'showAll' || !maxItemsToShowProp
      ? Infinity
      : parseInt(maxItemsToShowProp as string, 10)

  // Slider Settings
  const autoPlay = sliderSettings?.autoPlay ?? false
  const autoPlayDelay = Number(sliderSettings?.autoPlayDelay) || 10000
  const loop = sliderSettings?.loop ?? true

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

  // Responsive columns for grid mode: Match CMS settings
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

  const effectiveLimit = (() => {
    if (itemsLimit === Infinity || showAll) return tours.length
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

  const gridColumns = columns

  // Render a single Tour Card
  const renderTourCard = (tour: TourItem, index: number) => (
    <TourCardItem key={index} tour={tour} borderRadius={borderRadius} />
  )

  // Slide mode
  const renderSlideMode = () => (
    <div className="relative">
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
          {tours.map((tour, index) => {
            const itemBasis = tours.length < columns 
              ? 'max-[430px]:basis-full basis-1/2 lg:basis-1/3 xl:basis-1/5' 
              : slideBasis;
            return (
              <CarouselItem
                key={index}
                className={`pl-3 md:pl-4 ${itemBasis}`}
                style={tours.length < columns ? { maxWidth: '280px' } : undefined}
              >
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
        className={visibleTours.length < effectiveCols ? 'flex flex-wrap justify-center' : 'tour-grid'}
        style={visibleTours.length < effectiveCols ? { gap: '16px' } : { gridTemplateColumns: `repeat(${effectiveCols}, 1fr)` }}
      >
        {visibleTours.map((tour, index) => 
          visibleTours.length < effectiveCols ? (
            <div key={index} style={{ width: `calc((100% - ${(isolatedCols - 1) * 16}px) / ${isolatedCols})`, maxWidth: '280px' }}>
              {renderTourCard(tour, index)}
            </div>
          ) : (
            <div key={index}>
              {renderTourCard(tour, index)}
            </div>
          )
        )}
      </div>

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
        {/* Heading Section */}
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

export default WowtourTourCard1
