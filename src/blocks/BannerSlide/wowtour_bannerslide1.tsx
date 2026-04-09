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

const WowtourBannerSlide1: React.FC<BannerSlideBlock & { publicContext: PublicContextProps }> = ({
  bannerSlide1Settings,
  publicContext,
}) => {
  const sliderImages = bannerSlide1Settings?.sliderImages
  const sideImage = bannerSlide1Settings?.sideImage
  const autoPlayDelay = Number(bannerSlide1Settings?.autoPlayDelay) || 10000

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

  if (!sliderImages || sliderImages.length === 0) return null

  return (
    <section className="w-full py-4 md:py-8">
      <div className="container">
        <style>{`
                    /* Force Embla Carousel internal wrappers to exactly 100% height */
                    .bs1-carousel > div, 
                    .bs1-carousel > div > div {
                        height: 100% !important;
                    }
                `}</style>
        <div className="flex h-auto max-h-[600px] w-full flex-col gap-1 overflow-hidden rounded-md md:h-[600px] md:flex-row">
          {/* Left Side - Slider */}
          <div className="relative aspect-[3/2] w-full shrink-0 overflow-hidden md:aspect-auto md:h-[600px] md:w-[60%]">
            <Carousel
              setApi={setApi}
              plugins={[plugin]}
              opts={{
                loop: true,
              }}
              className="bs1-carousel absolute inset-0"
              onMouseEnter={plugin.stop}
              onMouseLeave={plugin.reset}
            >
              <CarouselContent className="m-0 -ml-0 h-full p-0">
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
                      className="relative h-full min-h-full basis-full pl-0"
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

          <div className="relative hidden overflow-hidden md:block md:h-[600px] md:w-[40%]">
            <div className="absolute inset-0">
              {typeof sideImage === 'object' && sideImage && (
                <Media resource={sideImage as MediaType} fill imgClassName="object-cover" />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WowtourBannerSlide1
