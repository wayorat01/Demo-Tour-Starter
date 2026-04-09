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

type WowtourHeroBanner4Props = Page['hero'] & { publicContext: PublicContextProps; pageTitle?: string; preloadedGlobalSettings?: any; preloadedSearchOptions?: any }

/** Helper: get the image URL from a Media object */
function getImageUrl(image: MediaType | null | undefined): string {
  if (!image?.url) return ''
  return image.url.startsWith('/') ? `${NEXT_PUBLIC_SERVER_URL || ''}${image.url}` : image.url
}

/**
 * WowtourHeroBanner4 (Hero version)
 * Full-width Banner Slide with glassmorphism search box overlay at bottom
 * Desktop: panoramic image with overlay search | Mobile: stacked image + search
 */
export const WowtourHeroBanner4: React.FC<WowtourHeroBanner4Props> = ({
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

  /** Compute the search container background style from admin settings */
  const getSearchContainerStyle = (): React.CSSProperties => {
    const bgImage = searchBgImage as MediaType | undefined
    if (searchBgType === 'gradient') {
      const start = searchGradientStartColor || 'hsl(173, 100%, 46%)'
      const end = searchGradientEndColor || 'hsl(214, 97%, 61%)'
      const type = searchGradientType || 'linear'
      const pos = searchGradientPosition || 'to right'
      const gradient =
        type === 'radial'
          ? `radial-gradient(circle, ${start}, ${end})`
          : `linear-gradient(${pos}, ${start}, ${end})`
      return { background: gradient }
    }
    if (searchBgType === 'image' && bgImage?.url) {
      const imgUrl = bgImage.url.startsWith('/')
        ? `${NEXT_PUBLIC_SERVER_URL || ''}${bgImage.url}`
        : bgImage.url
      return {
        backgroundImage: `url(${imgUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    }
    if (searchBgType === 'color' && searchBgColor) {
      return { backgroundColor: searchBgColor }
    }
    return {}
  }

  const searchContainerStyle = getSearchContainerStyle()
  const hasCustomBg = searchBgType && searchBgType !== 'color'

  /** Parse HSL string to rgba with opacity */
  const hslToRgba = (hsl: string, opacity: number): string => {
    const match = hsl.match(
      /hsl\(\s*(\d+(?:\.\d+)?),?\s*(\d+(?:\.\d+)?)%?,?\s*(\d+(?:\.\d+)?)%?\s*\)/i,
    )
    if (!match) return hsl
    const h = parseFloat(match[1])
    const s = parseFloat(match[2]) / 100
    const l = parseFloat(match[3]) / 100
    const a = opacity / 100
    const f = (n: number) => {
      const k = (n + h / 30) % 12
      const color = l - s * Math.min(l, 1 - l) * Math.max(Math.min(k - 3, 9 - k, 1), -1)
      return Math.round(255 * color)
    }
    return `rgba(${f(0)}, ${f(8)}, ${f(4)}, ${a})`
  }

  /** Inner search card style from sectionSettings */
  const searchCardStyle: React.CSSProperties = {
    backgroundColor: hslToRgba(sectionSettings.sectionBgColor, sectionSettings.sectionOpacity),
    borderRadius: `${sectionSettings.sectionBorderRadius}px`,
  }

  return (
    <>
      {/* Scoped CSS: larger heading & icon only for heroBanner4 */}
      <style>{`
        .hero4-search h2 {
          font-size: 1.125rem !important;
        }
        .hero4-search .mb-3 > .shrink-0 {
          width: 1.75rem !important;
          height: 1.75rem !important;
        }
        @media (min-width: 640px) {
          .hero4-search h2 {
            font-size: 1.25rem !important;
          }
          .hero4-search .mb-3 > .shrink-0 {
            width: 1.75rem !important;
            height: 1.75rem !important;
          }
        }
        @media (min-width: 768px) {
          .hero4-search h2 {
            font-size: 1.5rem !important;
          }
          .hero4-search .mb-3 > .shrink-0 {
            width: 2rem !important;
            height: 2rem !important;
          }
        }
        @media (min-width: 1024px) {
          .hero4-search h2 {
            font-size: 1.75rem !important;
          }
          .hero4-search .mb-3 > .shrink-0 {
            width: 2.25rem !important;
            height: 2.25rem !important;
          }
        }
      `}</style>

      <h1 className="sr-only">{pageTitle || 'หน้าแรก'}</h1>
      {/* ════════ MOBILE & TABLET (< md): Banner + Search stacked ════════ */}
      <section className="w-full md:hidden">
        <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
          <Carousel setApi={setApi} plugins={[autoplayPlugin.current]} opts={{ loop: true }}>
            <CarouselContent className="-ml-0">
              {sliderImages.map((item, i) => renderSlide(item, i, 'clamp(200px, 45vw, 350px)'))}
            </CarouselContent>
          </Carousel>
          {renderArrows()}

          {/* Dots — inside slider, near bottom */}
          <div className="absolute bottom-3 left-1/2 z-[110] flex -translate-x-1/2 gap-2">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                className={cn(
                  'h-2 w-2 cursor-pointer rounded-full ring-1 ring-white/30 transition-all duration-300',
                  index === current
                    ? 'w-5 bg-white shadow-md'
                    : 'bg-white/50 shadow-sm hover:bg-white/80',
                )}
                onClick={() => api?.scrollTo(index)}
              />
            ))}
          </div>
        </div>

        {/* Search Box */}
        <div className="w-full px-3 py-5 sm:px-5 sm:py-6" style={searchContainerStyle}>
          <div
            className="hero4-search w-full overflow-visible border border-gray-200/30 px-3 py-4 shadow-lg sm:px-5 sm:py-5"
            style={searchCardStyle}
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

      {/* ════════ DESKTOP (≥ md): Panoramic banner + search below ════════ */}
      <section className="hidden w-full md:block">
        {/* Banner Slider */}
        <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
          <Carousel setApi={setApi} plugins={[autoplayPlugin.current]} opts={{ loop: true }}>
            <CarouselContent className="-ml-0">
              {sliderImages.map((item, i) => renderSlide(item, i, 'clamp(350px, 30vw, 600px)'))}
            </CarouselContent>
          </Carousel>
          {renderArrows()}

          {/* Dots — inside slider area */}
          <div className="absolute bottom-4 left-1/2 z-[110] flex -translate-x-1/2 gap-2.5">
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
        </div>

        {/* Search Box — below slider */}
        <div
          className="w-full px-5 py-6 md:px-6 md:py-8 lg:px-10 lg:py-10 xl:px-12 xl:py-12"
          style={searchContainerStyle}
        >
          <div
            className="hero4-search mx-auto max-w-[1200px] overflow-visible border border-gray-200/30 px-5 py-5 shadow-lg md:px-6 md:py-6 lg:px-8 lg:py-8"
            style={searchCardStyle}
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

export default WowtourHeroBanner4
