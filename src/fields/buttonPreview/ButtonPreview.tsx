'use client'
import React from 'react'
import { useFormFields } from '@payloadcms/ui'
import './ButtonPreview.scss'

type ButtonPreviewType = 'background' | 'hover'

interface ButtonPreviewProps {
  type: ButtonPreviewType
}

// Helper function to convert linear position to radial position
function linearToRadialPosition(linearPosition: string): string {
  const mapping: Record<string, string> = {
    'to top': 'center bottom',
    'to top right': 'bottom left',
    'to right': 'center left',
    'to bottom right': 'top left',
    'to bottom': 'center top',
    'to bottom left': 'top right',
    'to left': 'center right',
    'to top left': 'bottom right',
  }
  return mapping[linearPosition] || 'center'
}

// Helper function to generate button background CSS
function generateButtonBgStyle(
  enableGradient: boolean | undefined | null,
  solidColor: string | undefined | null,
  startColor: string | undefined | null,
  endColor: string | undefined | null,
  gradientType: string | undefined | null,
  gradientPosition: string | undefined | null,
  defaultColor: string,
): string {
  if (!enableGradient) {
    return solidColor || defaultColor
  }

  const start = startColor || defaultColor
  const end = endColor || defaultColor
  const type = gradientType || 'linear'
  const position = gradientPosition || 'to bottom'

  if (type === 'radial') {
    const radialPosition = linearToRadialPosition(position)
    return `radial-gradient(circle at ${radialPosition}, ${start}, ${end})`
  }

  return `linear-gradient(${position}, ${start}, ${end})`
}

export const ButtonPreview: React.FC<ButtonPreviewProps> = ({ type }) => {
  // Get form field values
  const fields = useFormFields(([fields]) => {
    const borderRadius = (fields['buttonColors.buttonBorderRadius']?.value as string) || '6px'

    if (type === 'background') {
      return {
        enableGradient: fields['buttonColors.enableButtonBgGradient']?.value as boolean,
        solidColor: fields['buttonColors.buttonBgColor']?.value as string,
        startColor: fields['buttonColors.buttonBgGradientStartColor']?.value as string,
        endColor: fields['buttonColors.buttonBgGradientEndColor']?.value as string,
        gradientType: fields['buttonColors.buttonBgGradientType']?.value as string,
        gradientPosition: fields['buttonColors.buttonBgGradientPosition']?.value as string,
        textColor: fields['buttonColors.buttonTextColor']?.value as string,
        borderRadius,
      }
    } else {
      return {
        enableGradient: fields['buttonColors.enableButtonHoverBgGradient']?.value as boolean,
        solidColor: fields['buttonColors.buttonHoverBgColor']?.value as string,
        startColor: fields['buttonColors.buttonHoverBgGradientStartColor']?.value as string,
        endColor: fields['buttonColors.buttonHoverBgGradientEndColor']?.value as string,
        gradientType: fields['buttonColors.buttonHoverBgGradientType']?.value as string,
        gradientPosition: fields['buttonColors.buttonHoverBgGradientPosition']?.value as string,
        textColor: fields['buttonColors.buttonTextHoverColor']?.value as string,
        borderRadius,
      }
    }
  })

  const buttonBackground = generateButtonBgStyle(
    fields.enableGradient,
    fields.solidColor,
    fields.startColor,
    fields.endColor,
    fields.gradientType,
    fields.gradientPosition,
    type === 'background' ? '#DC1F26' : '#B31117',
  )

  const textColor = fields.textColor || '#FFFFFF'

  return (
    <div className="button-preview-container">
      <button
        type="button"
        className="button-preview"
        style={{
          background: buttonBackground,
          color: textColor,
          borderRadius: fields.borderRadius,
        }}
      >
        Button Preview
      </button>
    </div>
  )
}

// Wrapper component for Background Preview
export const ButtonBgPreview: React.FC = () => {
  return <ButtonPreview type="background" />
}

// Wrapper component for Hover Preview
export const ButtonHoverPreview: React.FC = () => {
  return <ButtonPreview type="hover" />
}
