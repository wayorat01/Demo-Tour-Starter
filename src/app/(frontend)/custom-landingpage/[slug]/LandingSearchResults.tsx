'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import {
  TourSidebarFilter,
  FilterOptions,
  FilterState,
  SidebarFilterConfig,
} from '@/components/TourSidebarFilter/TourSidebarFilter'
import { TourCardItem } from '@/blocks/TourType/wowtour_tourCard1'
import { TourCard2Item } from '@/blocks/TourType/wowtour_tourCard2'
import { TourCard3Item } from '@/blocks/TourType/wowtour_tourCard3'
import { TourCard4Item } from '@/blocks/TourType/wowtour_tourCard4'
import { TourCard5Item } from '@/blocks/TourType/wowtour_tourCard5'
import { TourCard6Item } from '@/blocks/TourType/wowtour_tourCard6'
import { cn } from '@/utilities/cn'
import '@/blocks/SearchPage/wowtour_searchTour1.css'
import '@/blocks/TourType/wowtour_tourCard1.css'
import '@/blocks/TourType/wowtour_tourCard2.css'
import '@/blocks/TourType/wowtour_tourCard3.css'
import '@/blocks/TourType/wowtour_tourCard4.css'
import '@/blocks/TourType/wowtour_tourCard5.css'
import '@/blocks/TourType/wowtour_tourCard6.css'
import '@/app/(frontend)/intertours/[slug]/country-page.css'
import './custom-tags.css'

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
        if (node.type === 'text') {
          let text: React.ReactNode = node.text || ''
          if (node.format & 1) text = <strong key={i}>{text}</strong>
          if (node.format & 2) text = <em key={i}>{text}</em>
          if (node.format & 8) text = <u key={i}>{text}</u>
          if (node.format & 4) text = <s key={i}>{text}</s>
          return <React.Fragment key={i}>{text}</React.Fragment>
        }
        if (node.type === 'linebreak') return <br key={i} />
        if (node.type === 'paragraph') {
          return (
            <p key={i}>
              <RenderLexicalContent nodes={node.children || []} />
            </p>
          )
        }
        if (node.type === 'heading') {
          const children = <RenderLexicalContent nodes={node.children || []} />
          switch (node.tag) {
            case 'h1':
              return <h1 key={i}>{children}</h1>
            case 'h2':
              return <h2 key={i}>{children}</h2>
            case 'h3':
              return <h3 key={i}>{children}</h3>
            case 'h4':
              return <h4 key={i}>{children}</h4>
            default:
              return <h2 key={i}>{children}</h2>
          }
        }
        if (node.type === 'list') {
          const Tag = node.listType === 'number' ? 'ol' : 'ul'
          return (
            <Tag key={i}>
              <RenderLexicalContent nodes={node.children || []} />
            </Tag>
          )
        }
        if (node.type === 'listitem') {
          return (
            <li key={i}>
              <RenderLexicalContent nodes={node.children || []} />
            </li>
          )
        }
        if (node.type === 'link' || node.type === 'autolink') {
          const url = node.fields?.url || node.url || '#'
          const newTab = node.fields?.newTab
          return (
            <a
              key={i}
              href={url}
              target={newTab ? '_blank' : undefined}
              rel={newTab ? 'noopener noreferrer' : undefined}
            >
              <RenderLexicalContent nodes={node.children || []} />
            </a>
          )
        }
        if (node.type === 'quote') {
          return (
            <blockquote key={i}>
              <RenderLexicalContent nodes={node.children || []} />
            </blockquote>
          )
        }
        if (node.children) {
          return <RenderLexicalContent key={i} nodes={node.children} />
        }
        return null
      })}
    </>
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
          <span key={`dots-${i}`} className="search-page-dots">
            ...
          </span>
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
// Custom Tags Section — drag-to-scroll + prominent buttons
// ============================================
function CustomTagsSection({
  customTags,
  tagDisplayMode,
  searchParams,
  basePath,
  router,
}: {
  customTags: { label: string; link?: string; newTab?: boolean; id?: string }[]
  tagDisplayMode: 'all' | 'slider'
  searchParams: ReturnType<typeof useSearchParams>
  basePath: string
  router: ReturnType<typeof useRouter>
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)
  const hasDragged = useRef(false)

  const checkScrollability = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 2)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2)
  }, [])

  useEffect(() => {
    checkScrollability()
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', checkScrollability, { passive: true })
      const ro = new ResizeObserver(checkScrollability)
      ro.observe(el)
      return () => {
        el.removeEventListener('scroll', checkScrollability)
        ro.disconnect()
      }
    }
  }, [checkScrollability])

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true
    hasDragged.current = false
    startX.current = e.pageX - (scrollRef.current?.offsetLeft || 0)
    scrollLeft.current = scrollRef.current?.scrollLeft || 0
    document.body.style.userSelect = 'none'
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - (scrollRef.current.offsetLeft || 0)
    const walk = (x - startX.current) * 1.5
    if (Math.abs(walk) > 3) hasDragged.current = true
    scrollRef.current.scrollLeft = scrollLeft.current - walk
  }

  const handleMouseUp = () => {
    isDragging.current = false
    document.body.style.userSelect = ''
  }

  const scrollBy = (direction: 'left' | 'right') => {
    scrollRef.current?.scrollBy({
      left: direction === 'left' ? -200 : 200,
      behavior: 'smooth',
    })
  }

  return (
    <section className="container">
      <div className="custom-tags-wrap">
        {/* Left arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scrollBy('left')}
            aria-label="Scroll left"
            className="custom-tags__arrow custom-tags__arrow--left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        {/* Right arrow */}
        {canScrollRight && (
          <button
            onClick={() => scrollBy('right')}
            aria-label="Scroll right"
            className="custom-tags__arrow custom-tags__arrow--right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        {/* Fade edges */}
        {canScrollLeft && <div className="custom-tags__fade custom-tags__fade--left" />}
        {canScrollRight && <div className="custom-tags__fade custom-tags__fade--right" />}

        {/* Scrollable tags container */}
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={cn(
            'custom-tags-container',
            tagDisplayMode === 'slider' && 'custom-tags-slider',
          )}
        >
          {customTags.map((tag, idx) => {
            const isQueryLink = tag.link?.startsWith('?')
            const isExternalLink = tag.link && !isQueryLink

            const handleClick = (e: React.MouseEvent) => {
              if (hasDragged.current) {
                e.preventDefault()
                return
              }
              if (isQueryLink) {
                e.preventDefault()
                const tagParams = new URLSearchParams(tag.link!.slice(1))
                const params = new URLSearchParams(searchParams.toString())
                tagParams.forEach((val, key) => params.set(key, val))
                params.set('page', '1')
                router.push(`${basePath}?${params.toString()}`, { scroll: false })
              }
            }

            const TagEl = (isExternalLink ? 'a' : 'span') as any
            const tagProps = isExternalLink
              ? {
                  href: tag.link,
                  target: tag.newTab ? '_blank' : undefined,
                  rel: tag.newTab ? 'noopener noreferrer' : undefined,
                }
              : {}

            return (
              <TagEl
                key={tag.id || idx}
                {...tagProps}
                onClick={handleClick}
                className="custom-tag-btn"
              >
                {tag.label}
              </TagEl>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ============================================
// Props
// ============================================
type LandingSearchResultsProps = {
  pageTitle: string
  pageSlug: string
  heroBannerUrl: string | null
  settings?: {
    listingCardSettings?: {
      cardDesignVersion?: string
      maxVisibleCards?: string
      resultsPerPage?: number
    }
    heroBannerSettings?: {
      showHeroBanner?: boolean
      showTourDescription?: boolean
    }
  }
  description?: any
  // Custom tags
  customTags?: { label: string; link?: string; newTab?: boolean; id?: string }[]
  tagDisplayMode?: 'all' | 'slider'
}

// ============================================
// Main Component
// ============================================
export default function LandingSearchResults({
  pageTitle,
  pageSlug,
  heroBannerUrl,
  settings,
  description,
  customTags = [],
  tagDisplayMode = 'all',
}: LandingSearchResultsProps) {
  const cardDesignVersion =
    settings?.listingCardSettings?.cardDesignVersion || 'WOWTOUR_TOUR_CARD_1'
  const maxVisibleCards = Number(settings?.listingCardSettings?.maxVisibleCards ?? '4')
  const resultsPerPage = settings?.listingCardSettings?.resultsPerPage ?? 12
  const CardComponent = cardItemComponents[cardDesignVersion] || TourCardItem
  const showHeroBanner = settings?.heroBannerSettings?.showHeroBanner ?? true
  const searchParams = useSearchParams()
  const router = useRouter()

  const [sort, setSort] = useState(searchParams.get('sort') || '')
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)

  // Results state
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

  const basePath = `/custom-landingpage/${pageSlug}`

  // Fetch filter options from search-options API
  useEffect(() => {
    fetch('/api/search-options')
      .then((res) => res.json())
      .then((data: any) => {
        if (data.success && data.data.filterOptions) {
          setFilterOptions(data.data.filterOptions)
        }
      })
      .catch(() => {})
  }, [])

  // Fetch sidebar filter config from Page Config
  useEffect(() => {
    fetch('/api/globals/page-config?depth=2')
      .then((res) => res.json())
      .then((data) => {
        // Sidebar filter config
        const sfs = data?.searchPageSettings?.sidebarFilterSettings || {}
        setSidebarFilterConfig(sfs)
        // Price range
        const ss = data?.searchSectionSettings || {}
        const prf = ss.searchFields?.priceRangeField
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

  // Fetch from /api/search-landing
  const fetchResults = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('slug', pageSlug)
      params.set('pagesize', String(resultsPerPage))
      params.set('pagenumber', String(searchParams.get('page') || '1'))
      const sSort = searchParams.get('sort') || ''
      if (sSort) params.set('sortby', sSort)

      const res = await fetch(`/api/search-landing?${params.toString()}`)
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
  }, [searchParams, pageSlug, resultsPerPage])

  useEffect(() => {
    fetchResults()
  }, [fetchResults])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`${basePath}?${params.toString()}`, { scroll: false })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSortChange = (newSort: string) => {
    setSort(newSort)
    setPage(1)
    const params = new URLSearchParams(searchParams.toString())
    if (newSort) params.set('sort', newSort)
    else params.delete('sort')
    params.set('page', '1')
    router.push(`${basePath}?${params.toString()}`, { scroll: false })
  }

  return (
    <main className="search-page">
      {/* ============================================ */}
      {/* Page Title Hero */}
      {/* ============================================ */}
      {showHeroBanner && (
        <section
          className={cn('country-hero', heroBannerUrl && 'country-hero--with-bg')}
          style={
            heroBannerUrl
              ? { background: `url("${heroBannerUrl}") center/cover no-repeat` }
              : undefined
          }
        >
          {heroBannerUrl && <div className="country-hero-overlay" />}
          <div className="container">
            <div className="country-hero-content">
              <h1 className="country-hero-title">{pageTitle}</h1>
            </div>
          </div>
        </section>
      )}

      {/* ============================================ */}
      {/* Tour Description — below Hero Banner */}
      {/* ============================================ */}
      {settings?.heroBannerSettings?.showTourDescription !== false &&
        description &&
        description.root && (
          <section className="country-description">
            <div className="container">
              <div className="country-description__card">
                <span className="country-description__quote-icon">"</span>
                <div className="country-description__content">
                  <RenderLexicalContent nodes={description.root.children} />
                </div>
              </div>
            </div>
          </section>
        )}

      {/* ============================================ */}
      {/* Custom Tags — below Description (drag-to-scroll) */}
      {/* ============================================ */}
      {customTags.length > 0 && (
        <CustomTagsSection
          customTags={customTags}
          tagDisplayMode={tagDisplayMode}
          searchParams={searchParams}
          basePath={basePath}
          router={router}
        />
      )}

      {/* Breadcrumb */}
      <div className="container pt-4 pb-2">
        <nav className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <a href="/" className="hover:text-primary whitespace-nowrap transition-colors">
            หน้าหลัก
          </a>
          <span className="opacity-50">›</span>
          <span className="text-foreground max-w-[200px] truncate font-medium md:max-w-none">
            {pageTitle}
          </span>
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
              <div>
                <label>เรียงตาม :</label>
                <select
                  className="search-sort-select"
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  <option value="">ล่าสุด</option>
                  <option value="price">ราคา</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Grid — Cards 1-6 */}
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

            <div className="tour-listing-layout__content">
              {/* Loading */}
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
                  <AlertCircle className="text-muted-foreground mb-4 h-16 w-16" />
                  <h3 className="mb-2 text-xl font-medium">ไม่พบโปรแกรมทัวร์</h3>
                  <p className="text-muted-foreground mb-6">
                    ลองเปลี่ยนเงื่อนไขการค้นหา หรือดูทัวร์ทั้งหมด
                  </p>
                  <button
                    onClick={() => {
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
                      router.push(basePath)
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
