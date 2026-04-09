import React from 'react'

/**
 * Pass-through layout for [[...slugs]] routes.
 * Root layout (html/body/header/footer) is handled by (frontend)/layout.tsx
 */
export default async function SlugsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
