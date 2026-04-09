'use client'

import React from 'react'

export const AlignTopIcon: React.FC = () => (
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
    {/* Top alignment: line at top + arrow pointing up */}
    <line
      x1="4"
      y1="4"
      x2="16"
      y2="4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M10 8v8M10 8l-3 3M10 8l3 3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const AlignMiddleIcon: React.FC = () => (
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
    {/* Middle alignment: line in center + arrows pointing to center */}
    <line
      x1="4"
      y1="10"
      x2="16"
      y2="10"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M10 4v4M10 4l-2 2M10 4l2 2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 16v-4M10 16l-2-2M10 16l2-2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const AlignBottomIcon: React.FC = () => (
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
    {/* Bottom alignment: line at bottom + arrow pointing down */}
    <line
      x1="4"
      y1="16"
      x2="16"
      y2="16"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M10 12V4M10 12l-3-3M10 12l3-3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
