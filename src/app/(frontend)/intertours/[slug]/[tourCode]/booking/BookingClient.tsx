'use client'

import React, { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ChevronRight,
  Minus,
  Plus,
  Plane,
  MapPin,
  Calendar,
  Clock,
  Users,
  CreditCard,
  ArrowLeft,
  Send,
  Phone,
  MessageCircle,
  AlertCircle,
} from 'lucide-react'
import Turnstile from 'react-turnstile'
import type { ApiProgramDetail } from '@/utilities/fetchTourProductDetails'
import './booking.css'

type BookingClientProps = {
  apiProgram: ApiProgramDetail
  countrySlug: string
  companyInfo?: any
}

type TravelerType = {
  type: string
  label: string
  pricePerPerson: number
  qty: number
}

const formatNumber = (n: number) => n.toLocaleString('th-TH')
const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}

export const BookingClient: React.FC<BookingClientProps> = ({ apiProgram, countrySlug, companyInfo }) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const {
    tourTitle,
    tourCode,
    countryName,
    coverImageUrl,
    airlineLogoUrl,
    stayDay,
    stayNight,
    travelPeriods,
  } = apiProgram

  // Travel periods
  const periods = travelPeriods || []

  // Get initial period from URL query param (from TourDetail "จองเลย" button)
  const initialPeriodId = searchParams.get('period') || periods[0]?.id || ''

  // State
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(initialPeriodId)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [isBookingFailed, setIsBookingFailed] = useState(false)
  const [isQrError, setIsQrError] = useState(false)

  // Form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string>('')

  // Selected period
  const selectedPeriod = useMemo(
    () => periods.find((p) => p.id === selectedPeriodId),
    [periods, selectedPeriodId],
  )

  // Build traveler types from selected period
  const initialTravelers = useMemo(() => {
    if (!selectedPeriod) return []
    const list: TravelerType[] = []
    if (selectedPeriod.priceAdultTwin)
      list.push({
        type: 'adultTwin',
        label: 'ผู้ใหญ่ (พักห้องคู่)',
        pricePerPerson: selectedPeriod.priceAdultTwin,
        qty: 0,
      })
    if (selectedPeriod.priceAdultSingle)
      list.push({
        type: 'adultSingle',
        label: 'ผู้ใหญ่ (พักเดี่ยว)',
        pricePerPerson: selectedPeriod.priceAdultSingle,
        qty: 0,
      })
    if (selectedPeriod.priceAdultTriple)
      list.push({
        type: 'adultTriple',
        label: 'ผู้ใหญ่ (พักสาม)',
        pricePerPerson: selectedPeriod.priceAdultTriple,
        qty: 0,
      })
    if (selectedPeriod.priceChildWithBed)
      list.push({
        type: 'childWithBed',
        label: 'เด็ก (2-20 ปี)',
        pricePerPerson: selectedPeriod.priceChildWithBed,
        qty: 0,
      })
    if (selectedPeriod.priceChildNoBed)
      list.push({
        type: 'childNoBed',
        label: 'เด็ก (ไม่มีเตียง)',
        pricePerPerson: selectedPeriod.priceChildNoBed,
        qty: 0,
      })
    return list
  }, [selectedPeriod])

  const [travelers, setTravelers] = useState<TravelerType[]>(initialTravelers)

  // Reset travelers when period changes
  React.useEffect(() => {
    setTravelers(initialTravelers)
  }, [initialTravelers])

  // Suppress unhandled promise rejections that are raw Events
  // (typically caused by 3rd party scripts like Turnstile failing to load due to ad-blockers)
  React.useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      if (event.reason instanceof Event) {
        event.preventDefault()
      }
    }
    window.addEventListener('unhandledrejection', handleRejection)
    return () => window.removeEventListener('unhandledrejection', handleRejection)
  }, [])

  const updateQty = useCallback(
    (type: string, delta: number) => {
      setTravelers((prev) => {
        const currentTotal = prev.reduce((s, t) => s + t.qty, 0)
        const maxSeats = selectedPeriod?.availableSeats
        // Block increase if at capacity
        if (delta > 0 && maxSeats != null && currentTotal >= maxSeats) return prev
        return prev.map((t) => (t.type === type ? { ...t, qty: Math.max(0, t.qty + delta) } : t))
      })
    },
    [selectedPeriod],
  )

  // Totals
  const totalTravelers = travelers.reduce((s, t) => s + t.qty, 0)
  const totalAmount = travelers.reduce((s, t) => s + t.qty * t.pricePerPerson, 0)
  const maxSeats = selectedPeriod?.availableSeats
  const isAtCapacity = maxSeats != null && totalTravelers >= maxSeats

  // Duration text
  const durationText = [stayDay ? `${stayDay} วัน` : '', stayNight ? `${stayNight} คืน` : '']
    .filter(Boolean)
    .join(' ')

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
      setFormError('กรุณากรอกข้อมูลผู้เดินทางให้ครบถ้วน')
      return
    }

    if (!/^\d{9,10}$/.test(phone.trim())) {
      setFormError('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (ตัวเลข 9-10 หลัก)')
      return
    }

    if (totalTravelers === 0) {
      setFormError('กรุณาเลือกจำนวนผู้เดินทางอย่างน้อย 1 ท่าน')
      return
    }

    setIsSubmitting(true)

    try {
      const hasTurnstile = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
      if (hasTurnstile && !captchaToken) {
        setFormError('กรุณายืนยันตัวตน (CAPTCHA)')
        setIsSubmitting(false)
        return
      }
      const travelDate = selectedPeriod
        ? `${formatDate(selectedPeriod.startDate)} - ${formatDate(selectedPeriod.endDate)}`
        : ''

      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourTitle: tourTitle,
          tourCode: tourCode || '',
          countryName: countryName || '',
          airlineName: selectedPeriod?.airlineCode || '',
          travelDate,
          duration: durationText,
          coverImageUrl: coverImageUrl || '',
          periodId: selectedPeriodId,
          interTourSlug: countrySlug,
          travelers: travelers
            .filter((t) => t.qty > 0)
            .map((t) => ({
              type: t.type,
              label: t.label,
              qty: t.qty,
              pricePerPerson: t.pricePerPerson,
              total: t.qty * t.pricePerPerson,
            })),
          depositPerPerson: selectedPeriod?.deposit ? String(selectedPeriod.deposit) : '',
          paymentDeadline: selectedPeriod?.depositDate || '',
          supplierName: apiProgram.supplierName || '',
          totalAmount,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          specialRequests: specialRequests.trim(),
          captchaToken,
        }),
      })

      const data = await res.json()

      if (!data.success) {
        setFormError(data.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่')
        setIsSubmitting(false)
        setIsBookingFailed(true)
        return
      }

      // Navigate to thank you page
      router.push(`/intertours/${countrySlug}/${tourCode}/booking/thank-you?pnr=${data.pnrCode}`)
    } catch (err: any) {
      setFormError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่')
      setIsSubmitting(false)
      setIsBookingFailed(true)
    }
  }

  if (isBookingFailed) {
    return (
      <div className="booking-page animate-in fade-in duration-500">
        <div className="booking-container flex min-h-[70vh] flex-col items-center justify-center p-4 py-12 md:p-8 text-center">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] ring-1 ring-gray-100 dark:bg-gray-900 dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] dark:ring-gray-800">
            {/* Top Decoration Gradient */}
            <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-red-500 via-orange-400 to-red-500 opacity-80" />
            
            {/* Icon Header */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 ring-8 ring-red-50/50 dark:bg-red-500/10 dark:ring-red-500/5">
              <AlertCircle className="h-10 w-10 text-red-500" strokeWidth={2} />
            </div>

            <h2 className="mb-3 text-2xl font-bold tracking-tight text-gray-900 dark:text-white md:text-3xl">
              ขออภัย การส่งใบจองถูกขัดจังหวะ
            </h2>
            <p className="mb-8 font-medium text-gray-500 dark:text-gray-400">
              ระบบไม่สามารถส่งข้อมูลได้สำเร็จในขณะนี้ กรุณาติดต่อชำระเงินหรือสำรองที่นั่งกับเจ้าหน้าที่ของเราได้ตามช่องทางด้านล่าง
            </p>
            
            <div className="mb-8 overflow-hidden rounded-xl bg-gray-50/80 ring-1 ring-gray-100/80 dark:bg-gray-800/50 dark:ring-gray-700/50">
              <div className="p-6">
                <div className="mb-8 flex flex-col items-center">
                  <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold tracking-wider text-gray-600 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700">
                    SCAN QR CODE
                  </span>
                  <div className="rounded-2xl bg-white p-3 shadow-md ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10">
                    {companyInfo?.qrCode && typeof companyInfo.qrCode === 'object' && companyInfo.qrCode.url && !isQrError ? (
                      <img 
                        src={companyInfo.qrCode.url} 
                        alt="Contact QR Code" 
                        className="h-44 w-44 object-cover rounded-xl"
                        onError={() => setIsQrError(true)}
                      />
                    ) : (
                      <div className="flex h-44 w-44 flex-col items-center justify-center rounded-xl bg-gray-100 border border-dashed border-gray-300 text-gray-400 dark:bg-gray-700 dark:border-gray-600">
                        <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                        <span className="text-xs text-center px-4">รูปภาพ QR Code<br/>ไม่สามารถแสดงได้</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3 text-left">
                  {companyInfo?.lineOA && (
                    <div className="group flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md dark:bg-gray-800 dark:ring-gray-700">
                      <div className="flex items-center gap-4">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#00B900]/10 text-[#00B900] transition-transform group-hover:scale-110">
                          <MessageCircle className="h-6 w-6" />
                        </span>
                        <div>
                          <p className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">LINE OFFICIAL</p>
                          {companyInfo?.lineLink && companyInfo.lineLink !== '#' ? (
                            <a href={companyInfo.lineLink} target="_blank" rel="noreferrer" className="text-lg font-bold text-[#00B900] hover:underline">
                              {companyInfo.lineOA}
                            </a>
                          ) : (
                            <span className="text-lg font-bold text-gray-900 dark:text-white">{companyInfo.lineOA}</span>
                          )}
                        </div>
                      </div>
                      {companyInfo?.lineLink && companyInfo.lineLink !== '#' && (
                        <a href={companyInfo.lineLink} target="_blank" rel="noreferrer" className="shrink-0 rounded-full bg-gray-50 p-2 text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-gray-100 hover:text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                          <ArrowLeft className="h-4 w-4 rotate-[135deg]" />
                        </a>
                      )}
                    </div>
                  )}
                  
                  {companyInfo?.callCenter && companyInfo.callCenter !== '#' && (
                    <div className="group flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md dark:bg-gray-800 dark:ring-gray-700">
                      <div className="flex items-center gap-4">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-500 transition-transform group-hover:scale-110 dark:bg-blue-500/10 dark:text-blue-400">
                          <Phone className="h-6 w-6" />
                        </span>
                        <div>
                          <p className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">CALL CENTER</p>
                          <a href={`tel:${companyInfo.callCenter.replace(/\s+/g, '')}`} className="text-lg font-bold text-blue-600 hover:underline dark:text-blue-400">
                            {companyInfo.callCenter}
                          </a>
                        </div>
                      </div>
                      <a href={`tel:${companyInfo.callCenter.replace(/\s+/g, '')}`} className="shrink-0 rounded-full bg-gray-50 p-2 text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-gray-100 hover:text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                        <Phone className="h-4 w-4" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button 
              type="button" 
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-4 px-6 text-sm font-semibold text-white transition-all hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 dark:focus:ring-white/20"
              onClick={() => {
                setIsBookingFailed(false)
                setFormError('')
              }}
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              กลับไปกรอกใบจองใหม่อีกครั้ง
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="booking-page">
      <div className="booking-container">
        {/* Breadcrumbs */}
        <nav className="booking-breadcrumbs">
          <Link href="/">หน้าหลัก</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/intertours/${countrySlug}`}>{countryName}</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/intertours/${countrySlug}/${tourCode}`}>{tourTitle}</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="active">จองทัวร์</span>
        </nav>

        {/* Page Title */}
        <div className="booking-page-title">
          <h1 className="text-3xl font-medium md:text-4xl">จองทัวร์</h1>
          <p>กรุณากรอกข้อมูลเพื่อดำเนินการจองทัวร์</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="booking-grid">
            {/* Left Column - Main Content */}
            <div className="booking-main">
              {/* Section 1: Tour Info */}
              <section className="booking-section">
                <div className="section-header">
                  <Plane className="section-icon" />
                  <h2>รายละเอียดทัวร์</h2>
                </div>
                <div className="tour-info-card">
                  {coverImageUrl && (
                    <div className="tour-info-image">
                      <img
                        src={coverImageUrl}
                        alt={tourTitle}
                        className="tour-info-img"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <div className="tour-info-details">
                    <h3>{tourTitle}</h3>
                    <div className="tour-info-meta">
                      {tourCode && (
                        <span className="meta-tag">
                          <span className="meta-label">รหัสทัวร์</span>
                          {tourCode}
                        </span>
                      )}
                      {countryName && (
                        <span className="meta-tag">
                          <MapPin className="h-3.5 w-3.5" />
                          {countryName}
                        </span>
                      )}
                      {durationText && (
                        <span className="meta-tag">
                          <Clock className="h-3.5 w-3.5" />
                          {durationText}
                        </span>
                      )}
                      {airlineLogoUrl && (
                        <span className="meta-tag">
                          <Plane className="h-3.5 w-3.5" />
                          <img src={airlineLogoUrl} alt="airline" className="h-4 w-auto" />
                        </span>
                      )}
                    </div>

                    {/* Selected Period */}
                    <div className="period-selection">
                      <div className="mb-3 flex items-center gap-3">
                        <label className="field-label !mb-0">
                          <Calendar className="h-4 w-4" />
                          ช่วงเวลาเดินทางที่เลือก
                        </label>
                        <Link
                          href={`/intertours/${countrySlug}/${tourCode}`}
                          className="text-primary text-sm hover:underline"
                        >
                          เปลี่ยนช่วงเวลา
                        </Link>
                      </div>
                      <div className="period-grid">
                        {selectedPeriod ? (
                          <div className="period-card selected cursor-default">
                            <div className="period-dates">
                              {selectedPeriod.startDate ? formatDate(selectedPeriod.startDate) : ''}{' '}
                              - {selectedPeriod.endDate ? formatDate(selectedPeriod.endDate) : ''}
                            </div>
                            {selectedPeriod.availableSeats != null && (
                              <div
                                className={`period-seats ${selectedPeriod.availableSeats === 0 ? 'sold-out' : ''}`}
                              >
                                {selectedPeriod.availableSeats === 0
                                  ? 'เต็ม'
                                  : `เหลือ ${selectedPeriod.availableSeats} ที่นั่ง`}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="py-2 text-sm text-red-500">
                            ไม่พบข้อมูลรอบเดินทางที่เลือก กรุณากลับไปเลือกใหม่
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 2: Travelers */}
              <section className="booking-section">
                <div className="section-header">
                  <Users className="section-icon" />
                  <h2>เลือกจำนวนผู้เดินทาง</h2>
                </div>
                <div className="traveler-table">
                  <div className="traveler-header">
                    <span>ห้องพัก / ประเภท</span>
                    <span>ราคา/ท่าน</span>
                    <span>จำนวน</span>
                    <span>รวม</span>
                  </div>
                  {travelers.map((t) => (
                    <div key={t.type} className="traveler-row">
                      <span className="traveler-label">{t.label}</span>
                      <span className="traveler-price">{formatNumber(t.pricePerPerson)}</span>
                      <div className="traveler-qty">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => updateQty(t.type, -1)}
                          disabled={t.qty === 0}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="qty-value">{t.qty}</span>
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => updateQty(t.type, 1)}
                          disabled={isAtCapacity}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="traveler-total">
                        {formatNumber(t.qty * t.pricePerPerson)} <small>บาท</small>
                      </span>
                    </div>
                  ))}
                </div>
                {isAtCapacity && (
                  <div className="capacity-warning">
                    ⚠️ เลือกครบจำนวนที่นั่งสูงสุดแล้ว ({maxSeats} ที่นั่ง)
                  </div>
                )}
                {maxSeats != null && !isAtCapacity && totalTravelers > 0 && (
                  <div className="capacity-info">
                    เหลือที่นั่งอีก {maxSeats - totalTravelers} จาก {maxSeats} ที่นั่ง
                  </div>
                )}
              </section>

              {/* Section 3: Traveler Info */}
              <section className="booking-section">
                <div className="section-header">
                  <CreditCard className="section-icon" />
                  <h2>ข้อมูลผู้จอง</h2>
                </div>
                <div className="form-grid">
                  <div className="form-field">
                    <label>
                      ชื่อ <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="กรอกชื่อ"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>
                      นามสกุล <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="กรอกนามสกุล"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>
                      อีเมล <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>
                      เบอร์โทรศัพท์ <span className="required">*</span>
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '')
                        if (digits.length <= 10) setPhone(digits)
                      }}
                      maxLength={10}
                      placeholder="08X-XXX-XXXX"
                      required
                    />
                  </div>
                  <div className="form-field full-width">
                    <label>ความต้องการพิเศษ</label>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="เช่น อาหารพิเศษ, ความต้องการด้านสุขภาพ ฯลฯ"
                      rows={3}
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column - Summary Sidebar */}
            <aside className="booking-sidebar">
              <div className="sidebar-sticky">
                <div className="summary-card">
                  <h3>สรุปรายละเอียด</h3>

                  <div className="summary-row">
                    <span>ค่าธรรมเนียมการจอง</span>
                    <span className="text-green">ฟรี</span>
                  </div>

                  {selectedPeriod && selectedPeriod.deposit > 0 && (
                    <>
                      <div className="summary-row">
                        <span>เงินมัดจำ/ท่าน</span>
                        <span>{formatNumber(selectedPeriod.deposit)} บาท</span>
                      </div>
                      {totalTravelers > 0 && (
                        <div className="summary-row">
                          <span>มัดจำรวม ({totalTravelers} ท่าน)</span>
                          <span className="text-red">
                            {formatNumber(selectedPeriod.deposit * totalTravelers)} บาท
                          </span>
                        </div>
                      )}
                      {selectedPeriod.depositDate && (
                        <div className="summary-row">
                          <span>ชำระมัดจำก่อน</span>
                          <span style={{ fontWeight: 600, color: '#e53e3e' }}>
                            {selectedPeriod.depositDate}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  <div className="summary-divider" />

                  {travelers
                    .filter((t) => t.qty > 0)
                    .map((t) => (
                      <div key={t.type} className="summary-row">
                        <span>
                          {t.label} ×{t.qty}
                        </span>
                        <span>{formatNumber(t.qty * t.pricePerPerson)} บาท</span>
                      </div>
                    ))}

                  {totalTravelers === 0 && (
                    <div className="summary-empty">กรุณาเลือกจำนวนผู้เดินทาง</div>
                  )}

                  <div className="summary-divider" />

                  <div className="summary-total">
                    <span>รวมสุทธิ</span>
                    <span className="total-amount">
                      {formatNumber(totalAmount)} <small>บาท</small>
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                {formError && <div className="form-error">{formError}</div>}

                <div className="action-buttons">
                  {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                    <div className="mb-4 flex min-h-[65px] w-full justify-center">
                      <Turnstile
                        sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                        onVerify={(token) => {
                          setCaptchaToken(token)
                          setFormError('')
                        }}
                        onError={() => setFormError('ยืนยันตัวตนผิดพลาด กรุณาลองใหม่')}
                        onExpire={() => setCaptchaToken('')}
                      />
                    </div>
                  )}
                  <Link href={`/intertours/${countrySlug}/${tourCode}`} className="btn-back">
                    <ArrowLeft className="h-4 w-4" />
                    กลับไปดูรายละเอียด
                  </Link>
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={isSubmitting || totalTravelers === 0}
                  >
                    {isSubmitting ? (
                      <>กำลังส่ง...</>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        ส่งใบจอง
                      </>
                    )}
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </div>
  )
}
