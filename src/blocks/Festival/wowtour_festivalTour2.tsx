'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import type { Festival, Media as MediaType } from '@/payload-types'
import type { PublicContextProps } from '@/utilities/publicContextProps'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/cn'

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

const FIXED_URL_PATTERN = '/search-tour/?filter_holiday={slug}'

type WowtourFestivalTour2Props = {
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

export const WowtourFestivalTour2: React.FC<WowtourFestivalTour2Props> = ({
  headingSettings,
  festivals,
  publicContext,
}) => {
  const [activeMonth, setActiveMonth] = useState<string>('all')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Heading
  const heading = headingSettings?.heading ?? 'เที่ยวตามเทศกาล'
  const showHeadingIcon = headingSettings?.showHeadingIcon ?? true
  const headingIcon = headingSettings?.headingIcon
  const showDescription = headingSettings?.showDescription ?? false
  const description = headingSettings?.description

  // Filter festivals by active month
  const filteredFestivals =
    activeMonth === 'all' ? festivals : festivals.filter((f) => (f as any).month === activeMonth)

  const buildLink = (slug: string) => {
    return FIXED_URL_PATTERN.replace('{slug}', slug)
  }

  if (!festivals || festivals.length === 0) return null

  return (
    <section className="w-full py-10 md:py-16">
      <div className="container">
        {/* Heading Section */}
        <div className="mb-6 flex flex-col items-center text-center md:mb-10">
          <div className="mb-1 flex items-center gap-3">
            {showHeadingIcon && headingIcon && typeof headingIcon === 'object' && (
              <div className="relative h-9 w-9 md:h-10 md:w-10">
                <Media resource={headingIcon} fill imgClassName="object-contain" />
              </div>
            )}
            <h2 className="text-2xl font-medium tracking-tight">{heading}</h2>
          </div>

          {showDescription && description && (
            <p className="text-muted-foreground mt-2 max-w-xl text-sm md:text-base">
              {description}
            </p>
          )}
        </div>

        {/* Month Filter — Horizontal Scroll Pills */}
        <div className="relative mb-6 md:mb-10">
          <div
            ref={scrollRef}
            className="scrollbar-hide -mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-2"
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
          {/* Fade edges */}
          <div className="from-background pointer-events-none absolute top-0 right-0 bottom-2 w-8 bg-gradient-to-l to-transparent md:hidden" />
        </div>

        {/* Festival Grid — Circle Cards */}
        {filteredFestivals.length > 0 ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 md:gap-6 lg:grid-cols-5">
            {filteredFestivals.map((festival) => {
              const thumbnail = festival.thumbnail as MediaType | undefined
              const slug = (festival as any).slug || ''
              const link = buildLink(slug)

              return (
                <a
                  key={festival.id}
                  href={link}
                  className="group flex flex-col items-center gap-3 text-center"
                >
                  {/* Circle Image */}
                  <div className="group-hover:ring-primary/40 relative aspect-square w-full max-w-[180px] overflow-hidden rounded-full shadow-md ring-2 ring-transparent transition-all duration-300 group-hover:shadow-xl">
                    {thumbnail && typeof thumbnail === 'object' && thumbnail.url ? (
                      <Image
                        src={thumbnail.url}
                        alt={thumbnail.alt || festival.nameHoliday || 'Festival'}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 40vw, (max-width: 768px) 25vw, 180px"
                      />
                    ) : (
                      <div className="bg-muted flex h-full w-full items-center justify-center">
                        <span className="text-muted-foreground text-xs">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Title below circle */}
                  <h3 className="text-foreground group-hover:text-primary line-clamp-2 text-sm font-semibold transition-colors duration-200 md:text-base">
                    {festival.nameHoliday}
                  </h3>
                </a>
              )
            })}
          </div>
        ) : (
          <div className="bg-muted/30 rounded-2xl py-16 text-center">
            <div className="mb-3 text-4xl">🎎</div>
            <p className="text-muted-foreground text-sm">ไม่พบเทศกาลในเดือนนี้</p>
          </div>
        )}
      </div>

      {/* Inline style for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}

export default WowtourFestivalTour2
