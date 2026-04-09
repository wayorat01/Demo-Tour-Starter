'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'next/navigation'
import {
  Calendar as CalendarIcon,
  ChevronDown,
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
} from 'lucide-react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import type { DateRange } from 'react-day-picker'

import { Calendar } from '@/components/ui/calendar'
import { Media } from '@/components/Media'
import type { WowtourSearchTourBlock, Media as MediaType } from '@/payload-types'
import type { PublicContextProps } from '@/utilities/publicContextProps'
import { cn } from '@/utilities/cn'

type WowtourSearch1Props = Partial<WowtourSearchTourBlock> & {
  publicContext?: PublicContextProps
  heroVerticalMode?: boolean
  heroHorizontalMode?: boolean
  preloadedGlobalSettings?: any
  preloadedSearchOptions?: any
}

// ============================================
// Autocomplete Dropdown Component
// ============================================
type AutocompleteOption = string | { label: string; value: string; searchTerms?: string[] }

function AutocompleteDropdown({
  label,
  placeholder,
  options,
  value,
  onChange,
}: {
  label: string
  placeholder: string
  options: AutocompleteOption[]
  value: string
  onChange: (val: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const getOptLabel = (opt: AutocompleteOption) => (typeof opt === 'string' ? opt : opt.label)
  const getOptValue = (opt: AutocompleteOption) => (typeof opt === 'string' ? opt : opt.value)
  const getSearchText = (opt: AutocompleteOption) =>
    typeof opt === 'string' ? opt : `${opt.label} ${opt.searchTerms?.join(' ')}`

  const filtered = options.filter((o) =>
    getSearchText(o).toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', isOpen ? 'relative z-[60]' : '')} ref={ref}>
      <label className="text-foreground truncate text-xs font-medium xl:text-sm">{label}</label>
      <div className="relative">
        <div
          className="bg-background border-input hover:border-primary/50 flex cursor-pointer items-center justify-between gap-1 rounded-lg border px-2 py-2 transition-colors xl:px-3 xl:py-2.5"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={cn('truncate text-xs xl:text-sm', !value && 'text-muted-foreground')}>
            {options.find((o) => getOptValue(o) === value)
              ? getOptLabel(options.find((o) => getOptValue(o) === value)!)
              : value || placeholder}
          </span>
          <ChevronDown
            className={cn(
              'text-muted-foreground h-4 w-4 shrink-0 transition-transform',
              isOpen && 'rotate-180',
            )}
          />
        </div>

        {isOpen && (
          <div className="bg-background border-input absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-hidden rounded-lg border shadow-lg">
            <div className="border-input border-b p-2">
              <input
                type="text"
                className="bg-muted placeholder:text-muted-foreground w-full rounded-md px-2 py-1.5 text-sm outline-none"
                placeholder="ค้นหา..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filtered.length > 0 ? (
                filtered.map((opt, i) => {
                  const optVal = getOptValue(opt)
                  const optLabel = getOptLabel(opt)
                  return (
                    <div
                      key={optVal + i}
                      className={cn(
                        'hover:bg-accent cursor-pointer px-3 py-2 text-sm transition-colors',
                        value === optVal && 'bg-accent font-medium',
                      )}
                      onClick={() => {
                        onChange(optVal)
                        setIsOpen(false)
                        setSearch('')
                      }}
                    >
                      {optLabel}
                    </div>
                  )
                })
              ) : (
                <div className="text-muted-foreground px-3 py-2 text-sm">ไม่พบข้อมูล</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// Month Dropdown Component
// ============================================
const MONTHS_TH = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
]

function MonthDropdown({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (val: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', isOpen ? 'relative z-[60]' : '')} ref={ref}>
      <label className="text-foreground truncate text-xs font-medium xl:text-sm">{label}</label>
      <div className="relative">
        <div
          className="bg-background border-input hover:border-primary/50 flex cursor-pointer items-center justify-between gap-1 rounded-lg border px-2 py-2 transition-colors xl:px-3 xl:py-2.5"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={cn('truncate text-xs xl:text-sm', !value && 'text-muted-foreground')}>
            {value || placeholder}
          </span>
          <ChevronDown
            className={cn(
              'text-muted-foreground h-4 w-4 shrink-0 transition-transform',
              isOpen && 'rotate-180',
            )}
          />
        </div>

        {isOpen && (
          <div className="bg-background border-input absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border shadow-lg">
            {MONTHS_TH.map((month) => (
              <div
                key={month}
                className={cn(
                  'hover:bg-accent cursor-pointer px-3 py-2 text-sm transition-colors',
                  value === month && 'bg-accent font-medium',
                )}
                onClick={() => {
                  onChange(month)
                  setIsOpen(false)
                }}
              >
                {month}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// Date Range Picker Component (Single Input)
// ============================================
function DateRangePicker({
  label,
  placeholder,
  dateRange,
  onDateRangeChange,
}: {
  label: string
  placeholder: string
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const formatDate = (date: Date | undefined) => {
    if (!date) return ''
    return format(date, 'd MMM yyyy', { locale: th })
  }

  const displayValue = () => {
    if (dateRange?.from && dateRange?.to) {
      return `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`
    }
    if (dateRange?.from) {
      return `${formatDate(dateRange.from)} - ...`
    }
    return ''
  }

  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', isOpen ? 'relative z-[60]' : '')} ref={ref}>
      <label className="text-foreground truncate text-xs font-medium xl:text-sm">{label}</label>
      <div className="relative">
        <div
          className="bg-background border-input hover:border-primary/50 flex cursor-pointer items-center gap-2 rounded-lg border px-2 py-2 transition-colors xl:px-3 xl:py-2.5"
          onClick={() => setIsOpen(!isOpen)}
        >
          <CalendarIcon className="text-muted-foreground h-4 w-4 shrink-0" />
          <span
            className={cn(
              'flex-1 truncate text-xs xl:text-sm',
              !dateRange?.from && 'text-muted-foreground',
            )}
          >
            {displayValue() || placeholder}
          </span>
        </div>

        {/* Calendar Popup */}
        {isOpen && (
          <div className="absolute top-full left-0 z-50 mt-1">
            <div className="bg-background border-input rounded-lg border p-2 shadow-xl">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => {
                  onDateRangeChange(range)
                  if (range?.from && range?.to) {
                    setIsOpen(false)
                  }
                }}
                numberOfMonths={2}
                className="rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// Price Range Slider Component
// ============================================
function PriceRangeSlider({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string
  min: number
  max: number
  step: number
  value: [number, number]
  onChange: (val: [number, number]) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)

  const formatNumber = (n: number) => n.toLocaleString('th-TH')

  const getPercent = (val: number) => ((val - min) / (max - min)) * 100

  const handlePointerDown = (index: 0 | 1) => (e: React.PointerEvent) => {
    e.preventDefault()
    const track = trackRef.current
    if (!track) return

    const onMove = (moveEvent: PointerEvent) => {
      const rect = track.getBoundingClientRect()
      const x = Math.max(0, Math.min(moveEvent.clientX - rect.left, rect.width))
      const ratio = x / rect.width
      let rawVal = min + ratio * (max - min)
      rawVal = Math.round(rawVal / step) * step
      rawVal = Math.max(min, Math.min(max, rawVal))

      // Snap to exact min/max at boundaries
      if (rawVal <= min + step / 2) rawVal = min
      if (rawVal >= max - step / 2) rawVal = max

      const newVal: [number, number] = [...value] as [number, number]
      if (index === 0) {
        newVal[0] = Math.min(rawVal, value[1] - step)
      } else {
        newVal[1] = Math.max(rawVal, value[0] + step)
      }
      onChange(newVal)
    }

    const onUp = () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
    }

    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
  }

  const leftPercent = getPercent(value[0])
  const rightPercent = getPercent(value[1])

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label className="text-foreground truncate text-sm font-medium">{label}</label>

      {/* Values Display */}
      <div className="flex items-baseline justify-center gap-2 py-1">
        <span className="text-base font-bold" style={{ color: 'var(--primary)' }}>
          {formatNumber(value[0])}
        </span>
        <span className="text-muted-foreground text-xs font-normal">ระหว่าง</span>
        <span className="text-base font-bold" style={{ color: 'var(--primary)' }}>
          {formatNumber(value[1])}
        </span>
      </div>

      {/* Slider Track — px-3 gives 12px padding for thumb overhang */}
      <div className="px-3 py-2">
        <div
          ref={trackRef}
          className="relative h-3 w-full cursor-pointer rounded-full"
          style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 15%, transparent)' }}
        >
          {/* Active Range */}
          <div
            className="absolute h-full rounded-full"
            style={{
              left: `${leftPercent}%`,
              width: `${rightPercent - leftPercent}%`,
              background: 'var(--primary)',
            }}
          />

          {/* Min Thumb */}
          <div
            className="absolute top-1/2 z-10 h-6 w-6 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-white shadow-lg transition-shadow hover:shadow-xl active:cursor-grabbing"
            style={{
              left: `${leftPercent}%`,
              backgroundColor: 'var(--secondary)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
            onPointerDown={handlePointerDown(0)}
          />

          {/* Max Thumb */}
          <div
            className="absolute top-1/2 z-10 h-6 w-6 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-white shadow-lg transition-shadow hover:shadow-xl active:cursor-grabbing"
            style={{
              left: `${rightPercent}%`,
              backgroundColor: 'var(--secondary)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
            onPointerDown={handlePointerDown(1)}
          />
        </div>
      </div>
    </div>
  )
}

// ============================================
// Helper: parse HSL to rgba
// ============================================
function hslToRgba(hsl: string, opacity: number): string {
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

// ============================================
// Main Component
// ============================================
export const WowtourSearch1: React.FC<WowtourSearch1Props> = ({
  backgroundSettings: blockBg,
  sectionSettings: blockSection,
  headingSettings: blockHeading,
  heroVerticalMode = false,
  heroHorizontalMode = false,
  preloadedGlobalSettings,
  preloadedSearchOptions,
  publicContext,
}) => {
  const searchParams = useSearchParams()
  const [populatedHeadingIcon, setPopulatedHeadingIcon] = useState<MediaType | null>(null)

  // Fetch search section settings from PageConfig (shared source of truth)
  const [globalSettings, setGlobalSettings] = useState<any>(
    preloadedGlobalSettings?.searchSectionSettings || null,
  )

  useEffect(() => {
    if (!preloadedGlobalSettings) {
      fetch('/api/globals/page-config?depth=2')
        .then((res) => res.json())
        .then((data) => {
          setGlobalSettings(data?.searchSectionSettings || {})
        })
        .catch(() => {})
    }
  }, [preloadedGlobalSettings])

  // Auto-populate headingIcon if it's passed as a string ID
  useEffect(() => {
    const rawIcon = blockHeading?.headingIcon || globalSettings?.headingSettings?.headingIcon
    if (typeof rawIcon === 'string' && rawIcon.length > 0) {
      fetch(`/api/media/${rawIcon}?depth=0`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.url) setPopulatedHeadingIcon(data)
        })
        .catch(() => {})
    } else if (rawIcon && typeof rawIcon === 'object') {
      setPopulatedHeadingIcon(rawIcon as MediaType)
    } else {
      setPopulatedHeadingIcon(null)
    }
  }, [blockHeading?.headingIcon, globalSettings?.headingSettings?.headingIcon])

  // Merge: block props override → global settings → defaults
  const sectionSettings = blockSection || globalSettings?.sectionSettings || {}
  const headingSettings = blockHeading || globalSettings?.headingSettings || {}
  const isLoadingConfig = !globalSettings && !preloadedGlobalSettings
  const searchFields =
    globalSettings?.searchFields ||
    (isLoadingConfig
      ? {
          // Sensible defaults to render inputs instantly while fetching config
          countryField: {
            enabled: true,
            label: 'เลือกประเทศ / เมือง',
            placeholder: 'เลือกประเทศ / เมือง',
          },
          festivalField: {
            enabled: true,
            label: 'ทัวร์ตามเทศกาล',
            placeholder: 'เลือกเทศกาล',
          },
          airlineField: {
            enabled: true,
            label: 'สายการบิน',
            placeholder: 'เลือกสายการบิน',
          },
          tourCodeField: {
            enabled: true,
            label: 'รหัสทัวร์, โปรแกรม, สถานที่',
            placeholder: 'คำค้นหา',
          },
          wholesaleField: {
            enabled: true,
            label: 'ซัพพลายเออร์',
            placeholder: 'เลือกซัพพลายเออร์',
          },
          dateRangeField: { enabled: true, label: 'ช่วงเวลาเดินทาง' },
          priceRangeField: { enabled: true, label: 'ช่วงราคา' },
        }
      : {})
  const enableSearchSection = globalSettings?.enableSearchSection !== false

  // if (!enableSearchSection) return null

  // Form state — pre-fill from URL params
  const [location, setLocation] = useState(
    searchParams.get('city')?.trim() || searchParams.get('country')?.trim() || '',
  )
  const [festival, setFestival] = useState(searchParams.get('festival')?.trim() || '')
  const [airline, setAirline] = useState(searchParams.get('airline')?.trim() || '')
  const [tourCode, setTourCode] = useState(searchParams.get('tourCode')?.trim() || '')
  const [wholesale, setWholesale] = useState(searchParams.get('wholesale')?.trim() || '')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const from = searchParams.get('dateFrom')
    const to = searchParams.get('dateTo')
    if (from) return { from: new Date(from), to: to ? new Date(to) : undefined }
    return undefined
  })
  const [month, setMonth] = useState(searchParams.get('month')?.trim() || '')

  // Price range state — DB values as primary, CMS config as fallback
  const cmsPriceMin = searchFields?.priceRangeField?.minPrice ?? 0
  const cmsPriceMax = searchFields?.priceRangeField?.maxPrice ?? 1000000
  const [actualPriceMin, setActualPriceMin] = useState(cmsPriceMin)
  const [actualPriceMax, setActualPriceMax] = useState(cmsPriceMax)
  const [priceRange, setPriceRange] = useState<[number, number]>([cmsPriceMin, cmsPriceMax])

  // Background style (only when used as standalone block, not inside HeroBanner)
  const bgType = blockBg?.backgroundType ?? 'color'
  const bgColor = blockBg?.backgroundColor ?? 'hsl(0, 70%, 60%)'
  const bgImage = blockBg?.backgroundImage as MediaType | undefined
  const gradientStartColor = blockBg?.gradientStartColor ?? 'hsl(173, 100%, 46%)'
  const gradientEndColor = blockBg?.gradientEndColor ?? 'hsl(214, 97%, 61%)'
  const gradientType = blockBg?.gradientType ?? 'linear'
  const gradientPosition = blockBg?.gradientPosition ?? 'to right'

  // Build gradient CSS
  const getBackgroundStyle = (): React.CSSProperties => {
    if (!blockBg) return {} // Inside HeroBanner — no background container
    if (bgType === 'color') {
      return { backgroundColor: bgColor }
    }
    if (bgType === 'gradient') {
      if (gradientType === 'radial') {
        const radialPos = gradientPosition.replace('to ', 'at ')
        return {
          background: `radial-gradient(circle ${radialPos}, ${gradientStartColor}, ${gradientEndColor})`,
        }
      }
      return {
        background: `linear-gradient(${gradientPosition}, ${gradientStartColor}, ${gradientEndColor})`,
      }
    }
    return {}
  }

  const sectionBgColor = sectionSettings?.sectionBgColor ?? 'hsl(0, 0%, 100%)'
  const sectionOpacity = sectionSettings?.sectionOpacity ?? 100
  const sectionBorderRadius = sectionSettings?.sectionBorderRadius ?? 16

  const heading = headingSettings?.heading ?? 'ค้นหาโปรแกรมทัวร์'
  const showHeadingIcon = headingSettings?.showHeadingIcon ?? false
  const headingIcon =
    populatedHeadingIcon || (headingSettings?.headingIcon as MediaType | undefined)

  const isInbound =
    publicContext?.cleanSlugs?.[0] === 'inbound-tours' ||
    (typeof window !== 'undefined' && window.location.pathname.includes('inbound'))

  // Placeholder data for dropdowns (will be replaced with real data from API)
  const [countryOptions, setCountryOptions] = useState<
    { title: string; title_en?: string; slug: string }[]
  >(isInbound ? preloadedSearchOptions?.inboundCountryList || [] : preloadedSearchOptions?.countryList || [])
  const [airlineOptions, setAirlineOptions] = useState<string[]>(
    preloadedSearchOptions?.airlines || [],
  )
  const [cityList, setCityList] = useState<{ label: string; value: string; title_en?: string }[]>(
    (isInbound ? preloadedSearchOptions?.inboundCityList : preloadedSearchOptions?.cityList)?.map((c: any) => ({
      label: c.label,
      value: c.value || c.label,
      title_en: c.title_en || '',
    })) || [],
  )
  const [festivalOptions, setFestivalOptions] = useState<string[]>(
    preloadedSearchOptions?.festivalList?.map((f: any) => f.label) || [],
  )
  const [wholesaleOptions, setWholesaleOptions] = useState<string[]>(
    preloadedSearchOptions?.wholesaleList?.map((w: any) => w.label) || [],
  )

  // Fetch dynamic dropdown options from API only if not preloaded
  useEffect(() => {
    // ⚡ Skip fetch if preloaded data exists (SSR already provided it)
    if (preloadedSearchOptions && preloadedSearchOptions.countryList) {
      // Populate from preloaded data
      if (preloadedSearchOptions.countryList) setCountryOptions(preloadedSearchOptions.countryList)
      if (preloadedSearchOptions.airlines) setAirlineOptions(preloadedSearchOptions.airlines)
      if (preloadedSearchOptions.cityList)
        setCityList(
          preloadedSearchOptions.cityList.map((c: any) => ({
            label: c.label,
            value: c.value || c.label,
            title_en: c.title_en || '',
          })),
        )
      if (preloadedSearchOptions.festivalList)
        setFestivalOptions(preloadedSearchOptions.festivalList.map((f: any) => f.label))
      if (preloadedSearchOptions.wholesaleList)
        setWholesaleOptions(preloadedSearchOptions.wholesaleList.map((w: any) => w.label))
      if (preloadedSearchOptions.filterOptions?.priceRange) {
        const dbMin = preloadedSearchOptions.filterOptions.priceRange.min
        const dbMax = preloadedSearchOptions.filterOptions.priceRange.max
        if (dbMin != null && dbMax != null && dbMax > dbMin) {
          setActualPriceMin(dbMin)
          setActualPriceMax(dbMax)
          setPriceRange([dbMin, dbMax])
        }
      }
      return
    }

    // Fallback: fetch from API (only when used standalone without SSR)
    fetch('/api/search-options')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.data.countryList) setCountryOptions(data.data.countryList)
          if (data.data.airlines) setAirlineOptions(data.data.airlines)
          if (data.data.cityList)
            setCityList(
              data.data.cityList.map((c: any) => ({
                label: c.label,
                value: c.value || c.label,
                title_en: c.title_en || '',
              })),
            )
          if (data.data.festivalList)
            setFestivalOptions(data.data.festivalList.map((f: any) => f.label))
          if (data.data.wholesaleList)
            setWholesaleOptions(data.data.wholesaleList.map((w: any) => w.label))
          if (data.data.filterOptions?.priceRange) {
            const dbMin = data.data.filterOptions.priceRange.min
            const dbMax = data.data.filterOptions.priceRange.max
            if (dbMin != null && dbMax != null && dbMax > dbMin) {
              setActualPriceMin(dbMin)
              setActualPriceMax(dbMax)
              setPriceRange([dbMin, dbMax])

            }
          }
        }
      })
      .catch(() => {})
  }, [preloadedSearchOptions])

  // If includeCity is enabled, combine country and city options
  const includeCity = searchFields?.countryField?.includeCity ?? false

  const mappedCountryOptions: AutocompleteOption[] = countryOptions.map((c) => ({
    label: c.title_en ? `${c.title} (${c.title_en})` : c.title,
    value: c.title,
    searchTerms: c.title_en ? [c.title_en] : [],
  }))

  const mappedCityOptions: AutocompleteOption[] = cityList.map((c) => ({
    label: c.title_en ? `${c.label} (${c.title_en})` : c.label,
    value: c.label,
    searchTerms: c.title_en ? [c.title_en] : [],
  }))

  const combinedLocationOptions: AutocompleteOption[] = includeCity
    ? [...mappedCountryOptions, ...mappedCityOptions]
    : mappedCountryOptions

  // Detect if we're on the home page — always redirect to /search-tour from home
  const isHomePage =
    publicContext?.cleanSlugs?.[0] === 'home' ||
    (typeof window !== 'undefined' && window.location.pathname === '/')

  const handleSearch = () => {
    // Build search params and redirect
    const params = new URLSearchParams()
    let targetBaseUrl = '/search-tour' // Default fallback
    let hasDirectSlug = false

    if (location) {
      const countryMatch = countryOptions.find((c) => c.title === location)
      if (countryMatch) {
         params.set('country', location)
         // On non-home pages, navigate directly to the country/city slug page
         if (countryMatch.slug && !isHomePage) {
            targetBaseUrl = isInbound ? `/inbound-tours/${countryMatch.slug}` : `/intertours/${countryMatch.slug}`
            hasDirectSlug = true
         }
      } else {
        const cityEntry = cityList.find((c) => c.label === location)
        if (cityEntry) {
          params.set('city', cityEntry.label)
          if (cityEntry.value && !isHomePage) {
             params.set('citySlug', cityEntry.value)
             targetBaseUrl = isInbound ? `/inbound-tours/${cityEntry.value}` : `/intertours/${cityEntry.value}`
             hasDirectSlug = true
          }
        } else {
          // fallback
          params.set('country', location)
        }
      }
    }
    if (festival) params.set('festival', festival)
    if (airline) params.set('airline', airline)
    if (tourCode) params.set('tourCode', tourCode)
    if (wholesale) params.set('wholesale', wholesale)
    if (dateRange?.from) params.set('dateFrom', format(dateRange.from, 'yyyy-MM-dd'))
    if (dateRange?.to) params.set('dateTo', format(dateRange.to, 'yyyy-MM-dd'))
    if (month) params.set('month', month)
    // ส่งช่วงราคาเฉพาะเมื่อลูกค้าปรับ slider จากค่าเริ่มต้น
    if (searchFields?.priceRangeField?.enabled) {
      if (priceRange[0] !== actualPriceMin) params.set('priceMin', priceRange[0].toString())
      if (priceRange[1] !== actualPriceMax) params.set('priceMax', priceRange[1].toString())
    }

    const url = hasDirectSlug ? `${targetBaseUrl}?${params.toString()}` : `/search-tour?${params.toString()}`
    window.location.href = url
  }

  const handleClear = () => {
    setLocation('')
    setTourCode('')
    setFestival('')
    setAirline('')
    setWholesale('')
    setDateRange(undefined)
    setMonth('')
    setPriceRange([actualPriceMin, actualPriceMax])
  }

  const hasAnyFilter = !!(
    location ||
    tourCode ||
    festival ||
    airline ||
    wholesale ||
    dateRange ||
    month
  )

  // Build array of enabled field elements — ordered to match CMS backend
  // CMS order: country → city → festival → airline → tourCode → wholesale → dateRange → month → priceRange
  const enabledFieldsList: React.ReactNode[] = []

  if (searchFields?.countryField?.enabled) {
    enabledFieldsList.push(
      <div key="location" className="w-full min-w-0">
        <AutocompleteDropdown
          label={searchFields.countryField.label || 'เลือกประเทศ'}
          placeholder={searchFields.countryField.placeholder || 'เลือกประเทศ'}
          options={combinedLocationOptions}
          value={location}
          onChange={setLocation}
        />
      </div>,
    )
  }

  if (searchFields?.festivalField?.enabled) {
    enabledFieldsList.push(
      <div key="festival" className="w-full min-w-0">
        <AutocompleteDropdown
          label={searchFields.festivalField.label || 'ทัวร์ตามเทศกาล'}
          placeholder={searchFields.festivalField.placeholder || 'เลือกเทศกาล'}
          options={festivalOptions}
          value={festival}
          onChange={setFestival}
        />
      </div>,
    )
  }

  if (searchFields?.airlineField?.enabled) {
    enabledFieldsList.push(
      <div key="airline" className="w-full min-w-0">
        <AutocompleteDropdown
          label={searchFields.airlineField.label || 'สายการบิน'}
          placeholder={searchFields.airlineField.placeholder || 'เลือกสายการบิน'}
          options={airlineOptions}
          value={airline}
          onChange={setAirline}
        />
      </div>,
    )
  }

  if (searchFields?.tourCodeField?.enabled) {
    enabledFieldsList.push(
      <div key="tourCode" className="w-full min-w-0">
        <div className="flex flex-col gap-1.5">
          <label className="text-foreground truncate text-xs font-medium xl:text-sm">
            {searchFields.tourCodeField.label || 'คำค้นหา (Keyword)'}
          </label>
          <div className="bg-background border-input hover:border-primary/50 focus-within:border-primary focus-within:ring-primary/30 flex items-center rounded-lg border px-2 py-2 transition-colors focus-within:ring-1 xl:px-3 xl:py-2.5">
            <input
              type="text"
              className="w-full border-none bg-transparent text-xs outline-none xl:text-sm placeholder:text-muted-foreground"
              placeholder={searchFields.tourCodeField.placeholder || 'รหัสทัวร์, โปรแกรม, สถานที่'}
              value={tourCode}
              onChange={(e) => setTourCode(e.target.value)}
            />
          </div>
        </div>
      </div>,
    )
  }

  if (searchFields?.wholesaleField?.enabled) {
    enabledFieldsList.push(
      <div key="wholesale" className="w-full min-w-0">
        <AutocompleteDropdown
          label={searchFields.wholesaleField.label || 'Wholesale'}
          placeholder={searchFields.wholesaleField.placeholder || 'เลือก Wholesale'}
          options={wholesaleOptions}
          value={wholesale}
          onChange={setWholesale}
        />
      </div>,
    )
  }

  if (searchFields?.dateRangeField?.enabled) {
    enabledFieldsList.push(
      <div key="dateRange" className="relative w-full min-w-0">
        <DateRangePicker
          label={searchFields.dateRangeField.labelFrom || 'ช่วงเวลาเดินทาง'}
          placeholder={searchFields.dateRangeField.placeholderFrom || 'เลือกช่วงเวลา'}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>,
    )
  }

  if (searchFields?.monthField?.enabled) {
    enabledFieldsList.push(
      <div key="month" className="w-full min-w-0">
        <MonthDropdown
          label={searchFields.monthField.label || 'เลือกเดือน'}
          placeholder={searchFields.monthField.placeholder || 'เลือกเดือน'}
          value={month}
          onChange={setMonth}
        />
      </div>,
    )
  }

  if (searchFields?.priceRangeField?.enabled) {
    enabledFieldsList.push(
      <div key="priceRange" className="w-full min-w-0">
        <PriceRangeSlider
          label={searchFields.priceRangeField.label || 'ช่วงราคา'}
          min={actualPriceMin}
          max={actualPriceMax}
          step={1000}
          value={priceRange}
          onChange={setPriceRange}
        />
      </div>,
    )
  }

  // Show up to 5 fields inline. If total ≤5, no advanced filter. If ≥6, advanced filter appears.
  const MAX_INLINE = 5
  const primaryFields = enabledFieldsList.slice(0, MAX_INLINE)
  const extraFields = enabledFieldsList.slice(MAX_INLINE)
  const hasExtra = extraFields.length > 0

  // Toggle state for expandable section
  const [showExtraFields, setShowExtraFields] = useState(false)
  const extraRef = useRef<HTMLDivElement>(null)

  if (!enableSearchSection) return null

  // ================================
  // heroVerticalMode — stacked layout for HeroBanner2 sidebar
  // ================================
  if (heroVerticalMode) {
    return (
      <section className="relative w-full">
        <div
          className="flex flex-col px-4 py-4 shadow-lg md:px-6 md:py-6 xl:px-8 xl:py-8"
          style={{
            backgroundColor: hslToRgba(sectionBgColor, sectionOpacity),
            borderRadius: `${sectionBorderRadius}px`,
          }}
        >
          {/* Heading */}
          <div className="mb-2 flex items-center justify-center gap-2 lg:mb-3 xl:mb-6">
            {showHeadingIcon && headingIcon && (
              <div className="relative h-5 w-5 shrink-0 md:h-6 md:w-6 xl:h-7 xl:w-7">
                <Media resource={headingIcon} fill imgClassName="object-contain" />
              </div>
            )}
            <h2 className="text-base font-semibold md:text-lg xl:text-xl">{heading}</h2>
          </div>

          {/* Fields — stacked vertically with auto-distributed spacing */}
          <div className="flex min-h-0 flex-col gap-2 md:gap-3 xl:gap-4">
            {primaryFields.map((field, i) => (
              <div key={i} className="w-full">
                {field}
              </div>
            ))}
          </div>

          {/* Bottom: Filter + Search button */}
          <div className="border-input/30 mt-2 flex items-center gap-2 border-t pt-2 xl:mt-[10px] xl:pt-[10px]">
            {hasExtra && (
              <button
                onClick={() => setShowExtraFields(true)}
                className={cn(
                  'flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border transition-all duration-200 md:h-10 md:w-10 xl:h-12 xl:w-12',
                  'bg-background border-input text-muted-foreground hover:border-primary/50 hover:text-foreground',
                )}
                title="ตัวกรองเพิ่มเติม"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            )}
            {hasAnyFilter && (
              <button
                onClick={handleClear}
                className="border-input bg-background text-muted-foreground flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border transition-all duration-200 hover:border-red-300 hover:text-red-500 md:h-10 md:w-10 xl:h-12 xl:w-12"
                title="ล้างค่าทั้งหมด"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={handleSearch}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 hover:opacity-90 active:scale-[0.98] md:px-4 md:py-2.5 md:text-sm xl:px-6 xl:py-3 xl:text-base"
              style={{
                background: 'var(--btn-bg)',
                color: 'var(--btn-text)',
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
              <Search className="h-3 w-3 md:h-4 md:w-4 xl:h-5 xl:w-5" />
              ค้นหา
            </button>
          </div>
        </div>

        {/* Popup Overlay for Extra Fields — rendered via Portal to escape stacking context */}
        {hasExtra &&
          showExtraFields &&
          typeof document !== 'undefined' &&
          createPortal(
            <div
              className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
              onClick={() => setShowExtraFields(false)}
            >
              <div
                className="bg-background animate-in fade-in zoom-in-95 relative max-h-[80vh] w-[90vw] max-w-lg overflow-y-auto rounded-2xl p-6 shadow-2xl duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                  onClick={() => setShowExtraFields(false)}
                  className="bg-muted hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground absolute top-3 right-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors"
                  title="ปิด"
                >
                  <X className="h-4 w-4" />
                </button>

                <h3 className="mb-5 text-lg font-semibold">ตัวกรองเพิ่มเติม</h3>

                <div
                  className={cn(
                    'grid gap-4',
                    extraFields.length === 1
                      ? 'grid-cols-1'
                      : extraFields.length === 2
                        ? 'grid-cols-2'
                        : 'grid-cols-2 sm:grid-cols-3',
                  )}
                >
                  {extraFields.map((field, i) => (
                    <div key={i} className="w-full">
                      {field}
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setShowExtraFields(false)}
                    className="border-input bg-background hover:bg-muted flex-1 cursor-pointer rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors"
                  >
                    ปิด
                  </button>
                  <button
                    onClick={() => {
                      setShowExtraFields(false)
                      handleSearch()
                    }}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:opacity-90"
                    style={{
                      background: 'var(--btn-bg)',
                      color: 'var(--btn-text)',
                    }}
                  >
                    <Search className="h-4 w-4" />
                    ค้นหา
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )}
      </section>
    )
  }

  // ================================
  // heroHorizontalMode — compact single row for glassmorphism overlay
  // ================================
  if (heroHorizontalMode) {
    return (
      <div className="relative w-full">
        {/* Heading — centered on top */}
        {heading && (
          <div className="mb-3 flex w-full items-center justify-center gap-2">
            {showHeadingIcon && headingIcon && (
              <div className="relative h-5 w-5 shrink-0 md:h-6 md:w-6">
                <Media resource={headingIcon as MediaType} fill imgClassName="object-contain" />
              </div>
            )}
            <h2 className="text-foreground text-center text-sm font-semibold drop-shadow-md md:text-base lg:text-lg">
              {heading}
            </h2>
          </div>
        )}

        {/* ≤1199px: 2-col grid + buttons below | 1200px+: 1 row 5 cols */}
        <div className="hidden w-full items-end gap-3 min-[1200px]:flex">
          {primaryFields.map((field, i) => (
            <div key={i} className="min-w-0 flex-1">
              {field}
            </div>
          ))}
          <div className="flex shrink-0 items-end gap-2">
            {hasExtra && (
              <button
                onClick={() => setShowExtraFields(!showExtraFields)}
                className={cn(
                  'flex h-[40px] shrink-0 cursor-pointer items-center justify-center rounded-lg border px-3 transition-all duration-200',
                  showExtraFields
                    ? 'bg-primary text-primary-foreground border-primary shadow-md'
                    : 'bg-background/80 border-input text-muted-foreground hover:border-primary/50 hover:text-foreground',
                )}
                title={showExtraFields ? 'ปิดตัวกรองเพิ่มเติม' : 'ตัวกรองเพิ่มเติม'}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            )}
            {hasAnyFilter && (
              <button
                onClick={handleClear}
                className="border-input bg-background/80 text-muted-foreground flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border transition-all duration-200 hover:border-red-300 hover:text-red-500"
                title="ล้างค่าทั้งหมด"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={handleSearch}
              className="flex h-[40px] cursor-pointer items-center justify-center gap-2 rounded-lg px-6 text-sm font-medium whitespace-nowrap transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{
                background: 'var(--btn-bg)',
                color: 'var(--btn-text)',
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
              <Search className="h-4 w-4 flex-shrink-0" />
              <span>ค้นหา</span>
            </button>
          </div>
        </div>

        {/* Mobile/Tablet: ≤1199px — 2-col grid + centered buttons */}
        <div className="min-[1200px]:hidden">
          <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
            {primaryFields.map((field, i) => (
              <div key={i} className="min-w-0">
                {field}
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-center gap-2">
            {hasExtra && (
              <button
                onClick={() => setShowExtraFields(!showExtraFields)}
                className={cn(
                  'flex h-[38px] shrink-0 cursor-pointer items-center justify-center rounded-lg border px-3 transition-all duration-200',
                  showExtraFields
                    ? 'bg-primary text-primary-foreground border-primary shadow-md'
                    : 'bg-background/80 border-input text-muted-foreground hover:border-primary/50 hover:text-foreground',
                )}
                title={showExtraFields ? 'ปิดตัวกรองเพิ่มเติม' : 'ตัวกรองเพิ่มเติม'}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            )}
            {hasAnyFilter && (
              <button
                onClick={handleClear}
                className="border-input bg-background/80 text-muted-foreground flex h-[38px] w-[38px] shrink-0 cursor-pointer items-center justify-center rounded-lg border transition-all duration-200 hover:border-red-300 hover:text-red-500"
                title="ล้างค่าทั้งหมด"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={handleSearch}
              className="flex h-[38px] cursor-pointer items-center justify-center gap-2 rounded-lg px-5 text-sm font-medium whitespace-nowrap transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{
                background: 'var(--btn-bg)',
                color: 'var(--btn-text)',
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
              <Search className="h-4 w-4 flex-shrink-0" />
              <span>ค้นหา</span>
            </button>
          </div>
        </div>

        {/* Desktop: Extra Fields — Expandable Section (slide down) — 769px+ */}
        {hasExtra && (
          <div
            ref={extraRef}
            className={cn(
              'mt-2 hidden transition-all duration-300 ease-in-out md:block',
              showExtraFields ? 'overflow-visible' : 'overflow-hidden',
            )}
            style={{
              maxHeight: showExtraFields ? '1000px' : '0px',
              opacity: showExtraFields ? 1 : 0,
            }}
          >
            <div className="relative rounded-xl border border-white/30 bg-white/20 p-3 backdrop-blur-sm md:p-4 dark:border-white/15 dark:bg-black/20">
              <button
                onClick={() => setShowExtraFields(false)}
                className="text-foreground/70 hover:text-foreground absolute top-2 right-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white/30 transition-colors hover:bg-white/50"
                title="ปิด"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <div
                className={cn(
                  'grid items-end gap-3 pr-6 md:gap-4',
                  extraFields.length === 1
                    ? 'grid-cols-1'
                    : extraFields.length === 2
                      ? 'grid-cols-2'
                      : 'grid-cols-2 sm:grid-cols-3',
                )}
                style={{
                  gridTemplateColumns:
                    extraFields.length <= 3
                      ? `repeat(${extraFields.length}, minmax(0, 1fr))`
                      : undefined,
                }}
              >
                {extraFields}
              </div>
            </div>
          </div>
        )}

        {/* Mobile: Extra Fields — Popup Modal — ≤768px */}
        {hasExtra &&
          showExtraFields &&
          typeof document !== 'undefined' &&
          createPortal(
            <div
              className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setShowExtraFields(false)}
            >
              <div
                className="bg-background animate-in fade-in zoom-in-95 relative max-h-[80vh] w-[90vw] max-w-lg overflow-y-auto rounded-2xl p-6 shadow-2xl duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowExtraFields(false)}
                  className="bg-muted hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground absolute top-3 right-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors"
                  title="ปิด"
                >
                  <X className="h-4 w-4" />
                </button>
                <h3 className="mb-5 text-lg font-semibold">ตัวกรองเพิ่มเติม</h3>
                <div
                  className={cn(
                    'grid gap-4',
                    extraFields.length === 1 ? 'grid-cols-1' : 'grid-cols-2',
                  )}
                >
                  {extraFields.map((field, i) => (
                    <div key={i} className="w-full">
                      {field}
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setShowExtraFields(false)}
                    className="border-input bg-background hover:bg-muted flex-1 cursor-pointer rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors"
                  >
                    ปิด
                  </button>
                  <button
                    onClick={() => {
                      setShowExtraFields(false)
                      handleSearch()
                    }}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:opacity-90"
                    style={{ background: 'var(--btn-bg)', color: 'var(--btn-text)' }}
                  >
                    <Search className="h-4 w-4" />
                    ค้นหา
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )}
      </div>
    )
  }

  // ================================
  // Default horizontal layout
  // ================================
  return (
    <section className="relative w-full py-8 md:py-12">
      {/* Background Container (only for standalone SearchTour block) */}
      {blockBg && (
        <div className="absolute inset-0 h-full w-full" style={getBackgroundStyle()}>
          {bgType === 'image' && bgImage && (
            <Media resource={bgImage} fill imgClassName="object-cover" />
          )}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 container">
        {/* Search Section Box */}
        <div
          className="relative z-50 w-full overflow-visible px-6 py-8 md:px-10 md:py-10"
          style={{
            backgroundColor: hslToRgba(sectionBgColor, sectionOpacity),
            borderRadius: `${sectionBorderRadius}px`,
          }}
        >
          {/* Heading */}
          <div className="mb-6 flex items-center justify-center gap-3 md:mb-8">
            {showHeadingIcon && headingIcon && (
              <div className="relative h-8 w-8 shrink-0">
                <Media resource={headingIcon} fill imgClassName="object-contain" />
              </div>
            )}
            <h2 className="text-2xl font-medium">{heading}</h2>
          </div>

          {/* Search Fields */}
          <div className="flex flex-col gap-4 md:gap-5">
            {/* Primary Row: all simple dropdown fields + search btn + filter icon */}
            <style>{`
              @media (min-width: 1024px) {
                .home-search-primary-grid {
                  grid-template-columns: repeat(${primaryFields.length}, minmax(0, 1fr)) auto !important;
                }
              }
            `}</style>
            <div className="home-search-primary-grid grid grid-cols-2 items-end gap-3 sm:gap-4">
              {primaryFields}

              {/* Search Button + Filter Icon (inline) */}
              <div className="flex h-[42px] w-full items-end gap-2 sm:col-span-full sm:gap-3 lg:col-span-1">
                {/* Filter Icon (only when >4 fields) */}
                {hasExtra && (
                  <button
                    onClick={() => setShowExtraFields(!showExtraFields)}
                    className={cn(
                      'flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border transition-all duration-200',
                      showExtraFields
                        ? 'bg-primary text-primary-foreground border-primary shadow-md'
                        : 'bg-background border-input text-muted-foreground hover:border-primary/50 hover:text-foreground',
                    )}
                    title={showExtraFields ? 'ปิดตัวกรองเพิ่มเติม' : 'ตัวกรองเพิ่มเติม'}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </button>
                )}
                {hasAnyFilter && (
                  <button
                    onClick={handleClear}
                    className="border-input bg-background text-muted-foreground flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border transition-all duration-200 hover:border-red-300 hover:text-red-500"
                    title="ล้างค่าทั้งหมด"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                )}

                <button
                  onClick={handleSearch}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-200 hover:opacity-90 active:scale-[0.98] sm:flex-none"
                  style={{
                    background: 'var(--btn-bg)',
                    color: 'var(--btn-text)',
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
                  <Search className="h-4 w-4" />
                  ค้นหา
                </button>
              </div>
            </div>

            {/* Extra Fields — Expandable Section */}
            {hasExtra && (
              <div
                ref={extraRef}
                className={cn(
                  'transition-all duration-300 ease-in-out',
                  showExtraFields ? 'overflow-visible' : 'overflow-hidden',
                )}
                style={{
                  maxHeight: showExtraFields ? '1000px' : '0px',
                  opacity: showExtraFields ? 1 : 0,
                }}
              >
                <div className="border-input/50 bg-muted/30 relative rounded-xl border p-4 md:p-5">
                  {/* Close button */}
                  <button
                    onClick={() => setShowExtraFields(false)}
                    className="bg-muted hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground absolute top-3 right-3 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-colors"
                    title="ปิด"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>

                  <div
                    className={cn(
                      'grid items-end gap-3 pr-8 sm:gap-4 md:pr-0',
                      extraFields.length === 1
                        ? 'grid-cols-1'
                        : extraFields.length === 2
                          ? 'grid-cols-2'
                          : extraFields.length === 3
                            ? 'grid-cols-3'
                            : `grid-cols-2 lg:grid-cols-${Math.min(extraFields.length, 5)}`,
                    )}
                  >

                    {extraFields}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default WowtourSearch1
