'use client'

import React from 'react'

/**
 * Custom label component for top-level groups in Page Config.
 * Renders the label text with a larger, bolder font size
 * so section headings stand out clearly.
 */
export const SectionLabel: React.FC<{ label?: string }> = ({ label }) => {
  return (
    <h3
      style={{
        fontSize: '22px',
        fontWeight: 700,
        margin: '8px 0 4px 0',
        letterSpacing: '0.01em',
      }}
    >
      {label || ''}
    </h3>
  )
}
