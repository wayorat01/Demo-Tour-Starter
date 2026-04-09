import React from 'react'

export const buttonStyleMap: Record<string, React.CSSProperties> = {
  primary: {
    backgroundColor: 'var(--primary, #2563eb)',
    color: '#ffffff',
    border: 'none',
  },
  secondary: {
    backgroundColor: '#374151',
    color: '#ffffff',
    border: 'none',
  },
  outline: {
    backgroundColor: 'transparent',
    color: 'var(--primary, #2563eb)',
    border: '2px solid var(--primary, #2563eb)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--primary, #2563eb)',
    border: 'none',
  },
}

/** Returns button CSS with optional custom color override */
export const getButtonStyle = (style: string, customColor?: string | null): React.CSSProperties => {
  const base = { ...(buttonStyleMap[style] || buttonStyleMap.primary) }

  // Skip default white from colorPickerField — treat as "not set"
  const isDefault = !customColor || customColor === 'hsl(0, 0%, 100%)' || customColor === '#ffffff'
  if (!isDefault) {
    if (style === 'outline') {
      base.color = customColor!
      base.border = `2px solid ${customColor}`
    } else if (style === 'ghost') {
      base.color = customColor!
    } else {
      // primary / secondary — fill background
      base.backgroundColor = customColor!
    }
  }

  return base
}

const iconPaths: Record<string, React.ReactNode> = {
  download: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </>
  ),
  document: (
    <>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </>
  ),
  eye: (
    <>
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  'arrow-right': (
    <>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </>
  ),
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </>
  ),
  plane: (
    <>
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
    </>
  ),
  phone: (
    <>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </>
  ),
  check: (
    <>
      <polyline points="20 6 9 17 4 12" />
    </>
  ),
}

export const ButtonIcon: React.FC<{ icon: string; size?: number }> = ({ icon, size = 16 }) => {
  if (!icon || icon === 'none' || !iconPaths[icon]) return null

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {iconPaths[icon]}
    </svg>
  )
}

export default ButtonIcon
