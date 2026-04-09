'use client'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { PublicContextProps } from '@/utilities/publicContextProps'
import type { Media as MediaType } from '@/payload-types'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useCallback, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'

// Render country flag as a circular image from CDN (works on all OS including Windows)
function FlagImage({
  code,
  icon,
  alt,
  size = 20,
}: {
  code?: string
  icon?: MediaType | string
  alt?: string
  size?: number
}) {
  // Prioritize 2-letter country code (CDN flags) — they always look crisp
  if (code && code.length === 2) {
    const lowerCode = code.toLowerCase()
    return (
      <div
        className="relative flex-shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-100 shadow-sm"
        style={{ width: size, height: size, display: 'inline-block', verticalAlign: 'middle' }}
      >
        <img
          src={`https://flagcdn.com/w40/${lowerCode}.png`}
          srcSet={`https://flagcdn.com/w80/${lowerCode}.png 2x`}
          alt={alt || code}
          className="absolute inset-0 h-full w-full object-cover rounded-full"
          loading="lazy"
        />
      </div>
    )
  }

  // Fallback to uploaded icon — use object-cover + circular crop for safety
  if (icon) {
    return (
      <div
        className="flex-shrink-0 overflow-hidden rounded-full"
        style={{ width: size, height: size, display: 'inline-block', verticalAlign: 'middle' }}
      >
        <Media
          resource={icon}
          imgClassName="w-full h-full object-cover"
          className="h-full w-full"
        />
      </div>
    )
  }

  return (
    <span className="flex-shrink-0 text-base leading-none" role="img" aria-label={alt}>
      🏳️
    </span>
  )
}

const emptySubscribe = () => () => {}
function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )
}

type CityItem = {
  id: string
  title: string
  slug: string
  tourCount: number
}

export type TourCategoryMenuProps = {
  title?: string
  underlineColor?: string
  category?: string | { id: string; title?: string }
  tours?: Array<
    | {
        id?: string
        title?: string
        slug?: string
        flagIcon?: MediaType | string
        flagCode?: string
        tourCount?: number
        isActive?: boolean
      }
    | { relationTo: string; value: any }
    | string
  >
  columns?: '1' | '2' | '3' | '4'
  showFlags?: boolean
  showTourCount?: boolean
  showCityHover?: boolean
  publicContext: PublicContextProps
  citiesMap?: Record<string, CityItem[]>
}

export const TourCategoryMenu: React.FC<TourCategoryMenuProps> = ({
  title,
  tours = [],
  columns = '2',
  showFlags = true,
  showTourCount = true,
  showCityHover = true,
  publicContext,
  citiesMap = {},
}) => {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)
  const [hoveredTour, setHoveredTour] = useState<any>(null)
  const [popupPos, setPopupPos] = useState<{ top: number; left?: number; right?: number }>({
    top: 0,
  })
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null)
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const mounted = useIsMounted()

  const pathname = usePathname()

  const handleMouseEnter = useCallback(
    (countryId: string, hasTours: boolean, tour: any, el: HTMLElement) => {
      if (!hasTours || !showCityHover) return
      if (leaveTimerRef.current) {
        clearTimeout(leaveTimerRef.current)
        leaveTimerRef.current = null
      }
      hoverTimerRef.current = setTimeout(() => {
        const rect = el.getBoundingClientRect()
        const popupW = 400
        const vw = window.innerWidth

        if (rect.right + 4 + popupW > vw) {
          setPopupPos({ top: rect.top, right: vw - rect.right + 15 })
        } else {
          setPopupPos({ top: rect.top, left: rect.right + 4 })
        }
        setHoveredCountry(countryId)
        setHoveredTour(tour)
      }, 50)
    },
    [],
  )

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
    leaveTimerRef.current = setTimeout(() => {
      setHoveredCountry(null)
      setHoveredTour(null)
    }, 50)
  }, [])

  const handlePopupEnter = useCallback(() => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current)
      leaveTimerRef.current = null
    }
  }, [])

  // Normalize tours — polymorphic format { relationTo, value } → value
  const tourItems = tours
    .map((tour) => {
      if (typeof tour === 'string') return null
      if (tour && 'relationTo' in tour && tour.value) {
        return typeof tour.value === 'object'
          ? { ...tour.value, relationTo: tour.relationTo }
          : null
      }
      return tour
    })
    .filter(
      (tour): tour is Exclude<typeof tour, null | string> =>
        tour !== null && typeof tour === 'object' && tour.isActive !== false,
    )

  if (tourItems.length === 0) return null

  const citiesForPopup = hoveredCountry ? citiesMap[hoveredCountry] || [] : []

  return (
    <div
      className={`flex min-w-0 flex-col pb-2 ${columns === '1' ? 'w-full' : ''}`}
      style={columns === '1' ? undefined : { maxHeight: '70vh' }}
    >
      {/* Section Title */}
      {title && (
        <div className="mb-2 flex-shrink-0 border-b border-current/20 pb-2">
          <h3 className="text-sm font-bold" style={{ color: 'var(--tc-dropdown-text, inherit)' }}>{title}</h3>
        </div>
      )}

      {/* Tour Grid */}
      <div
        className={`grid flex-1 content-start gap-x-2 gap-y-1 overflow-y-auto pr-1 ${columns === '1' ? 'w-full grid-cols-1' : columns === '3' ? 'grid-cols-3' : columns === '4' ? 'grid-cols-4' : 'grid-cols-2'}`}
        style={{ scrollbarWidth: 'thin' }}
      >
        {(tours || []).map((rawTour, index) => {
          let tour: any = null
          if (rawTour && typeof rawTour === 'object' && 'value' in rawTour) {
            if (typeof rawTour.value === 'object') {
              tour = { ...rawTour.value, relationTo: rawTour.relationTo }
            } else {
              // Broken or deleted reference (string ID)
              return null
            }
          } else if (typeof rawTour === 'object') {
            tour = rawTour
          } else {
            // Raw string (unpopulated/deleted)
            return null
          }

          if (!tour || tour.isActive === false) return null

          const code = tour.flagCode
          const hasTours = (tour.tourCount ?? 0) > 0
          const hasCities = showCityHover && !!(tour.id && citiesMap && citiesMap[tour.id]?.length)

          return (
            <div
              key={tour.id || `tour-${index}`}
              className="w-full"
              onMouseEnter={(e) =>
                tour.id && hasCities && handleMouseEnter(tour.id, true, tour, e.currentTarget)
              }
              onMouseLeave={handleMouseLeave}
            >
              <Link
                prefetch={false}
                href={
                  tour.relationTo === 'inbound-tours'
                    ? `/inbound-tours/${tour.slug || ''}`
                    : `/intertours/${tour.slug || ''}`
                }
                className={`group flex w-full min-w-0 items-center justify-between gap-2 rounded px-2 py-1.5 transition-colors ${pathname === `/intertours/${tour.slug}` || pathname === `/inbound-tours/${tour.slug}` ? 'font-semibold' : ''}`}
                style={{
                  color: 'var(--tc-dropdown-text, inherit)',
                  ...(pathname === `/intertours/${tour.slug}` || pathname === `/inbound-tours/${tour.slug}`
                    ? { backgroundColor: 'var(--tc-dropdown-hover, rgba(0,0,0,0.05))' }
                    : {}),
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--tc-dropdown-hover, rgba(0,0,0,0.05))'
                }}
                onMouseLeave={(e) => {
                  const isActive = pathname === `/intertours/${tour.slug}` || pathname === `/inbound-tours/${tour.slug}`
                  e.currentTarget.style.backgroundColor = isActive ? 'var(--tc-dropdown-hover, rgba(0,0,0,0.05))' : ''
                }}
              >
                <div className="flex min-w-0 flex-grow items-center gap-2 overflow-hidden">
                  {showFlags && (
                    <FlagImage
                      code={code}
                      icon={(tour as any).flagIcon}
                      alt={tour.title || 'Tour'}
                    />
                  )}
                  <span
                    className="truncate text-sm tracking-tight"
                    style={{ color: 'var(--tc-dropdown-text, inherit)' }}
                  >
                    {tour.title || 'Untitled Tour'}
                  </span>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1.5">
                  {showTourCount && hasTours && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] leading-none font-bold tabular-nums shadow-sm"
                      style={{
                        backgroundColor: 'var(--badge-bg, var(--primary))',
                        color: 'var(--badge-text, var(--primary-foreground))',
                      }}
                    >
                      {tour.tourCount}
                    </span>
                  )}
                  {hasCities ? (
                    <span className="text-[10px] opacity-40" style={{ color: 'var(--tc-dropdown-text, inherit)' }}>›</span>
                  ) : (
                    <span className="text-[10px] opacity-0" style={{ color: 'var(--tc-dropdown-text, inherit)' }}>›</span>
                  )}
                </div>
              </Link>
            </div>
          )
        })}
      </div>

      {/* City Popup — data from server-side citiesMap, no API call */}
      {showCityHover &&
        mounted &&
        hoveredCountry &&
        hoveredTour &&
        citiesForPopup.length > 0 &&
        createPortal(
          <div
            className="fixed z-[99999] max-h-[65vh] max-w-[400px] min-w-[280px] overflow-y-auto rounded-xl border border-gray-200 px-4 py-3 shadow-2xl dark:border-gray-700"
            style={{
              top: popupPos.top,
              ...(popupPos.right !== undefined
                ? { right: popupPos.right }
                : { left: popupPos.left }),
              scrollbarWidth: 'thin',
              background: 'var(--tc-dropdown-bg, #fff)',
              color: 'var(--tc-dropdown-text, inherit)',
            }}
            onMouseEnter={handlePopupEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className="mb-2 flex items-center gap-2 border-b pb-1.5 text-sm font-bold"
              style={{ color: 'var(--tc-dropdown-text, inherit)', borderColor: 'color-mix(in srgb, currentColor 20%, transparent)' }}
            >
              <FlagImage
                code={hoveredTour.flagCode}
                icon={(hoveredTour as any).flagIcon}
                alt={hoveredTour.title}
              />
              <span>{hoveredTour.title}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
              {citiesForPopup.map((city) => (
                <a
                  key={city.id}
                  href={
                    hoveredTour.relationTo === 'inbound-tours'
                      ? `/inbound-tours/${city.slug}`
                      : `/intertours/${city.slug}`
                  }
                  className="flex items-center gap-1.5 rounded px-1.5 py-1 text-xs transition-colors"
                  style={{ color: 'var(--tc-dropdown-text, inherit)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--tc-dropdown-hover, rgba(0,0,0,0.05))'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = ''
                  }}
                >
                  <span className="flex-1 truncate">{city.title}</span>
                  {city.tourCount > 0 && (
                    <span
                      className="flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] leading-none font-bold tabular-nums shadow-sm"
                      style={{
                        backgroundColor: 'var(--badge-bg, var(--primary))',
                        color: 'var(--badge-text, var(--primary-foreground))',
                      }}
                    >
                      {city.tourCount}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
