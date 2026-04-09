'use client'

import React from 'react'
import { useTranslation } from '@payloadcms/ui'

const HomeButton: React.FC = () => {
  const { i18n } = useTranslation()
  const isThai = i18n.language === 'th'

  const label = isThai ? 'ดูเว็บไซต์' : 'View Website'
  const title = isThai ? 'ไปหน้าเว็บไซต์' : 'Go to website'

  return (
    <a
      href="/"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '4px',
        background: 'transparent',
        border: '1px solid var(--theme-elevation-400)',
        color: 'var(--theme-text)',
        fontSize: '13px',
        fontWeight: 500,
        textDecoration: 'none',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--theme-elevation-100)'
        e.currentTarget.style.borderColor = 'var(--theme-elevation-500)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.borderColor = 'var(--theme-elevation-400)'
      }}
      title={title}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 3h6v6" />
        <path d="M10 14 21 3" />
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      </svg>
      {label}
    </a>
  )
}

export default HomeButton
