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
 * wowtour_testimonial5 — "Quote Strip Carousel" (always carousel, desktop + mobile)
 * Full-width centered quote band, one per slide, auto-slide.
 */

const QuoteIcon = () => (
  <svg className="text-primary mx-auto mb-4 size-12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
  </svg>
)

const WowtourTestimonial5: React.FC<
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

        {/* Full-width Quote Strip Carousel — always 1 per slide */}
        <div className="relative">
          <Carousel
            setApi={setApi}
            opts={{ align: 'center', loop: true }}
            plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
            className="w-full"
          >
            <CarouselContent className="px-1 py-2">
              {items.map((item) => {
                const interTour =
                  item.interTour && typeof item.interTour === 'object' ? item.interTour : null
                return (
                  <CarouselItem key={item.id} className="basis-full">
                    <div className="bg-primary/5 rounded-2xl px-8 py-10 text-center sm:px-12 lg:px-20">
                      <QuoteIcon />

                      {item.description && (
                        <p className="text-foreground mx-auto mb-6 max-w-3xl text-lg leading-relaxed lg:text-xl">
                          {item.description}
                        </p>
                      )}

                      {/* Author */}
                      <div className="flex flex-col items-center gap-3">
                        {item.profileImage && typeof item.profileImage === 'object' && (
                          <div className="size-[104px] shrink-0 overflow-hidden rounded-full ring-2 ring-white">
                            <Media
                              resource={item.profileImage}
                              imgClassName="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <div className="text-center">
                          <p className="text-base font-bold">{item.customerName}</p>
                          <div className="text-muted-foreground mt-1 flex items-center justify-center gap-2 text-sm">
                            {item.tourName && <span>{item.tourName}</span>}
                            {interTour && (
                              <>
                                <span className="text-border">•</span>
                                <span className="text-primary font-medium">{interTour.title}</span>
                              </>
                            )}
                          </div>
                          {item.rating && (
                            <div className="mt-2 flex items-center justify-center gap-0.5">
                              <Stars rating={item.rating} />
                            </div>
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

export default WowtourTestimonial5
