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
 * WowtourHeroBanner2 (Block version)
 * Desktop: Search Box (left, 350px) + Banner Slide (right, flex-1) — 600px
 * Mobile:  Banner Slide (top, 220px) then Search Box (bottom, auto)
 */
const WowtourHeroBanner2: React.FC<BannerSlideBlock & { publicContext: PublicContextProps; preloadedGlobalSettings?: any; preloadedSearchOptions?: any }> = ({
  heroBanner2Settings,
  publicContext,
  preloadedGlobalSettings,
  preloadedSearchOptions,
}) => {
  const sliderImages = heroBanner2Settings?.sliderImages
  const autoPlayDelay = Number(heroBanner2Settings?.autoPlayDelay) || 10000
  const searchBoxSettings = heroBanner2Settings?.searchBoxSettings
  const bgColor = heroBanner2Settings?.backgroundColor

  const plugin = useRef(Autoplay({ delay: autoPlayDelay, stopOnInteraction: false }))
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
    <section className="w-full" style={{ backgroundColor: bgColor || undefined }}>
      <div className="container py-[50px]">
        <div className="flex flex-col gap-3 lg:flex-row lg:gap-4">
          {/* Search Box — order-2 mobile, order-1 desktop */}
          <div className="order-2 flex w-full shrink-0 flex-col justify-stretch lg:order-1 lg:h-[500px] lg:w-[280px] xl:w-[350px]">
            <WowtourSearch1
              backgroundSettings={searchBoxSettings?.backgroundSettings}
              sectionSettings={searchBoxSettings?.sectionSettings}
              headingSettings={searchBoxSettings?.headingSettings}
              publicContext={publicContext}
              heroVerticalMode={true}
              preloadedGlobalSettings={preloadedGlobalSettings}
              preloadedSearchOptions={preloadedSearchOptions}
            />
          </div>

          {/* Banner Slide — order-1 mobile (top), order-2 desktop (right) */}
          {sliderImages && sliderImages.length > 0 && (
            <div className="order-1 flex w-full min-w-0 flex-col justify-stretch lg:order-2 lg:h-[500px] lg:flex-1">
              <div className="relative aspect-[16/9] h-full w-full overflow-hidden rounded-xl sm:aspect-[2/1] lg:aspect-auto">
                <Carousel
                  setApi={setApi}
                  plugins={[plugin.current]}
                  opts={{ loop: true }}
                  className="absolute inset-0 *:h-full"
                  onMouseEnter={plugin.current.stop}
                  onMouseLeave={plugin.current.reset}
                >
                  <CarouselContent className="-ml-0" style={{ height: '100%' }}>
                    {sliderImages.map((item, index) => {
                      const image = item.image as MediaType
                      const hasLink = !!item.url

                      const slideContent = (
                        <div className="bg-muted/20 absolute inset-0 flex items-center justify-center">
                          {image && (
                            <Media
                              resource={image}
                              fill
                              imgClassName="object-cover object-center"
                            />
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

                {/* Navigation Arrows — inside image, white color */}
                <div className="pointer-events-none absolute top-1/2 right-3 left-3 z-10 flex -translate-y-1/2 justify-between sm:right-4 sm:left-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="pointer-events-auto h-8 w-8 rounded-full border-0 bg-black/20 text-white shadow-none backdrop-blur-sm hover:bg-black/40 sm:h-9 sm:w-9 md:h-10 md:w-10"
                    onClick={scrollPrev}
                  >
                    <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="pointer-events-auto h-8 w-8 rounded-full border-0 bg-black/20 text-white shadow-none backdrop-blur-sm hover:bg-black/40 sm:h-9 sm:w-9 md:h-10 md:w-10"
                    onClick={scrollNext}
                  >
                    <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                  </Button>
                </div>

                {/* Dots Indicator */}
                <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 sm:bottom-3 sm:gap-2">
                  {Array.from({ length: count }).map((_, index) => (
                    <button
                      key={index}
                      className={cn(
                        'h-2 w-2 rounded-full shadow-sm transition-all duration-300 sm:h-2.5 sm:w-2.5',
                        index === current ? 'scale-110 bg-white' : 'bg-white/50 hover:bg-white/70',
                      )}
                      onClick={() => api?.scrollTo(index)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default WowtourHeroBanner2
