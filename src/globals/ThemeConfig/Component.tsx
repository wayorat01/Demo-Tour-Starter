import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'
import type { ThemeConfig as ThemeConfigType } from '@/payload-types'
import { PublicContextProps } from '@/utilities/publicContextProps'

// Local font mapping (for built-in fonts loaded via next/font/local in layout.tsx)
const localFontMap: Record<string, string> = {
  kanit: 'var(--font-kanit)',
  'noto-sans-thai': 'var(--font-noto-sans-thai)',
  'noto-sans-thai-looped': 'var(--font-noto-sans-thai-looped)',
}

// Parse font value — 'kanit' → local, 'google:Sarabun' → Google Font
function parseFontValue(value: string): {
  type: 'local' | 'google'
  family: string
  googleName?: string
} {
  if (value.startsWith('google:')) {
    const name = value.replace('google:', '')
    // Fallback to Kanit (local) if Google Font fails to load
    return { type: 'google', family: `'${name}', var(--font-kanit), sans-serif`, googleName: name }
  }
  return { type: 'local', family: localFontMap[value] || localFontMap.kanit }
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

// Helper function to generate button background CSS (solid or gradient)
function generateButtonBg(
  enableGradient: boolean | undefined | null,
  solidColor: string | undefined | null,
  gradientStartColor: string | undefined | null,
  gradientEndColor: string | undefined | null,
  gradientType: string | undefined | null,
  gradientPosition: string | undefined | null,
  defaultColor: string,
): string {
  if (!enableGradient) {
    return solidColor || defaultColor
  }

  const startColor = gradientStartColor || defaultColor
  const endColor = gradientEndColor || defaultColor
  const type = gradientType || 'linear'
  const position = gradientPosition || 'to bottom'

  if (type === 'radial') {
    const radialPosition = linearToRadialPosition(position)
    return `radial-gradient(circle at ${radialPosition}, ${startColor}, ${endColor})`
  }

  return `linear-gradient(${position}, ${startColor}, ${endColor})`
}

export async function ThemeConfig({ publicContext }: { publicContext: PublicContextProps }) {
  const themeConfig: ThemeConfigType = await getCachedGlobal(
    'themeConfig',
    publicContext.locale,
    2,
  )()

  // Resolve font values — support local fonts + Google Fonts + custom Google Font name
  const bodyFontValue =
    themeConfig.typography?.bodyFont === 'custom'
      ? `google:${(themeConfig.typography as any)?.customBodyFontName || 'Kanit'}`
      : (themeConfig.typography?.bodyFont || 'kanit')
  const headingFontValue =
    themeConfig.typography?.headingFont === 'custom'
      ? `google:${(themeConfig.typography as any)?.customHeadingFontName || 'Kanit'}`
      : (themeConfig.typography?.headingFont || 'kanit')

  const bodyFont = parseFontValue(bodyFontValue)
  const headingFont = parseFontValue(headingFontValue)

  // Collect unique Google Fonts to load via CDN (only 1-2 fonts, not all)
  const googleFonts = new Set<string>()
  if (bodyFont.googleName) googleFonts.add(bodyFont.googleName)
  if (headingFont.googleName) googleFonts.add(headingFont.googleName)

  const googleFontsUrl =
    googleFonts.size > 0
      ? `https://fonts.googleapis.com/css2?${[...googleFonts].map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700`).join('&')}&display=swap`
      : null

  // Generate button background CSS
  const buttonBg = generateButtonBg(
    themeConfig.buttonColors?.enableButtonBgGradient,
    themeConfig.buttonColors?.buttonBgColor,
    themeConfig.buttonColors?.buttonBgGradientStartColor,
    themeConfig.buttonColors?.buttonBgGradientEndColor,
    themeConfig.buttonColors?.buttonBgGradientType,
    themeConfig.buttonColors?.buttonBgGradientPosition,
    '#DC1F26',
  )

  const buttonHoverBg = generateButtonBg(
    themeConfig.buttonColors?.enableButtonHoverBgGradient,
    themeConfig.buttonColors?.buttonHoverBgColor,
    themeConfig.buttonColors?.buttonHoverBgGradientStartColor,
    themeConfig.buttonColors?.buttonHoverBgGradientEndColor,
    themeConfig.buttonColors?.buttonHoverBgGradientType,
    themeConfig.buttonColors?.buttonHoverBgGradientPosition,
    '#B31117',
  )

  const buttonTextColor = themeConfig.buttonColors?.buttonTextColor || '#FFFFFF'
  const buttonTextHoverColor = themeConfig.buttonColors?.buttonTextHoverColor || '#FFFFFF'
  const buttonBorderRadius = themeConfig.buttonColors?.buttonBorderRadius || '6px'

  return (
    <>
      {/* Google Fonts — load on-demand, only the selected font(s) */}
      {googleFontsUrl && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href={googleFontsUrl} rel="stylesheet" />
        </>
      )}
      <style
        id="theme-config"
        dangerouslySetInnerHTML={{
          __html:
            `
:root { 
  --radius: ${themeConfig.radius};
  --font-body: ${bodyFont.family};
  --font-heading: ${headingFont.family};

  --background: ${themeConfig.regularColors?.background};
  --foreground: ${themeConfig.regularColors?.foreground};
  --card: ${themeConfig.regularColors?.card};
  --card-foreground: ${themeConfig.regularColors?.['card-foreground']};

  --popover: ${themeConfig.regularColors?.popover};
  --popover-foreground: ${themeConfig.regularColors?.['popover-foreground']};

  --primary: ${themeConfig.regularColors?.primary};
  --primary-foreground: ${themeConfig.regularColors?.['primary-foreground']};

  --secondary: ${themeConfig.regularColors?.secondary};
  --secondary-foreground: ${themeConfig.regularColors?.['secondary-foreground']};

  --muted: ${themeConfig.regularColors?.muted};
  --muted-foreground: ${themeConfig.regularColors?.['muted-foreground']};

  --accent: ${themeConfig.regularColors?.accent};
  --accent-foreground: ${themeConfig.regularColors?.['accent-foreground']};

  --destructive: ${themeConfig.regularColors?.destructive};
  --destructive-foreground: ${themeConfig.regularColors?.['destructive-foreground']};

  --border: ${themeConfig.regularColors?.border};
  --input: ${themeConfig.regularColors?.input};
  --ring: ${themeConfig.regularColors?.['ring-3']};

  --success: ${themeConfig.regularColors?.success};
  --warning: ${themeConfig.regularColors?.warning};
  --error: ${themeConfig.regularColors?.error};

  --chart-1: ${themeConfig.regularColors?.['chart-1']};
  --chart-2: ${themeConfig.regularColors?.['chart-2']};
  --chart-3: ${themeConfig.regularColors?.['chart-3']};
  --chart-4: ${themeConfig.regularColors?.['chart-4']};
  --chart-5: ${themeConfig.regularColors?.['chart-5']};

  --muted2: ${themeConfig.regularColors?.muted2};
  --muted2-foreground: ${themeConfig.regularColors?.['muted2-foreground']};

  /* Button Colors */
  --btn-bg: ${buttonBg};
  --btn-bg-hover: ${buttonHoverBg};
  --btn-text: ${buttonTextColor};
  --btn-text-hover: ${buttonTextHoverColor};
  --btn-radius: ${buttonBorderRadius};
}` +
            (themeConfig.darkmodeColors?.enableDarkMode
              ? `

        
[data-theme='dark'] {
  --background: ${themeConfig.darkmodeColors?.background};
  --foreground: ${themeConfig.darkmodeColors?.foreground};

  --card: ${themeConfig.darkmodeColors?.card};
  --card-foreground: ${themeConfig.darkmodeColors?.['card-foreground']};

  --popover: ${themeConfig.darkmodeColors?.popover};
  --popover-foreground: ${themeConfig.darkmodeColors?.['popover-foreground']};

  --primary: ${themeConfig.darkmodeColors?.primary};
  --primary-foreground: ${themeConfig.darkmodeColors?.['primary-foreground']};

  --secondary: ${themeConfig.darkmodeColors?.secondary};
  --secondary-foreground: ${themeConfig.darkmodeColors?.['secondary-foreground']};

  --muted: ${themeConfig.darkmodeColors?.muted};
  --muted-foreground: ${themeConfig.darkmodeColors?.['muted-foreground']};

  --accent: ${themeConfig.darkmodeColors?.accent};
  --accent-foreground: ${themeConfig.darkmodeColors?.['accent-foreground']};

  --destructive: ${themeConfig.darkmodeColors?.destructive};
  --destructive-foreground: ${themeConfig.darkmodeColors?.['destructive-foreground']};

  --border: ${themeConfig.darkmodeColors?.border};
  --input: ${themeConfig.darkmodeColors?.input};
  --ring: ${themeConfig.darkmodeColors?.['ring-3']};

  --success: ${themeConfig.darkmodeColors?.success};
  --warning: ${themeConfig.darkmodeColors?.warning};
  --error: ${themeConfig.darkmodeColors?.error};
}`
              : ''),
        }}
      />
    </>
  )
}
