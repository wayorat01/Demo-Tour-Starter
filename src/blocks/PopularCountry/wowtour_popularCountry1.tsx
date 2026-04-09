'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Autoplay from 'embla-carousel-autoplay'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { CarouselApi } from '@/components/ui/carousel'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { Media } from '@/components/Media'
import type { WowtourPopularCountryBlock, Media as MediaType, Intertour } from '@/payload-types'
import type { PublicContextProps } from '@/utilities/publicContextProps'
import { cn } from '@/utilities/cn'

/** Get flag image URL from 2-letter country code (e.g. JP, KR) */
function getFlagImageUrl(code: string): string {
  return `https://flagcdn.com/w160/${code.toLowerCase()}.png`
}

type WowtourPopularCountry1Props = WowtourPopularCountryBlock & {
  publicContext: PublicContextProps
}

const MAX_VISIBLE_ITEMS = 5

export const WowtourPopularCountry1: React.FC<WowtourPopularCountry1Props> = ({
  headingSettings,
  countries,
  imageSettings,
  displayMode: displayModeProp,
  publicContext,
}) => {
  // Extract heading settings with defaults
  const heading = headingSettings?.heading ?? 'ทัวร์ประเทศยอดนิยม'
  const showHeadingIcon = headingSettings?.showHeadingIcon ?? false
  const headingIcon = headingSettings?.headingIcon
  const showDescription = headingSettings?.showDescription ?? false
  const description = headingSettings?.description

  // Extract image settings with defaults
  const borderRadius = imageSettings?.borderRadius ?? 999
  const displayMode = displayModeProp ?? 'slide'
  const showBorderOnHover = imageSettings?.showBorderOnHover ?? false
  const hoverColor = imageSettings?.hoverColor ?? 'primary'

  const [api, setApi] = useState<CarouselApi>()
  const [showAll, setShowAll] = useState(false)
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedIndex(api.selectedScrollSnap())
    })
  }, [api])

  if (!countries || countries.length === 0) return null

  const hasOverflow = countries.length > MAX_VISIBLE_ITEMS
  const shouldUseSlide = hasOverflow && displayMode === 'slide'
  const shouldUseShowAll = hasOverflow && displayMode === 'showAll'

  // Items to display based on mode
  const visibleCountries = showAll ? countries : countries.slice(0, MAX_VISIBLE_ITEMS)

  // Get hover classes based on settings
  const getHoverOverlayClass = () => {
    if (hoverColor === 'secondary') {
      return 'bg-secondary/60'
    }
    return 'bg-primary/60'
  }

  const getHoverTextClass = () => {
    if (hoverColor === 'secondary') {
      return 'text-secondary-foreground'
    }
    return 'text-primary-foreground'
  }

  const getBorderStyle = () => {
    if (!showBorderOnHover) return {}
    const color = hoverColor === 'secondary' ? 'hsl(var(--secondary))' : 'hsl(var(--primary))'
    return {
      boxShadow: `0 0 0 4px ${color}`,
    }
  }

  const renderCountryItem = (country: (typeof countries)[0], index: number) => {
    const tour = country.pageCountriesLink as Intertour
    const image =
      tour?.thumbnail && typeof tour.thumbnail === 'object' ? (tour.thumbnail as MediaType) : null
    const flagIconMedia =
      (tour as any)?.flagIcon && typeof (tour as any).flagIcon === 'object'
        ? ((tour as any).flagIcon as MediaType)
        : null
    const tourTitle = tour?.title || ''
    const tourSlug = tour?.slug || ''
    const flagCode = (tour as any)?.flagCode as string | undefined

    const content = (
      <div className="flex flex-col items-center gap-2 sm:gap-3">
        <div
          className="group relative h-24 w-24 cursor-pointer transition-all duration-300 sm:h-28 sm:w-28 md:h-32 md:w-32 lg:h-40 lg:w-40"
          style={{ borderRadius: `${borderRadius}px` }}
        >
          {/* Image container */}
          <div
            className="relative h-full w-full overflow-hidden transition-shadow duration-300"
            style={{
              borderRadius: `${borderRadius}px`,
            }}
          >
            {image ? (
              <Media
                resource={image}
                fill
                imgClassName="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : flagIconMedia ? (
              <div className="bg-muted/30 flex h-full w-full items-center justify-center">
                <Media
                  resource={flagIconMedia}
                  imgClassName="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain"
                />
              </div>
            ) : flagCode ? (
              <div className="bg-muted/30 flex h-full w-full items-center justify-center">
                <img
                  src={getFlagImageUrl(flagCode)}
                  alt={`${tourTitle} flag`}
                  className="h-16 w-16 rounded-full object-cover drop-shadow-lg sm:h-20 sm:w-20 md:h-24 md:w-24"
                />
              </div>
            ) : (
              <div className="bg-muted/30 flex h-full w-full items-center justify-center">
                <span className="text-muted-foreground text-xs">No Image</span>
              </div>
            )}

            {/* Hover Overlay — Flag image from flagCode */}
            {flagCode && (
              <div
                className={cn(
                  'absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100',
                  getHoverOverlayClass(),
                )}
                style={{ borderRadius: `${borderRadius}px` }}
              >
                <img
                  src={getFlagImageUrl(flagCode)}
                  alt={`${tourTitle} flag`}
                  className="h-10 w-10 rounded-full object-cover drop-shadow-lg sm:h-12 sm:w-12 md:h-16 md:w-16"
                />
              </div>
            )}
          </div>

          {/* Border overlay - appears on hover */}
          {showBorderOnHover && (
            <div
              className={cn(
                'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100',
                hoverColor === 'secondary' ? 'ring-secondary ring-4' : 'ring-primary ring-4',
              )}
              style={{ borderRadius: `${borderRadius}px` }}
            />
          )}
        </div>
        {tourTitle && (
          <span className="line-clamp-2 max-w-[8rem] text-center text-xs font-medium sm:max-w-[10rem] sm:text-sm md:text-base">
            {tourTitle}
          </span>
        )}
      </div>
    )

    if (tourSlug) {
      return (
        <a key={index} href={`/intertours/${tourSlug}`} className="block">
          {content}
        </a>
      )
    }

    return <div key={index}>{content}</div>
  }

  const renderSlideMode = () => (
    <div className="relative">
      <Carousel
        setApi={setApi}
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {countries.map((country, index) => (
            <CarouselItem
              key={index}
              className="basis-1/2 pl-2 sm:basis-1/3 md:basis-1/4 md:pl-4 lg:basis-1/5"
            >
              {renderCountryItem(country, index)}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Navigation Arrows */}
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

  const renderShowAllMode = () => (
    <div className="flex flex-col items-center gap-6">
      {/* Grid of visible items */}
      <div className="flex flex-wrap justify-center gap-6 md:gap-8">
        {visibleCountries.map((country, index) => renderCountryItem(country, index))}
      </div>

      {/* Show All Button */}
      {!showAll && countries.length > MAX_VISIBLE_ITEMS && (
        <Button
          variant="default"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setShowAll(true)}
        >
          แสดงทั้งหมด ({countries.length})
        </Button>
      )}

      {/* Collapse Button */}
      {showAll && (
        <Button variant="outline" onClick={() => setShowAll(false)}>
          แสดงน้อยลง
        </Button>
      )}
    </div>
  )

  const renderGridMode = () => (
    <div className="flex flex-wrap justify-center gap-6 md:gap-8">
      {countries.map((country, index) => renderCountryItem(country, index))}
    </div>
  )

  return (
    <section className="w-full py-12 md:py-16">
      <div className="container">
        {/* Heading Section */}
        <div className="mb-8 flex flex-col items-center text-center md:mb-12">
          <div className="mb-2 flex items-center gap-3">
            {showHeadingIcon && headingIcon && (
              <div className="relative h-8 w-8">
                <Media resource={headingIcon as MediaType} fill imgClassName="object-contain" />
              </div>
            )}
            <h2 className="text-2xl font-medium">{heading || 'ทัวร์ประเทศยอดนิยม'}</h2>
          </div>

          {showDescription && description && (
            <p className="text-muted-foreground mt-2 max-w-2xl">{description}</p>
          )}
        </div>

        {/* Countries Display */}
        <div className="w-full">
          {shouldUseSlide && renderSlideMode()}
          {shouldUseShowAll && renderShowAllMode()}
          {!hasOverflow && renderGridMode()}
        </div>
      </div>
    </section>
  )
}

export default WowtourPopularCountry1
