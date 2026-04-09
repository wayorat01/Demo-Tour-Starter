'use client'

import React from 'react'
import type { CheckboxFieldClientProps } from 'payload'
import { useField, useForm, FieldLabel, FieldDescription, CheckboxInput } from '@payloadcms/ui'

export const IncludeCityCheckbox: React.FC<CheckboxFieldClientProps> = (props) => {
  const { path, field, readOnly: readOnlyFromProps } = props
  const { value, setValue } = useField<boolean>({ path: path || field.name })
  const { dispatchFields, getFields } = useForm()

  const checked = Boolean(value)

  const handleChange = (isChecked: boolean) => {
    setValue(isChecked)

    if (isChecked && !readOnlyFromProps) {
      // Find the base path, mapping from e.g., "searchFields.countryField.includeCity"
      const basePath = (path || field.name).replace(/\.?includeCity$/, '')

      const formFields = getFields()

      const labelPath = basePath ? `${basePath}.label` : 'label'
      const placeholderPath = basePath ? `${basePath}.placeholder` : 'placeholder'

      const currentLabel = formFields[labelPath]?.value
      const currentPlaceholder = formFields[placeholderPath]?.value

      if (!currentLabel || currentLabel === 'เลือกประเทศ') {
        dispatchFields({
          type: 'UPDATE',
          path: labelPath,
          value: 'เลือกประเทศ / เมือง',
        })
      }

      if (!currentPlaceholder || currentPlaceholder === 'เลือกประเทศ') {
        dispatchFields({
          type: 'UPDATE',
          path: placeholderPath,
          value: 'เลือกประเทศ / เมือง',
        })
      }
    }
  }

  return (
    <div className="field-type checkbox" style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
        <CheckboxInput
          id={`field-${path || field.name}`}
          name={path || field.name}
          checked={checked}
          onToggle={() => handleChange(!checked)}
          readOnly={readOnlyFromProps}
          required={field.required}
        />
        <div style={{ cursor: 'pointer', userSelect: 'none', margin: 0, padding: 0 }}>
          <FieldLabel
            htmlFor={`field-${path || field.name}`}
            label={field.label}
            required={field.required}
          />
        </div>
      </div>
      <FieldDescription description={field.admin?.description} path={path || field.name} />
    </div>
  )
}
