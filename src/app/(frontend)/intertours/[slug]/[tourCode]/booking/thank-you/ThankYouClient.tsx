'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronRight,
  Plane,
  MapPin,
  Calendar,
  Clock,
  Home,
  Mail,
  User,
  ReceiptText,
} from 'lucide-react'
import '../booking.css'

type TravelerItem = {
  type: string
  label: string
  qty: number
  pricePerPerson: number
  total: number
}

type ThankYouClientProps = {
  booking: any
  slug: string
  tourCode: string
}

const formatNumber = (n: number) => n.toLocaleString('th-TH')

export const ThankYouClient: React.FC<ThankYouClientProps> = ({ booking, slug, tourCode }) => {
  const travelers: TravelerItem[] = booking.travelers || []
  const activeTravelers = travelers.filter((t) => t.qty > 0)
  const totalTravelers = activeTravelers.reduce((s: number, t: TravelerItem) => s + t.qty, 0)
  const depositNum = booking.depositPerPerson
    ? parseInt(String(booking.depositPerPerson).replace(/,/g, ''), 10) || 0
    : 0
  const totalDeposit = depositNum * totalTravelers

  return (
    <div className="ty-page">
      <div className="ty-container">
        {/* Breadcrumbs */}
        <nav className="booking-breadcrumbs">
          <Link href="/">หน้าหลัก</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/intertours/${slug}/${tourCode}`}>{booking.tourTitle}</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="active">Thank You</span>
        </nav>

        {/* Main Grid: 2 columns on desktop */}
        <div className="ty-grid">
          {/* Left Column — Info */}
          <div className="ty-left">
            <div className="ty-info-header">
              <h1>รายละเอียดการจอง</h1>
              <p className="ty-company">WOW. WE on WEB</p>
              <p className="ty-thankyou-text">ขอบคุณที่ใช้บริการจองทัวร์</p>
            </div>

            {/* Email notification banner */}
            <div className="ty-email-banner">
              <div className="ty-email-icon">
                <Mail className="text-primary h-8 w-8" />
              </div>
              <div>
                <p className="ty-email-title">เราจะส่งรายละเอียดการจองเพิ่มเติมให้คุณ</p>
                <p className="ty-email-address">{booking.email}</p>
                <p className="ty-email-note">
                  คุณจะได้รับอีเมลยืนยันภายในไม่กี่นาที
                  <br />
                  กรุณาตรวจสอบในกล่อง Inbox หรือ Spam ของคุณ
                </p>
              </div>
            </div>

            {/* Booker Info Card */}
            <div className="ty-section">
              <h3>
                <User className="text-primary h-5 w-5" /> ข้อมูลผู้จอง
              </h3>
              <div className="ty-info-grid">
                <div className="ty-info-item">
                  <span className="ty-info-label">ชื่อผู้จอง</span>
                  <span className="ty-info-value">
                    {booking.firstName} {booking.lastName}
                  </span>
                </div>
                <div className="ty-info-item">
                  <span className="ty-info-label">เบอร์โทร</span>
                  <span className="ty-info-value">{booking.phone}</span>
                </div>
                <div className="ty-info-item">
                  <span className="ty-info-label">อีเมล</span>
                  <span className="ty-info-value">{booking.email}</span>
                </div>
                <div className="ty-info-item">
                  <span className="ty-info-label">วันเดินทาง</span>
                  <span className="ty-info-value">{booking.travelDate}</span>
                </div>
                {booking.specialRequests && (
                  <div className="ty-info-item full-span">
                    <span className="ty-info-label">ความต้องการพิเศษ</span>
                    <span className="ty-info-value">{booking.specialRequests}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price Summary */}
            <div className="ty-section">
              <h3>
                <ReceiptText className="text-primary h-5 w-5" /> รายละเอียดราคา
              </h3>
              <div className="ty-price-table">
                <div className="ty-price-header">
                  <span>ประเภท</span>
                  <span>จำนวน</span>
                  <span>รวม</span>
                </div>
                {activeTravelers.map((t) => (
                  <div key={t.type} className="ty-price-row">
                    <span className="ty-price-label">{t.label}</span>
                    <span className="ty-price-val">{t.qty}</span>
                    <span className="ty-price-total">{formatNumber(t.total)} บาท</span>
                  </div>
                ))}
                {booking.depositPerPerson && (
                  <div className="ty-price-row ty-price-deposit">
                    <span className="ty-price-label">
                      เงินมัดจำ ({booking.depositPerPerson} บ./คน)
                    </span>
                    <span></span>
                    <span className="ty-price-total">{formatNumber(totalDeposit)} บาท</span>
                  </div>
                )}
                {booking.paymentDeadline && (
                  <div className="ty-price-row ty-price-deadline">
                    <span className="ty-price-label">ชำระเงินก่อนวันที่</span>
                    <span></span>
                    <span className="ty-price-deadline-val">{booking.paymentDeadline}</span>
                  </div>
                )}
              </div>
              <div className="ty-total-bar">
                <span>รวมสุทธิ</span>
                <span>{formatNumber(booking.totalAmount)} บาท</span>
              </div>
            </div>
          </div>

          {/* Right Column — Thank You Card */}
          <div className="ty-right">
            <div className="ty-card-sticky">
              {/* Thank You Header */}
              <div className="ty-thankyou-header">
                <div className="ty-plane-icon">✈️</div>
                <h2>THANK YOU</h2>
                <p>คุณจะได้รับอีเมลยืนยันภายในไม่กี่นาที</p>
                <div className="ty-pnr-box">
                  <span className="ty-pnr-label">รหัสจอง (PNR)</span>
                  <span className="ty-pnr-code">{booking.pnrCode}</span>
                </div>
              </div>

              {/* Tour Info */}
              <div className="ty-tour-card">
                {booking.coverImageUrl && (
                  <div className="ty-tour-image">
                    <Image
                      src={booking.coverImageUrl}
                      alt={booking.tourTitle}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="ty-tour-details">
                  <h4>{booking.tourTitle}</h4>
                  <div className="ty-tour-meta">
                    {booking.tourCode && (
                      <span className="ty-meta-tag">
                        <span className="ty-meta-label">รหัสทัวร์</span>
                        {booking.tourCode}
                      </span>
                    )}
                    {booking.countryName && (
                      <span className="ty-meta-tag">
                        <MapPin className="h-3.5 w-3.5" />
                        {booking.countryName}
                      </span>
                    )}
                  </div>
                  <div className="ty-tour-meta" style={{ marginTop: '6px' }}>
                    {booking.travelDate && (
                      <span className="ty-meta-tag">
                        <Calendar className="h-3.5 w-3.5" />
                        {booking.travelDate}
                      </span>
                    )}
                    {booking.duration && (
                      <span className="ty-meta-tag">
                        <Clock className="h-3.5 w-3.5" />
                        {booking.duration}
                      </span>
                    )}
                  </div>
                  {booking.airlineName && (
                    <div className="ty-tour-meta" style={{ marginTop: '6px' }}>
                      <span className="ty-meta-tag">
                        <Plane className="h-3.5 w-3.5" />
                        {booking.airlineName}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Back to Home */}
              <Link href="/" className="ty-btn-home">
                <Home className="h-5 w-5" />
                กลับหน้าหลัก
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
