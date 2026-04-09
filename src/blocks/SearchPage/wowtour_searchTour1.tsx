'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { TourCardItem } from '@/blocks/TourType/wowtour_tourCard1'
import { cn } from '@/utilities/cn'
import type { WowtourSearchTourBlock as WowtourSearchTourBlockType } from '@/payload-types'
import type { PublicContextProps } from '@/utilities/publicContextProps'
import './wowtour_searchTour1.css'

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

type WowtourSearchTour1Props = WowtourSearchTourBlockType & {
  publicContext: PublicContextProps
} & Record<string, any>

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
// Main Component
// ============================================
export function WowtourSearchTour1(props: WowtourSearchTour1Props) {
  const { listingCardSettings, resultsBarSettings } = props

  const searchParams = useSearchParams()
  const router = useRouter()

  // CMS settings with defaults
  const borderRadius = listingCardSettings?.borderRadius ?? 16
  const resultsPerPage = listingCardSettings?.resultsPerPage ?? 12
  const showMonthFilter = resultsBarSettings?.showMonthFilter ?? true
  const showSortFilter = resultsBarSettings?.showSortFilter ?? true
  const sortOpts = (resultsBarSettings as any)?.sortOptions

  // State from URL params
  const [month, setMonth] = useState(searchParams.get('month') || '')
  const [sort, setSort] = useState(searchParams.get('sort') || '')
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)

  // Results state
  const [results, setResults] = useState<any[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [totalPeriods, setTotalPeriods] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)

  // Fetch search results from ProgramTours (Payload CMS)
  const fetchResults = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()

      const sSort = searchParams.get('sort') || ''
      const sPage = searchParams.get('page') || '1'

      params.set('pagesize', String(resultsPerPage))
      params.set('pagenumber', sPage)
      if (sSort) params.set('sortby', sSort)

      // Pass any URL filters
      const sCountry = searchParams.get('country') || ''
      if (sCountry) params.set('country', sCountry)
      const sTourCode = searchParams.get('tourCode') || ''
      if (sTourCode) params.set('tourCode', sTourCode)

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
  }, [searchParams, resultsPerPage])

  useEffect(() => {
    fetchResults()
  }, [fetchResults])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`/search-tour?${params.toString()}`, { scroll: false })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSortChange = (newSort: string) => {
    setSort(newSort)
    setPage(1)
    const params = new URLSearchParams(searchParams.toString())
    if (newSort) params.set('sort', newSort)
    else params.delete('sort')
    params.set('page', '1')
    router.push(`/search-tour?${params.toString()}`, { scroll: false })
  }

  return (
    <main className="search-page">
      {/* Breadcrumb */}
      <div className="container pt-4 pb-2">
        <nav className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Link href="/" className="hover:text-primary whitespace-nowrap transition-colors" prefetch={false}>
            หน้าหลัก
          </Link>
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
              {showSortFilter && (
                <div>
                  <label>เรียงตาม :</label>
                  <select
                    className="search-sort-select"
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
              )}
            </div>
          </div>

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
              <div className="search-results-grid">
                {results.map((tour: any, idx: number) => (
                  <TourCardItem key={tour.id || idx} tour={tour} borderRadius={borderRadius} />
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
                ลองเปลี่ยนเงื่อนไขการค้นหา หรือเลือกประเทศอื่น
              </p>
              <button
                onClick={() => {
                  setMonth('')
                  setSort('')
                  setPage(1)
                  router.push('/search-tour')
                }}
                className="search-reset-btn"
              >
                ล้างตัวกรองทั้งหมด
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
