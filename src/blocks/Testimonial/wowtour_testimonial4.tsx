'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Media } from '@/components/Media'
import type { TestimonialBlock, Testimonial, Media as MediaType } from '@/payload-types'
import type { PublicContextProps } from '@/utilities/publicContextProps'
import { Stars } from '@/components/uiCustom/stars'
import { cn } from '@/utilities/cn'

// Mobile carousel imports
import Autoplay from 'embla-carousel-autoplay'
import type { CarouselApi } from '@/components/ui/carousel'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'

/**
 * wowtour_testimonial4 — "Rotating Spotlight + 3-Item Side"
 *
 * Desktop layout:
 *   Left: 1 featured testimonial (large quote card)
 *   Right: 3 testimonials stacked vertically
 *
 * Rotation behavior:
 *   - Every N seconds, the featured (left) rotates out
 *   - The top-right card becomes the new featured (left)
 *   - The right-side cards shift up, new item enters at bottom
 *   - Continuous cycling through all testimonials
 *
 * Mobile: standard horizontal carousel, 1 card per slide.
 */

const QuoteIcon = ({ className = 'size-8' }: { className?: string }) => (
  <svg className={cn('text-primary', className)} viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
  </svg>
)

const WowtourTestimonial4: React.FC<
  TestimonialBlock & { publicContext: PublicContextProps; testimonialItems: Testimonial[] }
> = ({ headingSettings, testimonialItems }) => {
  const heading = headingSettings?.heading
  const showHeadingIcon = headingSettings?.showHeadingIcon ?? false
  const headingIcon = headingSettings?.headingIcon
  const showDescription = headingSettings?.showDescription ?? false
  const description = headingSettings?.description

  const items = Array.isArray(testimonialItems) ? testimonialItems : []

  // Desktop rotation state
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Mobile carousel
  const [mobileApi, setMobileApi] = useState<CarouselApi>()
  const [mobileIndex, setMobileIndex] = useState(0)
  const [mobileSnaps, setMobileSnaps] = useState<number[]>([])

  // Get item at index (wraps around)
  const getItem = useCallback(
    (index: number) => {
      if (items.length === 0) return null
      return items[((index % items.length) + items.length) % items.length]
    },
    [items],
  )

  // Navigate
  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % items.length)
  }, [items.length])

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length)
  }, [items.length])

  const goTo = useCallback((index: number) => {
    setActiveIndex(index)
  }, [])

  // Auto-rotation
  useEffect(() => {
    if (isPaused || items.length <= 1) return
    const timer = setInterval(goNext, 4000)
    return () => clearInterval(timer)
  }, [isPaused, goNext, items.length])

  // Mobile carousel sync
  useEffect(() => {
    if (!mobileApi) return
    setMobileSnaps(mobileApi.scrollSnapList())
    setMobileIndex(mobileApi.selectedScrollSnap())
    mobileApi.on('select', () => setMobileIndex(mobileApi.selectedScrollSnap()))
  }, [mobileApi])

  if (items.length === 0) return null

  const getInterTour = (item: Testimonial) =>
    item.interTour && typeof item.interTour === 'object' ? item.interTour : null

  // Desktop: featured = activeIndex, right side = next 3
  const featured = getItem(activeIndex)!
  const sideItems = [
    getItem(activeIndex + 1),
    getItem(activeIndex + 2),
    getItem(activeIndex + 3),
  ].filter(Boolean) as Testimonial[]

  /** Small card for the right side */
  const renderSideCard = (item: Testimonial) => {
    const interTour = getInterTour(item)
    return (
      <div className="bg-card border-border/50 flex h-full flex-col rounded-xl border p-5 shadow-sm transition-all duration-500">
        {(interTour || item.tourName) && (
          <span className="bg-primary/10 text-primary mb-2 inline-block self-start rounded-full px-2 py-0.5 text-xs font-medium">
            {interTour?.title || item.tourName}
          </span>
        )}
        {item.description && (
          <p className="text-muted-foreground mb-3 line-clamp-3 text-sm leading-relaxed">
            "{item.description}"
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {item.profileImage && typeof item.profileImage === 'object' && (
              <div className="size-10 shrink-0 overflow-hidden rounded-full">
                <Media
                  resource={item.profileImage}
                  imgClassName="h-full w-full object-cover object-center"
                />
              </div>
            )}
            <p className="text-sm font-semibold">{item.customerName}</p>
          </div>
          {item.rating && <Stars rating={item.rating} />}
        </div>
      </div>
    )
  }

  const featuredInterTour = getInterTour(featured)

  return (
    <section className="w-full py-12 md:py-16">
      <div className="container">
        {/* Heading */}
        {heading && (
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-2 flex items-center gap-3">
              {showHeadingIcon && headingIcon && (
                <div className="relative size-8">
                  <Media resource={headingIcon as MediaType} fill imgClassName="object-contain" />
                </div>
              )}
              <h2 className="text-2xl font-medium">{heading}</h2>
            </div>
            {showDescription && description && (
              <p className="text-muted-foreground mt-2 max-w-2xl">{description}</p>
            )}
          </div>
        )}

        {/* Mobile: horizontal carousel */}
        <div className="block lg:hidden">
          <Carousel
            setApi={setMobileApi}
            opts={{ align: 'start', loop: true }}
            plugins={[Autoplay({ delay: 4000, stopOnInteraction: true })]}
            className="w-full"
          >
            <CarouselContent className="-ml-3">
              {items.map((item) => {
                const interTour = getInterTour(item)
                return (
                  <CarouselItem key={item.id} className="basis-full pl-3">
                    <div className="bg-card border-border/50 rounded-xl border p-5 shadow-sm">
                      <QuoteIcon className="mb-2 size-6" />
                      {(interTour || item.tourName) && (
                        <span className="bg-primary/10 text-primary mb-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium">
                          {interTour?.title || item.tourName}
                        </span>
                      )}
                      {item.rating && (
                        <div className="mb-2">
                          <Stars rating={item.rating} />
                        </div>
                      )}
                      {item.description && (
                        <p className="text-muted-foreground mb-3 text-sm leading-relaxed">
                          "{item.description}"
                        </p>
                      )}
                      <div className="flex items-center gap-3">
                        {item.profileImage && typeof item.profileImage === 'object' && (
                          <div className="size-11 shrink-0 overflow-hidden rounded-full">
                            <Media
                              resource={item.profileImage}
                              imgClassName="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <p className="text-sm font-semibold">{item.customerName}</p>
                      </div>
                    </div>
                  </CarouselItem>
                )
              })}
            </CarouselContent>
          </Carousel>
          {mobileSnaps.length > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              {mobileSnaps.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Slide ${i + 1}`}
                  className={cn(
                    'h-2 w-2 rounded-full transition-all duration-300',
                    mobileIndex === i ? 'bg-primary !w-6 !rounded' : 'bg-muted-foreground/30',
                  )}
                  onClick={() => mobileApi?.scrollTo(i)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Desktop: rotating spotlight + 3 stacked side cards */}
        <div
          className="relative hidden lg:block"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="grid grid-cols-5 gap-6">
            {/* Left — Featured: image left, content right */}
            <div
              key={featured.id + '-' + activeIndex}
              className="animate-in fade-in border-border/50 bg-card col-span-3 flex min-h-[380px] overflow-hidden rounded-2xl border shadow-sm duration-500"
            >
              {/* Profile image — left half, fill frame */}
              {featured.profileImage && typeof featured.profileImage === 'object' && (
                <div className="relative w-[42%] shrink-0">
                  <Media
                    resource={featured.profileImage}
                    fill
                    imgClassName="object-cover object-center"
                  />
                  {/* Tour badge overlay on image */}
                  {(featuredInterTour || featured.tourName) && (
                    <span className="bg-primary absolute bottom-4 left-4 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-md">
                      {featuredInterTour?.title || featured.tourName}
                    </span>
                  )}
                </div>
              )}

              {/* Content — right half, centered */}
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <QuoteIcon className="mb-3 size-8" />

                {featured.rating && (
                  <div className="mb-3">
                    <Stars rating={featured.rating} />
                  </div>
                )}

                {featured.description && (
                  <p className="text-foreground mb-5 text-base leading-relaxed italic">
                    "{featured.description}"
                  </p>
                )}

                <div>
                  <p className="text-base font-bold">{featured.customerName}</p>
                  {featured.tourName && (
                    <p className="text-muted-foreground text-sm">{featured.tourName}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right — 3 stacked cards (shift up on rotation) */}
            <div className="col-span-2 flex flex-col gap-4">
              {sideItems.map((item, i) => (
                <div
                  key={item.id + '-side-' + activeIndex + '-' + i}
                  className="animate-in fade-in slide-in-from-bottom-2 flex-1 duration-500"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {renderSideCard(item)}
                </div>
              ))}
            </div>
          </div>

          {/* Arrow buttons */}
          <Button
            variant="outline"
            size="icon"
            className="bg-background text-primary border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary absolute top-1/2 -left-5 left-0 z-10 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-lg transition-colors md:flex"
            onClick={goPrev}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-background text-primary border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary absolute top-1/2 -right-5 right-0 z-10 hidden h-10 w-10 translate-x-1/2 -translate-y-1/2 rounded-full shadow-lg transition-colors md:flex"
            onClick={goNext}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Dots — centered */}
          {items.length > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to item ${i + 1}`}
                  className={cn(
                    'h-2 w-2 rounded-full transition-all duration-300',
                    activeIndex === i
                      ? 'bg-primary !w-6 !rounded'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50',
                  )}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default WowtourTestimonial4
