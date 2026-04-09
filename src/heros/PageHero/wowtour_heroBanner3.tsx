'use client'

import Autoplay from 'embla-carousel-autoplay'
import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { CarouselApi } from '@/components/ui/carousel'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import type { Page, Media as MediaType } from '@/payload-types'
import { PublicContextProps } from '@/utilities/publicContextProps'
import { cn } from '@/utilities/cn'
import WowtourSearch1 from '@/blocks/SearchTour/wowtour_search1'
import { serverUrl as NEXT_PUBLIC_SERVER_URL } from '@/config/server'

type WowtourHeroBanner3Props = Page['hero'] & { publicContext: PublicContextProps; pageTitle?: string; preloadedGlobalSettings?: any; preloadedSearchOptions?: any }

/** Helper: get the image URL from a Media object */
function getImageUrl(image: MediaType | null | undefined): string {
  if (!image?.url) return ''
  return image.url.startsWith('/') ? `${NEXT_PUBLIC_SERVER_URL || ''}${image.url}` : image.url
}

/**
 * WowtourHeroBanner3 (Hero version)
 * Full-width Banner Slide with glassmorphism search box overlay at bottom
 * Desktop: panoramic image with overlay search | Mobile: stacked image + search
 */
export const WowtourHeroBanner3: React.FC<WowtourHeroBanner3Props> = ({
  sliderImages,
  autoPlayDelay = '20000',
  pageTitle,
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
  const autoplayPlugin = useRef(
    Autoplay({ delay, stopOnInteraction: false, stopOnMouseEnter: true }),
  )
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!api) return
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap())
    api.on('select', () => setCurrent(api.selectedScrollSnap()))
  }, [api])

  const scrollPrev = () => api?.scrollPrev()
  const scrollNext = () => api?.scrollNext()

  const sectionSettings = {
    sectionBgColor: searchSectionBgColor || 'hsl(0, 0%, 100%)',
    sectionOpacity: searchSectionOpacity ?? 100,
    sectionBorderRadius: searchSectionBorderRadius ?? 16,
  }

  if (!sliderImages || sliderImages.length === 0) return null

  /** Render a slide image using pure inline styles — bulletproof, no Tailwind override possible */
  const renderSlide = (item: (typeof sliderImages)[number], index: number, slideHeight: string) => {
    const image = item.image as MediaType
    const imgSrc = getImageUrl(image)
    const hasLink = !!item.url

    const imgTag = imgSrc ? (
      <img
        src={imgSrc}
        alt={image?.alt || ''}
        loading={index === 0 ? 'eager' : 'lazy'}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    ) : null

    return (
      <CarouselItem key={index} className="basis-full pl-0">
        <div
          style={{ position: 'relative', width: '100%', height: slideHeight, overflow: 'hidden' }}
        >
          {hasLink ? (
            <a
              href={item.url || '#'}
              target={item.newTab ? '_blank' : '_self'}
              rel={item.newTab ? 'noopener noreferrer' : undefined}
              style={{ display: 'block', position: 'absolute', inset: 0 }}
            >
              {imgTag}
            </a>
          ) : (
            imgTag
          )}
        </div>
      </CarouselItem>
    )
  }

  /** Render dots — z-[110] to stay above the search overlay (z-100) */
  const renderDots = () => (
    <div className="absolute bottom-3 left-1/2 z-[110] flex -translate-x-1/2 gap-2.5 md:bottom-[120px] lg:bottom-[140px]">
      {Array.from({ length: count }).map((_, index) => (
        <button
          key={index}
          className={cn(
            'h-2.5 w-2.5 cursor-pointer rounded-full ring-1 ring-white/30 transition-all duration-300',
            index === current
              ? 'w-6 bg-white shadow-md'
              : 'bg-white/50 shadow-sm hover:bg-white/80',
          )}
          onClick={() => api?.scrollTo(index)}
        />
      ))}
    </div>
  )

  /** Render arrows */
  const renderArrows = () => (
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
  )

  return (
    <>
      {/* ════════ MOBILE (< md): Banner + Search stacked ════════ */}
      <h1 className="sr-only">{pageTitle || 'หน้าแรก'}</h1>
      <section className="w-full md:hidden">
        <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
          <Carousel setApi={setApi} plugins={[autoplayPlugin.current]} opts={{ loop: true }}>
            <CarouselContent className="-ml-0">
              {sliderImages.map((item, i) => renderSlide(item, i, '220px'))}
            </CarouselContent>
          </Carousel>
          {renderArrows()}
          {renderDots()}
        </div>
        {/* Search Box */}
        <div className="w-full bg-gray-50 px-4 py-4 dark:bg-gray-900">
          <div className="w-full overflow-visible rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <WowtourSearch1
              sectionSettings={sectionSettings}
              publicContext={publicContext}
              heroHorizontalMode={true}
              preloadedGlobalSettings={preloadedGlobalSettings}
              preloadedSearchOptions={preloadedSearchOptions}
            />
          </div>
        </div>
      </section>

      {/* ════════ DESKTOP (≥ md): Panoramic banner + glassmorphism search overlay ════════ */}
      <section className="hidden w-full md:block" style={{ position: 'relative' }}>
        <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
          <Carousel setApi={setApi} plugins={[autoplayPlugin.current]} opts={{ loop: true }}>
            <CarouselContent className="-ml-0">
              {sliderImages.map((item, i) => renderSlide(item, i, 'clamp(450px, 31.25vw, 600px)'))}
            </CarouselContent>
          </Carousel>
          {renderArrows()}
        </div>

        {/* Overlay Container: Dots + Search Box (Stack vertically so they NEVER overlap) */}
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 110,
            width: '95%',
            maxWidth: '1100px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            pointerEvents: 'none', // Allow clicks to pass through empty space
          }}
        >
          {/* Dots */}
          <div style={{ display: 'flex', gap: '10px', pointerEvents: 'auto' }}>
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                className={cn(
                  'h-2.5 w-2.5 cursor-pointer rounded-full ring-1 ring-white/30 transition-all duration-300',
                  index === current
                    ? 'w-6 bg-white shadow-md'
                    : 'bg-white/50 shadow-sm hover:bg-white/80',
                )}
                onClick={() => api?.scrollTo(index)}
              />
            ))}
          </div>

          {/* Search Box */}
          <div
            className="w-full overflow-visible rounded-2xl border border-white/40 bg-white/30 px-6 py-4 shadow-xl backdrop-blur-md lg:px-8 lg:py-5 dark:border-white/20 dark:bg-black/30"
            style={{ pointerEvents: 'auto' }}
          >
            <WowtourSearch1
              sectionSettings={sectionSettings}
              publicContext={publicContext}
              heroHorizontalMode={true}
              preloadedGlobalSettings={preloadedGlobalSettings}
              preloadedSearchOptions={preloadedSearchOptions}
            />
          </div>
        </div>
      </section>
    </>
  )
}

export default WowtourHeroBanner3
