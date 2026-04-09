'use client'

import React, { useState } from 'react'

/**
 * Export Activity Logs Button — ปุ่ม export CSV สำหรับ Activity Logs
 * แสดงใน beforeListTable ของ ActivityLogs collection
 * ใช้ Payload CSS variables ให้ consistent กับ admin design
 */
export const ExportActivityLogsButton: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    setIsExporting(true)
    setError(null)

    try {
      const response = await fetch('/api/activity-logs/export')

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Export failed' }))
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      // Download the CSV
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `activity-logs-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      setError(err.message || 'Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div
      style={{
        marginBottom: '16px',
        padding: '12px 16px',
        border: '1px solid var(--theme-elevation-150, #e0e0e0)',
        borderRadius: '8px',
        background: 'var(--theme-elevation-50, #f8f8f8)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
      }}
    >
      <button
        onClick={handleExport}
        disabled={isExporting}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          background: 'var(--theme-elevation-500, #333)',
          color: 'var(--theme-elevation-0, #fff)',
          borderRadius: '6px',
          border: 'none',
          fontSize: '14px',
          fontWeight: 500,
          cursor: isExporting ? 'not-allowed' : 'pointer',
          opacity: isExporting ? 0.6 : 1,
          transition: 'background 0.2s',
          whiteSpace: 'nowrap',
        }}
      >
        {isExporting ? '⏳ กำลังส่งออก...' : '📥 Export CSV'}
      </button>

      <span
        style={{
          fontSize: '13px',
          color: 'var(--theme-elevation-600, #888)',
        }}
      >
        ดาวน์โหลด activity logs ทั้งหมดเป็นไฟล์ CSV
      </span>

      {error && (
        <span
          style={{
            fontSize: '13px',
            color: 'var(--theme-error-500, #dc3545)',
            fontWeight: 500,
          }}
        >
          ❌ {error}
        </span>
      )}
    </div>
  )
}
