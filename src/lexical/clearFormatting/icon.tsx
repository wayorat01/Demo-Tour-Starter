'use client'

import React from 'react'

export const ClearFormattingIcon: React.FC = () => (
  <svg
    aria-hidden="true"
    className="icon"
    fill="none"
    focusable="false"
    height="20"
    viewBox="0 0 20 20"
    width="20"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* T with x - clear formatting icon */}
    <path d="M4 5h8M8 5v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M12 12l4 4M16 12l-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)
