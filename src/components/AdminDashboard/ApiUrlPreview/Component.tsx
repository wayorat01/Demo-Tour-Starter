'use client'
import React from 'react'
import { useFormFields } from '@payloadcms/ui'

const ApiUrlPreview: React.FC<{ path: string }> = ({ path }) => {
  // path is something like: endpoints.0.urlPreview
  const parentPath = path.substring(0, path.lastIndexOf('.'))
  const queryParamsPrefix = `${parentPath}.queryParams.`

  // We use useFormFields to get the ENTIRE fields state for maximum reactivity
  const allFields = useFormFields(([fields]) => fields)

  const fullUrl = React.useMemo(() => {
    const apiEndPoint = allFields?.apiEndPoint?.value as string
    const apiKey = allFields?.apiKey?.value as string

    if (!apiEndPoint) return ''

    // 1. Build Query String dynamically by scanning all fields
    // This is the most reliable way to catch changes in nested array items in real-time
    const paramsMap: Record<number, { key: string; value: string }> = {}

    Object.keys(allFields).forEach((key) => {
      if (key.startsWith(queryParamsPrefix)) {
        // key format: endpoints.0.queryParams.0.key or endpoints.0.queryParams.0.value
        const parts = key.split('.')
        const fieldName = parts[parts.length - 1] // 'key' or 'value'
        const index = parseInt(parts[parts.length - 2], 10) // row index

        if (!isNaN(index)) {
          if (!paramsMap[index]) paramsMap[index] = { key: '', value: '' }
          if (fieldName === 'key') paramsMap[index].key = allFields[key].value as string
          if (fieldName === 'value') paramsMap[index].value = allFields[key].value as string
        }
      }
    })

    // 2. Assemble the query string
    const queryParts: string[] = []

    // Always include API Key first if exists
    if (apiKey) {
      queryParts.push(`apikey=${apiKey}`)
    }

    // Add all dynamic parameters that have a key
    const sortedIndices = Object.keys(paramsMap)
      .map(Number)
      .sort((a, b) => a - b)

    sortedIndices.forEach((index) => {
      const p = paramsMap[index]
      if (p.key && p.key.trim() !== '') {
        queryParts.push(`${p.key}=${encodeURIComponent(p.value || '')}`)
      }
    })

    const queryString = queryParts.join('&')

    // 3. Combine with Base URL
    let finalUrl = apiEndPoint.trim()

    // Remove trailing ? or & from base URL to avoid double symbols
    finalUrl = finalUrl.replace(/[?&]$/, '')

    if (queryString) {
      const separator = finalUrl.includes('?') ? '&' : '?'
      return `${finalUrl}${separator}${queryString}`
    }

    return finalUrl
  }, [allFields, queryParamsPrefix])

  if (!allFields?.apiEndPoint?.value) {
    return (
      <div className="field-type ui" style={{ marginTop: '20px' }}>
        <label className="field-label">API Endpoint URL (Preview)</label>
        <div
          style={{
            color: '#e01e5a',
            fontSize: '14px',
            fontStyle: 'italic',
            padding: '10px',
            background: '#fff5f7',
            borderRadius: '4px',
            border: '1px solid #ffebeb',
          }}
        >
          ⚠️ กรุณาระบุ <strong>API End Point</strong> ในแท็บ <strong>API Key</strong> ก่อนครับ
        </div>
      </div>
    )
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl)
    // Using a more subtle way to show success might be better, but alert works for now
    alert('คัดลอก URL เรียบร้อยแล้ว!')
  }

  return (
    <div
      className="field-type ui"
      style={{
        marginTop: '20px',
        padding: '15px',
        background: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
        }}
      >
        <label className="field-label" style={{ margin: 0, fontWeight: 'bold', color: '#1e293b' }}>
          🔗 API Endpoint URL (Preview)
        </label>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            fontSize: '12px',
            padding: '4px 10px',
            background: '#3b82f6',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '600',
            color: 'white',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          }}
        >
          📋 Copy Link
        </button>
      </div>

      <div
        style={{
          wordBreak: 'break-all',
          padding: '12px',
          background: '#fff',
          borderRadius: '6px',
          border: '1px solid #cbd5e1',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
          minHeight: '40px',
        }}
      >
        <a
          href={fullUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#2563eb',
            textDecoration: 'none',
            fontSize: '14px',
            fontFamily: 'monospace',
            display: 'block',
            lineHeight: '1.5',
          }}
        >
          {fullUrl || 'ตัวอย่าง URL จะปรากฏที่นี่...'}
        </a>
      </div>

      <div style={{ marginTop: '12px' }}>
        <div
          style={{
            fontSize: '11px',
            color: '#64748b',
            lineHeight: '1.6',
          }}
        >
          <div style={{ fontWeight: '500', marginBottom: '4px' }}>
            ✨ <strong>อัปเดตอัตโนมัติ:</strong>{' '}
            ลิงก์ด้านบนจะเปลี่ยนทันทีที่คุณเพิ่มหรือแก้ไขพารามิเตอร์ในตาราง
          </div>
          <div
            style={{
              padding: '6px 10px',
              background: '#f1f5f9',
              borderRadius: '4px',
              borderLeft: '3px solid #cbd5e1',
              fontStyle: 'italic',
              wordBreak: 'break-all',
            }}
          >
            <span style={{ color: '#ef4444' }}>* ตัวอย่าง :</span>{' '}
            http://apiwow.softsq.com/JsonSOA/getdata.ashx?apikey=APIwtravel&mode=searchresultsproduct&lang=th&pagesize=10&pagenumber=1&...
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApiUrlPreview
