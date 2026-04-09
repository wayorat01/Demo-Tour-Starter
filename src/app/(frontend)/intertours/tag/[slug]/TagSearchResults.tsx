'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Calendar as CalendarIcon,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import type { DateRange } from 'react-day-picker'
import dynamic from 'next/dynamic'
import { TourCardItem } from '@/blocks/TourType/wowtour_tourCard1'
import { cn } from '@/utilities/cn'
import type {
  FilterOptions,
  FilterState,
  SidebarFilterConfig,
} from '@/components/TourSidebarFilter/TourSidebarFilter'

const Calendar = dynamic(() => import('@/components/ui/calendar').then(m => m.Calendar), {
  ssr: false,
  loading: () => <div className="p-4 flex items-center justify-center text-sm text-foreground/50 h-[280px]">กำลังโหลดปฏิทิน...</div>
})

const TourSidebarFilter = dynamic(() => import('@/components/TourSidebarFilter/TourSidebarFilter').then(m => m.TourSidebarFilter), {
  ssr: false,
  loading: () => <div className="tour-sidebar-filter bg-muted/20 animate-pulse hidden lg:block h-[500px] w-full rounded-xl shrink-0" />
})
import '@/blocks/SearchPage/wowtour_searchTour1.css'
import '@/app/(frontend)/intertours/[slug]/country-page.css'

// Types
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

// DateRangeField
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

  const formatDate = (date: Date | undefined) =>
    date ? format(date, 'd MMM yyyy', { locale: th }) : ''

  const displayValue = () => {
    if (dateRange?.from && dateRange?.to)
      return `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`
    if (dateRange?.from) return `${formatDate(dateRange.from)} - ...`
    return ''
  }

  return (
    <div className="search-field" ref={ref}>
      <label className="search-label">{label}</label>
      <div className="relative">
        <div className="search-input-box cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <CalendarIcon className="text-muted-foreground h-4 w-4 shrink-0" />
          <span
            className={cn('flex-1 truncate text-sm', !dateRange?.from && 'text-muted-foreground')}
          >
            {displayValue() || placeholder}
          </span>
        </div>
        {isOpen && (
          <div className="absolute top-full left-0 z-50 mt-1">
            <div className="bg-background border-input rounded-lg border p-2 shadow-xl">
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

// Pagination
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
          <span key={`dots-${i}`} className="search-page-dots">
            ...
          </span>
        ) : (
          <button
            key={p}
            className={cn('search-page-btn', p === currentPage && 'search-page-btn--active')}
            onClick={() => onPageChange(p as number)}
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

// Props
type TagSearchResultsProps = {
  tagName: string
  tagId: string
  categoryTitle: string
  categoryId: string
  heroBannerUrl: string | null
}

export default function TagSearchResults({
  tagName,
  tagId,
  categoryTitle,
  categoryId,
  heroBannerUrl,
}: TagSearchResultsProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [tourCode, setTourCode] = useState(searchParams.get('tourCode') || '')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const from = searchParams.get('dateFrom')
    const to = searchParams.get('dateTo')
    if (from) return { from: new Date(from), to: to ? new Date(to) : undefined }
    return undefined
  })
  const [month, setMonth] = useState(searchParams.get('month') || '')
  const [sort, setSort] = useState(searchParams.get('sort') || '')
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)

  const [results, setResults] = useState<any[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [totalPeriods, setTotalPeriods] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)

  // Sidebar filter state
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null)
  const [sidebarFilterConfig, setSidebarFilterConfig] = useState<SidebarFilterConfig>({
    enabled: true,
  })
  const [sortOpts, setSortOpts] = useState<any>(null)
  const [sidebarPriceConfig, setSidebarPriceConfig] = useState({ min: 0, max: 600000, step: 1000 })
  const [sidebarFilter, setSidebarFilter] = useState<FilterState>({
    priceMin: 0,
    priceMax: 600000,
    festivals: [],
    durationDays: [],
    airlines: [],
    hotelStars: [],
    categories: [],
    countries: [],
    cities: [],
    months: [],
  })

  const basePath = typeof window !== 'undefined' ? window.location.pathname : ''

  // Fetch filter options + sidebar config
  useEffect(() => {
    fetch('/api/search-options')
      .then((res) => res.json())
      .then((data: any) => {
        if (data.success && data.data.filterOptions) {
          setFilterOptions(data.data.filterOptions)
        }
      })
      .catch(() => {})

    fetch('/api/globals/page-config?depth=2')
      .then((res) => res.json())
      .then((data) => {
        const sfs = data?.searchPageSettings?.sidebarFilterSettings || {}
        setSidebarFilterConfig(sfs)
        const so = data?.searchPageSettings?.resultsBarSettings?.sortOptions
        if (so) setSortOpts(so)
        const prf = data?.searchSectionSettings?.searchFields?.priceRangeField
        if (prf) {
          const pMin = prf.minPrice ?? 0
          const pMax = prf.maxPrice ?? 600000
          const pStep = prf.step ?? 1000
          setSidebarPriceConfig({ min: pMin, max: pMax, step: pStep })
          setSidebarFilter((prev) => ({ ...prev, priceMin: pMin, priceMax: pMax }))
        }
      })
      .catch(() => {})
  }, [])

  // Fetch results from Payload CMS (ไม่เรียก External API แล้ว)
  const fetchResults = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()

      const sSort = searchParams.get('sort') || ''
      const sPage = searchParams.get('page') || '1'

      params.set('pagesize', '12')
      params.set('pagenumber', sPage)
      if (sSort) params.set('sortby', sSort)
      // ส่ง tagName เพื่อ filter ตาม productTags ใน CMS
      if (tagName) params.set('tag', tagName)

      const res = await fetch(`/api/search-program-tours?${params.toString()}`)
      const data = await res.json()

      if (data.success) {
        setResults(data.data || [])
        setTotalResults(data.pagination?.totalResults || 0)
        setTotalPeriods(data.pagination?.totalPeriods || 0)
        setTotalPages(data.pagination?.totalPages || 0)
      }
    } catch {
      setResults([])
      setTotalResults(0)
      setTotalPeriods(0)
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }, [searchParams, tagName])

  useEffect(() => {
    fetchResults()
  }, [fetchResults])

  // Preserve ?cat= in URL
  const getCatParam = () => {
    if (typeof window === 'undefined') return ''
    return new URLSearchParams(window.location.search).get('cat') || ''
  }

  const buildUrl = (params: URLSearchParams) => {
    const cat = getCatParam()
    if (cat) params.set('cat', cat)
    return `${basePath}?${params.toString()}`
  }

  const handleSearch = () => {
    setPage(1)
    const params = new URLSearchParams()
    if (tourCode) params.set('tourCode', tourCode)
    if (dateRange?.from) params.set('dateFrom', format(dateRange.from, 'yyyy-MM-dd'))
    if (dateRange?.to) params.set('dateTo', format(dateRange.to, 'yyyy-MM-dd'))
    if (month) params.set('month', month)
    if (sort) params.set('sort', sort)
    router.push(buildUrl(params), { scroll: false })
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(buildUrl(params), { scroll: false })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSortChange = (newSort: string) => {
    setSort(newSort)
    setPage(1)
    const params = new URLSearchParams(searchParams.toString())
    if (newSort) params.set('sort', newSort)
    else params.delete('sort')
    params.set('page', '1')
    router.push(buildUrl(params), { scroll: false })
  }

  const handleMonthChange = (newMonth: string) => {
    setMonth(newMonth)
    setPage(1)
    const params = new URLSearchParams(searchParams.toString())
    if (newMonth) params.set('month', newMonth)
    else params.delete('month')
    params.set('page', '1')
    router.push(buildUrl(params), { scroll: false })
  }

  return (
    <main className="search-page">
      {/* ============================================ */}
      {/* Hero Banner */}
      {/* ============================================ */}
      <section
        className={cn('country-hero relative overflow-hidden', heroBannerUrl && 'country-hero--with-bg')}
      >
        {heroBannerUrl && (
          <img
            src={heroBannerUrl}
            alt={`${tagName} Banner`}
            className="absolute inset-0 w-full h-full object-cover object-center z-[0]"
            fetchPriority="high"
            decoding="async"
          />
        )}
        {heroBannerUrl && <div className="country-hero-overlay relative z-[1]" />}
        <div className="container relative z-[2]">
          <div className="country-hero-content">
            <h1 className="country-hero-title">{categoryTitle || 'ทัวร์'}</h1>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="container pt-4 pb-2">
        <nav className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <a href="/" className="hover:text-primary whitespace-nowrap transition-colors">
            หน้าหลัก
          </a>
          <span className="opacity-50">›</span>
          <span className="text-foreground max-w-[200px] truncate font-medium md:max-w-none">
            {tagName}
          </span>
        </nav>
      </div>

      {/* ============================================ */}
      {/* Results Section (same design as CountrySearchResults) */}
      {/* ============================================ */}
      <section className="search-results-section">
        <div className="container">
          {/* Results Header Bar */}
          <div
            className="mb-6 overflow-hidden rounded-2xl"
            style={{ background: 'var(--primary)' }}
          >
            <div className="p-5 md:px-8 md:py-5">
              {/* Title */}
              <h2 className="text-2xl font-medium text-white md:text-3xl" style={{ margin: 0 }}>
                {tagName}
              </h2>
              {/* Count + Filters — same line */}
              <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="text-lg font-medium text-white/90 md:text-2xl">
                  {loading ? (
                    <span>กำลังค้นหา...</span>
                  ) : (
                    <span>
                      พบทัวร์ทั้งหมด {totalPeriods} พีเรียดจาก {totalResults} โปรแกรม
                    </span>
                  )}
                </div>
                <div className="grid shrink-0 grid-cols-2 gap-3 md:flex md:items-center md:gap-3">
                  <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:gap-2">
                    <label className="text-xs font-medium text-white/80 md:text-sm md:whitespace-nowrap md:text-white">
                      เรียงตาม :
                    </label>
                    <select
                      className="search-sort-select w-full md:w-auto"
                      value={sort}
                      onChange={(e) => handleSortChange(e.target.value)}
                    >
                      {sortOpts?.showPeriodLowToHigh !== false && (
                        <option value="periodlowtohight">ล่าสุด</option>
                      )}
                      {sortOpts?.showPrice !== false && <option value="price">ราคา</option>}
                      {sortOpts?.showPeriodNoSoldout !== false && (
                        <option value="periodnosoldout">โปรแกรมที่ยังไม่เต็ม</option>
                      )}
                      {sortOpts?.showSupplierSeq === true && (
                        <option value="supplierseq">เรียงตามซัพพลายเออร์</option>
                      )}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar + Results Layout */}
          <div className="tour-listing-layout">
            {/* Sidebar Filter */}
            <TourSidebarFilter
              filterOptions={filterOptions}
              filterConfig={sidebarFilterConfig}
              filterState={sidebarFilter}
              onFilterChange={setSidebarFilter}
              onApply={() => {
                setPage(1)
                fetchResults()
              }}
              priceRangeConfig={sidebarPriceConfig}
            />

            {/* Content */}
            <div className="tour-listing-layout__content">
              {/* Loading Skeleton */}
              {loading && (
                <div className="search-loading">
                  <div className="search-loading-grid">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="search-skeleton-card">
                        <div className="search-skeleton-image" />
                        <div className="search-skeleton-body">
                          <div className="search-skeleton-line w-3/4" />
                          <div className="search-skeleton-line w-full" />
                          <div className="search-skeleton-line w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Results Grid */}
              {!loading && results.length > 0 && (
                <>
                  <div className="search-results-grid">
                    {results.map((tour: any, idx: number) => (
                      <TourCardItem key={tour.id || idx} tour={tour} borderRadius={16} />
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
                  <AlertCircle className="text-muted-foreground mb-4 h-16 w-16" />
                  <h3 className="mb-2 text-xl font-medium">ไม่พบโปรแกรมทัวร์</h3>
                  <p className="text-muted-foreground mb-6">
                    ลองเปลี่ยนเงื่อนไขการค้นหา หรือดูทัวร์ทั้งหมด
                  </p>
                  <button
                    onClick={() => {
                      setTourCode('')
                      setDateRange(undefined)
                      setMonth('')
                      setSort('')
                      setPage(1)
                      setSidebarFilter({
                        priceMin: sidebarPriceConfig.min,
                        priceMax: sidebarPriceConfig.max,
                        festivals: [],
                        durationDays: [],
                        airlines: [],
                        hotelStars: [],
                        categories: [],
                        countries: [],
                        cities: [],
                        months: [],
                      })
                      const params = new URLSearchParams()
                      const cat = getCatParam()
                      if (cat) params.set('cat', cat)
                      router.push(`${basePath}${params.toString() ? '?' + params.toString() : ''}`)
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
