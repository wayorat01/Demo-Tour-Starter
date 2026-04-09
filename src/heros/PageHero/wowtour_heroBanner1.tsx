'use client'

import Autoplay from 'embla-carousel-autoplay'
import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { CarouselApi } from '@/components/ui/carousel'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { Media } from '@/components/Media'
import type { Page, Media as MediaType } from '@/payload-types'
import { PublicContextProps } from '@/utilities/publicContextProps'
import { cn } from '@/utilities/cn'
import WowtourSearch1 from '@/blocks/SearchTour/wowtour_search1'

type WowtourHeroBanner1Props = Page['hero'] & { publicContext: PublicContextProps; pageTitle?: string; preloadedGlobalSettings?: any; preloadedSearchOptions?: any }

export const WowtourHeroBanner1: React.FC<WowtourHeroBanner1Props> = ({
  sliderImages,
  sideImage,
  autoPlayDelay = '20000',
  pageTitle,
  // Search Box Settings
  searchDesignVersion,
  searchBgType,
  searchBgColor,
  searchGradientStartColor,
  searchGradientEndColor,
  searchGradientType,
  searchGradientPosition,
  searchBgImage,
  searchSectionBgColor,
  searchSectionOpacity,
  searchSectionBorderRadius,
  publicContext,
  preloadedGlobalSettings,
  preloadedSearchOptions,
}) => {
  const delay = parseInt(autoPlayDelay as string, 10) || 20000
  const plugin = useRef(Autoplay({ delay, stopOnInteraction: false }))
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!api) return

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap())

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  const scrollPrev = () => api?.scrollPrev()
  const scrollNext = () => api?.scrollNext()

  // Map flat search settings to WowtourSearch1 props
  const backgroundSettings = {
    backgroundType: searchBgType as any,
    backgroundColor: searchBgColor,
    gradientStartColor: searchGradientStartColor,
    gradientEndColor: searchGradientEndColor,
    gradientType: searchGradientType as any,
    gradientPosition: searchGradientPosition as any,
    backgroundImage: searchBgImage,
  }

  const sectionSettings = {
    sectionBgColor: searchSectionBgColor,
    sectionOpacity: searchSectionOpacity,
    sectionBorderRadius: searchSectionBorderRadius,
  }

  if (!sliderImages || sliderImages.length === 0) return null

  return (
    <section className="w-full py-4 md:py-8">
      <h1 className="sr-only">{pageTitle || 'หน้าแรก'}</h1>
      <div className="container">
        <div className="flex flex-col justify-center gap-1 overflow-hidden rounded-md md:h-[600px] md:max-h-[600px] md:flex-row">
          {/* Left Side - Slider */}
          <div className="relative aspect-[3/2] w-full shrink-0 overflow-hidden md:aspect-auto md:h-[600px] md:flex-[8]">
            <Carousel
              setApi={setApi}
              plugins={[plugin.current]}
              opts={{
                loop: true,
              }}
              className="absolute inset-0 *:h-full"
              onMouseEnter={plugin.current.stop}
              onMouseLeave={plugin.current.reset}
            >
              <CarouselContent className="-ml-0" style={{ height: '100%' }}>
                {sliderImages.map((item, index) => {
                  const image = item.image as MediaType
                  const hasLink = !!item.url

                  const slideContent = (
                    <div className="absolute inset-0">
                      {image && <Media resource={image} fill imgClassName="object-cover" />}
                    </div>
                  )

                  return (
                    <CarouselItem
                      key={index}
                      className="relative basis-full pl-0"
                      style={{ height: '100%' }}
                    >
                      {hasLink ? (
                        <a
                          href={item.url || '#'}
                          target={item.newTab ? '_blank' : '_self'}
                          rel={item.newTab ? 'noopener noreferrer' : undefined}
                          className="absolute inset-0 block"
                        >
                          {slideContent}
                        </a>
                      ) : (
                        slideContent
                      )}
                    </CarouselItem>
                  )
                })}
              </CarouselContent>
            </Carousel>

            {/* Navigation Arrows */}
            <div className="pointer-events-none absolute top-1/2 right-2 left-2 z-10 flex -translate-y-1/2 justify-between md:right-4 md:left-4">
              <Button
                variant="default"
                size="icon"
                className="bg-primary hover:bg-primary/90 text-primary-foreground pointer-events-auto h-8 w-8 rounded-full shadow-lg md:h-10 md:w-10"
                onClick={scrollPrev}
              >
                <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
              <Button
                variant="default"
                size="icon"
                className="bg-primary hover:bg-primary/90 text-primary-foreground pointer-events-auto h-8 w-8 rounded-full shadow-lg md:h-10 md:w-10"
                onClick={scrollNext}
              >
                <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
            </div>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    'h-2 w-2 rounded-full transition-colors',
                    index === current ? 'bg-primary' : 'bg-white/70',
                  )}
                  onClick={() => api?.scrollTo(index)}
                />
              ))}
            </div>
          </div>

          {/* Right Side - Single Image */}
          <div className="relative aspect-[3/4] w-full overflow-hidden md:aspect-auto md:h-[600px] md:flex-[4.5]">
            {typeof sideImage === 'object' && sideImage && (
              <Media resource={sideImage as MediaType} fill imgClassName="object-cover" />
            )}
          </div>
        </div>
      </div>

      {/* Search Box — always shown, with configurable settings */}
      <div style={{ marginTop: 30 }}>
        <WowtourSearch1
          backgroundSettings={backgroundSettings}
          sectionSettings={sectionSettings}
          publicContext={publicContext}
          preloadedGlobalSettings={preloadedGlobalSettings}
          preloadedSearchOptions={preloadedSearchOptions}
        />
      </div>
    </section>
  )
}

export default WowtourHeroBanner1
