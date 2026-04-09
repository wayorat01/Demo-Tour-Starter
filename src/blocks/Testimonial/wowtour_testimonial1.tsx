'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Autoplay from 'embla-carousel-autoplay'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { CarouselApi } from '@/components/ui/carousel'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { Media } from '@/components/Media'
import type { TestimonialBlock, Testimonial, Media as MediaType } from '@/payload-types'
import type { PublicContextProps } from '@/utilities/publicContextProps'
import { Stars } from '@/components/uiCustom/stars'
import { cn } from '@/utilities/cn'

/**
 * Testimonial 21 — "2-per-slide Carousel"
 * Shows 2 testimonials per slide on desktop, 1 on mobile. Auto-slide. No scrollbar.
 */

const QuoteIcon = () => (
  <svg className="text-primary mb-3 size-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
  </svg>
)

const WowtourTestimonial1: React.FC<
  TestimonialBlock & { publicContext: PublicContextProps; testimonialItems: Testimonial[] }
> = ({ headingSettings, testimonialItems }) => {
  const heading = headingSettings?.heading
  const showHeadingIcon = headingSettings?.showHeadingIcon ?? false
  const headingIcon = headingSettings?.headingIcon
  const showDescription = headingSettings?.showDescription ?? false
  const description = headingSettings?.description

  const items = Array.isArray(testimonialItems) ? testimonialItems : []

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
    api.on('select', () => setSelectedIndex(api.selectedScrollSnap()))
  }, [api])

  if (items.length === 0) return null

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

        {/* Carousel — 2 per slide desktop, 1 mobile */}
        <div className="relative">
          <Carousel
            setApi={setApi}
            opts={{ align: 'start', loop: true }}
            plugins={[Autoplay({ delay: 4000, stopOnInteraction: true })]}
            className="w-full"
          >
            <CarouselContent className="-ml-3 px-1 py-2 md:-ml-5">
              {items.map((item) => {
                const interTour =
                  item.interTour && typeof item.interTour === 'object' ? item.interTour : null
                return (
                  <CarouselItem key={item.id} className="basis-full pl-3 md:basis-1/2 md:pl-5">
                    <div className="bg-card border-border/50 flex h-full flex-col overflow-hidden rounded-2xl border shadow-sm md:flex-row">
                      {/* Profile Image */}
                      {item.profileImage && typeof item.profileImage === 'object' && (
                        <div className="relative h-56 shrink-0 overflow-hidden md:h-auto md:w-64">
                          <div className="absolute inset-0">
                            <Media
                              resource={item.profileImage}
                              fill
                              imgClassName="h-full w-full object-cover"
                            />
                          </div>
                          {interTour && (
                            <span className="bg-primary text-primary-foreground absolute bottom-3 left-3 z-10 rounded-full px-3 py-1 text-xs font-medium shadow-sm">
                              {interTour.title}
                            </span>
                          )}
                        </div>
                      )}
                      {/* Content */}
                      <div className="flex flex-1 flex-col justify-center p-6">
                        <QuoteIcon />
                        {item.rating && (
                          <div className="mb-3 flex items-center gap-1">
                            <Stars rating={item.rating} />
                          </div>
                        )}
                        {item.description && (
                          <p className="text-muted-foreground mb-4 text-base leading-relaxed italic">
                            &quot;{item.description}&quot;
                          </p>
                        )}
                        <div>
                          <p className="text-base font-semibold">{item.customerName}</p>
                          {item.tourName && (
                            <p className="text-muted-foreground text-sm">{item.tourName}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                )
              })}
            </CarouselContent>
          </Carousel>

          {/* Navigation */}
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

          {/* Dots */}
          {scrollSnaps.length > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              {scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  className={cn(
                    'h-2 w-2 rounded-full transition-all duration-300',
                    selectedIndex === index
                      ? 'bg-primary !w-6 !rounded'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50',
                  )}
                  onClick={() => scrollTo(index)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default WowtourTestimonial1
