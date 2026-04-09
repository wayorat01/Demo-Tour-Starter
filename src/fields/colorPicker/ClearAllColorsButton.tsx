'use client'
import React from 'react'
import { useForm, useAllFormFields } from '@payloadcms/ui'
import type { UIFieldClientComponent } from 'payload'
import './ClearAllColorsButton.scss'
import { X } from 'lucide-react'

// Default values for all regular color fields
const regularColorDefaults: Record<string, string> = {
  'regularColors.background': 'hsl(0, 0%, 100%)',
  'regularColors.foreground': 'hsl(222, 84%, 5%)',
  'regularColors.card': 'hsl(240, 5%, 96%)',
  'regularColors.card-foreground': 'hsl(222, 84%, 5%)',
  'regularColors.popover': 'hsl(0, 0%, 100%)',
  'regularColors.popover-foreground': 'hsl(222, 84%, 5%)',
  'regularColors.primary': 'hsl(222, 47%, 11%)',
  'regularColors.primary-foreground': 'hsl(210, 40%, 98%)',
  'regularColors.secondary': 'hsl(210, 40%, 96%)',
  'regularColors.secondary-foreground': 'hsl(222, 47%, 11%)',
  'regularColors.muted': 'hsl(210, 40%, 96%)',
  'regularColors.muted-foreground': 'hsl(215, 16%, 47%)',
  'regularColors.accent': 'hsl(210, 40%, 96%)',
  'regularColors.accent-foreground': 'hsl(222, 47%, 11%)',
  'regularColors.destructive': 'hsl(0, 84%, 60%)',
  'regularColors.destructive-foreground': 'hsl(210, 40%, 98%)',
  'regularColors.border': 'hsl(240, 6%, 90%)',
  'regularColors.input': 'hsl(214, 32%, 91%)',
  'regularColors.ring-3': 'hsl(222, 84%, 5%)',
  'regularColors.success': 'hsl(196, 52%, 74%)',
  'regularColors.warning': 'hsl(34, 89%, 85%)',
  'regularColors.error': 'hsl(10, 100%, 86%)',
  'regularColors.chart-1': 'hsl(12, 76%, 61%)',
  'regularColors.chart-2': 'hsl(173, 58%, 39%)',
  'regularColors.chart-3': 'hsl(197, 37%, 24%)',
  'regularColors.chart-4': 'hsl(43, 74%, 66%)',
  'regularColors.chart-5': 'hsl(27, 87%, 67%)',
  'regularColors.muted2': 'hsl(0, 0%, 91%)',
  'regularColors.muted2-foreground': 'hsl(240, 4%, 46%)',
}

export const ClearAllColorsButton: UIFieldClientComponent = () => {
  const { dispatchFields } = useForm()
  const [fields] = useAllFormFields()

  // Check if any color has been modified from its default
  const hasModifications = React.useMemo(() => {
    return Object.entries(regularColorDefaults).some(([path, defaultValue]) => {
      const currentValue = fields[path]?.value
      return currentValue && currentValue !== defaultValue
    })
  }, [fields])

  const handleClearAll = () => {
    Object.entries(regularColorDefaults).forEach(([path, defaultValue]) => {
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
        <X size="16" />
        Clear All Colors
      </button>
    </div>
  )
}
