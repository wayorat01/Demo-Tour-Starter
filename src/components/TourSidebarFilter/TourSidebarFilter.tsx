'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Search, X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react'
import './TourSidebarFilter.css'

// ============================================
// Types
// ============================================
export type FilterOption = {
    label: string
    value: string
    count: number
}

export type FilterOptions = {
    countries: { title: string; slug: string; count: number }[]
    airlines: FilterOption[]
    durations: { label: string; value: number; count: number }[]
    hotelStars: FilterOption[]
    cities: FilterOption[]
    months: (FilterOption & { monthIndex: number })[]
    festivals: FilterOption[]
    categories: FilterOption[]
}

export type SidebarFilterConfig = {
    enabled?: boolean
    showPriceRange?: boolean
    showFestival?: boolean
    showDuration?: boolean
    showAirline?: boolean
    showHotelStar?: boolean
    showCategory?: boolean
    showCountry?: boolean
    showCity?: boolean
    showMonth?: boolean
}

export type FilterState = {
    priceMin: number
    priceMax: number
    festivals: string[]
    durationDays: number[]
    airlines: string[]
    hotelStars: string[]
    categories: string[]
    countries: string[]
    cities: string[]
    months: string[]
}

export type TourSidebarFilterProps = {
    filterOptions: FilterOptions | null
    filterConfig: SidebarFilterConfig
    filterState: FilterState
    onFilterChange: (newState: FilterState) => void
    onApply: () => void
    priceRangeConfig?: { min: number; max: number; step: number }
}

// ============================================
// Sub-components
// ============================================

/** Checkbox filter section with "show more" */
function CheckboxSection({
    title,
    items,
    selectedValues,
    onChange,
    maxVisible = 5,
    renderLabel,
    searchable = false,
    searchPlaceholder = 'ค้นหา...',
}: {
    title: string
    items: { label: string; value: string; count: number }[]
    selectedValues: string[]
    onChange: (values: string[]) => void
    maxVisible?: number
    renderLabel?: (item: { label: string; value: string; count: number }) => React.ReactNode
    searchable?: boolean
    searchPlaceholder?: string
}) {
    const [showAll, setShowAll] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const filteredItems = searchable && searchQuery
        ? items.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
        : items

    const displayItems = showAll ? filteredItems : filteredItems.slice(0, maxVisible)
    const hasMore = filteredItems.length > maxVisible

    const toggleValue = (value: string) => {
        if (selectedValues.includes(value)) {
            onChange(selectedValues.filter(v => v !== value))
        } else {
            onChange([...selectedValues, value])
        }
    }

    if (items.length === 0) return null

    return (
        <div className="tour-sidebar__section">
            <div className="tour-sidebar__section-title">{title}</div>

            {searchable && (
                <div className="tour-sidebar__search">
                    <Search />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            )}

            <div className="tour-sidebar__checkbox-list">
                {displayItems.map(item => (
                    <div key={item.value} className="tour-sidebar__checkbox-item">
                        <label>
                            <input
                                type="checkbox"
                                checked={selectedValues.includes(item.value)}
                                onChange={() => toggleValue(item.value)}
                            />
                            {renderLabel ? renderLabel(item) : <span>{item.label}</span>}
                        </label>
                        <span className="tour-sidebar__count">({item.count})</span>
                    </div>
                ))}
            </div>

            {hasMore && (
                <button
                    type="button"
                    className="tour-sidebar__show-more"
                    onClick={() => setShowAll(!showAll)}
                >
                    {showAll ? 'แสดงน้อยลง' : `ดูทั้งหมด`}
                    {showAll ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
            )}
        </div>
    )
}

/** Price Range Slider */
function PriceRangeSection({
    min,
    max,
    step,
    value,
    onChange,
}: {
    min: number
    max: number
    step: number
    value: [number, number]
    onChange: (val: [number, number]) => void
}) {
    const trackRef = useRef<HTMLDivElement>(null)

    const formatNumber = (n: number) =>
        n.toLocaleString('en-US')

    const getPercent = (val: number) =>
        Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100))

    const handlePointerDown = useCallback(
        (index: 0 | 1) => (e: React.PointerEvent) => {
            e.preventDefault()
            const track = trackRef.current
            if (!track) return

            const onMove = (moveEvent: PointerEvent) => {
                const rect = track.getBoundingClientRect()
                const percent = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width))
                let raw = min + percent * (max - min)
                raw = Math.round(raw / step) * step
                raw = Math.max(min, Math.min(max, raw))
                // Snap to exact min/max at boundaries
                if (raw <= min + step / 2) raw = min
                if (raw >= max - step / 2) raw = max
                const next: [number, number] = [...value] as [number, number]
                next[index] = raw
                if (next[0] > next[1]) {
                    if (index === 0) next[0] = next[1]
                    else next[1] = next[0]
                }
                onChange(next)
            }

            const onUp = () => {
                window.removeEventListener('pointermove', onMove)
                window.removeEventListener('pointerup', onUp)
            }

            window.addEventListener('pointermove', onMove)
            window.addEventListener('pointerup', onUp)
        },
        [min, max, step, value, onChange],
    )

    const leftPercent = getPercent(value[0])
    const rightPercent = getPercent(value[1])

    return (
        <div className="tour-sidebar__section">
            <div className="tour-sidebar__section-title">ช่วงราคา</div>
            <div className="tour-sidebar__price-range">
                <div className="tour-sidebar__price-labels">
                    <span>{formatNumber(value[0])} บาท</span>
                    <span>{formatNumber(value[1])} บาท</span>
                </div>
                <div className="tour-sidebar__price-slider-track" ref={trackRef}>
                    <div
                        className="tour-sidebar__price-slider-range"
                        style={{ left: `${leftPercent}%`, width: `${rightPercent - leftPercent}%` }}
                    />
                    <div
                        className="tour-sidebar__price-slider-thumb"
                        style={{ left: `${leftPercent}%` }}
                        onPointerDown={handlePointerDown(0)}
                    />
                    <div
                        className="tour-sidebar__price-slider-thumb"
                        style={{ left: `${rightPercent}%` }}
                        onPointerDown={handlePointerDown(1)}
                    />
                </div>
            </div>
        </div>
    )
}

/** Star Rating label */
function StarLabel({ star, count }: { star: string; count: number }) {
    const numStars = Number(star)
    return (
        <div className="tour-sidebar__checkbox-item">
            <label>
                <input type="checkbox" readOnly />
                <span className="tour-sidebar__stars">
                    {Array.from({ length: numStars }, (_, i) => (
                        <span key={i}>★</span>
                    ))}
                </span>
            </label>
            <span className="tour-sidebar__count">({count})</span>
        </div>
    )
}

// ============================================
// Main Component
// ============================================

export const TourSidebarFilter: React.FC<TourSidebarFilterProps> = ({
    filterOptions,
    filterConfig,
    filterState,
    onFilterChange,
    onApply,
    priceRangeConfig = { min: 0, max: 600000, step: 1000 },
}) => {
    const [mobileOpen, setMobileOpen] = useState(false)

    // Don't render if disabled
    if (!filterConfig.enabled) return null

    const handleClear = () => {
        onFilterChange({
            priceMin: priceRangeConfig.min,
            priceMax: priceRangeConfig.max,
            festivals: [],
            durationDays: [],
            airlines: [],
            hotelStars: [],
            categories: [],
            countries: [],
            cities: [],
            months: [],
        })
    }

    const handleMobileApply = () => {
        setMobileOpen(false)
        onApply()
    }

    // Render filter sections
    const renderFilters = () => {
        if (!filterOptions) return null

        return (
            <>
                {/* 1. ช่วงราคา */}
                {filterConfig.showPriceRange !== false && (
                    <PriceRangeSection
                        min={priceRangeConfig.min}
                        max={priceRangeConfig.max}
                        step={priceRangeConfig.step}
                        value={[filterState.priceMin, filterState.priceMax]}
                        onChange={([min, max]) =>
                            onFilterChange({ ...filterState, priceMin: min, priceMax: max })
                        }
                    />
                )}

                {/* 2. เทศกาล */}
                {filterConfig.showFestival !== false && filterOptions.festivals.length > 0 && (
                    <CheckboxSection
                        title="ทัวร์ตามเทศกาล"
                        items={filterOptions.festivals.filter(f => f.count > 0)}
                        selectedValues={filterState.festivals}
                        onChange={v => onFilterChange({ ...filterState, festivals: v })}
                        maxVisible={5}
                    />
                )}

                {/* 3. จำนวนวัน */}
                {filterConfig.showDuration !== false && filterOptions.durations.length > 0 && (
                    <CheckboxSection
                        title="เลือกจำนวนวัน"
                        items={filterOptions.durations.map(d => ({
                            label: `${d.value} วัน`,
                            value: String(d.value),
                            count: d.count,
                        }))}
                        selectedValues={filterState.durationDays.map(String)}
                        onChange={v => onFilterChange({ ...filterState, durationDays: v.map(Number) })}
                    />
                )}

                {/* 4. สายการบิน */}
                {filterConfig.showAirline !== false && filterOptions.airlines.length > 0 && (
                    <CheckboxSection
                        title="สายการบิน"
                        items={filterOptions.airlines.filter(a => a.count > 0)}
                        selectedValues={filterState.airlines}
                        onChange={v => onFilterChange({ ...filterState, airlines: v })}
                        maxVisible={5}
                    />
                )}

                {/* 5. ระดับดาวที่พัก */}
                {filterConfig.showHotelStar !== false && filterOptions.hotelStars.length > 0 && (
                    <CheckboxSection
                        title="ระดับดาวที่พัก"
                        items={filterOptions.hotelStars}
                        selectedValues={filterState.hotelStars}
                        onChange={v => onFilterChange({ ...filterState, hotelStars: v })}
                        renderLabel={(item) => (
                            <span className="tour-sidebar__stars">
                                {Array.from({ length: Number(item.value) }, (_, i) => (
                                    <span key={i}>★</span>
                                ))}
                            </span>
                        )}
                    />
                )}

                {/* 6. ทวีป */}
                {filterConfig.showCategory !== false && filterOptions.categories.length > 0 && (
                    <CheckboxSection
                        title="ทวีป"
                        items={filterOptions.categories}
                        selectedValues={filterState.categories}
                        onChange={v => onFilterChange({ ...filterState, categories: v })}
                    />
                )}

                {/* 7. ประเทศ / เมือง */}
                {(filterConfig.showCountry !== false || filterConfig.showCity) && (filterOptions.countries.length > 0 || filterOptions.cities.length > 0) && (
                    <CheckboxSection
                        title={filterConfig.showCity ? "ประเทศ / เมือง" : "ประเทศ"}
                        items={[
                            // 1. All countries
                            ...filterOptions.countries.map(c => ({
                                label: c.title,
                                value: c.title,
                                count: c.count,
                            })),
                            // 2. ONLY cities that are currently selected/searched
                            ...(filterConfig.showCity ? filterOptions.cities.filter(c => filterState.cities.includes(c.value)).map(c => ({
                                label: c.label,
                                value: c.value,
                                count: c.count,
                            })) : [])
                        ].sort((a, b) => {
                            const aSelected = [...filterState.countries, ...filterState.cities].includes(a.value)
                            const bSelected = [...filterState.countries, ...filterState.cities].includes(b.value)
                            if (aSelected && !bSelected) return -1
                            if (!aSelected && bSelected) return 1
                            return b.count - a.count
                        })}
                        selectedValues={[...filterState.countries, ...filterState.cities]}
                        onChange={values => {
                            const newCountries = values.filter(v => filterOptions.countries.some(c => c.title === v))
                            const newCities = values.filter(v => filterOptions.cities.some(c => c.value === v))
                            onFilterChange({ ...filterState, countries: newCountries, cities: newCities })
                        }}
                        searchable
                        searchPlaceholder={filterConfig.showCity ? "ใส่ชื่อประเทศ / เมือง..." : "ใส่ชื่อประเทศ..."}
                        maxVisible={5}
                    />
                )}

                {/* 9. เดือน */}
                {filterConfig.showMonth !== false && filterOptions.months.length > 0 && (
                    <CheckboxSection
                        title="เดือน"
                        items={filterOptions.months}
                        selectedValues={filterState.months}
                        onChange={v => onFilterChange({ ...filterState, months: v })}
                    />
                )}
            </>
        )
    }

    // Count active filters
    const activeCount =
        filterState.festivals.length +
        filterState.durationDays.length +
        filterState.airlines.length +
        filterState.hotelStars.length +
        filterState.categories.length +
        filterState.countries.length +
        filterState.cities.length +
        filterState.months.length +
        (filterState.priceMin > priceRangeConfig.min || filterState.priceMax < priceRangeConfig.max ? 1 : 0)

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="tour-sidebar-filter">
                <div className="tour-sidebar__header">
                    <span className="tour-sidebar__title">กรองการค้นหา</span>
                    {activeCount > 0 && (
                        <button type="button" className="tour-sidebar__clear-btn" onClick={handleClear}>
                            ล้างค่า
                        </button>
                    )}
                </div>
                {renderFilters()}
            </aside>

            {/* Mobile Floating Button */}
            <button
                type="button"
                className="tour-sidebar__mobile-trigger"
                onClick={() => setMobileOpen(true)}
            >
                <SlidersHorizontal />
                กรองการค้นหา
                {activeCount > 0 && ` (${activeCount})`}
            </button>

            {/* Mobile Overlay */}
            <div
                className={`tour-sidebar__overlay ${mobileOpen ? 'tour-sidebar__overlay--active' : ''}`}
                onClick={() => setMobileOpen(false)}
            />

            {/* Mobile Drawer */}
            <div className={`tour-sidebar__drawer ${mobileOpen ? 'tour-sidebar__drawer--active' : ''}`}>
                <div className="tour-sidebar__drawer-header">
                    <span className="tour-sidebar__title">กรองการค้นหา</span>
                    <button
                        type="button"
                        className="tour-sidebar__drawer-close"
                        onClick={() => setMobileOpen(false)}
                    >
                        <X size={18} />
                    </button>
                </div>

                {renderFilters()}

                <div className="tour-sidebar__drawer-footer">
                    <button
                        type="button"
                        className="tour-sidebar__drawer-apply-btn"
                        onClick={handleMobileApply}
                    >
                        ค้นหา {activeCount > 0 && `(${activeCount} ตัวกรอง)`}
                    </button>
                </div>
            </div>
        </>
    )
}

export default TourSidebarFilter
