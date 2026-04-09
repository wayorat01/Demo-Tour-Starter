'use client'
import React from 'react'
import { useForm, useAllFormFields } from '@payloadcms/ui'
import type { UIFieldClientComponent } from 'payload'
import './ClearAllColorsButton.scss'

// Default values for all darkmode color fields
const darkmodeColorDefaults: Record<string, string> = {
  'darkmodeColors.background': 'hsl(0, 0%, 0%)',
  'darkmodeColors.foreground': 'hsl(210, 40%, 98%)',
  'darkmodeColors.card': 'hsl(240, 6%, 10%)',
  'darkmodeColors.card-foreground': 'hsl(210, 40%, 98%)',
  'darkmodeColors.popover': 'hsl(222.2 84%, 4.9%)',
  'darkmodeColors.popover-foreground': 'hsl(210, 40%, 98%)',
  'darkmodeColors.primary': 'hsl(210, 40%, 98%)',
  'darkmodeColors.primary-foreground': 'hsl(222.2 47.4%, 11.2%)',
  'darkmodeColors.secondary': 'hsl(217.2 32.6%, 17.5%)',
  'darkmodeColors.secondary-foreground': 'hsl(210, 40%, 98%)',
  'darkmodeColors.muted': 'hsl(217.2 32.6%, 17.5%)',
  'darkmodeColors.muted-foreground': 'hsl(215, 20.2%, 65.1%)',
  'darkmodeColors.accent': 'hsl(217.2 32.6%, 17.5%)',
  'darkmodeColors.accent-foreground': 'hsl(210, 40%, 98%)',
  'darkmodeColors.destructive': 'hsl(0, 62.8%, 30.6%)',
  'darkmodeColors.destructive-foreground': 'hsl(210, 40%, 98%)',
  'darkmodeColors.border': 'hsl(240, 4%, 16%)',
  'darkmodeColors.input': 'hsl(217.2 32.6%, 17.5%)',
  'darkmodeColors.ring-3': 'hsl(212,.7 26.8%, 83.9%)',
  'darkmodeColors.success': 'hsl(196, 100%, 14%)',
  'darkmodeColors.warning': 'hsl(34, 51%, 25%)',
  'darkmodeColors.error': 'hsl(10, 39%, 43%)',
}

export const ClearAllDarkmodeColorsButton: UIFieldClientComponent = () => {
  const { dispatchFields } = useForm()
  const [fields] = useAllFormFields()

  // Check if any color has been modified from its default
  const hasModifications = Object.entries(darkmodeColorDefaults).some(([path, defaultValue]) => {
    const currentValue = fields[path]?.value
    return currentValue !== undefined && currentValue !== defaultValue
  })

  const handleClearAll = () => {
    Object.entries(darkmodeColorDefaults).forEach(([path, defaultValue]) => {
      dispatchFields({
        type: 'UPDATE',
        path,
        value: defaultValue,
      })
    })
  }

  return (
    <div className="clear-all-colors-header">
      <button
        type="button"
        className="clear-all-colors-btn"
        onClick={handleClearAll}
        disabled={!hasModifications}
      >
        <span className="btn-icon">×</span>
        <span className="btn-text">Clear All Colors</span>
      </button>
    </div>
  )
}
