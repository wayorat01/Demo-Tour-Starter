'use client'

import React, { useCallback } from 'react'
import { useField, FieldLabel } from '@payloadcms/ui'
import { NumericFormat } from 'react-number-format'
import type { NumberFieldClientProps } from 'payload'
import './numberFormatField.css'

export const NumberFormatField: React.FC<NumberFieldClientProps> = (props) => {
  const { field, path } = props
  const { name, label, required, admin } = field

  const fieldPath = path || name
  const { value, setValue, showError, errorMessage } = useField<number>({ path: fieldPath })

  const handleChange = useCallback(
    (values: any) => {
      const { floatValue } = values
      setValue(floatValue ?? null)
    },
    [setValue],
  )

  return (
    <div className={`field-type number ${showError ? 'error' : ''}`} style={{ width: '100%' }}>
      <FieldLabel label={label} required={required} path={fieldPath} />

      <div className="input-wrapper">
        <NumericFormat
          value={value === null || value === undefined ? '' : value}
          onValueChange={handleChange}
          thousandSeparator={true}
          allowNegative={false}
          className="number-format-input"
          placeholder="0"
        />
      </div>

      {admin?.description && (
        <div className="field-description">
          {typeof admin.description === 'string' ? admin.description : ''}
        </div>
      )}

      {showError && <div className="field-error">{errorMessage}</div>}
    </div>
  )
}
