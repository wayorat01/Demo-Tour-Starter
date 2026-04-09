// Design Version 4: Parallelogram cards
// Image Aspect Ratio: 1:1 (Square)
// Default Border Radius: 12px
// Max Items Per View: 4
// Layout: Centered heading + 4-column parallelogram card carousel with dot navigation

'use client'

import React, { useState, useEffect, useCallback } from 'react'
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

type WowtourPopularCountry4Props = WowtourPopularCountryBlock & {
  publicContext: PublicContextProps
}

// Skew angle for parallogram effect
const SKEW_ANGLE = -5

export const WowtourPopularCountry4: React.FC<WowtourPopularCountry4Props> = ({
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
  const borderRadius = imageSettings?.borderRadius ?? 12
  const hoverColor = imageSettings?.hoverColor ?? 'primary'
  const displayMode = displayModeProp ?? 'slide'

  const MAX_VISIBLE_ITEMS = 4

  const [api, setApi] = useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])
  const [showAll, setShowAll] = useState(false)

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
  const visibleCountries = showAll ? countries : countries.slice(0, MAX_VISIBLE_ITEMS)

  // Hover overlay class helpers
  const getHoverOverlayClass = () => {
    return hoverColor === 'secondary' ? 'bg-secondary/60' : 'bg-primary/60'
  }
  const getHoverTextClass = () => {
    return hoverColor === 'secondary' ? 'text-secondary-foreground' : 'text-primary-foreground'
  }

  const renderCountryCard = (country: (typeof countries)[0], index: number) => {
    const tour = country.pageCountriesLink as Intertour
    const image = tour?.thumbnail as MediaType
    const tourTitle = tour?.title || ''
    const tourSlug = tour?.slug || ''
    const flagCode = (tour as any)?.flagCode as string | undefined

    const content = (
      <div className="group flex flex-col items-center px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-4">
        {/* Parallelogram card container */}
        <div
          className="relative w-full cursor-pointer overflow-hidden transition-all duration-500 ease-out group-hover:scale-[1.03]"
          style={{
            transform: `skewX(${SKEW_ANGLE}deg)`,
            borderRadius: `${borderRadius}px`,
          }}
        >
          {/* Image — counter-skew to keep it straight */}
          <div
            className="relative w-full overflow-hidden"
            style={{
              transform: `skewX(${-SKEW_ANGLE}deg) scale(1.15)`,
              aspectRatio: '1 / 1',
            }}
          >
            {image && (
              <Media
                resource={image}
                fill
                imgClassName="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
              />
            )}
          </div>

          {/* Hover overlay with flag image */}
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center transition-opacity duration-300',
              flagCode
                ? 'opacity-0 group-hover:opacity-100 ' + getHoverOverlayClass()
                : 'bg-black/40 opacity-0 group-hover:opacity-100',
            )}
          >
            {flagCode ? (
              <img
                src={getFlagImageUrl(flagCode)}
                alt={`${tourTitle} flag`}
                className="h-14 w-14 rounded-full object-cover drop-shadow-lg md:h-18 md:w-18"
                style={{ transform: `skewX(${-SKEW_ANGLE}deg)` }}
              />
            ) : (
              tourTitle && (
                <span
                  className="px-2 text-center text-lg font-bold text-white italic md:text-xl"
                  style={{ transform: `skewX(${-SKEW_ANGLE}deg)` }}
                >
                  {tourTitle}
                </span>
              )
            )}
          </div>
        </div>

        {/* Country name — outside the card, below the image */}
        {tourTitle && (
          <span className="mt-2 block text-center text-sm font-medium md:text-base">
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

  return (
    <section className="w-full overflow-hidden px-4 py-10 sm:px-6 sm:py-12 md:py-16 lg:px-8">
      <div className="container">
        {/* Heading Section */}
        <div className="mb-4 flex flex-col items-center text-center sm:mb-5 md:mb-6">
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
          {shouldUseSlide && (
            /* Carousel with 4 items per view, slide 1 at a time */
            <div className="relative">
              <Carousel
                setApi={setApi}
                opts={{
                  align: 'start',
                  loop: true,
                  slidesToScroll: 1,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-2 md:-ml-3">
                  {countries.map((country, index) => (
                    <CarouselItem
                      key={index}
                      className="basis-1/2 pl-2 sm:basis-1/3 md:basis-1/4 md:pl-3"
                    >
                      {renderCountryCard(country, index)}
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              {/* Navigation Arrows */}
              <Button
                variant="outline"
                size="icon"
                className="bg-background/90 text-primary border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary absolute top-1/2 left-2 z-10 hidden h-8 w-8 -translate-y-1/2 rounded-full shadow-lg transition-colors sm:flex md:left-0 md:h-10 md:w-10 md:-translate-x-1/2"
                onClick={scrollPrev}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="bg-background/90 text-primary border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary absolute top-1/2 right-2 z-10 hidden h-8 w-8 -translate-y-1/2 rounded-full shadow-lg transition-colors sm:flex md:right-0 md:h-10 md:w-10 md:translate-x-1/2"
                onClick={scrollNext}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>

              {/* Dot Indicators */}
              {scrollSnaps.length > 1 && (
                <div className="mt-2 flex justify-center gap-1.5 sm:mt-3 md:mt-4">
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
          )}

          {shouldUseShowAll && (
            /* Grid 4 columns — Show All mode */
            <div className="flex flex-col items-center gap-4">
              <div className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                {visibleCountries.map((country, index) => renderCountryCard(country, index))}
              </div>

              {!showAll && countries.length > MAX_VISIBLE_ITEMS && (
                <Button
                  variant="default"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setShowAll(true)}
                >
                  แสดงทั้งหมด ({countries.length})
                </Button>
              )}

              {showAll && (
                <Button variant="outline" onClick={() => setShowAll(false)}>
                  แสดงน้อยลง
                </Button>
              )}
            </div>
          )}

          {!hasOverflow && (
            /* Grid 4 columns — items fit without overflow */
            <div className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
              {countries.map((country, index) => renderCountryCard(country, index))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default WowtourPopularCountry4
