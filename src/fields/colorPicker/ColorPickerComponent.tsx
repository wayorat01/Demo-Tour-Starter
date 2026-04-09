'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { TextFieldClientProps } from 'payload'
import { useField, FieldLabel, FieldDescription } from '@payloadcms/ui'
import './ColorPickerComponent.scss'
import { X } from 'lucide-react'

// Color conversion utilities
function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase()
}

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return null

  const r = parseInt(result[1], 16) / 255
  const g = parseInt(result[2], 16) / 255
  const b = parseInt(result[3], 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60
        break
      case g:
        h = ((b - r) / d + 2) * 60
        break
      case b:
        h = ((r - g) / d + 4) * 60
        break
    }
  }

  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function parseHslString(hsl: string): { h: number; s: number; l: number } | null {
  const match = hsl.match(
    /hsl\(\s*(\d+(?:\.\d+)?),?\s*(\d+(?:\.\d+)?)%?,?\s*(\d+(?:\.\d+)?)%?\s*\)/i,
  )
  if (!match) return null
  return {
    h: parseFloat(match[1]),
    s: parseFloat(match[2]),
    l: parseFloat(match[3]),
  }
}

function hslToString(h: number, s: number, l: number): string {
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`
}

type ColorPickerComponentProps = TextFieldClientProps & {
  defaultValue?: string
}

export const ColorPickerComponent: React.FC<ColorPickerComponentProps> = ({
  field,
  path,
  readOnly: readOnlyFromProps,
  defaultValue: defaultValueProp = '',
}) => {
  const { label, admin } = field
  const description = admin?.description
  const { value, setValue } = useField<string>({ path: path || field.name })

  const [isOpen, setIsOpen] = useState(false)
  const [displayFormat, setDisplayFormat] = useState<'hsl' | 'hex'>('hsl')
  const [hue, setHue] = useState(0)
  const [saturation, setSaturation] = useState(100)
  const [lightness, setLightness] = useState(50)
  const [inputValue, setInputValue] = useState('')
  const [popupHexInput, setPopupHexInput] = useState('')

  const popupRef = useRef<HTMLDivElement>(null)
  const gradientRef = useRef<HTMLCanvasElement>(null)
  const hueRef = useRef<HTMLCanvasElement>(null)

  // Parse initial value
  useEffect(() => {
    if (!value) return

    // Try HSL format first
    const hslParsed = parseHslString(value)
    if (hslParsed) {
      setHue(hslParsed.h)
      setSaturation(hslParsed.s)
      setLightness(hslParsed.l)
      setInputValue(
        displayFormat === 'hsl' ? value : hslToHex(hslParsed.h, hslParsed.s, hslParsed.l),
      )
      return
    }

    // Try HEX format
    const hexParsed = hexToHsl(value)
    if (hexParsed) {
      setHue(hexParsed.h)
      setSaturation(hexParsed.s)
      setLightness(hexParsed.l)
      setInputValue(
        displayFormat === 'hex' ? value : hslToString(hexParsed.h, hexParsed.s, hexParsed.l),
      )
    }
  }, [value, displayFormat])

  // Draw gradient canvas
  useEffect(() => {
    const canvas = gradientRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Draw saturation/lightness gradient
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const s = (x / width) * 100
        const l = 100 - (y / height) * 100
        ctx.fillStyle = `hsl(${hue}, ${s}%, ${l}%)`
        ctx.fillRect(x, y, 1, 1)
      }
    }
  }, [hue, isOpen])

  // Draw hue slider
  useEffect(() => {
    const canvas = hueRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const gradient = ctx.createLinearGradient(0, 0, width, 0)

    for (let i = 0; i <= 360; i += 30) {
      gradient.addColorStop(i / 360, `hsl(${i}, 100%, 50%)`)
    }

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
  }, [isOpen])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const updateColor = useCallback(
    (h: number, s: number, l: number) => {
      setHue(h)
      setSaturation(s)
      setLightness(l)
      const newValue = hslToString(h, s, l)
      setValue(newValue)
      setInputValue(displayFormat === 'hsl' ? newValue : hslToHex(h, s, l))
    },
    [setValue, displayFormat],
  )

  const handleGradientClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = gradientRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const s = Math.max(0, Math.min(100, (x / rect.width) * 100))
      const l = Math.max(0, Math.min(100, 100 - (y / rect.height) * 100))
      updateColor(hue, s, l)
    },
    [hue, updateColor],
  )

  const handleHueClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = hueRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const h = Math.max(0, Math.min(360, (x / rect.width) * 360))
      updateColor(h, saturation, lightness)
    },
    [saturation, lightness, updateColor],
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      setInputValue(val)

      // Try HEX
      if (val.startsWith('#')) {
        const parsed = hexToHsl(val)
        if (parsed) {
          setHue(parsed.h)
          setSaturation(parsed.s)
          setLightness(parsed.l)
          setValue(hslToString(parsed.h, parsed.s, parsed.l))
        }
        return
      }

      // Try HSL
      const parsed = parseHslString(val)
      if (parsed) {
        setHue(parsed.h)
        setSaturation(parsed.s)
        setLightness(parsed.l)
        setValue(val)
      }
    },
    [setValue],
  )

  const toggleFormat = useCallback(() => {
    const newFormat = displayFormat === 'hsl' ? 'hex' : 'hsl'
    setDisplayFormat(newFormat)
    setInputValue(
      newFormat === 'hsl'
        ? hslToString(hue, saturation, lightness)
        : hslToHex(hue, saturation, lightness),
    )
  }, [displayFormat, hue, saturation, lightness])

  const currentColor = hslToString(hue, saturation, lightness)
  const currentHex = hslToHex(hue, saturation, lightness)

  // Sync popupHexInput when color changes (from gradient/hue click)
  useEffect(() => {
    setPopupHexInput(currentHex)
  }, [currentHex])

  return (
    <div className="field-type color-picker-field">
      <FieldLabel htmlFor={`field-${path}`} label={label} />

      <div className="color-picker-wrapper" ref={popupRef}>
        <div className="color-picker-input-row">
          <button
            type="button"
            className="color-swatch"
            style={{ backgroundColor: currentColor }}
            onClick={() => !readOnlyFromProps && setIsOpen(!isOpen)}
            disabled={readOnlyFromProps}
            aria-label="Open color picker"
          />
          <input
            type="text"
            className="color-text-input"
            value={inputValue || value || ''}
            onChange={handleInputChange}
            readOnly={readOnlyFromProps}
            placeholder="hsl(0, 0%, 100%) or #FFFFFF"
          />
          <button
            type="button"
            className="clear-btn"
            onClick={() => {
              const defaultVal = defaultValueProp
              if (!defaultVal) {
                // Truly clear — no default
                setValue('')
                setInputValue('')
                setHue(0)
                setSaturation(0)
                setLightness(100)
              } else {
                setValue(defaultVal)
                const parsed = parseHslString(defaultVal)
                if (parsed) {
                  setHue(parsed.h)
                  setSaturation(parsed.s)
                  setLightness(parsed.l)
                  setInputValue(
                    displayFormat === 'hsl' ? defaultVal : hslToHex(parsed.h, parsed.s, parsed.l),
                  )
                }
              }
            }}
            disabled={
              readOnlyFromProps || (!value && !defaultValueProp) || value === defaultValueProp
            }
            aria-label="Clear to default"
            title={defaultValueProp ? 'Reset to default' : 'Clear color'}
          >
            <X size={16} />
          </button>
          <button
            type="button"
            className="format-toggle"
            onClick={toggleFormat}
            disabled={readOnlyFromProps}
          >
            {displayFormat.toUpperCase()}
          </button>
        </div>

        {isOpen && (
          <div className="color-picker-popup">
            <canvas
              ref={gradientRef}
              className="gradient-canvas"
              width={200}
              height={150}
              onClick={handleGradientClick}
            />
            <div
              className="gradient-cursor"
              style={{
                left: `${(saturation / 100) * 200}px`,
                top: `${((100 - lightness) / 100) * 150}px`,
                backgroundColor: currentColor,
              }}
            />
            <canvas
              ref={hueRef}
              className="hue-slider"
              width={200}
              height={16}
              onClick={handleHueClick}
            />
            <div className="hue-cursor" style={{ left: `${(hue / 360) * 200}px` }} />
            <div className="popup-input-row">
              <input
                type="text"
                className="popup-hex-input"
                value={popupHexInput}
                onChange={(e) => {
                  const val = e.target.value
                  setPopupHexInput(val)
                  const parsed = hexToHsl(val)
                  if (parsed) {
                    updateColor(parsed.h, parsed.s, parsed.l)
                  }
                }}
                placeholder="#FFFFFF"
              />
            </div>
          </div>
        )}
      </div>
      <FieldDescription description={description} path={path} />
    </div>
  )
}
