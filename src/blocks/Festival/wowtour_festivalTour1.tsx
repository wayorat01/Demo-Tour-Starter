'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import Image from 'next/image'
import type { Festival, Media as MediaType } from '@/payload-types'
import type { PublicContextProps } from '@/utilities/publicContextProps'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/cn'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from '@/components/ui/carousel'

const MONTH_FILTERS = [
  { label: 'ทั้งหมด', value: 'all' },
  { label: 'ม.ค.', value: 'january' },
  { label: 'ก.พ.', value: 'february' },
  { label: 'มี.ค.', value: 'march' },
  { label: 'เม.ย.', value: 'april' },
  { label: 'พ.ค.', value: 'may' },
  { label: 'มิ.ย.', value: 'june' },
  { label: 'ก.ค.', value: 'july' },
  { label: 'ส.ค.', value: 'august' },
  { label: 'ก.ย.', value: 'september' },
  { label: 'ต.ค.', value: 'october' },
  { label: 'พ.ย.', value: 'november' },
  { label: 'ธ.ค.', value: 'december' },
] as const

const ROWS = 2
const ITEMS_PER_PAGE = 5 * ROWS // 5 cols × 2 rows = 10 items

/** Month values used in MONTH_FILTERS mapped by JS month index (0-11) */
const MONTH_INDEX_MAP: Record<number, string> = {
  0: 'january',
  1: 'february',
  2: 'march',
  3: 'april',
  4: 'may',
  5: 'june',
  6: 'july',
  7: 'august',
  8: 'september',
  9: 'october',
  10: 'november',
  11: 'december',
}

/** Extract month value from a date string (ISO or any parseable format) */
function getMonthFromDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  return MONTH_INDEX_MAP[d.getMonth()] ?? null
}

type WowtourFestivalTour1Props = {
  headingSettings?: {
    heading?: string | null
    showHeadingIcon?: boolean | null
    headingIcon?: MediaType | string | null
    showDescription?: boolean | null
    description?: string | null
  }
  festivals: Festival[]
  publicContext: PublicContextProps
}

/** Split array into chunks of `size` */
function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

export const WowtourFestivalTour1: React.FC<WowtourFestivalTour1Props> = ({
  headingSettings,
  festivals,
  publicContext,
}) => {
  const [activeMonth, setActiveMonth] = useState<string>('all')
  const [api, setApi] = useState<CarouselApi>()
  const [currentPage, setCurrentPage] = useState(0)

  // Heading
  const heading = headingSettings?.heading ?? 'เที่ยวตามเทศกาล'
  const showHeadingIcon = headingSettings?.showHeadingIcon ?? true
  const headingIcon = headingSettings?.headingIcon
  const showDescription = headingSettings?.showDescription ?? false
  const description = headingSettings?.description

  // Filter festivals by month extracted from startDate
  const filteredFestivals = useMemo(
    () =>
      activeMonth === 'all'
        ? festivals
        : festivals.filter((f) => getMonthFromDate((f as any).startDate) === activeMonth),
    [activeMonth, festivals],
  )

  const pages = useMemo(() => chunkArray(filteredFestivals, ITEMS_PER_PAGE), [filteredFestivals])

  // Track carousel page via event callbacks (avoids setState in effect body)
  const handleSelect = useCallback(() => {
    if (!api) return
    setCurrentPage(api.selectedScrollSnap())
  }, [api])

  useEffect(() => {
    if (!api) return
    api.on('select', handleSelect)
    api.on('reInit', handleSelect)
    return () => {
      api.off('select', handleSelect)
      api.off('reInit', handleSelect)
    }
  }, [api, handleSelect])

  // Reset to first page when filter changes
  useEffect(() => {
    api?.scrollTo(0)
  }, [activeMonth, api])

  if (!festivals || festivals.length === 0) return null

  return (
    <section className="w-full py-12 md:py-16">
      <div className="container">
        {/* Heading Section */}
        <div className="mb-8 flex flex-col items-center text-center md:mb-10">
          <div className="mb-2 flex items-center gap-3">
            {showHeadingIcon && headingIcon && typeof headingIcon === 'object' && (
              <div className="relative h-10 w-10">
                <Media resource={headingIcon} fill imgClassName="object-contain" />
              </div>
            )}
            <h2 className="text-2xl font-medium">{heading}</h2>
          </div>

          {showDescription && description && (
            <p className="text-muted-foreground mt-2 max-w-2xl">{description}</p>
          )}
        </div>

        {/* Month Filter — Horizontal Scroll Pills */}
        <div className="relative mb-6 md:mb-10">
          <div
            className="-mx-1 flex flex-wrap justify-center gap-2 px-1 pb-2"
            style={{
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {MONTH_FILTERS.map((month) => (
              <button
                key={month.value}
                type="button"
                onClick={() => setActiveMonth(month.value)}
                className={cn(
                  'shrink-0 snap-start rounded-full px-4 py-2 text-xs font-medium whitespace-nowrap transition-all duration-200 md:text-sm',
                  activeMonth === month.value
                    ? 'bg-primary text-primary-foreground shadow-primary/25 scale-105 shadow-md'
                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                {month.label}
              </button>
            ))}
          </div>
          <div className="from-background pointer-events-none absolute top-0 right-0 bottom-2 w-8 bg-gradient-to-l to-transparent md:hidden" />
        </div>

        {/* Festival Grid Carousel */}
        {filteredFestivals.length > 0 ? (
          <div className="relative">
            <Carousel
              setApi={setApi}
              opts={{
                align: 'start',
                loop: false,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {pages.map((pageItems, pageIndex) => (
                  <CarouselItem key={pageIndex} className="basis-full pl-4">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-5 lg:grid-cols-5">
                      {pageItems.map((festival) => {
                        const thumbnail = festival.thumbnail as MediaType | undefined
                        const link = (festival as any).link || '#'

                        return (
                          <a
                            key={festival.id}
                            href={link}
                            className="group relative block aspect-square overflow-hidden rounded-lg shadow-sm transition-shadow duration-300 hover:shadow-lg"
                          >
                            {thumbnail && typeof thumbnail === 'object' && thumbnail.url ? (
                              <Image
                                src={thumbnail.url}
                                alt={thumbnail.alt || festival.nameHoliday || 'Festival'}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                              />
                            ) : (
                              <div className="bg-muted flex h-full w-full items-center justify-center">
                                <span className="text-muted-foreground text-sm">No Image</span>
                              </div>
                            )}
                          </a>
                        )
                      })}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {/* Navigation Arrows — only show when more than 1 page */}
              {pages.length > 1 && (
                <>
                  <CarouselPrevious className="-left-4 md:-left-5 lg:-left-12" />
                  <CarouselNext className="-right-4 md:-right-5 lg:-right-12" />
                </>
              )}
            </Carousel>

            {/* Dot Indicators */}
            {pages.length > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                {pages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Go to page ${idx + 1}`}
                    onClick={() => api?.scrollTo(idx)}
                    className={cn(
                      'h-2 w-2 rounded-full transition-all duration-300',
                      currentPage === idx
                        ? 'bg-primary w-6'
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50',
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">ไม่พบเทศกาลในเดือนนี้</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default WowtourFestivalTour1
