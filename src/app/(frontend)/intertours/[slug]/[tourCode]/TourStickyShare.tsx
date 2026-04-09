'use client'

import React, { useState, useEffect } from 'react'
import { X, Link as LinkIcon, Facebook, Twitter, MessageCircle, Copy, Check } from 'lucide-react'
import { cn } from '@/utilities/cn'
import './TourStickyShare.css'

type TourInfo = {
  tourTitle: string
  tourCode: string
  startPrice: number
  airlineName: string
  pdfUrl: string
  stayDay: number
  stayNight: number
  travelPeriods: {
    startDateDisplay?: string
    endDateDisplay?: string
  }[]
}

type CompanyInfo = {
  companyName: string
  hotline: string
  callCenter: string
  lineLink: string
}

type TourStickyShareProps = {
  tourInfo?: TourInfo
  companyInfo?: CompanyInfo
}

const formatPrice = (price: number) => (price > 0 ? price.toLocaleString('th-TH') : '-')

export const TourStickyShare: React.FC<TourStickyShareProps> = ({ tourInfo, companyInfo }) => {
  const [visible, setVisible] = useState(true)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setCurrentUrl(window.location.href)
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setHasScrolled(true)
        if (!visible) setVisible(true)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    setHasScrolled(true)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [visible])

  const handleClose = () => setVisible(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl)
    alert('คัดลอกลิงก์เรียบร้อยแล้ว')
  }

  const copyTourInfo = () => {
    if (!tourInfo) return

    // กำหนดการเดินทาง — รวม periods ที่มี
    const periodList = tourInfo.travelPeriods
      .filter((p) => p.startDateDisplay)
      .map((p) => `${p.startDateDisplay}${p.endDateDisplay ? ` - ${p.endDateDisplay}` : ''}`)
      .join(', ')

    const lines = [
      `โปรแกรมทัวร์ : ${tourInfo.tourTitle}`,
      `รหัสทัวร์ : ${tourInfo.tourCode}`,
      `กำหนดการเดินทาง : ${periodList || '-'}`,
      `ราคาเริ่มต้น : ${formatPrice(tourInfo.startPrice)} บาท`,
      `เดินทางโดย : ${tourInfo.airlineName || '-'}`,
      `โปรแกรมทัวร์ : ${tourInfo.pdfUrl || '-'}`,
      `เพิ่มเติม : ${currentUrl}`,
      '',
    ]

    if (companyInfo) {
      const phones = [companyInfo.hotline, companyInfo.callCenter].filter(Boolean).join(', ')

      lines.push(
        `ติดต่อสอบถาม : ${companyInfo.companyName || '-'}`,
        `โทร : ${phones || '-'}`,
        `Line : ${companyInfo.lineLink || '-'}`,
      )
    }

    const text = lines.join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const encodedUrl = encodeURIComponent(currentUrl)

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    line: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}`,
  }

  // Use visibility and scroll state to control display instead of early return
  const isHidden = !hasScrolled || !visible

  return (
    <div className={cn('tour-sticky-share', isHidden && 'tour-sticky-share--hidden')}>
      <div className="tour-sticky-share__panel">
        <button
          type="button"
          className="tour-sticky-share__close"
          onClick={handleClose}
          aria-label="ปิด"
        >
          <X size={14} />
        </button>

        <p className="tour-sticky-share__heading">แชร์โปรแกรมทัวร์นี้</p>

        <div className="tour-sticky-share__icons">
          <a
            href={shareLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="tour-sticky-share__btn tour-sticky-share__btn--facebook"
            title="Share on Facebook"
          >
            <Facebook size={18} fill="currentColor" strokeWidth={0} />
          </a>
          <a
            href={shareLinks.line}
            target="_blank"
            rel="noopener noreferrer"
            className="tour-sticky-share__btn tour-sticky-share__btn--line"
            title="Share on LINE"
          >
            <svg className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
          </a>
          <a
            href={shareLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="tour-sticky-share__btn tour-sticky-share__btn--twitter"
            title="Share on Twitter"
          >
            <Twitter size={18} fill="currentColor" strokeWidth={0} />
          </a>
          <button
            type="button"
            onClick={copyToClipboard}
            className="tour-sticky-share__btn tour-sticky-share__btn--copy"
            title="Copy Link"
          >
            <LinkIcon size={18} />
          </button>
          {tourInfo && (
            <button
              type="button"
              onClick={copyTourInfo}
              className={cn(
                'tour-sticky-share__btn tour-sticky-share__btn--copy-info',
                copied && 'tour-sticky-share__btn--copied',
              )}
              title="คัดลอกข้อมูลทัวร์"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
