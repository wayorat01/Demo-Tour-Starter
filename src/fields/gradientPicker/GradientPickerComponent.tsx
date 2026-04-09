'use client'
import React, { useState, useRef, useEffect } from 'react'
import type { TextFieldClientProps } from 'payload'
import { useField, FieldLabel, FieldDescription } from '@payloadcms/ui'
import './GradientPickerComponent.scss'

// Preset gradients — same as GRADIENT_MAP in Component.tsx
const GRADIENT_PRESETS: { label: string; value: string; css: string }[] = [
  {
    label: '🌊 Blue',
    value: 'gradient-blue',
    css: 'linear-gradient(135deg, #1976D2 0%, #42A5F5 50%, #64B5F6 100%)',
  },
  {
    label: '🌿 Teal',
    value: 'gradient-teal',
    css: 'linear-gradient(135deg, #00897B 0%, #26A69A 50%, #4DB6AC 100%)',
  },
  {
    label: '🍇 Purple',
    value: 'gradient-purple',
    css: 'linear-gradient(135deg, #7B1FA2 0%, #AB47BC 50%, #CE93D8 100%)',
  },
  {
    label: '🌅 Orange',
    value: 'gradient-orange',
    css: 'linear-gradient(135deg, #E65100 0%, #FB8C00 50%, #FFB74D 100%)',
  },
  {
    label: '🌹 Red',
    value: 'gradient-red',
    css: 'linear-gradient(135deg, #C62828 0%, #EF5350 50%, #EF9A9A 100%)',
  },
  {
    label: '🌑 Dark',
    value: 'gradient-dark',
    css: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  },
]

// Solid color presets
const SOLID_PRESETS: { label: string; value: string; color: string }[] = [
  { label: 'Primary', value: 'primary', color: 'hsl(214,97%,61%)' },
  { label: 'Secondary', value: 'secondary', color: '#00EACF' },
  { label: 'White', value: 'white', color: '#ffffff' },
  { label: 'Black', value: 'black', color: '#000000' },
  { label: 'Background', value: 'background', color: 'hsl(0,0%,100%)' },
  { label: 'Card', value: 'card', color: 'hsl(240,5%,96%)' },
  { label: 'Accent', value: 'accent', color: 'hsl(214,97%,61%)' },
  { label: 'Muted', value: 'muted', color: 'hsl(210,40%,96.1%)' },
  { label: 'Muted 2', value: 'muted2', color: 'hsl(0,0%,91%)' },
]

const DIRECTIONS = [
  { label: '↗ 135°', value: '135deg' },
  { label: '→ 90° (Left to Right)', value: '90deg' },
  { label: '↓ 180° (Top to Bottom)', value: '180deg' },
  { label: '↘ 225°', value: '225deg' },
  { label: '↙ 315°', value: '315deg' },
  { label: '← 270° (Right to Left)', value: '270deg' },
  { label: '↑ 0° (Bottom to Top)', value: '0deg' },
  { label: '↖ 45°', value: '45deg' },
]

function parseGradient(val: string): { color1: string; color2: string; direction: string } | null {
  if (!val) return null
  // Handle custom:linear-gradient(...)
  const gradStr = val.startsWith('custom:') ? val.slice(7) : val
  const match = gradStr.match(
    /linear-gradient\((\d+deg),\s*(#[0-9a-fA-F]{6})\s+\d+%,\s*(#[0-9a-fA-F]{6})\s+\d+%\)/,
  )
  if (match) return { direction: match[1], color1: match[2], color2: match[3] }
  return null
}

function buildGradient(color1: string, color2: string, direction: string): string {
  return `linear-gradient(${direction}, ${color1} 0%, ${color2} 100%)`
}

function getPreviewStyle(value: string): React.CSSProperties {
  if (!value) return { background: '#eee' }
  // Preset gradient
  const preset = GRADIENT_PRESETS.find((p) => p.value === value)
  if (preset) return { background: preset.css }
  // Custom gradient
  if (value.startsWith('custom:')) {
    const raw = value.slice(7)
    if (raw.startsWith('linear-gradient')) return { background: raw }
    return { backgroundColor: raw }
  }
  // Solid preset
  const solid = SOLID_PRESETS.find((s) => s.value === value)
  if (solid) return { backgroundColor: solid.color }
  return { background: `var(--${value})` }
}

export const GradientPickerComponent: React.FC<TextFieldClientProps> = ({
  field,
  path,
  readOnly,
}) => {
  const { label, admin } = field
  const description = admin?.description
  const { value, setValue } = useField<string>({ path: path || field.name })

  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<'presets' | 'custom'>('presets')
  const parsedInitial = value ? parseGradient(value as string) : null
  const [color1, setColor1] = useState(parsedInitial?.color1 || '#00897B')
  const [color2, setColor2] = useState(parsedInitial?.color2 || '#4DB6AC')
  const [direction, setDirection] = useState(parsedInitial?.direction || '135deg')
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setMode('presets')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleCustomApply = () => {
    const grad = buildGradient(color1, color2, direction)
    setValue(`custom:${grad}`)
    setIsOpen(false)
    setMode('presets')
  }

  const isGradientPreset = GRADIENT_PRESETS.some((p) => p.value === value)
  const isSolidPreset = SOLID_PRESETS.some((p) => p.value === value)
  const isCustomGradient = value?.startsWith('custom:') && value.includes('linear-gradient')

  const displayLabel = (() => {
    if (!value) return null
    const gp = GRADIENT_PRESETS.find((p) => p.value === value)
    if (gp) return gp.label
    const sp = SOLID_PRESETS.find((p) => p.value === value)
    if (sp) return sp.label
    if (isCustomGradient) return '🎨 กำหนดเอง'
    if (value.startsWith('custom:')) return `กำหนดเอง: ${value.slice(7)}`
    return value
  })()

  return (
    <div className="field-type gp-field" ref={wrapperRef}>
      <FieldLabel htmlFor={`field-${path}`} label={label} />

      <div style={{ position: 'relative' }}>
        {/* Trigger */}
        <button
          type="button"
          className="gp-trigger"
          onClick={() => !readOnly && setIsOpen(!isOpen)}
          disabled={readOnly}
        >
          <span className="gp-preview-dot" style={getPreviewStyle(value as string)} />
          {displayLabel ? (
            <span className="gp-label">{displayLabel}</span>
          ) : (
            <span className="gp-placeholder">— เลือกสีพื้นหลัง —</span>
          )}
          <span className="gp-trigger-right">
            {value && !readOnly && (
              <span
                className="gp-clear"
                role="button"
                tabIndex={0}
                title="ล้างค่า"
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
            <span className="gp-arrow">{isOpen ? '▲' : '▼'}</span>
          </span>
        </button>

        {/* Dropdown */}
        {isOpen && mode === 'presets' && (
          <div className="gp-dropdown">
            {/* Section: Solid Presets */}
            <div className="gp-section-label">Solid</div>
            <div className="gp-presets-grid">
              {SOLID_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  className={`gp-preset-item${value === p.value ? 'active' : ''}`}
                  title={p.label}
                  onClick={() => {
                    setValue(p.value)
                    setIsOpen(false)
                  }}
                >
                  <span className="gp-preset-swatch" style={{ backgroundColor: p.color }} />
                  <span className="gp-preset-label">{p.label}</span>
                </button>
              ))}
            </div>

            {/* Section: Gradient Presets */}
            <div className="gp-section-label">Gradient</div>
            <div className="gp-presets-grid">
              {GRADIENT_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  className={`gp-preset-item${value === p.value ? 'active' : ''}`}
                  title={p.label}
                  onClick={() => {
                    setValue(p.value)
                    setIsOpen(false)
                  }}
                >
                  <span className="gp-preset-swatch" style={{ background: p.css }} />
                  <span className="gp-preset-label">{p.label}</span>
                </button>
              ))}
            </div>

            {/* Custom gradient button */}
            <button
              type="button"
              className={`gp-custom-btn${isCustomGradient ? 'active' : ''}`}
              onClick={() => setMode('custom')}
            >
              🎨 สร้าง Gradient เอง
            </button>
          </div>
        )}

        {/* Custom gradient editor */}
        {isOpen && mode === 'custom' && (
          <div className="gp-dropdown gp-editor">
            <div className="gp-editor-header">
              <button type="button" className="gp-back" onClick={() => setMode('presets')}>
                ← กลับ
              </button>
              <span className="gp-editor-title">สร้าง Gradient</span>
            </div>

            {/* Live preview */}
            <div
              className="gp-live-preview"
              style={{ background: buildGradient(color1, color2, direction) }}
            />

            {/* Color pickers row */}
            <div className="gp-color-row">
              <div className="gp-color-group">
                <label className="gp-small-label">สีเริ่มต้น</label>
                <div className="gp-color-input-wrap">
                  <input
                    type="color"
                    className="gp-color-input"
                    value={color1}
                    onChange={(e) => setColor1(e.target.value)}
                  />
                  <input
                    type="text"
                    className="gp-hex-input"
                    value={color1}
                    onChange={(e) => {
                      setColor1(e.target.value)
                    }}
                  />
                </div>
              </div>
              <div className="gp-color-group">
                <label className="gp-small-label">สีสิ้นสุด</label>
                <div className="gp-color-input-wrap">
                  <input
                    type="color"
                    className="gp-color-input"
                    value={color2}
                    onChange={(e) => setColor2(e.target.value)}
                  />
                  <input
                    type="text"
                    className="gp-hex-input"
                    value={color2}
                    onChange={(e) => {
                      setColor2(e.target.value)
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Direction selector */}
            <div className="gp-direction-group">
              <label className="gp-small-label">ทิศทาง</label>
              <div className="gp-direction-grid">
                {DIRECTIONS.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    className={`gp-dir-btn${direction === d.value ? 'active' : ''}`}
                    onClick={() => setDirection(d.value)}
                    title={d.label}
                  >
                    {d.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Apply button */}
            <button type="button" className="gp-apply" onClick={handleCustomApply}>
              ✓ ใช้ Gradient นี้
            </button>
          </div>
        )}
      </div>

      <FieldDescription description={description} path={path} />
    </div>
  )
}
