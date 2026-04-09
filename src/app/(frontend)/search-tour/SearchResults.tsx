'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Calendar as CalendarIcon, Search, ChevronDown, ChevronLeft, ChevronRight, AlertCircle, SlidersHorizontal, X, RotateCcw } from 'lucide-react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import type { DateRange } from 'react-day-picker'
import { Calendar } from '@/components/ui/calendar'
import { Media } from '@/components/Media'
import { TourCardItem } from '@/blocks/TourType/wowtour_tourCard1'
import { TourCard2Item } from '@/blocks/TourType/wowtour_tourCard2'
import { TourCard3Item } from '@/blocks/TourType/wowtour_tourCard3'
import { TourCard4Item } from '@/blocks/TourType/wowtour_tourCard4'
import { TourCard5Item } from '@/blocks/TourType/wowtour_tourCard5'
import { TourCard6Item } from '@/blocks/TourType/wowtour_tourCard6'
import { cn } from '@/utilities/cn'
import { TourSidebarFilter, FilterOptions, FilterState, SidebarFilterConfig } from '@/components/TourSidebarFilter/TourSidebarFilter'
import './search-tour.css'
import '@/blocks/TourType/wowtour_tourCard1.css'
import '@/blocks/TourType/wowtour_tourCard2.css'
import '@/blocks/TourType/wowtour_tourCard3.css'
import '@/blocks/TourType/wowtour_tourCard4.css'
import '@/blocks/TourType/wowtour_tourCard5.css'
import '@/blocks/TourType/wowtour_tourCard6.css'

/** Card item components map — design version → component */
const cardItemComponents: Record<string, React.FC<{ tour: any; borderRadius?: number }>> = {
    WOWTOUR_TOUR_CARD_1: TourCardItem,
    WOWTOUR_TOUR_CARD_2: TourCard2Item,
    WOWTOUR_TOUR_CARD_3: TourCard3Item,
    WOWTOUR_TOUR_CARD_4: TourCard4Item,
    WOWTOUR_TOUR_CARD_5: TourCard5Item,
    WOWTOUR_TOUR_CARD_6: TourCard6Item,
}

// ============================================
// Types
// ============================================
type TourProgram = {
    parentTitle: string
    parentSlug: string
    parentCategory: any
    program: any
}

type SearchResponse = {
    success: boolean
    data: TourProgram[]
    pagination: {
        page: number
        limit: number
        totalResults: number
        totalPeriods: number
        totalPages: number
    }
}

type SearchOptionsResponse = {
    success: boolean
    data: {
        countryList: { title: string; slug: string }[]
        airlines: string[]
        cities: string[]
    }
}

// ============================================
// Sub-components
// ============================================

type AutocompleteOption = string | { label: string; value: string; searchTerms?: string[] }

/** Dropdown with search */
function SearchDropdown({
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
    const ref = React.useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const getOptLabel = (opt: AutocompleteOption) => typeof opt === 'string' ? opt : opt.label
    const getOptValue = (opt: AutocompleteOption) => typeof opt === 'string' ? opt : opt.value
    const getSearchText = (opt: AutocompleteOption) => typeof opt === 'string' ? opt : `${opt.label} ${opt.searchTerms?.join(' ')}`

    const filtered = options.filter((o) => getSearchText(o).toLowerCase().includes(search.toLowerCase()))

    return (
        <div className={cn('search-field', isOpen ? 'relative z-[60]' : '')} ref={ref}>
            <label className="search-label">{label}</label>
            <div className="relative">
                <div
                    className="search-input-box cursor-pointer"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className={cn('text-sm truncate flex-1', !value && 'text-muted-foreground')}>
                        {options.find(o => getOptValue(o) === value) ? getOptLabel(options.find(o => getOptValue(o) === value)!) : (value || placeholder)}
                    </span>
                    <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
                </div>
                {isOpen && (
                    <div className="search-dropdown">
                        <div className="p-2 border-b border-input">
                            <input
                                type="text"
                                className="w-full px-2 py-1.5 text-sm bg-muted rounded-md outline-none placeholder:text-muted-foreground"
                                placeholder="ค้นหา..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                            {value && (
                                <div
                                    className="px-3 py-2 text-sm cursor-pointer hover:bg-accent text-muted-foreground"
                                    onClick={() => { onChange(''); setIsOpen(false); setSearch('') }}
                                >
                                    — ล้างตัวเลือก —
                                </div>
                            )}
                            {filtered.map((opt, i) => {
                                const optVal = getOptValue(opt)
                                const optLabel = getOptLabel(opt)
                                return (
                                <div
                                    key={optVal + i}
                                    className={cn('px-3 py-2 text-sm cursor-pointer hover:bg-accent', value === optVal && 'bg-accent font-medium')}
                                    onClick={() => { onChange(optVal); setIsOpen(false); setSearch('') }}
                                >
                                    {optLabel}
                                </div>
                                )
                            })}
                            {filtered.length === 0 && (
                                <div className="px-3 py-2 text-sm text-muted-foreground">ไม่พบข้อมูล</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

/** Date Range Picker */
function DateRangeField({
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
    const ref = React.useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const formatDate = (date: Date | undefined) => {
        if (!date) return ''
        return format(date, 'd MMM yyyy', { locale: th })
    }

    const displayValue = () => {
        if (dateRange?.from && dateRange?.to) return `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`
        if (dateRange?.from) return `${formatDate(dateRange.from)} - ...`
        return ''
    }

    return (
        <div className={cn('search-field', isOpen ? 'relative z-[60]' : '')} ref={ref}>
            <label className="search-label">{label}</label>
            <div className="relative">
                <div className="search-input-box cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                    <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className={cn('text-sm truncate flex-1', !dateRange?.from && 'text-muted-foreground')}>
                        {displayValue() || placeholder}
                    </span>
                </div>
                {isOpen && (
                    <div className="absolute top-full left-0 mt-1 z-50">
                        <div className="bg-background border border-input rounded-lg shadow-xl p-2">
                            <Calendar
                                mode="range"
                                selected={dateRange}
                                onSelect={(range) => {
                                    onDateRangeChange(range)
                                    if (range?.from && range?.to) setIsOpen(false)
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

/** Price Range Slider — Dual Thumb */
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

    // Without -translate-x-1/2, `left` positions the LEFT edge of the 24px thumb.
    // At 0%:   left = 0px        → right edge = 24px  (within track)
    // At 100%: left = 100% - 24px → right edge = 100%  (within track)
    // Linear interpolation: left = pct% - (pct/100 * 24)px
    const thumbPos = (pct: number) => `calc(${pct}% - ${(pct / 100) * 24}px)`

    return (
        <div className="flex flex-col gap-1 min-w-0">
            <label className="text-sm font-medium text-foreground truncate">{label}</label>

            {/* Values Display */}
            <div className="flex items-baseline justify-center gap-2 py-1">
                <span className="text-base font-bold" style={{ color: 'var(--primary)' }}>{formatNumber(value[0])}</span>
                <span className="text-xs font-normal text-muted-foreground">ระหว่าง</span>
                <span className="text-base font-bold" style={{ color: 'var(--primary)' }}>{formatNumber(value[1])}</span>
            </div>

            {/* Slider Track */}
            <div className="py-2">
                <div
                    ref={trackRef}
                    className="relative w-full h-3 rounded-full cursor-pointer"
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
                        className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-white cursor-grab active:cursor-grabbing transition-shadow hover:shadow-xl z-10 shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                        style={{
                            left: thumbPos(leftPercent),
                            backgroundColor: 'var(--secondary)',
                        }}
                        onPointerDown={handlePointerDown(0)}
                    />

                    {/* Max Thumb */}
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-white cursor-grab active:cursor-grabbing transition-shadow hover:shadow-xl z-10 shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                        style={{
                            left: thumbPos(rightPercent),
                            backgroundColor: 'var(--secondary)',
                        }}
                        onPointerDown={handlePointerDown(1)}
                    />
                </div>
            </div>
        </div>
    )
}

// ============================================
// Search Fields Layout — primary (≤4) + expandable extra
// ============================================
function SearchFieldsLayout({
    searchFieldsCfg,
    combinedLocationOptions, location, setLocation,
    tourCode, setTourCode,
    festivalOptions, festival, setFestival,
    airlines, airline, setAirline,
    dateRange, setDateRange,
    monthOptions, month, setMonth,
    wholesaleOptions, wholesale, setWholesale,
    priceRange, setPriceRange,
    handleSearch,
    handleClear,
    sidebarPriceConfig,
}: {
    searchFieldsCfg: any
    combinedLocationOptions: AutocompleteOption[]; location: string; setLocation: (v: string) => void
    tourCode: string; setTourCode: (v: string) => void
    festivalOptions: string[]; festival: string; setFestival: (v: string) => void
    airlines: string[]; airline: string; setAirline: (v: string) => void
    dateRange: DateRange | undefined; setDateRange: (v: DateRange | undefined) => void
    monthOptions: string[]; month: string; setMonth: (v: string) => void
    wholesaleOptions: string[]; wholesale: string; setWholesale: (v: string) => void
    priceRange: [number, number]; setPriceRange: (v: [number, number]) => void
    handleSearch: () => void
    handleClear: () => void
    sidebarPriceConfig: { min: number; max: number; step: number }
}) {
    const [showExtra, setShowExtra] = useState(false)
    const extraRef = useRef<HTMLDivElement>(null)

    // Build array of enabled field elements — ordered to match CMS backend
    // CMS order: country → city → festival → airline → tourCode → wholesale → dateRange → month → priceRange
    const fields: React.ReactNode[] = []

    if (searchFieldsCfg?.countryField?.enabled ?? true) {
        fields.push(
            <div key="location" className="w-full min-w-0">
                <SearchDropdown
                    label={searchFieldsCfg?.countryField?.label || 'เลือกประเทศ'}
                    placeholder={searchFieldsCfg?.countryField?.placeholder || 'ทุกประเทศ'}
                    options={combinedLocationOptions}
                    value={location}
                    onChange={setLocation}
                />
            </div>,
        )
    }

    if (searchFieldsCfg?.festivalField?.enabled ?? false) {
        fields.push(
            <div key="festival" className="w-full min-w-0">
                <SearchDropdown
                    label={searchFieldsCfg?.festivalField?.label || 'ทัวร์ตามเทศกาล'}
                    placeholder={searchFieldsCfg?.festivalField?.placeholder || 'เลือกเทศกาล'}
                    options={festivalOptions}
                    value={festival}
                    onChange={setFestival}
                />
            </div>,
        )
    }

    if (searchFieldsCfg?.airlineField?.enabled ?? false) {
        fields.push(
            <div key="airline" className="w-full min-w-0">
                <SearchDropdown
                    label={searchFieldsCfg?.airlineField?.label || 'สายการบิน'}
                    placeholder={searchFieldsCfg?.airlineField?.placeholder || 'เลือกสายการบิน'}
                    options={airlines}
                    value={airline}
                    onChange={setAirline}
                />
            </div>,
        )
    }

    if (searchFieldsCfg?.tourCodeField?.enabled ?? true) {
        fields.push(
            <div key="tourCode" className="w-full min-w-0">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground truncate">
                        {searchFieldsCfg?.tourCodeField?.label || 'คำค้นหา (Keyword)'}
                    </label>
                    <input
                        type="text"
                        className="px-3 py-2.5 text-sm bg-background border border-input rounded-lg outline-none placeholder:text-muted-foreground hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                        placeholder={searchFieldsCfg?.tourCodeField?.placeholder || 'รหัสทัวร์, โปรแกรม, สถานที่'}
                        value={tourCode}
                        onChange={(e) => setTourCode(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>
            </div>,
        )
    }

    if (searchFieldsCfg?.wholesaleField?.enabled ?? false) {
        fields.push(
            <div key="wholesale" className="w-full min-w-0">
                <SearchDropdown
                    label={searchFieldsCfg?.wholesaleField?.label || 'Wholesale'}
                    placeholder={searchFieldsCfg?.wholesaleField?.placeholder || 'เลือก Wholesale'}
                    options={wholesaleOptions}
                    value={wholesale}
                    onChange={setWholesale}
                />
            </div>,
        )
    }

    if (searchFieldsCfg?.dateRangeField?.enabled ?? true) {
        fields.push(
            <div key="dateRange" className="relative w-full min-w-0">
                <DateRangeField
                    label={searchFieldsCfg?.dateRangeField?.labelFrom || 'ช่วงเวลาเดินทาง'}
                    placeholder={searchFieldsCfg?.dateRangeField?.placeholderFrom || 'เลือกช่วงเวลา'}
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                />
            </div>,
        )
    }

    if (searchFieldsCfg?.monthField?.enabled ?? false) {
        fields.push(
            <div key="month" className="w-full min-w-0">
                <SearchDropdown
                    label={searchFieldsCfg?.monthField?.label || 'เลือกเดือน'}
                    placeholder={searchFieldsCfg?.monthField?.placeholder || 'เลือกเดือน'}
                    options={monthOptions}
                    value={month}
                    onChange={setMonth}
                />
            </div>,
        )
    }

    if (searchFieldsCfg?.priceRangeField?.enabled ?? false) {
        fields.push(
            <div key="priceRange" className="w-full min-w-0 sm:col-span-2 lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl px-4 py-3 border border-input/40 shadow-sm">
                <PriceRangeSlider
                    label={searchFieldsCfg?.priceRangeField?.label || 'ช่วงราคา'}
                    min={sidebarPriceConfig.min}
                    max={sidebarPriceConfig.max}
                    step={1000}
                    value={priceRange}
                    onChange={setPriceRange}
                />
            </div>,
        )
    }

    // Show up to 5 fields inline. If total ≤5, no advanced filter. If ≥6, advanced filter appears.
    const MAX_INLINE = 5
    const primaryFields = fields.slice(0, MAX_INLINE)
    const extraFields = fields.slice(MAX_INLINE)
    const hasExtra = extraFields.length > 0

    return (
        <div className="flex flex-col gap-4 md:gap-5">
            {/* Primary Row */}
            <style>{`
                @media (min-width: 1024px) {
                    .search-primary-grid {
                        grid-template-columns: repeat(${primaryFields.length}, minmax(0, 1fr)) auto !important;
                    }
                }
            `}</style>
            <div className="search-primary-grid grid grid-cols-1 sm:grid-cols-2 items-end gap-4 md:gap-5 w-full">
                {primaryFields}

                <div className="flex items-end gap-2 sm:gap-3 w-full sm:col-span-full lg:col-span-1 h-[42px]">
                    {hasExtra && (
                        <button
                            onClick={() => setShowExtra(!showExtra)}
                            className={cn(
                                'flex items-center justify-center w-10 h-10 rounded-lg border transition-all duration-200 cursor-pointer shrink-0',
                                showExtra
                                    ? 'bg-primary text-primary-foreground border-primary shadow-md'
                                    : 'bg-background border-input text-muted-foreground hover:border-primary/50 hover:text-foreground',
                            )}
                            title={showExtra ? 'ปิดตัวกรองเพิ่มเติม' : 'ตัวกรองเพิ่มเติม'}
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                        </button>
                    )}

                    {(location || tourCode || festival || airline || wholesale || dateRange || month) && (
                    <button
                        onClick={handleClear}
                        className="flex items-center justify-center w-10 h-10 rounded-lg border border-input bg-background text-muted-foreground hover:border-red-300 hover:text-red-500 transition-all duration-200 cursor-pointer"
                        title="ล้างค่าทั้งหมด"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </button>
                    )}

                    <button
                        onClick={handleSearch}
                        className="flex-1 w-full flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 hover:opacity-90 active:scale-[0.98] cursor-pointer whitespace-nowrap"
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

            {/* Extra Fields — Expandable */}
            {hasExtra && (
                <div
                    ref={extraRef}
                    className="transition-all duration-300 ease-in-out"
                    style={{
                        ...({ maxHeight: showExtra ? `${(extraRef.current?.scrollHeight ?? 500) + 20}px` : '0px', opacity: showExtra ? 1 : 0 }),
                        overflow: showExtra ? 'visible' : 'hidden',
                    }}

                >
                    <div className="relative rounded-xl py-4 md:py-5 px-0 bg-transparent">
                        <button
                            onClick={() => setShowExtra(false)}
                            className="absolute top-3 right-3 flex items-center justify-center w-7 h-7 rounded-full bg-muted hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground transition-colors cursor-pointer z-10"
                            title="ปิด"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 items-end gap-4 md:gap-5 w-full relative">
                            {extraFields}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// ============================================
// Removed local TourCard, using TourCardItem from TourType block
// ============================================

// ============================================
// Pagination
// ============================================
function Pagination({
    currentPage,
    totalPages,
    onPageChange,
}: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}) {
    if (totalPages <= 1) return null

    const getPages = () => {
        const pages: (number | '...')[] = []
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
            pages.push(1)
            if (currentPage > 3) pages.push('...')
            const start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)
            for (let i = start; i <= end; i++) pages.push(i)
            if (currentPage < totalPages - 2) pages.push('...')
            pages.push(totalPages)
        }
        return pages
    }

    return (
        <div className="search-pagination">
            <button
                className="search-page-btn"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                <ChevronLeft className="h-4 w-4" />
            </button>
            {getPages().map((p, i) =>
                p === '...' ? (
                    <span key={`dots-${i}`} className="search-page-dots">...</span>
                ) : (
                    <button
                        key={p}
                        className={cn('search-page-btn', currentPage === p && 'search-page-btn--active')}
                        onClick={() => onPageChange(p)}
                    >
                        {p}
                    </button>
                ),
            )}
            <button
                className="search-page-btn"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    )
}

// ============================================
// Main Component
// ============================================
type SearchResultsProps = {
    settings?: {
        listingCardSettings?: {
            cardDesignVersion?: string
            maxVisibleCards?: string
            resultsPerPage?: number
        }
        resultsBarSettings?: {
            showMonthFilter?: boolean
            showSortFilter?: boolean
            sortOptions?: {
                showPeriodLowToHigh?: boolean
                showPrice?: boolean
                showPeriodNoSoldout?: boolean
                showSupplierSeq?: boolean
            }
        }
    }
    ssrSearchData?: any
    ssrOptionsData?: any
    ssrSearchConfig?: any
}

export default function SearchResults({ settings, ssrSearchData, ssrOptionsData, ssrSearchConfig }: SearchResultsProps) {
    const searchParams = useSearchParams()
    const router = useRouter()

    // CMS settings with defaults
    const cardDesignVersion = settings?.listingCardSettings?.cardDesignVersion || 'WOWTOUR_TOUR_CARD_1'
    const maxVisibleCards = Number(settings?.listingCardSettings?.maxVisibleCards ?? '4')
    const resultsPerPage = settings?.listingCardSettings?.resultsPerPage ?? 12
    const CardComponent = cardItemComponents[cardDesignVersion] || TourCardItem
    const showMonthFilter = settings?.resultsBarSettings?.showMonthFilter ?? true
    const showSortFilter = settings?.resultsBarSettings?.showSortFilter ?? true
    const sortOpts = settings?.resultsBarSettings?.sortOptions

    // Search form state
    const [location, setLocation] = useState(searchParams.get('city') || searchParams.get('country') || '')
    const [tourCode, setTourCode] = useState(searchParams.get('tourCode') || '')
    const [festival, setFestival] = useState(searchParams.get('festival') || '')
    const [festivalSlug, setFestivalSlug] = useState(searchParams.get('festivals') || '')
    const [airline, setAirline] = useState(searchParams.get('airline') || '')
    const [wholesale, setWholesale] = useState(searchParams.get('wholesale') || '')
    const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
        const from = searchParams.get('dateFrom')
        const to = searchParams.get('dateTo')
        if (from) return { from: new Date(from), to: to ? new Date(to) : undefined }
        return undefined
    })
    const [month, setMonth] = useState(searchParams.get('month') || '')
    const [sort, setSort] = useState(searchParams.get('sort') || '')
    const [page, setPage] = useState(Number(searchParams.get('page')) || 1)
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000])

    // Dynamic dropdown options from API
    const [festivalList, setFestivalList] = useState<{ label: string; value: string }[]>([])
    const festivalOptions = (ssrOptionsData?.filterOptions?.festivals || []).map((f: any) => f.label)
    const wholesaleOptions = (ssrOptionsData?.filterOptions?.wholesale || []).map((w: any) => typeof w === 'string' ? w : w.label)
    const monthOptions = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']

    // Results state
    const results = ssrSearchData?.data || []
    const totalResults = ssrSearchData?.pagination?.totalResults || 0
    const totalPeriods = ssrSearchData?.pagination?.totalPeriods || 0
    const totalPages = ssrSearchData?.pagination?.totalPages || 0
    const [isPending, startTransition] = React.useTransition()
    const loading = isPending

    // Dropdown options — format countries with English names like home page
    const countryRawList = ssrOptionsData?.countryList || []
    const mappedCountryOptions: AutocompleteOption[] = countryRawList.map((c: any) => ({
        label: c.title_en ? `${c.title} (${c.title_en})` : c.title,
        value: c.title,
        searchTerms: c.title_en ? [c.title_en] : [],
    }))
    const countries = countryRawList.map((c: any) => c.title_en ? `${c.title} (${c.title_en})` : c.title)
    const airlines = ssrOptionsData?.airlines || []
    const cityOptions = ssrOptionsData?.cities || []
    const cityRawList = ssrOptionsData?.cityList || []
    const mappedCityOptions: AutocompleteOption[] = cityRawList.map((c: any) => ({
        label: c.label,
        value: c.label,
        searchTerms: [],
    }))

    const filterOptions = ssrOptionsData?.filterOptions || null

    // Fetch heading + search field settings from Page Config
    const headingSettings = ssrSearchConfig?.headingSettings || {}
    const searchFieldsCfg = ssrSearchConfig?.searchFields || {}
    const enableSearchSection = ssrSearchConfig?.enableSearchSection !== false

    // If includeCity is enabled, combine country and city options
    const includeCity = searchFieldsCfg?.countryField?.includeCity ?? false
    const combinedLocationOptions: AutocompleteOption[] = includeCity
        ? [...mappedCountryOptions, ...mappedCityOptions]
        : mappedCountryOptions

    const sidebarSettings = (settings as any)?.sidebarFilterSettings || {}
    const isSidebarEnabled = sidebarSettings.enabled !== false
    const sidebarFilterConfig = {
        ...sidebarSettings,
        enabled: isSidebarEnabled,
        // Override sidebar showCity if search box has includeCity enabled
        showCity: includeCity ? true : sidebarSettings.showCity,
    }
    
    // Default Price Range — DBเป็นหลัก, CMS config เป็น fallback
    const prf = searchFieldsCfg?.priceRangeField
    const dbPriceRange = ssrOptionsData?.filterOptions?.priceRange
    const sidebarPriceConfig = {
        min: (dbPriceRange?.min != null && dbPriceRange?.max != null && dbPriceRange.max > dbPriceRange.min) ? dbPriceRange.min : (prf?.minPrice ?? 0),
        max: (dbPriceRange?.min != null && dbPriceRange?.max != null && dbPriceRange.max > dbPriceRange.min) ? dbPriceRange.max : (prf?.maxPrice ?? 1000000),
        step: 1000
    }

    const priceDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const [sidebarFilter, setSidebarFilter] = useState<FilterState>(() => {
        // Sidebar sync — ดึงค่าจาก search params ทั้งหมด
        const airlinesParam = searchParams.get('airlines') || ''
        const airlineParam = searchParams.get('airline') || ''
        const festivalsParam = searchParams.get('festivals') || ''
        const festivalParam = searchParams.get('festival') || ''
        const countryParam = searchParams.get('country') || ''
        const cityParam = searchParams.get('city') || ''
        const monthParam = searchParams.get('month') || ''
        const priceMinParam = Number(searchParams.get('priceMin') || '0')
        const priceMaxParam = Number(searchParams.get('priceMax') || '0')

        const fOpts = ssrOptionsData?.filterOptions

        // Airlines — URL sends label (e.g. "Thai Lion Air"), sidebar uses value (airlineCode e.g. "SL")
        // Convert label → airlineCode by looking up filterOptions
        const rawAirlines = airlinesParam ? airlinesParam.split(',').map(a => a.trim()).filter(Boolean) : []
        if (airlineParam && !rawAirlines.includes(airlineParam)) rawAirlines.push(airlineParam)
        const initAirlines: string[] = []
        for (const a of rawAirlines) {
            // Try exact value match first, then label match
            const byValue = fOpts?.airlines?.find((ao: any) => ao.value === a)
            const byLabel = fOpts?.airlines?.find((ao: any) => ao.label === a)
            initAirlines.push(byValue ? byValue.value : byLabel ? byLabel.value : a)
        }

        // Festivals — URL sends slug via handleSearch, sidebar uses value (=slug) ✅
        const initFestivals = festivalsParam ? festivalsParam.split(',').map(f => f.trim()).filter(Boolean) : []
        if (festivalParam && !initFestivals.includes(festivalParam)) initFestivals.push(festivalParam)

        // Countries — sidebar uses value = c.title, URL sends title ✅
        const initCountries = countryParam ? [countryParam] : []

        // Cities — URL sends label (e.g. "ทัวร์โตเกียว"), sidebar CheckboxSection uses item.value for matching
        // filterOptions.cities = cityList = [{label: "ทัวร์โตเกียว", value: "tokyo", count: N}]
        // So we need to convert the label → value (slug) for proper checkbox matching
        let initCities: string[] = []
        if (cityParam) {
            const cityMatch = fOpts?.cities?.find((c: any) => c.label === cityParam)
            initCities = [cityMatch ? cityMatch.value : cityParam]
        }

        const initMonths = monthParam ? [monthParam] : []

        return {
            priceMin: priceMinParam || sidebarPriceConfig.min, 
            priceMax: priceMaxParam || sidebarPriceConfig.max,
            festivals: initFestivals, durationDays: [],
            airlines: initAirlines,
            hotelStars: [], categories: [],
            countries: initCountries,
            cities: initCities,
            months: initMonths,
        }
    })


    const searchHeading = headingSettings?.heading || 'ค้นหาโปรแกรมทัวร์'
    const showHeadingIcon = headingSettings?.showHeadingIcon ?? false
    const headingIcon = headingSettings?.headingIcon

    // Universal Sync: whenever URL params change, update all local states (top box + sidebar filter)
    useEffect(() => {
        // Sync Top Search Box
        // Find matching title with english translation if necessary.
        const urlLoc = searchParams.get('city') || searchParams.get('country') || ''
        const urlLocMatch = countryRawList.find((c:any) => c.title === urlLoc)
        setLocation(urlLocMatch?.title_en ? `${urlLocMatch.title} (${urlLocMatch.title_en})` : urlLoc)
        setTourCode(searchParams.get('tourCode') || '')
        setFestival(searchParams.get('festival') || '')
        setFestivalSlug(searchParams.get('festivals') || '')
        
        // Ensure airline sync top box
        const urlAirline = searchParams.get('airline')
        
        setWholesale(searchParams.get('wholesale') || '')

        const from = searchParams.get('dateFrom')
        const to = searchParams.get('dateTo')
        if (from) setDateRange({ from: new Date(from), to: to ? new Date(to) : undefined })
        else setDateRange(undefined)

        setMonth(searchParams.get('month') || '')
        setSort(searchParams.get('sort') || '')
        setPage(Number(searchParams.get('page')) || 1)

        // Sync Price Range 
        const priceMinP = Number(searchParams.get('priceMin') || '0')
        const priceMaxP = Number(searchParams.get('priceMax') || '0')
        // Only set slider if it matches URL, otherwise fallback to config min/max
        const newPriceMin = priceMinP || sidebarPriceConfig.min
        const newPriceMax = priceMaxP || sidebarPriceConfig.max
        setPriceRange([newPriceMin, newPriceMax])

        // --- Sync Sidebar Filter State ---
        const airlinesParam = searchParams.get('airlines') || ''
        const festivalParam = searchParams.get('festival') || ''
        const festivalsParam = searchParams.get('festivals') || ''
        const countryParam = searchParams.get('country') || ''
        const cityParam = searchParams.get('city') || ''
        const monthParam = searchParams.get('month') || ''
        const fOpts = ssrOptionsData?.filterOptions

        // Map airline label to code
        const rawAirlines = airlinesParam ? airlinesParam.split(',').map(a => a.trim()).filter(Boolean) : []
        if (urlAirline && !rawAirlines.includes(urlAirline)) rawAirlines.push(urlAirline)
        const initAirlines: string[] = []
        for (const a of rawAirlines) {
            const byValue = fOpts?.airlines?.find((ao: any) => ao.value === a)
            const byLabel = fOpts?.airlines?.find((ao: any) => ao.label === a)
            initAirlines.push(byValue ? byValue.value : byLabel ? byLabel.value : a)
        }
        
        // Sync Top Box from Sidebar's first selection
        if (urlAirline) {
            setAirline(urlAirline)
        } else if (rawAirlines.length > 0) {
            const firstAirl = rawAirlines[0]
            const match = fOpts?.airlines?.find((ao: any) => ao.value === firstAirl || ao.label === firstAirl)
            setAirline(match ? match.label : firstAirl)
        } else {
            setAirline('')
        }

        // Map festival label to slug for sidebar
        const rawFestivals = festivalsParam ? festivalsParam.split(',').map(f => f.trim()).filter(Boolean) : []
        if (festivalParam && !rawFestivals.includes(festivalParam)) rawFestivals.push(festivalParam)
        const initFestivals: string[] = []
        for (const f of rawFestivals) {
            const byValue = fOpts?.festivals?.find((fo: any) => fo.value === f)
            const byLabel = fOpts?.festivals?.find((fo: any) => fo.label === f)
            initFestivals.push(byValue ? byValue.value : byLabel ? byLabel.value : f)
        }

        let initCities: string[] = []
        if (cityParam) {
            const cityMatch = fOpts?.cities?.find((c: any) => {
                const mappedObjLabel = c.label
                return mappedObjLabel === cityParam || c.label === cityParam
            })
            initCities = [cityMatch ? cityMatch.value : cityParam]
        }
        
        const initCategories = (searchParams.get('categories') || '').split(',').filter(Boolean)
        const initDurationDays = (searchParams.get('durationDays') || '').split(',').map(Number).filter(Boolean)
        const initHotelStars = (searchParams.get('hotelStars') || '').split(',').filter(Boolean)

        setSidebarFilter({
            priceMin: newPriceMin,
            priceMax: newPriceMax,
            festivals: initFestivals,
            durationDays: initDurationDays,
            airlines: initAirlines,
            hotelStars: initHotelStars,
            categories: initCategories,
            countries: countryParam ? [countryParam] : [],
            cities: initCities,
            months: monthParam ? [monthParam] : [],
        })
    }, [searchParams, sidebarPriceConfig.min, sidebarPriceConfig.max, ssrOptionsData])

    // fetchResults replaced by SSR Native Next.js Behavior
    const handleSearch = () => {
        setPage(1)

        // Update URL params
        const params = new URLSearchParams()
        if (location) {
            const countryEntry = countryRawList.find((c: any) => {
                const mappedLabel = c.title_en ? `${c.title} (${c.title_en})` : c.title
                return mappedLabel === location || c.title === location
            })
            if (countryEntry) {
                params.set('country', countryEntry.title)
                if (countryEntry.slug) params.set('countrySlug', countryEntry.slug)
            } else {
                const cityEntry = cityRawList.find((c: any) => {
                    const mappedLabel = c.label
                    return mappedLabel === location || c.label === location
                })
                if (cityEntry) {
                    params.set('city', cityEntry.label)
                    if (cityEntry.value) params.set('citySlug', cityEntry.value)
                } else {
                    params.set('country', location)
                }
            }
        }
        if (tourCode) params.set('tourCode', tourCode)
        if (festival) {
            // Send festival slug for exact match
            const festivalEntry = festivalList.find((f) => f.label === festival)
            if (festivalEntry?.value) {
                params.set('festivals', festivalEntry.value)
            } else {
                params.set('festival', festival)
            }
        }
        if (airline) params.set('airline', airline)
        if (wholesale) params.set('wholesale', wholesale)
        if (dateRange?.from) params.set('dateFrom', format(dateRange.from, 'yyyy-MM-dd'))
        if (dateRange?.to) params.set('dateTo', format(dateRange.to, 'yyyy-MM-dd'))
        if (month) params.set('month', month)
        if (sort) params.set('sort', sort)
        // ส่งช่วงราคาเฉพาะเมื่อ slider ถูกปรับจากค่าเริ่มต้น
        if (searchFieldsCfg?.priceRangeField?.enabled) {
            if (priceRange[0] !== sidebarPriceConfig.min) params.set('priceMin', priceRange[0].toString())
            if (priceRange[1] !== sidebarPriceConfig.max) params.set('priceMax', priceRange[1].toString())
        }
        startTransition(() => {
            router.push(`/search-tour?${params.toString()}`, { scroll: false })
        })
    }

    const handleClear = () => {
        setLocation('')
        setTourCode('')
        setFestival('')
        setFestivalSlug('')
        setAirline('')
        setWholesale('')
        setDateRange(undefined)
        setMonth('')
        setSort('')
        setPage(1)
        setPriceRange([sidebarPriceConfig.min, sidebarPriceConfig.max])
        setSidebarFilter({
            priceMin: sidebarPriceConfig.min,
            priceMax: sidebarPriceConfig.max,
            festivals: [], durationDays: [], airlines: [],
            hotelStars: [], categories: [], countries: [], cities: [], months: [],
        })
        startTransition(() => {
            router.push('/search-tour', { scroll: false })
        })
    }

    const handlePageChange = (newPage: number) => {
        setPage(newPage)

        const params = new URLSearchParams(searchParams.toString())
        params.set('page', newPage.toString())
        startTransition(() => {
            router.push(`/search-tour?${params.toString()}`, { scroll: false })
            window.scrollTo({ top: 0, behavior: 'smooth' })
        })
    }

    const handleSortChange = (newSort: string) => {
        setSort(newSort)
        setPage(1)

        const params = new URLSearchParams(searchParams.toString())
        if (newSort) params.set('sort', newSort)
        else params.delete('sort')
        params.set('page', '1')
        startTransition(() => {
            router.push(`/search-tour?${params.toString()}`, { scroll: false })
        })
    }

    return (
        <main className="search-page">
            {/* ============================================ */}
            {/* Search Form Section */}
            {/* ============================================ */}
            {enableSearchSection && (
                <section className="search-form-section">
                    <div className="container">
                        <div className="search-form-box">
                            {/* Heading */}
                            <div className="flex items-center justify-center gap-3 mb-6 md:mb-8">
                                {showHeadingIcon && headingIcon && (
                                    <div className="w-8 h-8 relative shrink-0">
                                        <Media resource={headingIcon} fill imgClassName="object-contain" />
                                    </div>
                                )}
                                <h1 className="text-2xl font-medium">{searchHeading}</h1>
                            </div>

                            {/* Search Fields — Dynamic Layout */}
                            <SearchFieldsLayout
                                searchFieldsCfg={searchFieldsCfg}
                                combinedLocationOptions={combinedLocationOptions}
                                location={location}
                                setLocation={setLocation}
                                tourCode={tourCode}
                                setTourCode={setTourCode}
                                festivalOptions={festivalOptions}
                                festival={festival}
                                setFestival={setFestival}
                                airlines={airlines}
                                airline={airline}
                                setAirline={setAirline}
                                dateRange={dateRange}
                                setDateRange={setDateRange}
                                monthOptions={monthOptions}
                                month={month}
                                setMonth={setMonth}
                                wholesaleOptions={wholesaleOptions}
                                wholesale={wholesale}
                                setWholesale={setWholesale}
                                priceRange={priceRange}
                                setPriceRange={setPriceRange}
                                handleSearch={handleSearch}
                                handleClear={handleClear}
                                sidebarPriceConfig={sidebarPriceConfig}
                            />
                        </div>
                    </div>
                </section>
            )}

            {/* Breadcrumb */}
            <div className="container pt-4 pb-2">
                <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <a href="/" className="hover:text-primary transition-colors whitespace-nowrap">หน้าหลัก</a>
                    <span className="opacity-50">›</span>
                    <span className="text-foreground font-medium">ค้นหาโปรแกรมทัวร์</span>
                </nav>
            </div>

            {/* ============================================ */}
            {/* Results Section */}
            {/* ============================================ */}
            <section className="search-results-section">
                <div className="container">
                    {/* Results Header */}
                    <div className="search-results-bar">
                        <div className="search-results-count">
                            {loading ? (
                                <span>กำลังค้นหา...</span>
                            ) : (
                                <span>
                                    พบทัวร์ ทัวร์ทั้งหมด {totalPeriods} พีเรียดจาก {totalResults} โปรแกรม
                                </span>
                            )}
                        </div>
                        <div className="search-sort">
                            {showSortFilter && (<div>
                                <label>เรียงตาม :</label>
                                <select
                                    className="search-sort-select"
                                    value={sort}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                >
                                    {(sortOpts?.showPeriodLowToHigh !== false) && <option value="periodlowtohight">ล่าสุด</option>}
                                    {(sortOpts?.showPrice !== false) && <option value="price">ราคา</option>}
                                    {(sortOpts?.showPeriodNoSoldout !== false) && <option value="periodnosoldout">โปรแกรมที่ยังไม่เต็ม</option>}
                                    {(sortOpts?.showSupplierSeq === true) && <option value="supplierseq">เรียงตามซัพพลายเออร์</option>}
                                </select>
                            </div>)}
                        </div>
                    </div>

                    {/* Sidebar + Results Layout */}
                    <div className="tour-listing-layout">
                        {/* Sidebar Filter */}
                        <TourSidebarFilter
                            filterOptions={filterOptions}
                            filterConfig={sidebarFilterConfig}
                            filterState={sidebarFilter}
                            onFilterChange={(newState) => {
                                setSidebarFilter(newState)

                                // ตรวจว่าเป็นการเปลี่ยนราคาหรือไม่
                                const isPriceChange = newState.priceMin !== sidebarFilter.priceMin || newState.priceMax !== sidebarFilter.priceMax

                                const pushParams = () => {
                                    const params = new URLSearchParams(searchParams.toString())
                                    const fOpts = filterOptions
                                    // Airlines — sidebar value = airlineCode, send codes directly to URL
                                    if (newState.airlines.length > 0) {
                                        params.set('airlines', newState.airlines.join(','))
                                    } else {
                                        params.delete('airlines')
                                        params.delete('airline')
                                    }
                                    // Festivals — value = slug, API expects slug ✅
                                    if (newState.festivals.length > 0) {
                                        params.set('festivals', newState.festivals.join(','))
                                    } else {
                                        params.delete('festivals')
                                        params.delete('festival')
                                    }
                                    // Countries — value = title, API expects title ✅
                                    if (newState.countries.length > 0) {
                                        params.set('country', newState.countries[0])
                                    } else {
                                        params.delete('country')
                                    }
                                    // Cities — sidebar value = slug, but API needs label
                                    if (newState.cities.length > 0) {
                                        const cityVal = newState.cities[0]
                                        const cityMatch = fOpts?.cities?.find((c: any) => c.value === cityVal)
                                        params.set('city', cityMatch ? cityMatch.label : cityVal)
                                        if (cityMatch) params.set('citySlug', cityMatch.value)
                                    } else {
                                        params.delete('city')
                                        params.delete('citySlug')
                                    }
                                    // Months
                                    if (newState.months.length > 0) {
                                        params.set('month', newState.months[0])
                                    } else {
                                        params.delete('month')
                                    }
                                    // Categories (ทวีป)
                                    if (newState.categories.length > 0) {
                                        params.set('categories', newState.categories.join(','))
                                    } else {
                                        params.delete('categories')
                                    }
                                    // Duration (จำนวนวัน)
                                    if (newState.durationDays.length > 0) {
                                        params.set('durationDays', newState.durationDays.join(','))
                                    } else {
                                        params.delete('durationDays')
                                    }
                                    // Hotel Stars
                                    if (newState.hotelStars.length > 0) {
                                        params.set('hotelStars', newState.hotelStars.join(','))
                                    } else {
                                        params.delete('hotelStars')
                                    }
                                    // Price Range
                                    if (newState.priceMin > sidebarPriceConfig.min) {
                                        params.set('priceMin', String(newState.priceMin))
                                    } else {
                                        params.delete('priceMin')
                                    }
                                    if (newState.priceMax < sidebarPriceConfig.max) {
                                        params.set('priceMax', String(newState.priceMax))
                                    } else {
                                        params.delete('priceMax')
                                    }
                                    params.set('page', '1')
                                    startTransition(() => {
                                        router.push(`/search-tour?${params.toString()}`, { scroll: false })
                                    })
                                }

                                // Debounce สำหรับ slider (500ms) — checkbox ทำทันที
                                if (isPriceChange) {
                                    if (priceDebounceRef.current) clearTimeout(priceDebounceRef.current)
                                    priceDebounceRef.current = setTimeout(pushParams, 500)
                                } else {
                                    pushParams()
                                }
                            }}
                            onApply={() => {
                                // Apply is implicitly handled by onFilterChange pushes
                            }}
                            priceRangeConfig={sidebarPriceConfig}
                        />

                        {/* Content */}
                        <div className="tour-listing-layout__content" style={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                            {/* Loading Skeleton removed for SSR smooth transitions */}
                            {/* Loading */}
                            {/* Results Grid */}
                            {results.length > 0 && (
                                <>
                                    <div
                                        className={`search-results-grid search-results-grid--cols-${maxVisibleCards}`}
                                    >
                                        {results.map((tour: any, idx: number) => (
                                            <CardComponent key={tour.id || idx} tour={tour} borderRadius={16} />
                                        ))}
                                    </div>
                                    <Pagination
                                        currentPage={page}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                </>
                            )}

                            {/* Empty State */}
                            {results.length === 0 && (
                                <div className="search-empty">
                                    <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
                                    <h3 className="text-xl font-medium mb-2">ไม่พบโปรแกรมทัวร์</h3>
                                    <p className="text-muted-foreground mb-6">
                                        ลองเปลี่ยนเงื่อนไขการค้นหา หรือเลือกประเทศอื่น
                                    </p>
                                    <button
                                        onClick={() => {
                                            setLocation('')
                                            setTourCode('')
                                            setDateRange(undefined)
                                            setMonth('')
                                            setSort('')
                                            setPage(1)
                                            setSidebarFilter({
                                                priceMin: sidebarPriceConfig.min,
                                                priceMax: sidebarPriceConfig.max,
                                                festivals: [], durationDays: [], airlines: [],
                                                hotelStars: [], categories: [], countries: [], cities: [], months: [],
                                            })
                                            startTransition(() => {
                                                router.push('/search-tour')
                                            })
                                        }}
                                        className="search-reset-btn"
                                    >
                                        ล้างตัวกรองทั้งหมด
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
