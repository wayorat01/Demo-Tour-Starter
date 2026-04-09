'use client'

import Autoplay from 'embla-carousel-autoplay'
import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { CarouselApi } from '@/components/ui/carousel'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { Media } from '@/components/Media'
import type { BannerSlideBlock, Media as MediaType } from '@/payload-types'
import { PublicContextProps } from '@/utilities/publicContextProps'
import { cn } from '@/utilities/cn'
import WowtourSearch1 from '@/blocks/SearchTour/wowtour_search1'

const WowtourHeroBanner1: React.FC<BannerSlideBlock & { publicContext: PublicContextProps; preloadedGlobalSettings?: any; preloadedSearchOptions?: any }> = ({
  heroBanner1Settings,
  publicContext,
  preloadedGlobalSettings,
  preloadedSearchOptions,
}) => {
  const sliderImages = heroBanner1Settings?.sliderImages
  const autoPlayDelay = Number(heroBanner1Settings?.autoPlayDelay) || 10000
  const searchBoxSettings = heroBanner1Settings?.searchBoxSettings

  const plugin = useMemo(
    () => Autoplay({ delay: autoPlayDelay, stopOnInteraction: false, playOnInit: true }),
    [autoPlayDelay],
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
    <section className="w-full">
      {/* Hero Banner Slider */}
      {sliderImages && sliderImages.length > 0 && (
        <div className="relative h-[280px] w-full overflow-hidden sm:h-[360px] md:h-[420px] lg:h-[500px] xl:h-[600px] 2xl:h-[600px]">
          <Carousel
            setApi={setApi}
            plugins={[plugin]}
            opts={{ loop: true }}
            className="absolute inset-0"
            onMouseEnter={plugin.stop}
            onMouseLeave={plugin.reset}
          >
            <CarouselContent className="-ml-0 h-full">
              {sliderImages.map((item, index) => {
                const image = item.image as MediaType
                const hasLink = !!item.url

                const slideContent = (
                  <div className="absolute inset-0">
                    {image && (
                      <Media resource={image} fill imgClassName="object-cover object-center" />
                    )}
                  </div>
                )

                return (
                  <CarouselItem key={index} className="relative h-full basis-full pl-0">
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
              variant="default"
              size="icon"
              className="bg-primary hover:bg-primary/90 text-primary-foreground pointer-events-auto h-10 w-10 rounded-full shadow-lg"
              onClick={scrollPrev}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="default"
              size="icon"
              className="bg-primary hover:bg-primary/90 text-primary-foreground pointer-events-auto h-10 w-10 rounded-full shadow-lg"
              onClick={scrollNext}
            >
              <ChevronRight className="h-6 w-6" />
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
      )}

      {/* Search Box — always shown, with configurable settings */}
      <WowtourSearch1
        backgroundSettings={searchBoxSettings?.backgroundSettings}
        sectionSettings={searchBoxSettings?.sectionSettings}
        headingSettings={searchBoxSettings?.headingSettings}
        publicContext={publicContext}
        preloadedGlobalSettings={preloadedGlobalSettings}
        preloadedSearchOptions={preloadedSearchOptions}
      />
    </section>
  )
}

export default WowtourHeroBanner1
