'use client'

import React from 'react'
import { useFormFields } from '@payloadcms/ui'

/**
 * Client component that reads meta.image (URL string) from the form
 * and renders an image preview below the Meta Image field.
 */
export const MetaImagePreview: React.FC = () => {
  const imageUrl = useFormFields(([fields]) => {
    return fields?.['meta.image']?.value as string | undefined
  })

  if (!imageUrl) {
    return (
      <div
        style={{
          padding: '12px 16px',
          background: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '6px',
          color: '#92400e',
          fontSize: '13px',
          marginBottom: '16px',
        }}
      >
        ⚠️ ไม่มีรูปภาพ — ยังไม่มี Main Image URL
      </div>
    )
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      <div
        style={{
          fontSize: '13px',
          fontWeight: 500,
          color: '#666',
          marginBottom: '8px',
        }}
      >
        OG Image Preview
      </div>
      <div
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          overflow: 'hidden',
          maxWidth: '400px',
          background: '#f8fafc',
        }}
      >
        <img
          src={imageUrl}
          alt="Meta Image Preview"
          style={{
            display: 'block',
            width: '100%',
            height: 'auto',
            maxHeight: '220px',
            objectFit: 'cover',
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            const parent = target.parentElement
            if (parent) {
              parent.innerHTML =
                '<div style="padding: 24px; text-align: center; color: #ef4444; font-size: 13px;">❌ ไม่สามารถโหลดรูปภาพได้</div>'
            }
          }}
        />
      </div>
      <div
        style={{
          fontSize: '11px',
          color: '#94a3b8',
          marginTop: '4px',
          wordBreak: 'break-all',
        }}
      >
        {imageUrl}
      </div>
    </div>
  )
}
