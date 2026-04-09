'use client'
import React from 'react'
import { useFormFields } from '@payloadcms/ui'

/**
 * 🔗 API Mode Links
 *
 * แสดงลิงก์ proxy (/api/wowtour) ที่สร้างจาก endpoints ใน API Setting
 * ทีมสามารถคลิกลิงก์เพื่อทดสอบ API ได้ทันที
 */
const ApiModeLinks: React.FC = () => {
  const allFields = useFormFields(([fields]) => fields)

  // ดึงข้อมูล endpoints จาก form state
  const links = React.useMemo(() => {
    const result: { name: string; mode: string; proxyUrl: string; params: string }[] = []

    // Scan all fields to find endpoint data
    const endpointNames: Record<number, string> = {}
    const endpointParams: Record<number, { key: string; value: string }[]> = {}

    Object.keys(allFields).forEach((fieldKey) => {
      // Match endpoints.N.endpointName
      const nameMatch = fieldKey.match(/^endpoints\.(\d+)\.endpointName$/)
      if (nameMatch) {
        const idx = parseInt(nameMatch[1], 10)
        endpointNames[idx] = (allFields[fieldKey].value as string) || ''
      }

      // Match endpoints.N.queryParams.M.key or .value
      const paramMatch = fieldKey.match(/^endpoints\.(\d+)\.queryParams\.(\d+)\.(key|value)$/)
      if (paramMatch) {
        const epIdx = parseInt(paramMatch[1], 10)
        const paramIdx = parseInt(paramMatch[2], 10)
        const fieldType = paramMatch[3]

        if (!endpointParams[epIdx]) endpointParams[epIdx] = []
        if (!endpointParams[epIdx][paramIdx])
          endpointParams[epIdx][paramIdx] = { key: '', value: '' }
        if (fieldType === 'key')
          endpointParams[epIdx][paramIdx].key = (allFields[fieldKey].value as string) || ''
        if (fieldType === 'value')
          endpointParams[epIdx][paramIdx].value = (allFields[fieldKey].value as string) || ''
      }
    })

    // Build proxy URLs
    const indices = Object.keys(endpointNames)
      .map(Number)
      .sort((a, b) => a - b)

    for (const idx of indices) {
      const name = endpointNames[idx]
      if (!name) continue

      const params = (endpointParams[idx] || []).filter((p) => p && p.key)
      const queryParts: string[] = []
      let mode = ''

      for (const p of params) {
        if (p.key === 'mode') mode = p.value
        if (p.value) {
          queryParts.push(`${p.key}=${encodeURIComponent(p.value)}`)
        }
      }

      const proxyUrl = `/api/wowtour?${queryParts.join('&')}`
      const paramsStr = params
        .filter((p) => p.key !== 'mode' && p.value)
        .map((p) => `${p.key}=${p.value}`)
        .join(', ')

      result.push({ name, mode, proxyUrl, params: paramsStr })
    }

    return result
  }, [allFields])

  // Get origin for full URL display
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(`${origin}${url}`)
    alert('คัดลอก URL เรียบร้อยแล้ว!')
  }

  const handleCopyAll = () => {
    const allLinks = links.map((l) => `${l.name}\n${origin}${l.proxyUrl}`).join('\n\n')
    navigator.clipboard.writeText(allLinks)
    alert('คัดลอกทุกลิงก์เรียบร้อยแล้ว!')
  }

  if (links.length === 0) {
    return (
      <div style={{ padding: '20px', color: '#64748b', fontStyle: 'italic' }}>
        ⚠️ ยังไม่มี Endpoints — กรุณาเพิ่ม Endpoints ในแท็บ &quot;API Endpoints&quot; ก่อนครับ
      </div>
    )
  }

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#1e293b' }}>
            🔗 Proxy API Links (ลิงก์สำหรับเว็บไซต์)
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
            คลิกที่ลิงก์เพื่อทดสอบ หรือก๊อปปี้แชร์ให้ทีม — ลิงก์เหล่านี้ผ่าน proxy ของเว็บ
            ไม่ต้องใช้ API Key
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopyAll}
          style={{
            fontSize: '12px',
            padding: '6px 14px',
            background: '#8b5cf6',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            color: 'white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            whiteSpace: 'nowrap',
          }}
        >
          📋 Copy All
        </button>
      </div>

      {/* Links Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {links.map((link, i) => (
          <div
            key={i}
            style={{
              padding: '14px 16px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              transition: 'all 0.15s ease',
            }}
          >
            {/* Mode badge + Copy button */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 10px',
                    background: '#dbeafe',
                    color: '#1d4ed8',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '700',
                    letterSpacing: '0.3px',
                  }}
                >
                  {link.mode || 'N/A'}
                </span>
                <span style={{ fontWeight: '600', fontSize: '14px', color: '#334155' }}>
                  {link.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(link.proxyUrl)}
                style={{
                  fontSize: '11px',
                  padding: '3px 10px',
                  background: '#3b82f6',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  color: 'white',
                }}
              >
                📋 Copy
              </button>
            </div>

            {/* Clickable URL */}
            <a
              href={link.proxyUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#2563eb',
                textDecoration: 'none',
                fontSize: '13px',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                lineHeight: '1.5',
                display: 'block',
                padding: '8px 10px',
                background: '#fff',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
              }}
            >
              {origin}
              {link.proxyUrl}
            </a>

            {/* Params info */}
            {link.params && (
              <div style={{ marginTop: '6px', fontSize: '11px', color: '#94a3b8' }}>
                📌 Params: {link.params}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer info */}
      <div
        style={{
          marginTop: '16px',
          padding: '10px 14px',
          background: '#f0fdf4',
          borderRadius: '6px',
          border: '1px solid #bbf7d0',
          fontSize: '12px',
          color: '#15803d',
          lineHeight: '1.6',
        }}
      >
        💡 <strong>วิธีใช้:</strong> ลิงก์เหล่านี้สร้างจาก Endpoints ในแท็บ &quot;API
        Endpoints&quot; — ถ้าเพิ่ม/แก้ไข Endpoint ใหม่ ลิงก์จะอัพเดตอัตโนมัติ
        <br />
        🌐 <strong>Proxy Route:</strong>{' '}
        <code style={{ background: '#dcfce7', padding: '1px 4px', borderRadius: '3px' }}>
          /api/wowtour
        </code>
        — ดึง API Key จาก Admin อัตโนมัติ ไม่ต้องใส่ในลิงก์
      </div>
    </div>
  )
}

export default ApiModeLinks
