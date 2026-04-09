'use client'

import React, { useState, useRef } from 'react'
import Papa from 'papaparse'
import './ImportInterToursButton.css'

const PAYLOAD_FIELDS = [
  { value: '', label: '-- ไม่แมป (Ignore) --' },
  { value: 'slug', label: 'Slug' },
  { value: 'category', label: 'Category / หมวดหมู่' },
  { value: 'category_slug', label: 'Slug หมวดหมู่ (ภาษาอังกฤษ)' },
  { value: 'parentCountry', label: 'ประเทศหลัก TH (Parent Country)' },
  { value: 'parentCountry_en', label: 'ประเทศหลัก EN (Parent Country EN)' },
  { value: 'title', label: 'Tour Title — th' },
  { value: 'title_en', label: 'Tour Title — en' },
  { value: 'isActive', label: 'Active' },
  { value: 'flagCode', label: 'Flag Code' },
  { value: 'description', label: 'รายละเอียดทัวร์ — th' },
  { value: 'description_en', label: 'รายละเอียดทัวร์ — en' },
  { value: 'tourCount', label: 'Tour Count' },
]

export const ImportInterToursButton: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Modal states
  const [showMappingModal, setShowMappingModal] = useState(false)
  const [showConflictModal, setShowConflictModal] = useState(false)

  // Preview states
  const [previewData, setPreviewData] = useState<{ duplicates: any[]; newItems: any[] } | null>(
    null,
  )
  const [selectedOverrides, setSelectedOverrides] = useState<Set<string>>(new Set())

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      setError('กรุณาเลือกไฟล์ .csv เท่านั้น')
      return
    }

    setSelectedFile(file)
    setResult(null)
    setError(null)
    setPreviewData(null)

    // Parse ONLY the first few rows to get headers
    Papa.parse(file, {
      header: true,
      preview: 1, // Only read first row of data
      skipEmptyLines: true,
      complete: (results) => {
        if (results.meta.fields) {
          const foundHeaders = results.meta.fields
          setHeaders(foundHeaders)

          // Auto-map based on requested defaults
          const defaultMapping: Record<string, string> = {}
          for (const header of foundHeaders) {
            const h = header.trim()
            if (h.toLowerCase() === 'keyslug') defaultMapping[h] = 'slug'
            else if (h.toLowerCase() === 'category') defaultMapping[h] = 'category'
            else if (h.toLowerCase() === 'countryname_th') defaultMapping[h] = 'title'
            else if (h.toLowerCase() === 'countryname_en') defaultMapping[h] = 'title_en'
            else if (h.toLowerCase() === 'active') defaultMapping[h] = 'isActive'
            else if (h.toLowerCase() === 'flag code') defaultMapping[h] = 'flagCode'
            else defaultMapping[h] = ''
          }
          setMapping(defaultMapping)
          setShowMappingModal(true)
        } else {
          setError('ไม่พบ Headers ในไฟล์ CSV')
        }
      },
      error: (err) => {
        setError(err.message)
      },
    })
  }

  const handleMappingChange = (header: string, field: string) => {
    setMapping((prev) => ({ ...prev, [header]: field }))
  }

  // Step 1: Request Preview to check for duplicates
  const confirmMappingAndPreview = async () => {
    if (!selectedFile) return

    setIsImporting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('mapping', JSON.stringify(mapping))
      formData.append('mode', 'preview')

      const response = await fetch('/api/import-intertours', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        if (data.duplicates && data.duplicates.length > 0) {
          setShowMappingModal(false)
          setPreviewData(data)
          // Select all duplicates for override by default
          setSelectedOverrides(new Set(data.duplicates.map((d: any) => d.slug)))
          setShowConflictModal(true)
        } else {
          // No duplicates, proceed directly to import
          setShowMappingModal(false)
          performImport([])
        }
      } else {
        setError(data.error || 'Preview failed')
      }
    } catch (err: any) {
      setError(err.message || 'Network error')
    } finally {
      setIsImporting(false)
    }
  }

  // Step 2: Handle Conflict Resolution and Proceed
  const confirmConflictResolution = () => {
    if (!previewData) return

    const skipSlugs = previewData.duplicates
      .filter((d) => !selectedOverrides.has(d.slug))
      .map((d) => d.slug)

    setShowConflictModal(false)
    performImport(skipSlugs)
  }

  // Final Step: Perform actual import
  const performImport = async (skipSlugs: string[]) => {
    if (!selectedFile) return

    setIsImporting(true)
    setResult(null)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('mapping', JSON.stringify(mapping))
      formData.append('mode', 'import')
      formData.append('skipSlugs', JSON.stringify(skipSlugs))

      const response = await fetch('/api/import-intertours', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || 'Import failed')
      }
    } catch (err: any) {
      setError(err.message || 'Network error')
    } finally {
      setIsImporting(false)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const toggleOverride = (title: string) => {
    const newSet = new Set(selectedOverrides)
    if (newSet.has(title)) {
      newSet.delete(title)
    } else {
      newSet.add(title)
    }
    setSelectedOverrides(newSet)
  }

  const cancelImport = () => {
    setShowMappingModal(false)
    setShowConflictModal(false)
    setSelectedFile(null)
    setHeaders([])
    setMapping({})
    setPreviewData(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="import-intertours-container">
      <div className="import-intertours-row">
        <label className="import-intertours-btn" data-disabled={isImporting}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isImporting}
            style={{ display: 'none' }}
          />
          {isImporting ? '⏳ กำลังประมวลผล...' : '📥 Import CSV'}
        </label>

        {result && (
          <span className="import-intertours-summary">
            ✅ สำเร็จ: สร้าง/อัปเดต {result.summary.postsProcessed} รายการ
            {result.summary.postsSkipped > 0 && ` | ข้าม ${result.summary.postsSkipped}`}
            {result.summary.categoriesCreated > 0 &&
              ` | สร้าง ${result.summary.categoriesCreated} หมวดใหม่`}
          </span>
        )}

        {error && <span className="import-intertours-error">❌ {error}</span>}
      </div>

      {/* Step 1 Modal: Mapping */}
      {showMappingModal && (
        <div className="import-mapping-modal-overlay">
          <div className="import-mapping-modal">
            <h3>จับคู่คอลัมน์ (Field Mapping)</h3>
            <p>เลือกฟิลด์ใน Payload ที่ต้องการจับคู่กับคอลัมน์จากไฟล์ CSV</p>

            <div className="mapping-list">
              {headers.map((header) => (
                <div key={header} className="mapping-row">
                  <div className="mapping-col-name">{header}</div>
                  <div className="mapping-arrow">➡️</div>
                  <select
                    className="mapping-select"
                    value={mapping[header] || ''}
                    onChange={(e) => handleMappingChange(header, e.target.value)}
                  >
                    {PAYLOAD_FIELDS.map((pf) => (
                      <option key={pf.value} value={pf.value}>
                        {pf.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="mapping-modal-actions">
              <button className="mapping-btn-cancel" onClick={cancelImport}>
                ยกเลิก
              </button>
              <button className="mapping-btn-confirm" onClick={confirmMappingAndPreview}>
                ตรวจสอบและพรีวิว
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 Modal: Conflict Resolution */}
      {showConflictModal && previewData && (
        <div className="import-mapping-modal-overlay">
          <div className="import-mapping-modal conflict-modal">
            <h3>⚠️ พบข้อมูลที่มี Slug ซ้ำในระบบ</h3>
            <p>
              มีข้อมูล (Slug) ตรงกับข้อมูลที่อยู่ในระบบอยู่แล้ว คุณต้องการเขียนทับ (อัปเดต)
              ข้อมูลเดิม หรือข้ามไป?
            </p>

            <div className="mapping-list conflict-list">
              {previewData.duplicates.map((item, idx) => (
                <label
                  key={idx}
                  className={`mapping-row conflict-row ${selectedOverrides.has(item.slug) ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedOverrides.has(item.slug)}
                    onChange={() => toggleOverride(item.slug)}
                  />
                  <div className="conflict-details">
                    <h4>
                      {item.title} ({item.slug})
                    </h4>
                    <div className="conflict-compare">
                      <div>
                        <strong>ข้อมูลเดิม:</strong> {item.oldData.title} | Active:{' '}
                        {item.oldData.isActive ? 'Yes' : 'No'} | Flag:{' '}
                        {item.oldData.flagCode || '-'}
                      </div>
                      <div>
                        <strong>ข้อมูลใหม่:</strong> {item.newData.title} | Active:{' '}
                        {item.newData.isActive ? 'Yes' : 'No'} | Flag:{' '}
                        {item.newData.flagCode || '-'}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <p className="conflict-new-note">
              * จะมีข้อมูลสร้างใหม่ทั้งหมด {previewData.newItems.length} รายการ (ไม่มีชื่อซ้ำ)
            </p>

            <div className="mapping-modal-actions">
              <button className="mapping-btn-cancel" onClick={cancelImport}>
                ยกเลิกทั้งหมด
              </button>
              <button className="mapping-btn-confirm" onClick={confirmConflictResolution}>
                แน่ใจ ทำการ Import
              </button>
            </div>
          </div>
        </div>
      )}

      {result && result.processedPosts?.length > 0 && (
        <details className="import-intertours-details">
          <summary>📋 รายการที่สร้าง/อัปเดต ({result.processedPosts.length})</summary>
          <ul>
            {result.processedPosts.map((post: string, i: number) => (
              <li key={i}>{post}</li>
            ))}
          </ul>
        </details>
      )}

      {result && result.skippedSlugs?.length > 0 && (
        <details className="import-intertours-details">
          <summary>⏭️ รายการที่ข้าม ({result.skippedSlugs.length})</summary>
          <ul>
            {result.skippedSlugs.map((slug: string, i: number) => (
              <li key={i}>{slug}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
