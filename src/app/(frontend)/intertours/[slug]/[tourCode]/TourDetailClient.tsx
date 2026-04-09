'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import {
  ChevronRight,
  ChevronDown,
  FileText,
  FileIcon,
  ImageIcon,
  AlertCircle,
  Plane,
  Clock,
  MapPin,
  Star,
  ZoomIn,
  X,
  Phone,
  Download,
  MessageCircle,
} from 'lucide-react'
import type { ApiProgramDetail } from '@/utilities/fetchTourProductDetails'
import { TourStickyShare } from './TourStickyShare'
import './tourDetail.css'

export type RelatedTourItem = {
  id: string
  tourTitle: string
  tourCode: string
  coverImageUrl: string
  countryName: string
  countrySlug: string
  stayDay: number
  stayNight: number
  airlineLogoUrl: string
  startPrice: number
  highlight: string
}

type TourDetailClientProps = {
  apiProgram: ApiProgramDetail
  countrySlug: string
  relatedTours?: RelatedTourItem[]
  companyInfo?: {
    companyName: string
    hotline: string
    callCenter: string
    lineLink: string
    lineOA: string
  }
  festivalNames?: string[]
  showBookingButton?: boolean
  showRelatedTours?: boolean
  showTags?: boolean
  showItinerary?: boolean
}

const formatPrice = (price?: number | null) => {
  if (price == null) return '-'
  return price.toLocaleString('th-TH')
}

/** ดาวน์โหลดไฟล์ผ่าน proxy — ใช้ hidden iframe เพื่อ force download */
const handleDownload = (fileUrl: string | null, filename: string) => {
  if (!fileUrl) return
  const proxyUrl = `/api/download/${encodeURIComponent(filename)}?url=${encodeURIComponent(fileUrl)}`

  // ใช้ <a> tag ชั่วคราว กับ blob fetch เพื่อ guarantee ชื่อไฟล์
  fetch(proxyUrl)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.blob()
    })
    .then((blob) => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      // Cleanup after a short delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }, 100)
    })
    .catch((err) => {
      console.error('[download error]', err)
      // Fallback: เปิดลิงก์ตรง
      window.open(proxyUrl, '_blank')
    })
}

export const TourDetailClient: React.FC<TourDetailClientProps> = ({
  apiProgram,
  countrySlug,
  relatedTours = [],
  companyInfo,
  festivalNames,
  showBookingButton = true,
  showRelatedTours = true,
  showTags = true,
  showItinerary = true,
}) => {
  const {
    tourTitle,
    tourCode,
    tourDescription,
    coverImageUrl,
    countryName,
    stayDay,
    stayNight,
    starHotel,
    airlineName,
    airlineLogoUrl,
    startPrice,
    discountPrice,
    originalPrice,
    pdfUrl,
    wordUrl,
    bannerUrl,
    soldout,
    highlightItems,
    destination,
    highlight,
    food,
    travelPeriods,
    itinerarySummary,
    itinerarySummaryText,
  } = apiProgram

  // Discount info
  const hasDiscount = discountPrice != null && originalPrice != null && discountPrice > 0
  const discountPercent =
    hasDiscount && originalPrice
      ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
      : 0

  // Accordion States
  const [openDescription, setOpenDescription] = useState(false)
  const [openHighlights, setOpenHighlights] = useState(true)
  const [openDestination, setOpenDestination] = useState(false)
  const [openItinerary, setOpenItinerary] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  // Close lightbox on Escape key & lock body scroll
  useEffect(() => {
    if (!lightboxOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [lightboxOpen])

  // Month Filter for travel periods
  const [selectedMonth, setSelectedMonth] = useState<string>('all')

  const availableMonths = useMemo(() => {
    const months = new Set<string>()
    travelPeriods.forEach((p) => {
      if (p.startDate) {
        const date = new Date(p.startDate)
        months.add(`${date.getMonth() + 1}-${date.getFullYear()}`)
      }
    })
    return Array.from(months)
      .sort((a, b) => {
        const [m1, y1] = a.split('-').map(Number)
        const [m2, y2] = b.split('-').map(Number)
        if (y1 !== y2) return y1 - y2
        return m1 - m2
      })
      .map((m) => {
        const [month, year] = m.split('-')
        const date = new Date(Number(year), Number(month) - 1, 1)
        const label = date.toLocaleDateString('th-TH', { month: 'short', year: '2-digit' })
        return { value: m, label }
      })
  }, [travelPeriods])

  const filteredPeriods = useMemo(() => {
    if (selectedMonth === 'all') return travelPeriods
    return travelPeriods.filter((p) => {
      if (!p.startDate) return false
      const date = new Date(p.startDate)
      const m = `${date.getMonth() + 1}-${date.getFullYear()}`
      return m === selectedMonth
    })
  }, [travelPeriods, selectedMonth])

  const formatPeriodDate = (start?: string | null, end?: string | null) => {
    const fmt = (d: string) => {
      const date = new Date(d)
      return date.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' })
    }
    if (start && end) return `${fmt(start)} - ${fmt(end)}`
    if (start) return fmt(start)
    return '-'
  }

  // Duration text
  const durationText = [stayDay ? `${stayDay} วัน` : '', stayNight ? `${stayNight} คืน` : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div className="tour-detail-page">
      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="text-muted-foreground mb-6 flex items-center gap-2 overflow-hidden text-sm text-wrap">
          <Link href="/" className="hover:text-primary whitespace-nowrap transition-colors">
            หน้าหลัก
          </Link>
          <ChevronRight className="h-4 w-4 shrink-0" />
          <Link
            href={`/intertours/${countrySlug}`}
            className="hover:text-primary whitespace-nowrap transition-colors"
          >
            {countryName}
          </Link>
          <ChevronRight className="h-4 w-4 shrink-0" />
          <span className="text-foreground truncate font-medium">{tourTitle}</span>
        </nav>

        {/* Tour Title */}
        <h1 className="mb-4 text-3xl leading-snug font-medium md:text-4xl">{tourTitle}</h1>

        {/* Tour Tags */}
        {showTags &&
          (() => {
            const allTags = [...(apiProgram.productTags || []), ...(festivalNames || [])]
            if (allTags.length === 0) return null
            return (
              <div className="tour-tags-row">
                {allTags.map((tag, i) => (
                  <span key={i} className="tour-tag-pill">
                    {tag}
                  </span>
                ))}
              </div>
            )
          })()}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Image & Content */}
          <div className="space-y-8 lg:col-span-7">
            {/* Cover Image */}
            <div className="tour-cover-wrapper bg-muted relative aspect-square overflow-hidden rounded-2xl shadow-sm">
              {coverImageUrl && (
                <img
                  src={coverImageUrl}
                  alt={tourTitle}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              {coverImageUrl && (
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="cover-zoom-btn"
                  aria-label="ขยายดูรูปเต็มจอ"
                >
                  <ZoomIn size={20} />
                </button>
              )}
            </div>

            {/* Lightbox Modal */}
            {lightboxOpen && coverImageUrl && (
              <div className="cover-lightbox" onClick={() => setLightboxOpen(false)}>
                <button
                  type="button"
                  className="cover-lightbox__close"
                  onClick={() => setLightboxOpen(false)}
                  aria-label="ปิด"
                >
                  <X size={28} />
                </button>
                <img
                  src={coverImageUrl}
                  alt={tourTitle}
                  className="cover-lightbox__img"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            {/* Section Heading: รายละเอียดโปรแกรมทัวร์ */}
            <section className="detail-section-heading">
              <div className="detail-section-heading__accent" />
              <h2 className="detail-section-heading__title">รายละเอียดโปรแกรมทัวร์</h2>
            </section>

            {/* Highlights + Food — ไฮไลท์โปรแกรมทัวร์ */}
            {((highlight && highlight.trim().length > 0) || (food && food.trim().length > 0)) && (
              <section className="detail-accordion">
                <button
                  type="button"
                  onClick={() => setOpenHighlights(!openHighlights)}
                  className={`detail-accordion__trigger ${openHighlights ? 'detail-accordion__trigger--open' : ''}`}
                >
                  <h2 className="detail-accordion__title">ไฮไลท์โปรแกรมทัวร์</h2>
                  <ChevronDown
                    className={`detail-accordion__icon ${openHighlights ? 'rotate-180' : ''}`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${openHighlights ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                  <div className="overflow-hidden">
                    <div className="detail-accordion__body">
                      {highlight && highlight.trim().length > 0 && (
                        <p className="text-base leading-relaxed whitespace-pre-line text-[#333]">
                          {highlight}
                        </p>
                      )}
                      {food && food.trim().length > 0 && (
                        <>
                          {highlight && highlight.trim().length > 0 && (
                            <div className="my-4 border-t border-dashed border-[#e0e0e0]" />
                          )}
                          <p className="mb-1 text-lg font-semibold text-[#1a8fe8]">อาหาร</p>
                          <p className="text-base leading-relaxed whitespace-pre-line text-[#333]">
                            {food}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Destination — จุดหมายปลายทาง */}
            {destination && destination.trim().length > 0 && (
              <section className="detail-accordion">
                <button
                  type="button"
                  onClick={() => setOpenDestination(!openDestination)}
                  className={`detail-accordion__trigger ${openDestination ? 'detail-accordion__trigger--open' : ''}`}
                >
                  <h2 className="detail-accordion__title">จุดหมายปลายทาง</h2>
                  <ChevronDown
                    className={`detail-accordion__icon ${openDestination ? 'rotate-180' : ''}`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${openDestination ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                  <div className="overflow-hidden">
                    <div className="detail-accordion__body">
                      <p className="text-base leading-relaxed text-[#333]">{destination}</p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Itinerary — รายละเอียดการเดินทาง */}
            {showItinerary &&
              ((Array.isArray(itinerarySummary) && itinerarySummary.length > 0) ||
                (itinerarySummaryText && itinerarySummaryText.trim().length > 0)) && (
                <section className="detail-accordion">
                  <button
                    type="button"
                    onClick={() => setOpenItinerary(!openItinerary)}
                    className={`detail-accordion__trigger ${openItinerary ? 'detail-accordion__trigger--open' : ''}`}
                  >
                    <h2 className="detail-accordion__title">รายละเอียดการเดินทาง</h2>
                    <ChevronDown
                      className={`detail-accordion__icon ${openItinerary ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${openItinerary ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                  >
                    <div className="overflow-hidden">
                      {/* ไฮไลท์การเดินทาง (Itinerary Summary Text) */}
                      {itinerarySummaryText && itinerarySummaryText.trim().length > 0 && (
                        <div className="px-5 pt-6">
                          <p className="mb-2 text-lg font-semibold text-[#1a8fe8]">
                            ไฮไลท์การเดินทาง
                          </p>
                          <p className="text-base leading-relaxed whitespace-pre-line text-[#555]">
                            {itinerarySummaryText.replace(/<[^>]*>/g, '')}
                          </p>
                          <div className="mt-5 border-t border-dashed border-[#e0e0e0]" />
                        </div>
                      )}
                      <div className="itinerary-section pt-6 pb-8">
                        {/* Day-by-day itinerary */}
                        {Array.isArray(itinerarySummary) &&
                          itinerarySummary.map((day: any, idx: number) => {
                            // Parse content to extract time entries
                            const contentHtml = day.content || ''
                            return (
                              <div key={idx} className="itinerary-day">
                                {/* Day Badge */}
                                <div className="itinerary-day__header">
                                  <span className="itinerary-day__badge">
                                    <span className="itinerary-day__badge-label">วันที่</span>
                                    <span className="itinerary-day__badge-number">{idx + 1}</span>
                                  </span>
                                  <h3 className="itinerary-day__title">
                                    {day.type || `Day ${idx + 1}`}
                                  </h3>
                                </div>
                                {/* Content */}
                                {contentHtml && (
                                  <div className="itinerary-day__content">
                                    <div
                                      className="itinerary-day__content-html"
                                      dangerouslySetInnerHTML={{ __html: contentHtml }}
                                    />
                                  </div>
                                )}
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  </div>
                </section>
              )}
          </div>

          {/* Right Column: Sticky Sidebar */}
          <div className="space-y-6 lg:col-span-5">
            <div className="sticky top-32 space-y-6">
              <div className="sidebar-card">
                <div className="sidebar-card__body">
                  {/* Badge Row: Country + Tour Code + Discount */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {countryName && <span className="sidebar-country-badge">{countryName}</span>}
                      {discountPercent > 0 && (
                        <span className="sidebar-discount-badge">-{discountPercent}%</span>
                      )}
                    </div>
                    {tourCode && (
                      <span className="sidebar-tour-code">
                        <span className="sidebar-tour-code__label">รหัสทัวร์ :</span>
                        <span className="sidebar-tour-code__value"> {tourCode}</span>
                      </span>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="sidebar-divider" />

                  {/* Airline (left) + Hotel Star (right) — Same Row */}
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: Airline */}
                    <div className="sidebar-info-block min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-1.5 text-[13px] font-medium tracking-wider text-[#9ca3af] uppercase">
                        <Plane size={14} className="shrink-0" />
                        สายการบิน
                      </div>
                      <div className="mt-1.5 flex items-center gap-3">
                        {airlineLogoUrl && (
                          <div className="relative flex h-10 w-fit max-w-[160px] shrink-0 items-center">
                            <img
                              src={airlineLogoUrl}
                              alt={airlineName || 'Airline logo'}
                              className="h-full w-auto object-contain"
                            />
                          </div>
                        )}
                        {airlineName && (
                          <>
                            <div className="h-5 w-[1.5px] shrink-0 bg-gray-200" />
                            <span className="line-clamp-1 text-[12px] leading-tight font-medium text-[#6b7280]">
                              {airlineName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Right: Hotel Star */}
                    <div className="sidebar-info-block shrink-0 text-right">
                      <div className="mb-1 flex items-center justify-end gap-1.5 text-[13px] font-medium tracking-wider text-[#9ca3af] uppercase">
                        <Star size={14} className="shrink-0" />
                        ดาวโรงแรม
                      </div>
                      <div className="mt-2.5 flex items-center justify-end gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={20}
                            className={
                              i < starHotel
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-gray-300 text-gray-300'
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Price Box (with Duration inside) */}
                  {startPrice && (
                    <div className="sidebar-price-box">
                      {/* Row 1: Labels */}
                      <div className="mb-0.5 flex items-center justify-between">
                        {/* Left: Duration Label */}
                        {(stayDay || stayNight) && (
                          <span className="flex items-center gap-1 text-xs font-medium text-[#9ca3af]">
                            ระยะเวลา
                          </span>
                        )}
                        {/* Right: Price Label */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-[#9ca3af]">ราคาเริ่มต้น</span>
                          {hasDiscount && originalPrice ? (
                            <span className="text-xs text-[#b0b5be] line-through">
                              {formatPrice(originalPrice)}.-
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Row 2: Values */}
                      <div className="flex items-end justify-between">
                        {/* Left: Duration Value */}
                        {(stayDay || stayNight) && (
                          <span className="text-xl font-semibold whitespace-nowrap text-[#1a1a1a]">
                            {durationText}
                          </span>
                        )}

                        {/* Right: Price Value */}
                        <div className="text-right">
                          {hasDiscount && discountPrice ? (
                            <span className="sidebar-price-row">
                              <span className="sidebar-price-value">
                                {formatPrice(discountPrice)}
                              </span>
                              <span className="sidebar-price-unit">บาท</span>
                            </span>
                          ) : (
                            <span className="sidebar-price-row">
                              <span className="sidebar-price-value">{formatPrice(startPrice)}</span>
                              <span className="sidebar-price-unit">บาท</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {showBookingButton ? (
                    <>
                      {soldout ? (
                        <>
                          {/* All periods sold out — show action buttons for inquiry */}
                          <div className="sidebar-action-buttons">
                            <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
                              <AlertCircle className="h-4 w-4 shrink-0" />
                              <span>ทัวร์นี้เต็มแล้ว! ติดต่อเราเพื่อสอบถามข้อมูลเพิ่มเติม</span>
                            </div>
                            {/* LINE + Call Row */}
                            <div className="sidebar-action-row">
                              {/* LINE */}
                              {companyInfo?.lineOA && companyInfo?.lineLink ? (
                                <a
                                  href={companyInfo.lineLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="sidebar-action-btn sidebar-action-btn--line"
                                >
                                  <svg
                                    className="h-[22px] w-[22px] shrink-0"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                                  </svg>
                                  <span>Line {companyInfo.lineOA}</span>
                                </a>
                              ) : (
                                <button
                                  disabled
                                  className="sidebar-action-btn sidebar-action-btn--disabled"
                                >
                                  <svg
                                    className="h-[22px] w-[22px] shrink-0"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                                  </svg>
                                  <span>Line</span>
                                </button>
                              )}

                              {/* Call */}
                              {(() => {
                                const phoneNumber =
                                  companyInfo?.callCenter || companyInfo?.hotline || ''
                                const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '')
                                if (cleanPhone) {
                                  return (
                                    <a
                                      href={`tel:${cleanPhone}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="sidebar-action-btn sidebar-action-btn--call"
                                    >
                                      <Phone size={22} />
                                      <span>ติดต่อสอบถาม</span>
                                    </a>
                                  )
                                }
                                return (
                                  <button
                                    disabled
                                    className="sidebar-action-btn sidebar-action-btn--disabled"
                                  >
                                    <Phone size={22} />
                                    <span>ติดต่อสอบถาม</span>
                                  </button>
                                )
                              })()}
                            </div>
                          </div>
                        </>
                      ) : (
                        <a
                          href="#pricing-table"
                          className="sidebar-btn-cta"
                          onClick={(e) => {
                            e.preventDefault()
                            document
                              .getElementById('pricing-table')
                              ?.scrollIntoView({ behavior: 'smooth' })
                          }}
                        >
                          <span className="sidebar-btn-cta__text">จองเลย</span>
                        </a>
                      )}

                      {/* Download Buttons — only when showBookingButton is ON */}
                      {(pdfUrl || wordUrl || bannerUrl) && (
                        <div className="sidebar-downloads">
                          <span className="sidebar-downloads__label">
                            ดาวน์โหลดรายละเอียดโปรแกรม
                          </span>
                          <div className="sidebar-downloads__grid">
                            {pdfUrl && (
                              <a
                                href={`/api/dl?fn=${tourCode}.pdf&url=${encodeURIComponent(pdfUrl)}`}
                                download={`${tourCode}.pdf`}
                                className="sidebar-download-btn"
                              >
                                <FileText size={16} /> PDF
                              </a>
                            )}
                            {wordUrl && (
                              <a
                                href={`/api/dl?fn=${tourCode}.docx&url=${encodeURIComponent(wordUrl)}`}
                                download={`${tourCode}.docx`}
                                className="sidebar-download-btn"
                              >
                                <FileIcon size={16} /> Word
                              </a>
                            )}
                            {bannerUrl && (
                              <a
                                href={`/api/dl?fn=${tourCode}-banner.jpg&url=${encodeURIComponent(bannerUrl)}`}
                                download={`${tourCode}-banner.jpg`}
                                className="sidebar-download-btn"
                              >
                                <ImageIcon size={16} /> Banner
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {soldout && (
                        <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <span>ทัวร์นี้เต็มแล้ว! ติดต่อเราเพื่อสอบถามข้อมูลเพิ่มเติม</span>
                        </div>
                      )}
                      <div className="sidebar-action-buttons">
                        {/* Download PDF */}
                        {pdfUrl ? (
                          <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="sidebar-action-btn sidebar-action-btn--download"
                          >
                            <Download size={22} />
                            <span>ดาวน์โหลดโปรแกรมทัวร์</span>
                          </a>
                        ) : (
                          <button
                            disabled
                            className="sidebar-action-btn sidebar-action-btn--disabled"
                          >
                            <Download size={22} />
                            <span>ดาวน์โหลดโปรแกรมทัวร์</span>
                          </button>
                        )}

                        {/* LINE + Call Row */}
                        <div className="sidebar-action-row">
                          {/* LINE */}
                          {companyInfo?.lineOA && companyInfo?.lineLink ? (
                            <a
                              href={companyInfo.lineLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="sidebar-action-btn sidebar-action-btn--line"
                            >
                              <svg
                                className="h-[22px] w-[22px] shrink-0"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                              </svg>
                              <span>Line {companyInfo.lineOA}</span>
                            </a>
                          ) : (
                            <button
                              disabled
                              className="sidebar-action-btn sidebar-action-btn--disabled"
                            >
                              <svg
                                className="h-[22px] w-[22px] shrink-0"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                              </svg>
                              <span>Line</span>
                            </button>
                          )}

                          {/* Call */}
                          {(() => {
                            const phoneNumber =
                              companyInfo?.callCenter || companyInfo?.hotline || ''
                            const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '')
                            if (cleanPhone) {
                              return (
                                <a
                                  href={`tel:${cleanPhone}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="sidebar-action-btn sidebar-action-btn--call"
                                >
                                  <Phone size={22} />
                                  <span>โทรจองทัวร์นี้</span>
                                </a>
                              )
                            }
                            return (
                              <button
                                disabled
                                className="sidebar-action-btn sidebar-action-btn--disabled"
                              >
                                <Phone size={22} />
                                <span>โทรจองทัวร์นี้</span>
                              </button>
                            )
                          })()}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Travel Periods Full Width Section */}
        {travelPeriods.length > 0 && (
          <section
            id="pricing-table"
            className="relative mt-12 py-8 md:py-10"
            style={{
              marginLeft: 'calc(-50vw + 50%)',
              marginRight: 'calc(-50vw + 50%)',
              paddingLeft: 'calc(50vw - 50%)',
              paddingRight: 'calc(50vw - 50%)',
            }}
          >
            <div className="absolute inset-0 bg-[#f4f9ff]" />
            <div className="relative z-10">
              <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <h2 className="mb-1 text-2xl font-medium text-black">ตารางเวลาเดินทางและราคา</h2>
                  <p className="text-sm text-[#868686]">
                    ตรวจสอบที่นั่งว่างและราคาสำหรับช่วงเวลาที่คุณต้องการ
                  </p>
                </div>

                {availableMonths.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedMonth('all')}
                      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${selectedMonth === 'all' ? 'bg-primary text-white' : 'hover:border-primary hover:text-primary border border-[#d0d0d0] bg-white text-[#868686]'}`}
                    >
                      ทั้งหมด
                    </button>
                    {availableMonths.map((m) => (
                      <button
                        key={m.value}
                        onClick={() => setSelectedMonth(m.value)}
                        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${selectedMonth === m.value ? 'bg-primary text-white' : 'hover:border-primary hover:text-primary border border-[#d0d0d0] bg-white text-[#868686]'}`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile: Card Layout */}
              <div className="space-y-4 md:hidden">
                {filteredPeriods.map((p, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-[#eee] bg-white p-5 shadow-sm"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Plane className="text-primary h-4 w-4" />
                        <span className="text-sm font-medium text-black">
                          {formatPeriodDate(p.startDate, p.endDate)}
                        </span>
                      </div>
                      {p.airlineIconUrl ? (
                        <img
                          src={p.airlineIconUrl}
                          alt={p.airlineCode || 'airline'}
                          className="h-7 w-auto"
                        />
                      ) : null}
                    </div>
                    <div className="mb-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                      <div>
                        <span className="block text-xs text-[#868686]">ผู้ใหญ่ (พักคู่)</span>
                        <span className="text-[#555]">{formatPrice(p.priceAdultTwin)}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-[#868686]">ผู้ใหญ่ (พักเดี่ยว)</span>
                        <span className="text-[#555]">{formatPrice(p.priceAdultSingle)}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-[#868686]">ผู้ใหญ่ (พักสาม)</span>
                        <span className="text-[#555]">{formatPrice(p.priceAdultTriple)}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-[#868686]">เด็ก (2-20 ปี)</span>
                        <span className="text-[#555]">{formatPrice(p.priceChildWithBed)}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-[#868686]">เด็ก (ไม่มีเตียง)</span>
                        <span className="text-[#555]">{formatPrice(p.priceChildNoBed)}</span>
                      </div>
                    </div>
                    {showBookingButton && (
                      <div className="border-t border-[#f0f0f0] pt-3">
                        {p.isSoldOut ? (
                          <a
                            href={companyInfo?.lineLink || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center justify-center gap-1 rounded-lg bg-[#06c755] py-2.5 text-center text-[13px] font-medium text-white transition-colors hover:bg-[#05b34c]"
                          >
                            <svg
                              className="h-[14px] w-[14px] shrink-0"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                            </svg>
                            ติดต่อสอบถาม
                          </a>
                        ) : (
                          <a
                            href={`/intertours/${countrySlug}/${tourCode}/booking?period=${p.id}`}
                            className="bg-primary hover:bg-primary/90 block w-full rounded-lg py-2.5 text-center text-sm font-medium text-white transition-colors"
                          >
                            จองเลย
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {filteredPeriods.length === 0 && (
                  <div className="py-12 text-center text-[#868686]">
                    ไม่พบช่วงเวลาเดินทางในเดือนที่เลือก
                  </div>
                )}
              </div>

              {/* Desktop: Table Layout */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#d0d0d0]/50 text-sm text-[#868686]">
                      <th className="pr-4 pb-4 pl-2 font-medium">ช่วงเวลาเดินทาง</th>
                      <th className="px-3 pb-4 font-medium">สายการบิน</th>
                      <th className="px-3 pb-4 font-medium">
                        ผู้ใหญ่
                        <br />
                        <span className="text-xs font-normal opacity-70">(พักคู่)</span>
                      </th>
                      <th className="px-3 pb-4 font-medium">
                        ผู้ใหญ่
                        <br />
                        <span className="text-xs font-normal opacity-70">(พักเดี่ยว)</span>
                      </th>
                      <th className="px-3 pb-4 font-medium">
                        ผู้ใหญ่
                        <br />
                        <span className="text-xs font-normal opacity-70">(พักสาม)</span>
                      </th>
                      <th className="px-3 pb-4 font-medium">
                        เด็ก
                        <br />
                        <span className="text-xs font-normal opacity-70">(2-20 ปี)</span>
                      </th>
                      <th className="px-3 pb-4 font-medium">
                        เด็ก
                        <br />
                        <span className="text-xs font-normal opacity-70">(ไม่มีเตียง)</span>
                      </th>

                      <th className="px-3 pb-4 text-center font-medium">กรุ๊ปไซส์</th>
                      {showBookingButton && (
                        <th className="pb-4 pl-4 text-right font-medium">ทำรายการ</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d0d0d0]/30">
                    {filteredPeriods.map((p, idx) => (
                      <tr key={idx} className="group transition-colors hover:bg-white/50">
                        <td className="py-4 pr-4 pl-2 font-medium whitespace-nowrap text-black">
                          {formatPeriodDate(p.startDate, p.endDate)}
                        </td>
                        <td className="px-3 py-4">
                          {p.airlineIconUrl ? (
                            <img
                              src={p.airlineIconUrl}
                              alt={p.airlineCode || 'airline'}
                              className="h-7 w-auto"
                              title={p.airlineCode || ''}
                            />
                          ) : p.airlineCode ? (
                            <span className="text-sm text-[#555]">{p.airlineCode}</span>
                          ) : (
                            <span className="text-sm text-[#ccc]">-</span>
                          )}
                        </td>
                        <td className="px-3 py-4 text-[#555]">{formatPrice(p.priceAdultTwin)}</td>
                        <td className="px-3 py-4 text-[#555]">{formatPrice(p.priceAdultSingle)}</td>
                        <td className="px-3 py-4 text-[#555]">{formatPrice(p.priceAdultTriple)}</td>
                        <td className="px-3 py-4 text-[#555]">
                          {formatPrice(p.priceChildWithBed)}
                        </td>
                        <td className="px-3 py-4 text-[#555]">{formatPrice(p.priceChildNoBed)}</td>

                        <td className="px-3 py-4 text-center text-[#555]">{p.groupSize ?? '-'}</td>
                        {showBookingButton && (
                          <td className="py-4 pl-4 text-right">
                            {p.isSoldOut ? (
                              <a
                                href={companyInfo?.lineLink || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex w-[120px] items-center justify-center gap-1 rounded-lg bg-[#06c755] px-2 py-2 text-center text-[13px] font-medium whitespace-nowrap text-white transition-colors hover:bg-[#05b34c]"
                              >
                                <svg
                                  className="h-[14px] w-[14px] shrink-0"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                                </svg>
                                ติดต่อสอบถาม
                              </a>
                            ) : (
                              <a
                                href={`/intertours/${countrySlug}/${tourCode}/booking?period=${p.id}`}
                                className="bg-primary hover:bg-primary/90 inline-block w-[120px] rounded-lg px-4 py-2 text-center text-sm font-medium text-white transition-colors"
                              >
                                จองเลย
                              </a>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}

                    {filteredPeriods.length === 0 && (
                      <tr>
                        <td
                          colSpan={showBookingButton ? 9 : 8}
                          className="py-12 text-center text-[#868686]"
                        >
                          ไม่พบช่วงเวลาเดินทางในเดือนที่เลือก
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Related Tours Section */}
        {showRelatedTours && relatedTours.length > 0 && (
          <section className="related-tours-section mt-12 pb-12">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="mb-1 text-2xl font-medium text-black">ทัวร์ที่คุณอาจสนใจ</h2>
                <p className="text-sm text-[#868686]">
                  โปรแกรมทัวร์อื่นๆ ใน{countryName}ที่น่าสนใจ
                </p>
              </div>
              <Link
                href={`/intertours/${countrySlug}`}
                className="text-primary hover:text-primary/80 hidden items-center gap-1 text-sm font-medium whitespace-nowrap transition-colors md:inline-flex"
              >
                ดูทั้งหมด <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {relatedTours.map((tour, idx) => {
                const duration = [
                  tour.stayDay ? `${tour.stayDay} วัน` : '',
                  tour.stayNight ? `${tour.stayNight} คืน` : '',
                ]
                  .filter(Boolean)
                  .join(' ')

                return (
                  <Link
                    key={tour.id + idx}
                    href={`/intertours/${tour.countrySlug || countrySlug}/${tour.tourCode}`}
                    className="related-tour-card group"
                  >
                    {/* Image */}
                    <div className="related-tour-card__image">
                      {tour.coverImageUrl ? (
                        <img
                          src={tour.coverImageUrl}
                          alt={tour.tourTitle}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50">
                          <MapPin className="h-8 w-8 text-blue-300" />
                        </div>
                      )}
                      {/* Gradient overlay */}
                      <div className="related-tour-card__overlay" />
                      {/* Tour Code Badge */}
                      <span className="related-tour-card__badge">{tour.tourCode}</span>
                    </div>

                    {/* Content */}
                    <div className="related-tour-card__content">
                      <h3 className="related-tour-card__title">{tour.tourTitle}</h3>

                      <div className="related-tour-card__meta">
                        {duration && (
                          <span className="related-tour-card__meta-item">
                            <Clock className="h-3.5 w-3.5" />
                            {duration}
                          </span>
                        )}
                        {tour.airlineLogoUrl && (
                          <img src={tour.airlineLogoUrl} alt="airline" className="h-4 w-auto" />
                        )}
                      </div>

                      <div className="related-tour-card__footer">
                        <div>
                          <span className="text-xs text-[#868686]">เริ่มต้น</span>
                          <div className="related-tour-card__price">
                            {formatPrice(tour.startPrice)}
                            <span className="related-tour-card__price-unit">บาท</span>
                          </div>
                        </div>
                        <span className="related-tour-card__cta">ดูรายละเอียด</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Mobile: View All Link */}
            <div className="mt-6 text-center md:hidden">
              <Link
                href={`/intertours/${countrySlug}`}
                className="text-primary hover:text-primary/80 inline-flex items-center gap-1 font-medium transition-colors"
              >
                ดูทัวร์ทั้งหมด <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        )}
      </div>
      <TourStickyShare
        tourInfo={{
          tourTitle,
          tourCode,
          startPrice,
          airlineName: apiProgram.airlineName ?? '',
          pdfUrl: pdfUrl ?? '',
          stayDay,
          stayNight,
          travelPeriods: travelPeriods ?? [],
        }}
        companyInfo={companyInfo}
      />
    </div>
  )
}
