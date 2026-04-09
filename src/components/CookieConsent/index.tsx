'use client'

import React, { useState, useEffect, useCallback } from 'react'
import './CookieConsent.css'

const STORAGE_KEY = 'cookie-consent'

interface CookiePreferences {
  necessary: boolean // always true
  analytics: boolean
  functional: boolean
  targeting: boolean
  timestamp: number
}

interface CookieConsentProps {
  /** URL ของหน้า Cookie Policy — ดึงจาก legalLinks ใน footer ได้ */
  cookiePolicyUrl?: string
  /** ข้อความบน Banner — ดึงจาก PageConfig PDPA settings */
  bannerText?: string
}

const defaultBannerText =
  'บริษัทใช้คุกกี้เพื่อเพิ่มประสบการณ์และความพึงพอใจในการใช้งานเว็บไซต์ ให้สามารถเข้าถึงง่าย สะดวกในการใช้งาน และมีประสิทธิภาพยิ่งขึ้น การกด "ยอมรับ" ถือว่าคุณได้ให้อนุญาตให้เราใช้คุกกี้ทั้งหมด'

const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  functional: false,
  targeting: false,
  timestamp: 0,
}

export const CookieConsent: React.FC<CookieConsentProps> = ({
  cookiePolicyUrl = '/cookie-policy',
  bannerText,
}) => {
  const [visible, setVisible] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [prefs, setPrefs] = useState<CookiePreferences>(defaultPreferences)
  const [hasConsented, setHasConsented] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setVisible(true)
      } else {
        setHasConsented(true)
      }
    } catch {
      setVisible(true)
    }
  }, [])

  const savePreferences = useCallback((preferences: CookiePreferences) => {
    const data = { ...preferences, timestamp: Date.now() }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      /* ignore */
    }
    setVisible(false)
    setShowModal(false)
    setHasConsented(true)
  }, [])

  const handleAcceptAll = useCallback(() => {
    savePreferences({
      necessary: true,
      analytics: true,
      functional: true,
      targeting: true,
      timestamp: 0,
    })
  }, [savePreferences])

  const handleReject = useCallback(() => {
    savePreferences({
      necessary: true,
      analytics: false,
      functional: false,
      targeting: false,
      timestamp: 0,
    })
  }, [savePreferences])

  const handleSaveSettings = useCallback(() => {
    savePreferences(prefs)
  }, [prefs, savePreferences])

  const handleReopenSettings = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as CookiePreferences
        setPrefs(parsed)
      }
    } catch {
      /* ignore */
    }
    setShowModal(true)
  }, [])

  return (
    <>
      {/* Banner — แสดงเฉพาะเมื่อยังไม่เคย consent */}
      {visible && !showModal && (
        <div className="cookie-consent">
          <div className="cookie-consent__banner">
            <div className="cookie-consent__inner">
              <div className="cookie-consent__icon">
                <img src="/api/media/file/cookie.svg" alt="cookie" width={28} height={28} />
              </div>
              <div className="cookie-consent__text">
                <p>
                  {bannerText || defaultBannerText} ตาม
                  <a href={cookiePolicyUrl}>นโยบายคุกกี้ของบริษัท</a>
                </p>
              </div>
              <div className="cookie-consent__actions">
                <button
                  className="cookie-consent__btn cookie-consent__btn--accept"
                  onClick={handleAcceptAll}
                >
                  ยอมรับทั้งหมด
                </button>
                <button
                  className="cookie-consent__btn cookie-consent__btn--settings"
                  onClick={() => setShowModal(true)}
                >
                  ตั้งค่าคุกกี้
                </button>
                <button
                  className="cookie-consent__btn cookie-consent__btn--reject"
                  onClick={handleReject}
                >
                  ปฏิเสธ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky FAB — แสดงหลัง consent แล้ว (ไม่แสดงขณะ modal เปิด) */}
      {!visible && hasConsented && !showModal && (
        <button
          className="cookie-fab"
          onClick={handleReopenSettings}
          aria-label="ตั้งค่าคุกกี้"
          title="ตั้งค่าคุกกี้"
        >
          <img src="/api/media/file/cookie.svg" alt="cookie" width={28} height={28} />
        </button>
      )}

      {/* Settings Modal */}
      {showModal && (
        <div className="cookie-modal">
          <div className="cookie-modal__backdrop" onClick={() => setShowModal(false)} />
          <div className="cookie-modal__content">
            <h3 className="cookie-modal__title">ตั้งค่าความเป็นส่วนตัว</h3>
            <p className="cookie-modal__desc">
              คุณสามารถเลือกตั้งค่าคุกกี้แต่ละประเภทได้ตามความต้องการ
              ยกเว้นคุกกี้ที่จำเป็นซึ่งไม่สามารถปิดใช้งานได้
            </p>

            {/* Strictly Necessary */}
            <div className="cookie-modal__category">
              <div className="cookie-modal__category-info">
                <h4>🔒 คุกกี้ที่จำเป็น</h4>
                <p>จำเป็นต่อการทำงานของเว็บไซต์ ไม่สามารถปิดได้</p>
              </div>
              <label className="cookie-toggle">
                <input type="checkbox" checked disabled />
                <span className="cookie-toggle__slider" />
              </label>
            </div>

            {/* Analytics */}
            <div className="cookie-modal__category">
              <div className="cookie-modal__category-info">
                <h4>📊 คุกกี้เพื่อการวิเคราะห์</h4>
                <p>เก็บข้อมูลการใช้งานเพื่อปรับปรุงเว็บไซต์</p>
              </div>
              <label className="cookie-toggle">
                <input
                  type="checkbox"
                  checked={prefs.analytics}
                  onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })}
                />
                <span className="cookie-toggle__slider" />
              </label>
            </div>

            {/* Functional */}
            <div className="cookie-modal__category">
              <div className="cookie-modal__category-info">
                <h4>⚡ คุกกี้เพื่อช่วยในการใช้งาน</h4>
                <p>จดจำการตั้งค่าเพื่อความสะดวกในการใช้งาน</p>
              </div>
              <label className="cookie-toggle">
                <input
                  type="checkbox"
                  checked={prefs.functional}
                  onChange={(e) => setPrefs({ ...prefs, functional: e.target.checked })}
                />
                <span className="cookie-toggle__slider" />
              </label>
            </div>

            {/* Targeting */}
            <div className="cookie-modal__category">
              <div className="cookie-modal__category-info">
                <h4>🎯 คุกกี้เพื่อปรับเนื้อหาให้เข้ากับกลุ่มเป้าหมาย</h4>
                <p>วิเคราะห์และนำเสนอเนื้อหาที่เหมาะสม</p>
              </div>
              <label className="cookie-toggle">
                <input
                  type="checkbox"
                  checked={prefs.targeting}
                  onChange={(e) => setPrefs({ ...prefs, targeting: e.target.checked })}
                />
                <span className="cookie-toggle__slider" />
              </label>
            </div>

            {/* Footer */}
            <div className="cookie-modal__footer">
              <button
                className="cookie-consent__btn cookie-consent__btn--reject"
                onClick={handleReject}
              >
                ปฏิเสธทั้งหมด
              </button>
              <button
                className="cookie-consent__btn cookie-consent__btn--accept"
                onClick={handleSaveSettings}
              >
                บันทึกการตั้งค่า
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CookieConsent
