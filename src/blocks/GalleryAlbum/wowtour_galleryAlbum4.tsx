/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import Autoplay from 'embla-carousel-autoplay'

import type { CarouselApi } from '@/components/ui/carousel'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { Media } from '@/components/Media'
import type { WowtourGalleryAlbumBlock, Media as MediaType, GalleryAlbum } from '@/payload-types'
import type { PublicContextProps } from '@/utilities/publicContextProps'
import { cn } from '@/utilities/cn'
import Link from 'next/link'

import './wowtour_galleryAlbum4.css'

type WowtourGalleryAlbum4Props = WowtourGalleryAlbumBlock & {
  publicContext: PublicContextProps
}

export const WowtourGalleryAlbum4: React.FC<WowtourGalleryAlbum4Props> = ({
  headingSettings,
  albums,
  cardSettings,
  buttonSettings,
  sliderSettings,
  ...rest
}) => {
  // Extract heading settings
  const heading = headingSettings?.heading ?? 'แกลลอรี่'
  const showHeadingIcon = headingSettings?.showHeadingIcon ?? false
  const headingIcon = headingSettings?.headingIcon

  // Extract button settings
  const showButton = buttonSettings?.showButton ?? true
  const buttonText = buttonSettings?.buttonText ?? 'ดูแกลลอรี่ทั้งหมด'
  const buttonLink = buttonSettings?.buttonLink ?? '/gallery'

  // Extract card settings
  const albumsPerRow = Number(
    (rest as any)?.albumsPerRow ??
      (cardSettings as any)?.albumsPerRow ??
      (cardSettings as any)?.maxVisibleCards ??
      4,
  )
  const borderRadius = cardSettings?.borderRadius ?? 12

  // Display mode — auto-fallback to grid if items fit in one row
  const displayModeSetting = (rest as any).displayMode ?? 'showAll'

  // Slider settings
  const loop = sliderSettings?.loop ?? true
  const autoPlay = sliderSettings?.autoPlay ?? false
  const autoPlayDelay = sliderSettings?.autoPlayDelay ?? 5000

  // Carousel state
  const [api, setApi] = useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const scrollPrev = () => api?.scrollPrev()
  const scrollNext = () => api?.scrollNext()
  const scrollTo = useCallback((index: number) => api?.scrollTo(index), [api])

  useEffect(() => {
    if (!api) return
    setScrollSnaps(api.scrollSnapList())
    setSelectedIndex(api.selectedScrollSnap())
    api.on('select', () => {
      setSelectedIndex(api.selectedScrollSnap())
    })
  }, [api])

  // Resolve albums and filter out hidden ones
  const hiddenAlbumIdsRaw = (rest as any).hiddenAlbumIds
  const hiddenIds: string[] = (() => {
    if (!hiddenAlbumIdsRaw) return []
    if (typeof hiddenAlbumIdsRaw === 'string') {
      try {
        return JSON.parse(hiddenAlbumIdsRaw)
      } catch {
        return []
      }
    }
    if (Array.isArray(hiddenAlbumIdsRaw)) return hiddenAlbumIdsRaw
    return []
  })()
  const albumItems = ((albums as GalleryAlbum[] | undefined) ?? []).filter(
    (album) => !hiddenIds.includes(album.id),
  )

  if (!albumItems || albumItems.length === 0) return null

  // Auto-fallback: if items fit in one row, show as grid instead of slide
  const displayMode =
    displayModeSetting === 'slide' && albumItems.length > albumsPerRow ? 'slide' : 'showAll'

  // Format date in Thai
  const formatDateThai = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('th-TH-u-ca-gregory', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const renderAlbumCard = (album: GalleryAlbum, index: number) => {
    const coverImage = album.coverImage as MediaType
    const updatedDate = album.updatedAt ? formatDateThai(album.updatedAt) : ''
    const albumSlug = album.slug || ''

    const cardContent = (
      <div className="gallery-filmstrip__card">
        <div className="gallery-filmstrip__image">
          {coverImage && (
            <Media resource={coverImage} fill imgClassName="object-cover w-full h-full" />
          )}

          {/* Hover overlay */}
          <div className="gallery-filmstrip__overlay">
            <Search className="gallery-filmstrip__search-icon" strokeWidth={2} />
            <span className="gallery-filmstrip__overlay-title">{album.title}</span>
            {updatedDate && <span className="gallery-filmstrip__overlay-date">{updatedDate}</span>}
          </div>
        </div>
      </div>
    )

    if (albumSlug) {
      return (
        <Link
          key={index}
          href={`/gallery/${albumSlug}`}
          className="block"
          style={{ textDecoration: 'none' }}
        >
          {cardContent}
        </Link>
      )
    }

    return <div key={index}>{cardContent}</div>
  }

  const renderGridMode = () => (
    <div
      className="gallery-filmstrip__strip"
      style={
        {
          '--cols': albumsPerRow,
          borderRadius: `${borderRadius}px`,
        } as React.CSSProperties
      }
    >
      {albumItems.map((album, index) => renderAlbumCard(album, index))}
    </div>
  )

  const renderSlideMode = () => (
    <div className="relative overflow-visible">
      <Carousel
        setApi={setApi}
        opts={{
          align: 'start',
          loop,
        }}
        plugins={autoPlay ? [Autoplay({ delay: autoPlayDelay, stopOnInteraction: true })] : []}
        className="w-full overflow-visible"
      >
        <CarouselContent className="-ml-1 py-2">
          {albumItems.map((album, index) => (
            <CarouselItem
              key={index}
              className={cn(
                'pl-1',
                albumsPerRow === 3 && 'basis-1/2 md:basis-1/3',
                albumsPerRow === 4 && 'basis-1/2 md:basis-1/4',
                albumsPerRow === 5 && 'basis-1/2 md:basis-1/5',
                albumsPerRow === 6 && 'basis-1/2 md:basis-1/6',
              )}
            >
              {renderAlbumCard(album, index)}
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

  return (
    <section className="w-full py-12 md:py-16">
      <div className="container">
        <div className="gallery-filmstrip__wrapper">
          {/* Header: heading left, button right */}
          <div className="gallery-filmstrip__header">
            <div className="gallery-filmstrip__heading">
              {showHeadingIcon && headingIcon && (
                <div className="relative h-8 w-8 flex-shrink-0">
                  <Media resource={headingIcon as MediaType} fill imgClassName="object-contain" />
                </div>
              )}
              <h2>{heading}</h2>
            </div>

            {showButton && (
              <Link href={buttonLink} className="gallery-filmstrip__btn" prefetch={false}>
                {buttonText}
                <span className="gallery-filmstrip__btn-arrow">→</span>
              </Link>
            )}
          </div>

          {/* Albums — Grid or Slide */}
          {displayMode === 'slide' ? renderSlideMode() : renderGridMode()}
        </div>
      </div>
    </section>
  )
}

export default WowtourGalleryAlbum4
