'use client'
import { useState, useEffect } from 'react'
import { Button, toast } from '@payloadcms/ui'
import { generateSeed, applySeed, previewSeed } from './actions'
import type { SeedMode, SeedPreview, ApplySeedReport } from './actions'

const MODE_OPTIONS: { value: SeedMode; label: string; icon: string; description: string }[] = [
  {
    value: 'merge-newer',
    label: 'Merge: Keep Newer',
    icon: '⏱️',
    description: 'Compare updatedAt → Keep newer (Recommended for teams)',
  },
  {
    value: 'replace',
    label: 'Replace All',
    icon: '🔄',
    description: '⚠️ Delete all and seed (Local data will be lost!)',
  },
]

const PROTECTED_GLOBALS = [
  { key: 'header', label: 'Header' },
  { key: 'footer', label: 'Footer' },
  { key: 'themeConfig', label: 'Theme Config' },
  { key: 'theme-Config', label: 'Theme Config (alt)', hidden: true },
  { key: 'company-info', label: 'Company Info' },
  { key: 'page-config', label: 'Page Config' },
  { key: 'pageConfig', label: 'Page Config (alt)', hidden: true },
]

/**
 * Friendly Thai labels for collection names
 */
const COLLECTION_LABELS: Record<string, { label: string; group: 'content' | 'system' }> = {
  // Content collections
  pages: { label: '📄 หน้าเว็บ (Pages)', group: 'content' },
  posts: { label: '📝 บทความ (Posts)', group: 'content' },
  media: { label: '🖼️ รูปภาพ/ไฟล์ (Media)', group: 'content' },
  categories: { label: '🏷️ หมวดหมู่ (Categories)', group: 'content' },
  tags: { label: '🔖 แท็ก (Tags)', group: 'content' },
  testimonials: { label: '💬 รีวิว (Testimonials)', group: 'content' },
  forms: { label: '📋 ฟอร์ม (Forms)', group: 'content' },
  'form-submissions': { label: '📨 ข้อมูลส่งฟอร์ม', group: 'content' },
  redirects: { label: '🔗 Redirects (เปลี่ยนเส้นทาง URL)', group: 'content' },
  'gallery-albums': { label: '🎨 อัลบัมรูป (Gallery)', group: 'content' },
  interTours: { label: '✈️ โปรแกรมทัวร์ (InterTours)', group: 'content' },
  tour_categories: { label: '📂 หมวดหมู่ทัวร์', group: 'content' },
  bookings: { label: '📅 การจอง (Bookings)', group: 'content' },
  searches: { label: '🔍 ข้อมูลค้นหา (Searches)', group: 'content' },
  // System/internal collections
  'payload-locked-documents': { label: '🔒 เอกสารที่ล็อค (ระบบ)', group: 'system' },
}

function getCollectionInfo(name: string): { label: string; group: 'content' | 'system' } {
  // Check exact match first
  if (COLLECTION_LABELS[name]) return COLLECTION_LABELS[name]
  // _versions suffix = system
  if (name.endsWith('_versions')) {
    const baseName = name.replace(/_versions$/, '').replace(/^_/, '')
    const baseLabel = COLLECTION_LABELS[baseName]?.label || baseName
    return { label: `📑 ${baseLabel} (versions)`, group: 'system' }
  }
  return { label: name, group: 'content' }
}

/* ─────────────────────────────────────────────
 * Custom Confirm Modal
 * (replaces window.confirm which doesn't work in Payload Admin)
 * ───────────────────────────────────────────── */
const ConfirmModal: React.FC<{
  open: boolean
  title: string
  message: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}> = ({ open, title, message, danger, onConfirm, onCancel }) => {
  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(2px)',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: 'var(--theme-elevation-0, #fff)',
          border: '1px solid var(--theme-elevation-150, #ddd)',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '480px',
          width: '90%',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            margin: '0 0 12px 0',
            fontSize: '1.1rem',
            color: danger ? 'var(--theme-error-500, #e53e3e)' : 'var(--theme-text, #333)',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            margin: '0 0 20px 0',
            color: 'var(--theme-text, #333)',
            whiteSpace: 'pre-line',
            lineHeight: 1.5,
            fontSize: '0.95rem',
          }}
        >
          {message}
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 20px',
              borderRadius: '6px',
              border: '1px solid var(--theme-elevation-150, #ccc)',
              backgroundColor: 'var(--theme-elevation-50, #f5f5f5)',
              color: 'var(--theme-text, #333)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            ❌ ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '8px 20px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: danger
                ? 'var(--theme-error-500, #e53e3e)'
                : 'var(--theme-success-500, #38a169)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            ✅ ยืนยัน
          </button>
        </div>
      </div>
    </div>
  )
}

export const GenerateSeedButton: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleGenerate = async () => {
    setShowConfirm(false)
    setLoading(true)
    try {
      const result = await generateSeed()
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Generate seed failed:', error)
      toast.error('Generate seed failed. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setShowConfirm(true)} disabled={loading}>
        {loading ? '⏳ Generating...' : '🌱 Generate Seed'}
      </Button>
      <ConfirmModal
        open={showConfirm}
        title="🌱 Generate Seed File"
        message="ต้องการ Generate Seed File ใหม่หรือไม่?\n\nระบบจะ export DB แล้วอัปโหลดไป S3 อัตโนมัติ\nไฟล์เดิมบน S3 จะถูกแทนที่"
        onConfirm={handleGenerate}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  )
}

export const ApplySeedButton: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<SeedMode>('merge-newer')
  const [preview, setPreview] = useState<SeedPreview | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [selectedCollections, setSelectedCollections] = useState<Set<string>>(new Set())
  const [excludeGlobals, setExcludeGlobals] = useState<Set<string>>(
    new Set(PROTECTED_GLOBALS.map((g) => g.key)),
  )
  const [report, setReport] = useState<ApplySeedReport | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  // Load preview when component mounts
  useEffect(() => {
    loadPreview()
  }, [])

  const loadPreview = async () => {
    setLoadingPreview(true)
    try {
      const result = await previewSeed()
      setPreview(result)
      if (result.success && result.collections) {
        // Select all collections by default, except media (large files, usually not needed)
        setSelectedCollections(
          new Set(result.collections.filter((c) => c.name !== 'media').map((c) => c.name)),
        )
      }
    } catch (e) {
      console.error('Preview failed:', e)
    } finally {
      setLoadingPreview(false)
    }
  }

  const toggleCollection = (name: string) => {
    setSelectedCollections((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const toggleGlobalExclude = (key: string) => {
    setExcludeGlobals((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handleApplyClick = () => {
    setShowConfirm(true)
  }

  const handleConfirmApply = async () => {
    setShowConfirm(false)
    setLoading(true)
    setReport(null)
    try {
      const result = await applySeed({
        mode,
        selectedCollections: [...selectedCollections],
        excludeGlobalTypes: [...excludeGlobals],
      })

      setReport(result)

      if (result.success) {
        toast.success(result.message)
        setTimeout(() => window.location.reload(), 2500)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Apply seed failed:', error)
      toast.error('Apply seed failed. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  const selectedModeInfo = MODE_OPTIONS.find((m) => m.value === mode)

  const confirmTitle = mode === 'replace' ? '⚠️ Apply Seed — Replace All' : '📥 Apply Seed — Merge'

  const confirmMessage =
    mode === 'replace'
      ? `ใช้โหมด "${selectedModeInfo?.label}" — ข้อมูลทั้งหมดจะถูกลบแล้วแทนที่ด้วย seed!\n\nต้องการดำเนินการ?`
      : `ใช้โหมด "${selectedModeInfo?.label}"\n\n${selectedModeInfo?.description}\n\nต้องการดำเนินการ?`

  return (
    <div className="seed-apply-panel">
      {/* Mode Selector */}
      <div className="seed-section">
        <h4 className="seed-section-title">📋 โหมด Apply</h4>
        <div className="seed-mode-list">
          {MODE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`seed-mode-option ${mode === opt.value ? 'seed-mode-option--active' : ''}`}
            >
              <input
                type="radio"
                name="seedMode"
                value={opt.value}
                checked={mode === opt.value}
                onChange={() => setMode(opt.value)}
              />
              <span className="seed-mode-icon">{opt.icon}</span>
              <span className="seed-mode-info">
                <strong>{opt.label}</strong>
                <small>{opt.description}</small>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Collection Selector */}
      <div className="seed-section">
        <h4 className="seed-section-title">📦 เลือก Collections</h4>
        {loadingPreview ? (
          <p style={{ color: 'var(--theme-text)', opacity: 0.6 }}>⏳ กำลังโหลด...</p>
        ) : preview?.collections ? (
          <>
            {/* Content Collections */}
            <p className="seed-section-desc">
              📄 <strong>ข้อมูลเว็บไซต์</strong>
            </p>
            <div className="seed-collection-list">
              {preview.collections
                .filter((c) => !c.isGlobal && getCollectionInfo(c.name).group === 'content')
                .map((c) => {
                  const info = getCollectionInfo(c.name)
                  return (
                    <label key={c.name} className="seed-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedCollections.has(c.name)}
                        onChange={() => toggleCollection(c.name)}
                      />
                      <span>
                        {info.label} <small>({c.docCount})</small>
                      </span>
                    </label>
                  )
                })}
            </div>

            {/* System Collections */}
            {preview.collections.some(
              (c) => !c.isGlobal && getCollectionInfo(c.name).group === 'system',
            ) && (
              <>
                <p className="seed-section-desc" style={{ marginTop: '0.75rem' }}>
                  ⚙️ <strong>ระบบ (ปกติไม่ต้องเลือก)</strong>
                </p>
                <div className="seed-collection-list">
                  {preview.collections
                    .filter((c) => !c.isGlobal && getCollectionInfo(c.name).group === 'system')
                    .map((c) => {
                      const info = getCollectionInfo(c.name)
                      return (
                        <label key={c.name} className="seed-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedCollections.has(c.name)}
                            onChange={() => toggleCollection(c.name)}
                          />
                          <span>
                            {info.label} <small>({c.docCount})</small>
                          </span>
                        </label>
                      )
                    })}
                </div>
              </>
            )}
          </>
        ) : (
          <p style={{ color: 'var(--theme-error-500)' }}>
            {preview?.message || 'ไม่สามารถโหลด preview'}
          </p>
        )}
      </div>

      {/* Globals Protection */}
      <div className="seed-section">
        <h4 className="seed-section-title">🛡️ Globals Protection</h4>
        <p className="seed-section-desc">
          Globals ที่ถูกเลือก (✓) จะ<strong>ไม่ถูก import</strong> — ข้อมูล local จะถูกคงไว้
        </p>
        <div className="seed-collection-list">
          {PROTECTED_GLOBALS.filter((g) => !g.hidden).map((g) => (
            <label key={g.key} className="seed-checkbox">
              <input
                type="checkbox"
                checked={excludeGlobals.has(g.key)}
                onChange={() => toggleGlobalExclude(g.key)}
              />
              <span>ปกป้อง {g.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Apply Report */}
      {report?.details && (
        <div
          className={`seed-report ${report.success ? 'seed-report--success' : 'seed-report--error'}`}
        >
          <h4>📊 ผลลัพธ์</h4>
          <div className="seed-report-grid">
            <span>➕ เพิ่มใหม่:</span>
            <strong>{report.details.inserted}</strong>
            <span>🔄 อัพเดท:</span>
            <strong>{report.details.updated}</strong>
            <span>✅ คงข้อมูล local:</span>
            <strong>{report.details.skippedLocal}</strong>
            <span>🛡️ Globals ข้าม:</span>
            <strong>{report.details.skippedGlobal}</strong>
            <span>🖼️ Media files:</span>
            <strong>{report.details.mediaRestored}</strong>
          </div>
        </div>
      )}

      {/* Apply Button */}
      <div style={{ marginTop: '16px' }}>
        <Button onClick={handleApplyClick} disabled={loading}>
          {loading ? '⏳ Applying...' : `📥 Apply Seed (${selectedModeInfo?.label})`}
        </Button>
      </div>

      {/* Custom Confirmation Popup */}
      {showConfirm && (
        <div className="seed-confirm-overlay" onClick={() => setShowConfirm(false)}>
          <div className="seed-confirm-popup" onClick={(e) => e.stopPropagation()}>
            <h3 className="seed-confirm-title">
              {mode === 'replace' ? '⚠️ ยืนยันการ Apply Seed' : '📥 ยืนยันการ Apply Seed'}
            </h3>
            <div className="seed-confirm-body">
              <p>
                <strong>โหมด:</strong> {selectedModeInfo?.icon} {selectedModeInfo?.label}
              </p>
              <p className="seed-confirm-desc">{selectedModeInfo?.description}</p>
              <p>
                <strong>Collections ที่เลือก:</strong> {selectedCollections.size} รายการ
              </p>
              {mode === 'replace' && (
                <div className="seed-confirm-warning">
                  ⚠️ <strong>คำเตือน:</strong> โหมด Replace All จะ<strong>ลบข้อมูลทั้งหมด</strong>ใน
                  database แล้วแทนที่ด้วย seed!
                </div>
              )}
            </div>
            <div className="seed-confirm-actions">
              <button
                className="seed-confirm-btn seed-confirm-btn--cancel"
                onClick={() => setShowConfirm(false)}
              >
                ❌ ยกเลิก
              </button>
              <button
                className="seed-confirm-btn seed-confirm-btn--confirm"
                onClick={handleConfirmApply}
              >
                ✅ ยืนยัน Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
