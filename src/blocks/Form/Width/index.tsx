import * as React from 'react'

export const Width: React.FC<{
  children: React.ReactNode
  className?: string
  width?: number | string
}> = ({ children, className, width }) => {
  const isCustomWidth = width && typeof width === 'number' && width > 0 && width < 100

  return (
    <div
      className={`${className || ''} w-full max-md:!max-w-full max-md:!basis-full`}
      style={{
        maxWidth: isCustomWidth ? `calc(${width}% - 0.5rem)` : '100%', // 0.5rem accounts for half of the gap-4 (1rem) roughly
        flexBasis: isCustomWidth ? `calc(${width}% - 0.5rem)` : '100%',
        flexGrow: isCustomWidth ? 0 : 1,
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  )
}
