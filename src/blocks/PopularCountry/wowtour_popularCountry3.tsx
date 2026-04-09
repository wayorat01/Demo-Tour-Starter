// Design Version 3: Card-based layout with image + content area
// Image Aspect Ratio: 4:3 (landscape)
// Card Style: Rounded corners, shadow, white content area
// Layout: Heading on top + 3-column card grid

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

type WowtourPopularCountry3Props = WowtourPopularCountryBlock & {
  publicContext: PublicContextProps
}

const MAX_VISIBLE_ITEMS = 6

export const WowtourPopularCountry3: React.FC<WowtourPopularCountry3Props> = ({
  headingSettings,
  countries,
  imageSettings,
  displayMode: displayModeProp,
  publicContext,
}) => {
  // Extract heading settings with defaults
  const heading = headingSettings?.heading ?? 'ประเทศยอดนิยม'
  const showHeadingIcon = headingSettings?.showHeadingIcon ?? false
  const headingIcon = headingSettings?.headingIcon
  const showDescription = headingSettings?.showDescription ?? false
  const description = headingSettings?.description ?? ''

  // Extract image settings with defaults
  const borderRadius = imageSettings?.borderRadius ?? 16
  const displayMode = 'showAll' // V3 always uses showAll mode

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

  const hasOverflow = countries.length >= 7
  const shouldUseSlide = hasOverflow && (displayMode as string) === 'slide'
  const shouldUseShowAll = hasOverflow

  // Items to display based on mode
  const visibleCountries = showAll ? countries : countries.slice(0, MAX_VISIBLE_ITEMS)

  const renderCountryCard = (country: (typeof countries)[0], index: number) => {
    const tour = country.pageCountriesLink as Intertour
    const image = tour?.thumbnail as MediaType
    const tourTitle = tour?.title || ''
    const tourSlug = tour?.slug || ''
    const tourCount = tour?.tourCount ?? 0
    const tourDescription = (country as any)?.tourDescription || ''

    const content = (
      <div
        className="group flex h-full flex-col overflow-hidden shadow-md transition-shadow duration-300 hover:shadow-xl"
        style={{ borderRadius: `${borderRadius}px` }}
      >
        {/* Image Section with Overlay */}
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4 / 3' }}>
          {image && (
            <Media
              resource={image}
              fill
              imgClassName="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            />
          )}

          {/* Gradient Overlay - black from bottom to transparent */}
          <div
            className="pointer-events-none absolute inset-0 z-[1]"
            style={{
              background:
                'linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.55) 30%, rgba(0, 0, 0, 0.25) 50%, transparent 70%)',
            }}
          />

          {/* Text Content on Image */}
          <div className="absolute right-0 bottom-0 left-0 z-[2] flex flex-col justify-end p-4">
            {/* Country Name */}
            {tourTitle && (
              <h3 className="mb-1 line-clamp-1 text-lg font-bold text-white drop-shadow-md">
                {tourTitle}
              </h3>
            )}

            {/* Tour Description */}
            {tourDescription && (
              <p className="line-clamp-3 text-sm leading-relaxed text-white/90 drop-shadow-sm">
                {tourDescription}
              </p>
            )}
          </div>
        </div>
      </div>
    )

    if (tourSlug) {
      return (
        <a key={index} href={`/intertours/${tourSlug}`} className="block h-full">
          {content}
        </a>
      )
    }

    return <div key={index}>{content}</div>
  }

  // Heading component
  const renderHeading = () => (
    <div className="mb-6 text-center md:mb-8">
      <div className="flex items-center justify-center gap-3">
        {showHeadingIcon && headingIcon && (
          <div className="relative h-8 w-8 flex-shrink-0">
            <Media resource={headingIcon as MediaType} fill imgClassName="object-contain" />
          </div>
        )}
        <h2 className="text-2xl leading-tight font-medium">{heading || 'ประเทศยอดนิยม'}</h2>
      </div>
      {showDescription && description && (
        <p className="text-muted-foreground mx-auto mt-2 max-w-2xl text-sm md:text-base">
          {description}
        </p>
      )}
    </div>
  )

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
        <CarouselContent className="-ml-3 md:-ml-4">
          {countries.map((country, index) => (
            <CarouselItem
              key={index}
              className="basis-[85%] pl-3 sm:basis-1/2 md:basis-1/3 md:pl-4"
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
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
        {visibleCountries.map((country, index) => renderCountryCard(country, index))}
      </div>

      {!showAll && countries.length >= 7 && (
        <Button
          variant="default"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setShowAll(true)}
        >
          ดูเพิ่มเติม ({countries.length})
        </Button>
      )}

      {showAll && (
        <Button variant="outline" onClick={() => setShowAll(false)}>
          แสดงน้อยลง
        </Button>
      )}
    </div>
  )

  const renderGridMode = () => (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-5">
      {countries.map((country, index) => renderCountryCard(country, index))}
    </div>
  )

  // For slide mode
  if (shouldUseSlide) {
    return (
      <section className="w-full py-12 md:py-16">
        <div className="container">
          {renderHeading()}
          {renderSlideMode()}
        </div>
      </section>
    )
  }

  return (
    <section className="w-full py-12 md:py-16">
      <div className="container">
        {renderHeading()}
        {shouldUseShowAll && renderShowAllMode()}
        {!hasOverflow && renderGridMode()}
      </div>
    </section>
  )
}

export default WowtourPopularCountry3
