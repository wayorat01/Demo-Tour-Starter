'use client'

import Autoplay from 'embla-carousel-autoplay'
import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { CarouselApi } from '@/components/ui/carousel'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { Media } from '@/components/Media'
import type { BannerSlideBlock, Media as MediaType } from '@/payload-types'
import { PublicContextProps } from '@/utilities/publicContextProps'
import { cn } from '@/utilities/cn'
import WowtourSearch1 from '@/blocks/SearchTour/wowtour_search1'

/**
 * WowtourHeroBanner4 (Block version)
 * Full-width Banner Slide with glassmorphism search box overlay at bottom
 * Image ratio: 1920x600 → aspect-[32/10]
 */
const WowtourHeroBanner4: React.FC<BannerSlideBlock & { publicContext: PublicContextProps; preloadedGlobalSettings?: any; preloadedSearchOptions?: any }> = ({
  heroBanner3Settings,
  publicContext,
  preloadedGlobalSettings,
  preloadedSearchOptions,
}) => {
  const sliderImages = heroBanner3Settings?.sliderImages
  const autoPlayDelay = Number(heroBanner3Settings?.autoPlayDelay) || 10000
  const searchBoxSettings = heroBanner3Settings?.searchBoxSettings
  const bgColor = heroBanner3Settings?.backgroundColor

  const autoplayPlugin = useRef(
    Autoplay({ delay: autoPlayDelay, stopOnInteraction: false, stopOnMouseEnter: true }),
  )
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

  return (
    <section className="w-full overflow-hidden" style={{ backgroundColor: bgColor || undefined }}>
      <div className="relative w-full">
        {/* Full Width Banner Slide */}
        {sliderImages && sliderImages.length > 0 && (
          <div
            className="relative max-h-[600px] min-h-[400px] w-full md:min-h-[450px]"
            style={{ aspectRatio: '1920 / 600' }}
          >
            <Carousel
              setApi={setApi}
              plugins={[autoplayPlugin.current]}
              opts={{ loop: true }}
              className="absolute inset-0 *:h-full"
            >
              <CarouselContent className="-ml-0" style={{ height: '100%' }}>
                {sliderImages.map((item, index) => {
                  const image = item.image as MediaType
                  const hasLink = !!item.url

                  const slideContent = (
                    <div className="absolute inset-0">
                      {image && (
                        <Media resource={image} fill imgClassName="object-cover w-full h-full" />
                      )}
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
            <div className="pointer-events-none absolute top-1/2 right-4 left-4 z-10 flex -translate-y-1/2 justify-between">
              <Button
                variant="ghost"
                size="icon"
                className="pointer-events-auto h-10 w-10 rounded-full border-0 bg-black/20 text-white shadow-none backdrop-blur-sm hover:bg-black/40 md:h-12 md:w-12"
                onClick={scrollPrev}
              >
                <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="pointer-events-auto h-10 w-10 rounded-full border-0 bg-black/20 text-white shadow-none backdrop-blur-sm hover:bg-black/40 md:h-12 md:w-12"
                onClick={scrollNext}
              >
                <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
              </Button>
            </div>

            {/* Dots */}
            <div className="absolute bottom-20 left-1/2 z-10 flex -translate-x-1/2 gap-2 md:bottom-24 lg:bottom-28">
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    'h-2.5 w-2.5 cursor-pointer rounded-full shadow-sm transition-all duration-300',
                    index === current ? 'scale-110 bg-white' : 'bg-white/50 hover:bg-white/80',
                  )}
                  onClick={() => api?.scrollTo(index)}
                />
              ))}
            </div>

            {/* Search Box Overlay — anchored to the bottom */}
            <div className="pointer-events-auto absolute bottom-4 left-1/2 z-20 w-[95%] max-w-[1100px] -translate-x-1/2 md:bottom-6 lg:bottom-8">
              <div className="w-full rounded-2xl border border-white/40 bg-white/30 px-4 py-3 shadow-xl backdrop-blur-md md:px-6 md:py-4 lg:px-8 lg:py-5 dark:border-white/20 dark:bg-black/30">
                <WowtourSearch1
                  backgroundSettings={searchBoxSettings?.backgroundSettings}
                  sectionSettings={searchBoxSettings?.sectionSettings}
                  headingSettings={searchBoxSettings?.headingSettings}
                  publicContext={publicContext}
                  heroHorizontalMode={true}
                  preloadedGlobalSettings={preloadedGlobalSettings}
                  preloadedSearchOptions={preloadedSearchOptions}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default WowtourHeroBanner4
