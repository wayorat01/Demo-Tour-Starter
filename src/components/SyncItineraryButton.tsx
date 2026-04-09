'use client'

import React, { useState, useEffect, useCallback } from 'react'
import './SyncProgramToursButton.css'

/* ─── Custom Confirm Modal ───────────────────────────── */
const ItineraryConfirmModal: React.FC<{
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}> = ({ open, onConfirm, onCancel }) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    },
    [onCancel],
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, handleKeyDown])

  if (!open) return null

  return (
    <div className="sync-confirm-overlay" onClick={onCancel}>
      <div className="sync-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sync-confirm-icon">📋</div>
        <h3 className="sync-confirm-title">ยืนยันการ Sync Itinerary + Summary</h3>
        <div className="sync-confirm-body">
          <p>จะดึง Itinerary + Summary จาก API สำหรับทุกโปรแกรมทัวร์ที่มีอยู่</p>
          <ul>
            <li>
              ดึงรายละเอียดรายวัน (mode: <strong>itinerarybasic</strong>)
            </li>
            <li>
              ดึงสรุป itinerary_summary (mode: <strong>productdetails</strong>)
            </li>
            <li>ทับข้อมูลเดิมทั้งหมด</li>
          </ul>
          <p style={{ marginTop: '8px', color: '#b91c1c' }}>ต้องการดำเนินการหรือไม่?</p>
        </div>
        <div className="sync-confirm-actions">
          <button className="sync-confirm-cancel" onClick={onCancel}>
            ยกเลิก
          </button>
          <button className="sync-confirm-ok" onClick={onConfirm}>
            ✅ ยืนยัน Sync
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────── */
export const SyncItineraryButton: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<string>('')
  const [showConfirm, setShowConfirm] = useState(false)

  const handleClickSync = () => {
    if (isSyncing) return
    setShowConfirm(true)
  }

  const handleConfirm = async () => {
    setShowConfirm(false)
    setIsSyncing(true)
    setResult(null)
    setError(null)
    setProgress('กำลังดึงข้อมูล itinerary จาก API...')

    try {
      const response = await fetch('/api/sync-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data)
        setProgress('')
      } else {
        setError(data.error || 'Sync Itinerary ไม่สำเร็จ')
        setProgress('')
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด')
      setProgress('')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  return (
    <div
      className="sync-programtour-container"
      style={{ borderColor: 'rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.04)' }}
    >
      <div className="sync-programtour-row">
        <button
          className="sync-programtour-btn sync-itinerary-btn"
          onClick={handleClickSync}
          disabled={isSyncing}
        >
          {isSyncing ? '⏳ กำลัง Sync Itinerary...' : '📋 Sync Itinerary + Summary จาก API'}
        </button>

        <span className="sync-programtour-hint">
          ดึงรายละเอียดรายวัน (itinerarybasic) + สรุปการเดินทาง (itinerary_summary) จาก API
        </span>
      </div>

      {/* Custom Confirm Modal */}
      <ItineraryConfirmModal open={showConfirm} onConfirm={handleConfirm} onCancel={handleCancel} />

      {progress && (
        <div className="sync-programtour-reload-note" style={{ marginTop: '8px' }}>
          {progress}
        </div>
      )}

      {result && (
        <div className="sync-programtour-result">
          <div className="sync-programtour-success">✅ {result.message}</div>
          {result.summary && (
            <div className="sync-programtour-summary-bar">
              <span className="sync-stat sync-stat-updated">
                🔄 อัปเดต: {result.summary.updated}
              </span>
              <span
                className="sync-stat"
                style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}
              >
                ⏭️ ข้าม: {result.summary.skipped}
              </span>
              {result.summary.errors > 0 && (
                <span className="sync-stat sync-stat-errors">
                  ❌ ผิดพลาด: {result.summary.errors}
                </span>
              )}
              <span className="sync-stat sync-stat-total">
                📦 ทั้งหมด: {result.totalPrograms} โปรแกรม
              </span>
            </div>
          )}
          {result.results?.length > 0 && (
            <details className="sync-programtour-details">
              <summary>📋 รายการทั้งหมด ({result.results.length})</summary>
              <ul>
                {result.results.map((item: any, i: number) => (
                  <li key={i}>
                    <span className={`sync-badge sync-badge-${item.action}`}>
                      {item.action === 'updated' ? '🔄' : '⏭️'}
                    </span>{' '}
                    <strong>{item.productCode}</strong> — {item.productName}
                    {item.days != null && (
                      <span style={{ color: '#10b981', marginLeft: '8px', fontSize: '12px' }}>
                        ({item.days} วัน)
                      </span>
                    )}
                    {item.reason && (
                      <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>
                        ({item.reason})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </details>
          )}
          {result.errors?.length > 0 && (
            <details className="sync-programtour-details" open>
              <summary>❌ ข้อผิดพลาด ({result.errors.length})</summary>
              <ul>
                {result.errors.map((item: any, i: number) => (
                  <li key={i}>
                    <strong>{item.productCode}</strong> — {item.error}
                  </li>
                ))}
              </ul>
            </details>
          )}
          <div className="sync-programtour-reload-note">
            ✅ การ Sync Itinerary เสร็จสมบูรณ์แล้ว คุณสามารถรีเฟรชหน้าเพื่อดูข้อมูลล่าสุดครับ
            <button
              onClick={() => window.location.reload()}
              style={{
                marginLeft: '12px',
                padding: '4px 12px',
                border: '1px solid #10b981',
                borderRadius: '4px',
                background: '#10b981',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              🔄 รีเฟรชเดี๋ยวนี้
            </button>
          </div>
        </div>
      )}

      {error && <div className="sync-programtour-error">❌ {error}</div>}
    </div>
  )
}
