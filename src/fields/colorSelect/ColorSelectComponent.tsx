'use client'
import React, { useState, useRef, useEffect } from 'react'
import type { SelectFieldClientProps } from 'payload'
import { useField, FieldLabel, FieldDescription } from '@payloadcms/ui'
import './ColorSelectComponent.scss'

// Default fallback colors — updated from ThemeConfig API (regularColors)
// These are used in the admin panel where frontend CSS vars aren't available
const DEFAULT_COLOR_MAP: Record<string, string> = {
  background: 'hsl(0, 0%, 100%)',
  foreground: 'hsl(222.2, 84%, 4.9%)',
  card: 'hsl(240, 5%, 96%)',
  'card-foreground': 'hsl(222.2, 84%, 4.9%)',
  popover: 'hsl(0, 0%, 100%)',
  'popover-foreground': 'hsl(222.2, 84%, 4.9%)',
  primary: 'hsl(214, 97%, 61%)',
  'primary-foreground': 'hsl(210, 40%, 98%)',
  secondary: '#00EACF',
  'secondary-foreground': 'hsl(222.2, 47.4%, 11.2%)',
  muted: 'hsl(210, 40%, 96.1%)',
  'muted-foreground': 'hsl(215.4, 16.3%, 46.9%)',
  accent: 'hsl(214, 97%, 61%)',
  'accent-foreground': 'hsl(222.2, 47.4%, 11.2%)',
  destructive: 'hsl(0, 84.2%, 60.2%)',
  'destructive-foreground': 'hsl(210, 40%, 98%)',
  border: 'hsl(240, 6%, 90%)',
  input: 'hsl(214.3, 31.8%, 91.4%)',
  'ring-3': 'hsl(222.2, 84%, 4.9%)',
  success: 'hsl(196, 52%, 74%)',
  warning: 'hsl(34, 89%, 85%)',
  error: 'hsl(10, 100%, 86%)',
  'chart-1': 'hsl(28, 86%, 52%)',
  'chart-2': 'hsl(173, 58%, 39%)',
  'chart-3': 'hsl(197, 37%, 24%)',
  'chart-4': 'hsl(43, 74%, 66%)',
  'chart-5': 'hsl(27, 87%, 67%)',
  muted2: 'hsl(0, 0%, 91%)',
  'muted2-foreground': 'hsl(240, 3.8%, 46.1%)',
  transparent: 'transparent',
  white: '#ffffff',
  black: '#000000',
  // Gradient presets
  'gradient-blue': 'linear-gradient(135deg, #1976D2 0%, #42A5F5 50%, #64B5F6 100%)',
  'gradient-teal': 'linear-gradient(135deg, #00897B 0%, #26A69A 50%, #4DB6AC 100%)',
  'gradient-purple': 'linear-gradient(135deg, #7B1FA2 0%, #AB47BC 50%, #CE93D8 100%)',
  'gradient-orange': 'linear-gradient(135deg, #E65100 0%, #FB8C00 50%, #FFB74D 100%)',
  'gradient-red': 'linear-gradient(135deg, #C62828 0%, #EF5350 50%, #EF9A9A 100%)',
  'gradient-dark': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
}

// Attempt to load live colors from ThemeConfig API
const COLOR_MAP = { ...DEFAULT_COLOR_MAP }
let colorsLoaded = false

async function loadLiveColors() {
  if (colorsLoaded) return
  try {
    const res = await fetch('/api/globals/themeConfig')
    if (res.ok) {
      const data = await res.json()
      const live = data.regularColors || {}
      for (const [key, val] of Object.entries(live)) {
        if (typeof val === 'string') COLOR_MAP[key] = val
      }
    }
  } catch {
    /* use defaults */
  }
  colorsLoaded = true
}

function getColorStyle(token: string): React.CSSProperties {
  // Handle custom: prefix
  if (token.startsWith('custom:')) {
    const hex = token.slice(7)
    return { backgroundColor: hex }
  }
  const value = COLOR_MAP[token]
  if (!value) return { backgroundColor: '#cccccc' }
  if (value.startsWith('linear-gradient')) return { background: value }
  return { backgroundColor: value }
}

function getDisplayLabel(value: string, options: { label: string; value: string }[]): string {
  if (value.startsWith('custom:')) return `กำหนดเอง: ${value.slice(7)}`
  const opt = options.find((o) => o.value === value)
  return opt ? (typeof opt.label === 'string' ? opt.label : opt.value) : value
}

export const ColorSelectComponent: React.FC<SelectFieldClientProps> = ({
  field,
  path,
  readOnly,
}) => {
  const { label, admin, options } = field
  const description = admin?.description
  const { value, setValue } = useField<string>({ path: path || field.name })
  const [isOpen, setIsOpen] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [customHex, setCustomHex] = useState(
    value?.startsWith('custom:') ? value.slice(7) : '#2196F3',
  )
  const [, forceRender] = useState(0)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Load live theme colors on mount
  useEffect(() => {
    if (!colorsLoaded) {
      loadLiveColors().then(() => forceRender((n) => n + 1))
    }
  }, [])

  const resolvedOptions = (options || []).map((opt) => {
    if (typeof opt === 'string') return { label: opt, value: opt }
    return { label: typeof opt.label === 'string' ? opt.label : opt.value, value: opt.value }
  })

  const isCustom = value?.startsWith('custom:')

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setShowPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="field-type color-select-field">
      <FieldLabel htmlFor={`field-${path}`} label={label} />

      <div className="cs-dropdown" ref={wrapperRef}>
        {/* Trigger button */}
        <button
          type="button"
          className="cs-trigger"
          onClick={() => !readOnly && setIsOpen(!isOpen)}
          disabled={readOnly}
        >
          {value ? (
            <>
              <span
                className={`cs-dot${value.startsWith('gradient-') ? 'cs-dot-wide' : ''}`}
                style={getColorStyle(value)}
              />
              <span className="cs-label">{getDisplayLabel(value, resolvedOptions)}</span>
            </>
          ) : (
            <span className="cs-placeholder">— เลือกสี —</span>
          )}
          <span className="cs-trigger-right">
            {value && !readOnly && (
              <span
                className="cs-clear"
                role="button"
                tabIndex={0}
                title="ล้างค่า (ใช้สีเริ่มต้น)"
                onClick={(e) => {
                  e.stopPropagation()
                  setValue('' as any)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.stopPropagation()
                    setValue('' as any)
                  }
                }}
              >
                ✕
              </span>
            )}
            <span className="cs-arrow">{isOpen ? '▲' : '▼'}</span>
          </span>
        </button>

        {/* Dropdown list */}
        {isOpen && !showPicker && (
          <div className="cs-list">
            {resolvedOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`cs-option${value === opt.value ? 'active' : ''}`}
                onClick={() => {
                  setValue(opt.value)
                  setIsOpen(false)
                }}
              >
                <span
                  className={`cs-dot${opt.value.startsWith('gradient-') ? 'cs-dot-wide' : ''}`}
                  style={getColorStyle(opt.value)}
                />
                <span className="cs-label">{opt.label}</span>
              </button>
            ))}

            {/* Custom color option */}
            <button
              type="button"
              className={`cs-option cs-option-custom${isCustom ? 'active' : ''}`}
              onClick={() => setShowPicker(true)}
            >
              <span
                className="cs-dot"
                style={{
                  background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
                }}
              />
              <span className="cs-label">🎨 กำหนดสีเอง</span>
            </button>
          </div>
        )}

        {/* Custom color picker */}
        {isOpen && showPicker && (
          <div className="cs-picker">
            <div className="cs-picker-header">
              <button type="button" className="cs-picker-back" onClick={() => setShowPicker(false)}>
                ← กลับ
              </button>
              <span className="cs-picker-title">กำหนดสีเอง</span>
            </div>
            <div className="cs-picker-body">
              <input
                type="color"
                className="cs-color-input"
                value={customHex}
                onChange={(e) => {
                  setCustomHex(e.target.value)
                  setValue(`custom:${e.target.value}`)
                }}
              />
              <input
                type="text"
                className="cs-hex-input"
                value={customHex}
                placeholder="#RRGGBB"
                onChange={(e) => {
                  setCustomHex(e.target.value)
                  if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                    setValue(`custom:${e.target.value}`)
                  }
                }}
              />
              <span className="cs-dot cs-dot-preview" style={{ backgroundColor: customHex }} />
            </div>
            <button
              type="button"
              className="cs-picker-done"
              onClick={() => {
                setIsOpen(false)
                setShowPicker(false)
              }}
            >
              ✓ ตกลง
            </button>
          </div>
        )}
      </div>

      <FieldDescription description={description} path={path} />
    </div>
  )
}
