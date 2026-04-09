'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Autoplay from 'embla-carousel-autoplay'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { CarouselApi } from '@/components/ui/carousel'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { Media } from '@/components/Media'
import type { BannerSlideBlock as BannerSlideBlockType, Media as MediaType } from '@/payload-types'
import { cn } from '@/utilities/cn'
import './wowtour_bannerSlide2.css'

type WowtourBannerSlide2Props = BannerSlideBlockType & {
  id?: string
}

export const WowtourBannerSlide2: React.FC<WowtourBannerSlide2Props> = (props) => {
  const { bannerSlide2Settings } = props
  if (!bannerSlide2Settings) return null

  const banners = bannerSlide2Settings.banners || []
  const cardSettings = bannerSlide2Settings.cardSettings
  const sliderSettings = bannerSlide2Settings.sliderSettings

  // Settings
  const borderRadius = cardSettings?.borderRadius ?? 12
  const maxVisibleCards = cardSettings?.maxVisibleCards ?? 3
  const displayMode = cardSettings?.displayMode ?? 'slide'

  const autoPlay = sliderSettings?.autoPlay ?? false
  const autoPlayDelay = Number(sliderSettings?.autoPlayDelay) || 10000
  const loop = sliderSettings?.loop ?? true

  // Carousel state
  const [api, setApi] = useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const scrollPrev = useCallback(() => api?.scrollPrev(), [api])
  const scrollNext = useCallback(() => api?.scrollNext(), [api])
  const scrollTo = useCallback((index: number) => api?.scrollTo(index), [api])

  useEffect(() => {
    if (!api) return
    setScrollSnaps(api.scrollSnapList())
    setSelectedIndex(api.selectedScrollSnap())
    api.on('select', () => {
      setSelectedIndex(api.selectedScrollSnap())
    })
  }, [api])

  if (!banners || banners.length === 0) return null

  const hasOverflow = banners.length > maxVisibleCards
  const shouldUseSlide = hasOverflow && displayMode === 'slide'

  // Render a single Banner Card
  const renderBannerCard = (banner: (typeof banners)[number], index: number) => {
    const image = banner.image as MediaType | undefined
    if (!image) return null

    const content = (
      <div
        className="banner-slide2-card group block h-full overflow-hidden"
        style={{ borderRadius: `${borderRadius}px` }}
      >
        <div className="relative aspect-[2/1] w-full overflow-hidden">
          <Media
            resource={image}
            fill
            imgClassName="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </div>
    )

    if (banner.link) {
      return (
        <a
          key={index}
          href={banner.link}
          target={banner.openInNewTab ? '_blank' : undefined}
          rel={banner.openInNewTab ? 'noopener noreferrer' : undefined}
          className="block h-full"
        >
          {content}
        </a>
      )
    }

    return (
      <div key={index} className="h-full">
        {content}
      </div>
    )
  }

  // Slide mode
  const renderSlideMode = () => (
    <div className="relative px-2 sm:px-4 md:px-0">
      <Carousel
        setApi={setApi}
        opts={{
          align: 'start',
          loop,
        }}
        plugins={autoPlay ? [Autoplay({ delay: autoPlayDelay, stopOnInteraction: true })] : []}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {banners.map((banner, index) => (
            <CarouselItem
              key={index}
              className="basis-[85%] pl-2 sm:basis-1/2 md:pl-4 lg:basis-1/3"
            >
              {renderBannerCard(banner, index)}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Navigation Arrows */}
      <Button
        variant="outline"
        size="icon"
        className="bg-background border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary absolute top-1/2 -left-4 z-10 hidden h-8 w-8 -translate-y-1/2 rounded-full shadow-lg transition-colors sm:flex md:-left-5 md:h-10 md:w-10"
        onClick={scrollPrev}
      >
        <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="bg-background border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary absolute top-1/2 -right-4 z-10 hidden h-8 w-8 -translate-y-1/2 rounded-full shadow-lg transition-colors sm:flex md:-right-5 md:h-10 md:w-10"
        onClick={scrollNext}
      >
        <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
      </Button>

      {/* Dot Indicators */}
      {scrollSnaps.length > 1 && (
        <div className="mt-6 flex justify-center gap-1.5">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              className={cn(
                'h-2 cursor-pointer rounded-full border-0 p-0 transition-all duration-300 md:h-2.5',
                selectedIndex === index
                  ? 'bg-primary w-6 md:w-8'
                  : 'w-2 bg-gray-300 hover:bg-gray-400 md:w-2.5',
              )}
              onClick={() => scrollTo(index)}
            />
          ))}
        </div>
      )}
    </div>
  )

  // Grid mode (≤ maxVisibleCards or ShowAll mode)
  const renderGridMode = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
      {banners.map((banner, index) => renderBannerCard(banner, index))}
    </div>
  )

  return (
    <section className="w-full py-8 md:py-12">
      <div className="container">{shouldUseSlide ? renderSlideMode() : renderGridMode()}</div>
    </section>
  )
}

export default WowtourBannerSlide2
