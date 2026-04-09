'use client'

import React, { useEffect, useState } from 'react'
import { useAllFormFields } from '@payloadcms/ui'

// Type badge color mapping
const typeBadgeColors: Record<string, { bg: string; text: string }> = {
  text: { bg: '#e0f2fe', text: '#0369a1' },
  email: { bg: '#fce7f3', text: '#be185d' },
  textarea: { bg: '#f0fdf4', text: '#15803d' },
  number: { bg: '#fef9c3', text: '#a16207' },
  select: { bg: '#ede9fe', text: '#6d28d9' },
  checkbox: { bg: '#ffedd5', text: '#c2410c' },
  telephone: { bg: '#e0e7ff', text: '#4338ca' },
  message: { bg: '#f1f5f9', text: '#475569' },
  country: { bg: '#f0fdfa', text: '#0f766e' },
  state: { bg: '#fdf2f8', text: '#9d174d' },
}

const FormPreview: React.FC<any> = () => {
  const [fields] = useAllFormFields()
  const [formId, setFormId] = useState<string | null>(null)
  const [formData, setFormData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Find the form relationship value from the fields
  useEffect(() => {
    let foundFormId: string | null = null

    for (const [key, fieldState] of Object.entries(fields)) {
      // Look for a field path matching form.0.form (blocks > first block > form relationship)
      if (key.match(/\.form\.0\.form$/) && fieldState?.value) {
        const val = fieldState.value
        foundFormId = typeof val === 'string' ? val : (val as any)?.id || null
        break
      }
    }

    setFormId(foundFormId)
  }, [fields])

  // Fetch form data when formId changes
  useEffect(() => {
    if (!formId) {
      setFormData(null)
      return
    }

    setIsLoading(true)
    fetch(`/api/forms/${formId}?depth=0`)
      .then((res) => res.json())
      .then((data) => {
        setFormData(data)
        setIsLoading(false)
      })
      .catch(() => {
        setIsLoading(false)
      })
  }, [formId])

  if (!formId) {
    return null
  }

  if (isLoading) {
    return (
      <div
        style={{
          padding: '16px',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          marginBottom: '16px',
        }}
      >
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>กำลังโหลด preview...</p>
      </div>
    )
  }

  if (!formData?.fields || formData.fields.length === 0) {
    return null
  }

  const formFields = formData.fields as any[]
  const submitLabel = formData.submitButtonLabel || 'Submit'

  return (
    <div style={{ marginBottom: '16px' }}>
      <label
        style={{
          display: 'block',
          fontSize: '12px',
          fontWeight: 600,
          color: '#64748b',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        ตัวอย่างฟอร์ม
      </label>
      <div
        style={{
          padding: '20px',
          background: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        {/* Form title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
            {formData.title}
          </span>
          <span
            style={{
              fontSize: '11px',
              color: '#94a3b8',
              background: '#f1f5f9',
              padding: '2px 8px',
              borderRadius: '4px',
            }}
          >
            {formFields.length} fields
          </span>
        </div>

        {/* Fields preview */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {formFields.map((field: any, index: number) => {
            const blockType = field.blockType || 'unknown'
            const colors = typeBadgeColors[blockType] || { bg: '#f1f5f9', text: '#475569' }
            const width = field.width || 100
            const isRequired = field.required
            const label = field.label || field.name || 'Untitled'

            if (blockType === 'message') {
              return (
                <div key={field.id || index} style={{ flex: '1 1 100%' }}>
                  <div
                    style={{
                      padding: '8px 12px',
                      background: '#f8fafc',
                      borderRadius: '6px',
                      border: '1px dashed #cbd5e1',
                      fontSize: '12px',
                      color: '#94a3b8',
                      fontStyle: 'italic',
                    }}
                  >
                    📝 Message Block
                  </div>
                </div>
              )
            }

            return (
              <div
                key={field.id || index}
                style={{
                  flex: width < 100 ? `1 1 calc(${width}% - 4px)` : '1 1 100%',
                  minWidth: width < 100 ? '120px' : undefined,
                }}
              >
                <div
                  style={{
                    padding: '10px 12px',
                    background: '#f8fafc',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: '13px',
                        color: '#334155',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {label}
                      {isRequired && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        color: colors.text,
                        background: colors.bg,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {blockType}
                    </span>
                    {width < 100 && (
                      <span
                        style={{
                          fontSize: '10px',
                          color: '#94a3b8',
                          background: '#f1f5f9',
                          padding: '2px 5px',
                          borderRadius: '3px',
                        }}
                      >
                        {width}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Submit button preview */}
        <div style={{ marginTop: '12px' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '6px 16px',
              background: '#0f172a',
              color: '#ffffff',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            {submitLabel}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FormPreview
