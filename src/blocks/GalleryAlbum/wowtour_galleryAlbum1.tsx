'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'

import type { CarouselApi } from '@/components/ui/carousel'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { Media } from '@/components/Media'
import type { WowtourGalleryAlbumBlock, Media as MediaType, GalleryAlbum } from '@/payload-types'
import type { PublicContextProps } from '@/utilities/publicContextProps'
import { cn } from '@/utilities/cn'
import Link from 'next/link'

import './wowtour_galleryAlbum1.css'

type WowtourGalleryAlbum1Props = WowtourGalleryAlbumBlock & {
  publicContext: PublicContextProps
}

export const WowtourGalleryAlbum1: React.FC<WowtourGalleryAlbum1Props> = ({
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
  const showDescription = headingSettings?.showDescription ?? false
  const description = headingSettings?.description

  // Extract card settings
  const borderRadius = cardSettings?.borderRadius ?? 16
  const maxVisibleCards = Number(
    (rest as any)?.albumsPerRow ??
      (cardSettings as any)?.albumsPerRow ??
      (cardSettings as any)?.maxVisibleCards ??
      5,
  )

  // Extract button settings
  const showButton = buttonSettings?.showButton ?? true
  const buttonText = buttonSettings?.buttonText ?? 'ดูแกลลอรี่ทั้งหมด'
  const buttonLink = buttonSettings?.buttonLink ?? '/gallery'

  // Extract slider settings
  const loop = sliderSettings?.loop ?? true
  const autoPlay = sliderSettings?.autoPlay ?? false
  const autoPlayDelay = sliderSettings?.autoPlayDelay ?? 5000

  // Display mode — auto-fallback to grid if items fit in one row
  const displayModeSetting = (rest as any).displayMode ?? 'showAll'

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

  const displayMode =
    displayModeSetting === 'slide' && albumItems.length > maxVisibleCards
      ? 'slide'
      : displayModeSetting === 'slide'
        ? 'showAll' // fallback to grid if too few items for slide
        : 'showAll'

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('th-TH-u-ca-gregory', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const renderAlbumCard = (album: GalleryAlbum, index: number) => {
    const coverImage = album.coverImage as MediaType
    const updatedDate = album.updatedAt ? formatDate(album.updatedAt) : ''
    const albumSlug = album.slug || ''

    const cardContent = (
      <div className="gallery-album-card-wrap" style={{ borderRadius: `${borderRadius + 6}px` }}>
        <div className="gallery-album-card" style={{ borderRadius: `${borderRadius}px` }}>
          {/* Cover Image */}
          <div className="gallery-album-card__image">
            {coverImage && (
              <Media resource={coverImage} fill imgClassName="object-cover w-full h-full" />
            )}

            {/* Normal State — Info at bottom */}
            <div className="gallery-album-card__info">
              <p className="gallery-album-card__title">{album.title}</p>
              {updatedDate && <p className="gallery-album-card__date">{updatedDate}</p>}
            </div>

            {/* Hover State — Primary overlay with search icon */}
            <div className="gallery-album-card__overlay">
              <Search className="gallery-album-card__search-icon" strokeWidth={2} />
            </div>
          </div>
        </div>
      </div>
    )

    if (albumSlug) {
      return (
        <Link key={index} href={`/gallery/${albumSlug}`} className="block" prefetch={false}>
          {cardContent}
        </Link>
      )
    }

    return <div key={index}>{cardContent}</div>
  }

  const renderSlideMode = () => (
    <div className="relative overflow-visible">
      <Carousel
        setApi={setApi}
        opts={{
          align: 'start',
          loop,
        }}
        className="w-full overflow-visible"
      >
        <CarouselContent className="-ml-3 py-4 md:-ml-4">
          {albumItems.map((album, index) => (
            <CarouselItem
              key={index}
              className={cn(
                'pl-3 md:pl-4',
                maxVisibleCards === 3 && 'basis-1/2 md:basis-1/3',
                maxVisibleCards === 4 && 'basis-1/2 md:basis-1/4',
                maxVisibleCards === 5 && 'basis-1/2 md:basis-1/5',
                maxVisibleCards === 6 && 'basis-1/2 md:basis-1/6',
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

  const renderGridMode = () => (
    <div
      className={cn(
        'grid gap-4 md:gap-6',
        maxVisibleCards === 3 && 'grid-cols-2 md:grid-cols-3',
        maxVisibleCards === 4 && 'grid-cols-2 md:grid-cols-4',
        maxVisibleCards === 5 && 'grid-cols-2 md:grid-cols-5',
        maxVisibleCards === 6 && 'grid-cols-2 md:grid-cols-6',
      )}
    >
      {albumItems.map((album, index) => renderAlbumCard(album, index))}
    </div>
  )

  return (
    <section className="w-full py-12 md:py-16">
      <div className="container">
        {/* Heading Section */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-2 flex items-center gap-3">
            {showHeadingIcon && headingIcon && (
              <div className="relative h-8 w-8">
                <Media resource={headingIcon as MediaType} fill imgClassName="object-contain" />
              </div>
            )}
            <h2 className="text-2xl font-medium">{heading}</h2>
          </div>

          {showDescription && description && (
            <p className="text-muted-foreground mt-2 max-w-2xl">{description}</p>
          )}
        </div>

        {/* Album Cards */}
        <div className="w-full">
          {displayMode === 'slide' ? renderSlideMode() : renderGridMode()}
        </div>

        {/* "ดูแกลลอรี่ทั้งหมด" Button */}
        {showButton && (
          <div className="mt-8 flex justify-center">
            <Link href={buttonLink} prefetch={false}>
              <Button
                className="px-8 py-3 text-base font-medium"
                style={{
                  background: 'var(--btn-bg)',
                  color: 'var(--btn-text)',
                  borderRadius: 'var(--btn-radius, 9999px)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--btn-bg-hover)'
                  e.currentTarget.style.color = 'var(--btn-text-hover)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--btn-bg)'
                  e.currentTarget.style.color = 'var(--btn-text)'
                }}
              >
                {buttonText}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

export default WowtourGalleryAlbum1
