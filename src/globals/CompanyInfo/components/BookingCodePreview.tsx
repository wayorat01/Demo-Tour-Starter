'use client'

import React from 'react'
import { useFormFields } from '@payloadcms/ui'

const BookingCodePreview: React.FC = () => {
  const prefix = useFormFields(([fields]) => fields.bookingPrefix?.value as string) || 'BK'
  const separator = useFormFields(([fields]) => fields.bookingSeparator?.value as string) || '-'
  const digits = useFormFields(([fields]) => fields.bookingDigits?.value as string) || '4'

  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const running = '1'.padStart(Number(digits), '0')
  const preview = `${prefix}${separator}${today}${separator}${running}`

  return (
    <div
      style={{
        background: 'var(--theme-elevation-50)',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '16px',
      }}
    >
      <div
        style={{
          fontSize: '12px',
          color: 'var(--theme-elevation-500)',
          marginBottom: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        ตัวอย่างรหัสจอง (Preview)
      </div>
      <div
        style={{
          fontSize: '22px',
          fontWeight: 700,
          color: 'var(--theme-text)',
          letterSpacing: '2px',
          fontFamily: 'monospace',
        }}
      >
        {preview}
      </div>
    </div>
  )
}

export default BookingCodePreview
