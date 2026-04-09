'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Calendar as CalendarIcon, Search, ChevronDown, ChevronLeft, ChevronRight, AlertCircle, SlidersHorizontal, X, RotateCcw } from 'lucide-react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import type { DateRange } from 'react-day-picker'
import dynamic from 'next/dynamic'
import { TourCardItem } from '@/blocks/TourType/wowtour_tourCard1'
import { TourCard2Item } from '@/blocks/TourType/wowtour_tourCard2'
import { TourCard3Item } from '@/blocks/TourType/wowtour_tourCard3'
import { TourCard4Item } from '@/blocks/TourType/wowtour_tourCard4'
import { TourCard5Item } from '@/blocks/TourType/wowtour_tourCard5'
import { TourCard6Item } from '@/blocks/TourType/wowtour_tourCard6'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/cn'
import type { FilterOptions, FilterState, SidebarFilterConfig } from '@/components/TourSidebarFilter/TourSidebarFilter'

const Calendar = dynamic(() => import('@/components/ui/calendar').then(m => m.Calendar), {
    ssr: false,
    loading: () => <div className="p-4 flex items-center justify-center text-sm text-foreground/50 h-[280px]">กำลังโหลดปฏิทิน...</div>
})

const TourSidebarFilter = dynamic(() => import('@/components/TourSidebarFilter/TourSidebarFilter').then(m => m.TourSidebarFilter), {
    ssr: false,
    loading: () => <div className="tour-sidebar-filter bg-muted/20 animate-pulse hidden lg:block h-[500px] w-full rounded-xl shrink-0" />
})
import '@/blocks/SearchPage/wowtour_searchTour1.css'
import '@/blocks/TourType/wowtour_tourCard1.css'
import '@/blocks/TourType/wowtour_tourCard2.css'
import '@/blocks/TourType/wowtour_tourCard3.css'
import '@/blocks/TourType/wowtour_tourCard4.css'
import '@/blocks/TourType/wowtour_tourCard5.css'
import '@/blocks/TourType/wowtour_tourCard6.css'
import './country-page.css'

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
// Lexical RichText renderer (client-side helper)
// ============================================
function RenderLexicalContent({ nodes }: { nodes: any[] }) {
    if (!nodes || !Array.isArray(nodes)) return null

    return (
        <>
            {nodes.map((node: any, i: number) => {
                // Text node
                if (node.type === 'text') {
                    let text: React.ReactNode = node.text || ''
                    if (node.format & 1) text = <strong key={i}>{text}</strong>
                    if (node.format & 2) text = <em key={i}>{text}</em>
                    if (node.format & 8) text = <u key={i}>{text}</u>
                    if (node.format & 4) text = <s key={i}>{text}</s>
                    return <React.Fragment key={i}>{text}</React.Fragment>
                }

                // Line break
                if (node.type === 'linebreak') return <br key={i} />

                // Paragraph
                if (node.type === 'paragraph') {
                    return <p key={i}><RenderLexicalContent nodes={node.children || []} /></p>
                }

                // Heading
                if (node.type === 'heading') {
                    const children = <RenderLexicalContent nodes={node.children || []} />
                    switch (node.tag) {
                        case 'h1': return <h1 key={i}>{children}</h1>
                        case 'h2': return <h2 key={i}>{children}</h2>
                        case 'h3': return <h3 key={i}>{children}</h3>
                        case 'h4': return <h4 key={i}>{children}</h4>
                        case 'h5': return <h5 key={i}>{children}</h5>
                        case 'h6': return <h6 key={i}>{children}</h6>
                        default: return <h2 key={i}>{children}</h2>
                    }
                }

                // List
                if (node.type === 'list') {
                    const Tag = node.listType === 'number' ? 'ol' : 'ul'
                    return <Tag key={i}><RenderLexicalContent nodes={node.children || []} /></Tag>
                }

                // List item
                if (node.type === 'listitem') {
                    return <li key={i}><RenderLexicalContent nodes={node.children || []} /></li>
                }

                // Link
                if (node.type === 'link' || node.type === 'autolink') {
                    const url = node.fields?.url || node.url || '#'
                    const newTab = node.fields?.newTab
                    return (
                        <a key={i} href={url} target={newTab ? '_blank' : undefined} rel={newTab ? 'noopener noreferrer' : undefined}>
                            <RenderLexicalContent nodes={node.children || []} />
                        </a>
                    )
                }

                // Quote
                if (node.type === 'quote') {
                    return <blockquote key={i}><RenderLexicalContent nodes={node.children || []} /></blockquote>
                }

                // Fallback: render children if any
                if (node.children) {
                    return <RenderLexicalContent key={i} nodes={node.children} />
                }

                return null
            })}
        </>
    )
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

// ============================================
// Sub-components
// ============================================

/** Dropdown with search (supports searchAliases for multi-language search) */
function SearchDropdown({
    label,
    placeholder,
    options,
    value,
    onChange,
    searchAliases,
}: {
    label: string
    placeholder: string
    options: string[]
    value: string
    onChange: (val: string) => void
    searchAliases?: Record<string, string>
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

    const filtered = options.filter((o) => {
        const q = search.toLowerCase()
        if (!q) return true
        if (o.toLowerCase().includes(q)) return true
        const alias = searchAliases?.[o]
        if (alias && alias.toLowerCase().includes(q)) return true
        return false
    })

    return (
        <div className="search-field" ref={ref}>
            <label className="search-label">{label}</label>
            <div className="relative">
                <div
                    className="search-input-box cursor-pointer"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className={cn('text-sm truncate flex-1', !value && 'text-muted-foreground')}>
                        {value || placeholder}
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
                            {filtered.map((opt) => (
                                <div
                                    key={opt}
                                    className={cn('px-3 py-2 text-sm cursor-pointer hover:bg-accent', value === opt && 'bg-accent font-medium')}
                                    onClick={() => { onChange(opt); setIsOpen(false); setSearch('') }}
                                >
                                    {opt}
                                </div>
                            ))}
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
        <div className="search-field" ref={ref}>
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
        <div className="flex flex-col gap-1 min-w-0">
            <label className="text-sm font-medium text-foreground truncate">{label}</label>

            {/* Values Display */}
            <div className="flex items-baseline justify-center gap-2 py-1">
                <span className="text-base font-bold" style={{ color: 'var(--primary)' }}>{formatNumber(value[0])}</span>
                <span className="text-xs font-normal text-muted-foreground">ระหว่าง</span>
                <span className="text-base font-bold" style={{ color: 'var(--primary)' }}>{formatNumber(value[1])}</span>
            </div>

            {/* Slider Track */}
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
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-2 border-white cursor-grab active:cursor-grabbing transition-shadow hover:shadow-xl z-10 shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                    style={{
                        left: `${leftPercent}%`,
                        backgroundColor: 'var(--secondary)',
                    }}
                    onPointerDown={handlePointerDown(0)}
                />

                {/* Max Thumb */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-2 border-white cursor-grab active:cursor-grabbing transition-shadow hover:shadow-xl z-10 shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                    style={{
                        left: `${rightPercent}%`,
                        backgroundColor: 'var(--secondary)',
                    }}
                    onPointerDown={handlePointerDown(1)}
                />
            </div>
        </div>
    )
}

// ============================================
// Search Fields Layout — primary (≤4) + expandable extra (Country version)
// ============================================
function SearchFieldsLayoutCountry({
    searchFieldsCfg,
    countrySlug, countryTitle, countryOptions, router,
    cityOptions, city, setCity,
    tourCode, setTourCode,
    festivalOptions, festival, setFestival,
    airlineOptions, airline, setAirline,
    dateRange, setDateRange,
    monthOptions, month, setMonth,
    wholesaleOptions, wholesale, setWholesale,
    priceRange, setPriceRange,
    handleSearch,
    handleClear,
    showExtra, setShowExtra, extraRef,
}: {
    searchFieldsCfg: any
    countrySlug: string; countryTitle: string
    countryOptions: { title: string; slug: string; title_en?: string }[]
    router: any
    cityOptions: string[]; city: string; setCity: (v: string) => void
    tourCode: string; setTourCode: (v: string) => void
    festivalOptions: string[]; festival: string; setFestival: (v: string) => void
    airlineOptions: string[]; airline: string; setAirline: (v: string) => void
    dateRange: DateRange | undefined; setDateRange: (v: DateRange | undefined) => void
    monthOptions: string[]; month: string; setMonth: (v: string) => void
    wholesaleOptions: string[]; wholesale: string; setWholesale: (v: string) => void
    priceRange: [number, number]; setPriceRange: (v: [number, number]) => void
    handleSearch: () => void
    handleClear: () => void
    showExtra: boolean; setShowExtra: (v: boolean) => void
    extraRef: React.RefObject<HTMLDivElement | null>
}) {
    // Build array of enabled field elements
    const fields: React.ReactNode[] = []

    if (searchFieldsCfg?.countryField?.enabled ?? true) {
        const countryDropdownOptions = countryOptions.map((c) => c.title_en ? `${c.title} (${c.title_en})` : c.title)

        const currentCountry = countryOptions.find((c) => c.title === countryTitle)
        const displayValue = currentCountry?.title_en ? `${currentCountry.title} (${currentCountry.title_en})` : countryTitle
        
        const countryAliases: Record<string, string> = {}
        countryOptions.forEach((c) => {
            const label = c.title
            if (c.slug) countryAliases[label] = c.slug
        })
        fields.push(
            <div key="country" className="w-full min-w-0">
                <SearchDropdown
                    label={searchFieldsCfg?.countryField?.label || 'เลือกประเทศ'}
                    placeholder={searchFieldsCfg?.countryField?.placeholder || 'เลือกประเทศ'}
                    options={countryDropdownOptions.length > 0 ? countryDropdownOptions : [displayValue]}
                    value={displayValue}
                    onChange={(val) => {
                        const match = countryOptions.find((c) => c.title === val || (c.title_en && `${c.title} (${c.title_en})` === val))
                        if (match?.slug) {
                            router.push(`/inbound-tours/${match.slug}`)
                        }
                    }}
                    searchAliases={countryAliases}
                />
            </div>,
        )
    }

    if (searchFieldsCfg?.tourCodeField?.enabled ?? true) {
        fields.push(
            <div key="tourCode" className="w-full min-w-0">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground truncate">
                        {searchFieldsCfg?.tourCodeField?.label || 'รหัสทัวร์ / โปรแกรม'}
                    </label>
                    <input
                        type="text"
                        className="px-3 py-2.5 text-sm bg-background border border-input rounded-lg outline-none placeholder:text-muted-foreground hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                        placeholder={searchFieldsCfg?.tourCodeField?.placeholder || 'รหัสทัวร์ / โปรแกรม / สถานที่ท่องเที่ยว'}
                        value={tourCode}
                        onChange={(e) => setTourCode(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>
            </div>,
        )
    }

    if (searchFieldsCfg?.cityField?.enabled ?? false) {
        fields.push(
            <div key="city" className="w-full min-w-0">
                <SearchDropdown
                    label={searchFieldsCfg?.cityField?.label || 'เมือง / จังหวัด'}
                    placeholder={searchFieldsCfg?.cityField?.placeholder || 'เลือกเมือง'}
                    options={cityOptions}
                    value={city}
                    onChange={setCity}
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
                    options={airlineOptions}
                    value={airline}
                    onChange={setAirline}
                />
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
            <div key="priceRange" className="w-full min-w-0 sm:col-span-2 lg:col-span-2">
                <PriceRangeSlider
                    label={searchFieldsCfg?.priceRangeField?.label || 'ช่วงราคา'}
                    min={searchFieldsCfg?.priceRangeField?.minPrice ?? 0}
                    max={searchFieldsCfg?.priceRangeField?.maxPrice ?? 1000000}
                    step={1000}
                    value={priceRange}
                    onChange={setPriceRange}
                />
            </div>,
        )
    }

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
                    {/* Filter Icon (only when >4 fields) */}
                    {hasExtra && (
                        <button
                            onClick={() => setShowExtra(!showExtra)}
                            className={cn(
                                'flex items-center justify-center w-10 h-10 rounded-lg border transition-all duration-200 cursor-pointer',
                                showExtra
                                    ? 'bg-primary text-primary-foreground border-primary shadow-md'
                                    : 'bg-background border-input text-muted-foreground hover:border-primary/50 hover:text-foreground',
                            )}
                            title={showExtra ? 'ปิดตัวกรองเพิ่มเติม' : 'ตัวกรองเพิ่มเติม'}
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                        </button>
                    )}

                    {(tourCode || city || festival || airline || wholesale || dateRange || month) && (
                    <button
                        onClick={handleClear}
                        className="flex items-center justify-center w-10 h-10 shrink-0 rounded-lg border border-input bg-background/80 text-muted-foreground hover:border-red-300 hover:text-red-500 transition-all duration-200 cursor-pointer"
                        title="ล้างค่าทั้งหมด"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </button>
                    )}

                    <button
                        onClick={handleSearch}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 hover:opacity-90 active:scale-[0.98] cursor-pointer whitespace-nowrap"
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
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{
                        maxHeight: showExtra ? `${(extraRef.current?.scrollHeight ?? 500) + 20}px` : '0px',
                        opacity: showExtra ? 1 : 0,
                    }}
                >
                    <div className="relative border border-input/50 rounded-xl p-4 md:p-5 bg-muted/30">
                        <button
                            onClick={() => setShowExtra(false)}
                            className="absolute top-3 right-3 flex items-center justify-center w-7 h-7 rounded-full bg-muted hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            title="ปิด"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>

                        <div className="flex flex-wrap items-end gap-4 md:gap-5 pr-8">
                            {extraFields}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

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
// Props
// ============================================
type CountrySearchResultsProps = {
    countryTitle: string
    countrySlug: string
    flagCode?: string | null
    flagIconUrl: string | null
    heroBannerUrl: string | null
    allTags: { id: string; name: string; slug: string }[]
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
        heroBannerSettings?: {
            showHeroBanner?: boolean
            showTourDescription?: boolean
        }
        sidebarFilterSettings?: any
    }
    description?: any
    ssrSearchData?: any
    ssrOptionsData?: any
    ssrSearchConfig?: any
}

// ============================================
// Main Component
// ============================================
export default function CountrySearchResults({
    countryTitle,
    countrySlug,
    flagCode,
    flagIconUrl,
    heroBannerUrl,
    allTags,
    settings,
    description,
    ssrSearchData,
    ssrOptionsData,
    ssrSearchConfig,
}: CountrySearchResultsProps) {
    // CMS settings with defaults
    const cardDesignVersion = settings?.listingCardSettings?.cardDesignVersion || 'WOWTOUR_TOUR_CARD_1'
    const maxVisibleCards = Number(settings?.listingCardSettings?.maxVisibleCards ?? '4')
    const resultsPerPage = settings?.listingCardSettings?.resultsPerPage ?? 12
    const CardComponent = cardItemComponents[cardDesignVersion] || TourCardItem
    const showMonthFilter = settings?.resultsBarSettings?.showMonthFilter ?? true
    const showSortFilter = settings?.resultsBarSettings?.showSortFilter ?? true
    const sortOpts = settings?.resultsBarSettings?.sortOptions
    const showHeroBanner = settings?.heroBannerSettings?.showHeroBanner ?? true
    const searchParams = useSearchParams()
    const router = useRouter()

    // Search form state
    const [tourCode, setTourCode] = useState(searchParams.get('tourCode') || '')
    const [city, setCity] = useState(searchParams.get('city') || '')
    const [festival, setFestival] = useState(searchParams.get('festival') || '')
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

    // Toggle state for expandable extra fields
    const [showExtra, setShowExtra] = useState(false)
    const extraRef = useRef<HTMLDivElement>(null)

    // Dynamic dropdown options from ssrOptionsData (shared source of truth)
    const festivalOptions = (ssrOptionsData?.filterOptions?.festivals || []).map((f: any) => f.label)
    const wholesaleListRaw = (countrySlug && ssrOptionsData?.filterOptions?.wholesaleByCountry)
        ? (ssrOptionsData.filterOptions.wholesaleByCountry[countrySlug] || [])
        : (ssrOptionsData?.filterOptions?.wholesale || ssrOptionsData?.wholesaleList || [])

    const wholesaleOptions = wholesaleListRaw.map((w: any) => typeof w === 'string' ? w : w.label)
    const monthOptions = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']

    // Country and dynamic selector state
    const countryOptions = ssrOptionsData?.inboundCountryList || []
    const cityOptions = ssrOptionsData?.inboundCities || []
    const airlineOptions = ssrOptionsData?.airlines || []

    // Results state
    const results = ssrSearchData?.data || []
    const totalResults = ssrSearchData?.pagination?.totalResults || 0
    const totalPeriods = ssrSearchData?.pagination?.totalPeriods || 0
    const totalPages = ssrSearchData?.pagination?.totalPages || 0
    const [isPending, startTransition] = React.useTransition()
    const loading = isPending

    // Sidebar filter state
    const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null)
    const [sidebarFilterConfig, setSidebarFilterConfig] = useState<SidebarFilterConfig>({ enabled: true, ...(settings?.sidebarFilterSettings || {}) })
    // Use real DB prices from SSR as initial values
    const dbPriceRange = ssrOptionsData?.filterOptions?.priceRange
    const [sidebarPriceConfig, setSidebarPriceConfig] = useState({
        min: dbPriceRange?.min ?? 0,
        max: dbPriceRange?.max ?? 600000,
        step: 1000
    })
    const [sidebarFilter, setSidebarFilter] = useState<FilterState>({
        priceMin: dbPriceRange?.min ?? 0,
        priceMax: dbPriceRange?.max ?? 600000,
        festivals: [], durationDays: [],
        airlines: [], hotelStars: [], categories: [], countries: [], cities: [], months: [],
    })

    const basePath = `/inbound-tours/${countrySlug}`

    // Use ssrOptionsData directly for filter options
    useEffect(() => {
        if (ssrOptionsData?.filterOptions) {
            setFilterOptions({
                ...ssrOptionsData.filterOptions,
                countries: ssrOptionsData.filterOptions.inboundCountries || [],
                cities: ssrOptionsData.filterOptions.inboundCities || []
            })
        }
    }, [ssrOptionsData])

    // Search field settings — use SSR data from PageConfig (shared source of truth)
    const headingSettings = ssrSearchConfig?.headingSettings || {}
    const [searchFieldsCfg, setSearchFieldsCfg] = useState<any>(ssrSearchConfig?.searchFields || null)
    const [enableSearchSection, setEnableSearchSection] = useState<boolean>(ssrSearchConfig?.enableSearchSection !== false)
    useEffect(() => {
        if (!ssrSearchConfig || Object.keys(ssrSearchConfig).length === 0) {
            fetch('/api/globals/page-config?depth=2')
                .then((res) => res.json())
                .then((data) => {
                    const ss = data?.searchSectionSettings || {}
                    setSearchFieldsCfg(ss.searchFields || {})
                    setEnableSearchSection(ss.enableSearchSection !== false)

                    // Sidebar filter config
                    const sfs = data?.searchPageSettings?.sidebarFilterSettings || {}
                    setSidebarFilterConfig({ enabled: true, ...sfs })
                    // Price range — prefer DB values, fallback to CMS config
                    const prf = ss.searchFields?.priceRangeField
                    const dbRange = ssrOptionsData?.filterOptions?.priceRange
                    const pMin = dbRange?.min ?? prf?.minPrice ?? 0
                    const pMax = dbRange?.max ?? prf?.maxPrice ?? 600000
                    setSidebarPriceConfig({ min: pMin, max: pMax, step: 1000 })
                    setSidebarFilter(prev => ({ ...prev, priceMin: pMin, priceMax: pMax }))
                })
                .catch(() => { })
        }
    }, [ssrSearchConfig])

    const searchHeading = headingSettings?.heading || 'ค้นหาโปรแกรมทัวร์'
    const showHeadingIcon = headingSettings?.showHeadingIcon ?? false
    const rawHeadingIcon = headingSettings?.headingIcon

    // Auto-populate headingIcon if it's a string ID (same as home page)
    const [populatedHeadingIcon, setPopulatedHeadingIcon] = useState<any>(null)
    useEffect(() => {
        if (typeof rawHeadingIcon === 'string' && rawHeadingIcon.length > 0) {
            fetch(`/api/media/${rawHeadingIcon}?depth=0`)
                .then((res) => res.json())
                .then((data) => {
                    if (data && data.url) setPopulatedHeadingIcon(data)
                })
                .catch(() => {})
        } else if (rawHeadingIcon && typeof rawHeadingIcon === 'object') {
            setPopulatedHeadingIcon(rawHeadingIcon)
        } else {
            setPopulatedHeadingIcon(null)
        }
    }, [rawHeadingIcon])
    const headingIcon = populatedHeadingIcon

    // Sync price range when config loads
    useEffect(() => {
        if (searchFieldsCfg?.priceRangeField) {
            const min = searchFieldsCfg.priceRangeField.minPrice ?? 0
            const max = searchFieldsCfg.priceRangeField.maxPrice ?? 1000000
            setPriceRange([min, max])
        }
    }, [searchFieldsCfg?.priceRangeField?.minPrice, searchFieldsCfg?.priceRangeField?.maxPrice])

    // fetchResults replaced by SSR Native Next.js Behavior

    // Handle form clearing
    const handleClear = () => {
        setCity('')
        setTourCode('')
        setFestival('')
        setAirline('')
        setWholesale('')
        setDateRange(undefined)
        setMonth('')
        setPriceRange([sidebarPriceConfig.min, sidebarPriceConfig.max])
        setSort('')
        setPage(1)
        
        // Also clear sidebar state entirely
        setSidebarFilter({
            priceMin: sidebarPriceConfig.min,
            priceMax: sidebarPriceConfig.max,
            festivals: [], durationDays: [],
            airlines: [], hotelStars: [], categories: [],
            countries: [], cities: [], months: []
        })

        startTransition(() => {
            router.push(basePath, { scroll: false })
        })
    }

    // Handle search button click
    const handleSearch = () => {
        setPage(1)
        const params = new URLSearchParams()
        if (city) params.set('city', city)
        if (tourCode) params.set('tourCode', tourCode)
        if (festival) params.set('festival', festival)
        if (airline) params.set('airline', airline)
        if (wholesale) params.set('wholesale', wholesale)
        if (dateRange?.from) params.set('dateFrom', format(dateRange.from, 'yyyy-MM-dd'))
        if (dateRange?.to) params.set('dateTo', format(dateRange.to, 'yyyy-MM-dd'))
        if (month) params.set('month', month)
        if (sort) params.set('sort', sort)
        if (searchFieldsCfg?.priceRangeField?.enabled) {
            params.set('priceMin', priceRange[0].toString())
            params.set('priceMax', priceRange[1].toString())
        }
        startTransition(() => {
            router.push(`${basePath}?${params.toString()}`, { scroll: false })
        })
    }

    const handlePageChange = (newPage: number) => {
        setPage(newPage)
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', newPage.toString())
        startTransition(() => {
            router.push(`${basePath}?${params.toString()}`, { scroll: false })
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
            router.push(`${basePath}?${params.toString()}`, { scroll: false })
        })
    }

    return (
        <main className="search-page">
            {/* ============================================ */}
            {/* Page Title Hero */}
            {/* ============================================ */}
            {showHeroBanner && heroBannerUrl && (
                <section className="relative w-full h-[250px] overflow-hidden">
                    <img
                        src={heroBannerUrl}
                        alt={`${countryTitle} Banner`}
                        className="absolute inset-0 w-full h-full object-cover object-center z-[-1]"
                        fetchPriority="high"
                        decoding="async"
                    />
                </section>
            )}

            {/* Breadcrumb */}
            <div className="container pt-6 pb-2">
                <nav className="flex items-center gap-1.5 text-sm text-foreground/70">
                    <a href="/" className="hover:text-primary transition-colors whitespace-nowrap">หน้าหลัก</a>
                    <span className="opacity-50 mx-1">›</span>
                    <span className="text-foreground font-medium truncate max-w-[200px] md:max-w-none">{countryTitle}</span>
                </nav>
            </div>

            {/* ============================================ */}
            {/* Country Title & Tour Description */}
            {/* ============================================ */}
            <div className="container mt-6 mb-8">
                <div className="flex items-center gap-3 md:gap-4 mb-4">
                    {flagCode ? (
                        <div className="w-[42px] h-[42px] rounded-full overflow-hidden shrink-0 border border-border shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                            <img src={`https://flagcdn.com/w80/${flagCode.toLowerCase()}.png`} srcSet={`https://flagcdn.com/w160/${flagCode.toLowerCase()}.png 2x`} alt={`${countryTitle} Flag`} className="w-full h-full object-cover" />
                        </div>
                    ) : flagIconUrl ? (
                         <div className="w-[42px] h-[42px] rounded-full overflow-hidden shrink-0 border border-border shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                            <img src={flagIconUrl} alt={`${countryTitle} Flag`} className="w-full h-full object-cover" />
                        </div>
                    ) : null}
                    <h1 className="text-[28px] md:text-4xl font-bold tracking-tight text-foreground">{countryTitle}</h1>
                </div>

                {(settings?.heroBannerSettings?.showTourDescription !== false) && description && description.root && (
                    <div className="text-foreground/80 text-[15px] md:text-base leading-relaxed md:leading-loose prose-sm prose-p:my-1 prose-strong:text-foreground">
                        <RenderLexicalContent nodes={description.root.children} />
                    </div>
                )}
            </div>

            {/* ============================================ */}
            {/* Search Form Section */}
            {/* ============================================ */}
            {enableSearchSection && (
                <section className="py-6">
                    <div className="container">
                        <div className="search-form-box">
                            {/* Heading */}
                            <div className="flex items-center gap-3 mb-6 md:mb-8">
                                {showHeadingIcon && headingIcon && (
                                    <div className="w-8 h-8 relative shrink-0">
                                        <Media resource={headingIcon} fill imgClassName="object-contain" />
                                    </div>
                                )}
                                <h2 className="text-2xl font-medium">{searchHeading}</h2>
                            </div>

                            {/* Search Fields — Dynamic primary + expandable layout */}
                            <SearchFieldsLayoutCountry
                                searchFieldsCfg={searchFieldsCfg}
                                countrySlug={countrySlug}
                                countryTitle={countryTitle}
                                countryOptions={countryOptions}
                                router={router}
                                cityOptions={cityOptions}
                                city={city}
                                setCity={setCity}
                                tourCode={tourCode}
                                setTourCode={setTourCode}
                                festivalOptions={festivalOptions}
                                festival={festival}
                                setFestival={setFestival}
                                airlineOptions={airlineOptions}
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
                                showExtra={showExtra}
                                setShowExtra={setShowExtra}
                                extraRef={extraRef}
                            />
                        </div>
                    </div>
                </section>
            )}

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

                    {/* Tags Section — below filter bar */}
                    {allTags.length > 0 && (
                        <div className="country-tags">
                            {allTags.map((tag) => (
                                <a
                                    key={tag.id}
                                    href={`/tour/tag/${encodeURIComponent(tag.slug || tag.name)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="country-tag-pill"
                                >
                                    {tag.name}
                                </a>
                            ))}
                        </div>
                    )}

                    {/* Sidebar + Results Layout */}
                    <div className="tour-listing-layout">
                        {/* Sidebar Filter */}
                        <TourSidebarFilter
                            filterOptions={filterOptions}
                            filterConfig={sidebarFilterConfig}
                            filterState={sidebarFilter}
                            onFilterChange={(newState) => {
                                setSidebarFilter(newState)
                                setPage(1)
                                
                                const params = new URLSearchParams(searchParams.toString())
                                
                                // Mapping filters to URL 
                                if (newState.priceMin > sidebarPriceConfig.min) params.set('priceMin', String(newState.priceMin))
                                else params.delete('priceMin')
                                
                                if (newState.priceMax < sidebarPriceConfig.max) params.set('priceMax', String(newState.priceMax))
                                else params.delete('priceMax')

                                if (newState.festivals.length) params.set('festivals', newState.festivals.join(','))
                                else params.delete('festivals')

                                if (newState.airlines.length) params.set('airlines', newState.airlines.join(','))
                                else params.delete('airlines')

                                if (newState.months.length) params.set('months', newState.months.join(','))
                                else params.delete('months')
                                
                                if (newState.hotelStars.length) params.set('hotelStars', newState.hotelStars.join(','))
                                else params.delete('hotelStars')

                                if (newState.categories.length) params.set('categories', newState.categories.join(','))
                                else params.delete('categories')

                                if (newState.countries.length) params.set('countries', newState.countries.join(','))
                                else params.delete('countries')

                                if (newState.cities.length) params.set('cities', newState.cities.join(','))
                                else params.delete('cities')

                                if (newState.durationDays.length) params.set('durationDays', newState.durationDays.join(','))
                                else params.delete('durationDays')

                                params.set('page', '1')

                                startTransition(() => {
                                    router.push(`${basePath}?${params.toString()}`, { scroll: false })
                                })
                            }}
                            onApply={() => { /* Apply is implicitly handled by onFilterChange */ }}
                            priceRangeConfig={sidebarPriceConfig}
                        />

                        {/* Content */}
                        <div className="tour-listing-layout__content">
                            {/* Loading Skeleton */}
                            {loading && (
                                <div className="search-loading mb-6">
                                    <div className={`search-results-grid search-results-grid--cols-${maxVisibleCards}`}>
                                        {Array.from({ length: 8 }).map((_, i) => (
                                            <div key={i} className="animate-pulse bg-muted rounded-2xl h-[380px] w-full border border-border" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Results Grid — Cards 1-6 */}
                            {!loading && results.length > 0 && (
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
                            {!loading && results.length === 0 && (
                                <div className="search-empty">
                                    <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
                                    <h3 className="text-xl font-medium mb-2">ไม่พบโปรแกรมทัวร์</h3>
                                    <p className="text-muted-foreground mb-6">
                                        ลองเปลี่ยนเงื่อนไขการค้นหา หรือดูทัวร์ทั้งหมด
                                    </p>
                                    <button
                                        onClick={() => {
                                            setTourCode('')
                                            setCity('')
                                            setDateRange(undefined)
                                            setMonth('')
                                            setSort('')
                                            setPage(1)
                                            setSidebarFilter({
                                                priceMin: sidebarPriceConfig.min, priceMax: sidebarPriceConfig.max,
                                                festivals: [], durationDays: [], airlines: [],
                                                hotelStars: [], categories: [], countries: [], cities: [], months: [],
                                            })
                                            router.push(basePath)
                                        }}
                                        className="search-reset-btn"
                                    >
                                        ล้างตัวกรองทั้งหมด
                                    </button>
                                </div>
                            )}
                        </div >
                    </div >
                </div >
            </section >
        </main >
    )
}
