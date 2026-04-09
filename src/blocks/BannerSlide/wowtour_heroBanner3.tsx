'use client'

import Autoplay from 'embla-carousel-autoplay'
import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { CarouselApi } from '@/components/ui/carousel'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { Media } from '@/components/Media'
import type { BannerSlideBlock, Media as MediaType } from '@/payload-types'
import { PublicContextProps } from '@/utilities/publicContextProps'
import { cn } from '@/utilities/cn'
import WowtourSearch1 from '@/blocks/SearchTour/wowtour_search1'

/**
 * WowtourHeroBanner3 (Block version)
 * Full-width Banner Slide with glassmorphism search box overlay at bottom
 * Image ratio: 1920x600 → aspect-[32/10]
 */
const WowtourHeroBanner3: React.FC<BannerSlideBlock & { publicContext: PublicContextProps, preloadedGlobalSettings?: any, preloadedSearchOptions?: any }> = ({
    heroBanner3Settings,
    publicContext,
    preloadedGlobalSettings,
    preloadedSearchOptions,
}) => {
    const sliderImages = heroBanner3Settings?.sliderImages
    const autoPlayDelay = Number(heroBanner3Settings?.autoPlayDelay) || 10000
    const searchBoxSettings = heroBanner3Settings?.searchBoxSettings
    const bgColor = heroBanner3Settings?.backgroundColor

    const autoplayPlugin = useRef(Autoplay({ delay: autoPlayDelay, stopOnInteraction: false, stopOnMouseEnter: true }))
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
        <section
            className="w-full overflow-hidden"
            style={{ backgroundColor: bgColor || undefined }}
        >
            <div className="w-full relative">
                {/* Full Width Banner Slide */}
                {sliderImages && sliderImages.length > 0 && (
                    <div className="relative w-full max-h-[600px] min-h-[400px] md:min-h-[450px]" style={{ aspectRatio: '1920 / 600' }}>
                        <Carousel
                            setApi={setApi}
                            plugins={[autoplayPlugin.current]}
                            opts={{ loop: true }}
                            className="absolute inset-0 *:h-full"
                        >
                            <CarouselContent className="-ml-0" style={{ height: '100%' }}>
                                {sliderImages.map((item, index) => {
                                    const image = item.image as MediaType
                                    const hasLink = !!item.url

                                    const slideContent = (
                                        <div className="absolute inset-0">
                                            {image && (
                                                <Media
                                                    resource={image}
                                                    fill
                                                    imgClassName="object-cover w-full h-full"
                                                />
                                            )}
                                        </div>
                                    )

                                    return (
                                        <CarouselItem key={index} className="basis-full pl-0 relative" style={{ height: '100%' }}>
                                            {hasLink ? (
                                                <a
                                                    href={item.url || '#'}
                                                    target={item.newTab ? '_blank' : '_self'}
                                                    rel={item.newTab ? 'noopener noreferrer' : undefined}
                                                    className="block absolute inset-0"
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
                        <div className="absolute left-4 right-4 top-1/2 z-10 flex -translate-y-1/2 justify-between pointer-events-none">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="pointer-events-auto h-10 w-10 md:h-12 md:w-12 rounded-full bg-black/20 hover:bg-black/40 text-white border-0 shadow-none backdrop-blur-sm"
                                onClick={scrollPrev}
                            >
                                <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="pointer-events-auto h-10 w-10 md:h-12 md:w-12 rounded-full bg-black/20 hover:bg-black/40 text-white border-0 shadow-none backdrop-blur-sm"
                                onClick={scrollNext}
                            >
                                <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
                            </Button>
                        </div>

                        {/* Dots */}
                        <div className="absolute bottom-20 md:bottom-24 lg:bottom-28 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                            {Array.from({ length: count }).map((_, index) => (
                                <button
                                    key={index}
                                    className={cn(
                                        'h-2.5 w-2.5 rounded-full transition-all duration-300 shadow-sm cursor-pointer',
                                        index === current
                                            ? 'bg-white scale-110'
                                            : 'bg-white/50 hover:bg-white/80'
                                    )}
                                    onClick={() => api?.scrollTo(index)}
                                />
                            ))}
                        </div>

                        {/* Search Box Overlay — anchored to the bottom */}
                        <div className="absolute bottom-4 md:bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-[1100px] pointer-events-auto">
                            <div className="w-full backdrop-blur-md bg-white/30 dark:bg-black/30 border border-white/40 dark:border-white/20 rounded-2xl px-4 py-3 md:px-6 md:py-4 lg:px-8 lg:py-5 shadow-xl">
                                <WowtourSearch1
                                    backgroundSettings={searchBoxSettings?.backgroundSettings}
                                    sectionSettings={searchBoxSettings?.sectionSettings}
                                    headingSettings={searchBoxSettings?.headingSettings}
                                    publicContext={publicContext}
                                    heroHorizontalMode={true}
                                    preloadedGlobalSettings={preloadedGlobalSettings}
                                    preloadedSearchOptions={preloadedSearchOptions}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

export default WowtourHeroBanner3
