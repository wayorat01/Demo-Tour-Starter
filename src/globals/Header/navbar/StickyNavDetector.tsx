'use client'

import { useEffect, useRef } from 'react'

/**
 * Wraps the sticky nav bar and adds 'is-stuck' class when it becomes stuck.
 * Uses IntersectionObserver on a sentinel element above the nav.
 */
export function StickyNavDetector({
  children,
  className,
  reserveHeight = false,
}: {
  children: React.ReactNode
  className?: string
  reserveHeight?: boolean
}) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const placeholderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reserveHeight && placeholderRef.current && navRef.current) {
      const height = navRef.current.getBoundingClientRect().height
      if (height > 50) {
        placeholderRef.current.style.minHeight = `${height}px`
      }
    }
  }, [reserveHeight])

  useEffect(() => {
    const sentinel = sentinelRef.current
    const nav = navRef.current
    if (!sentinel || !nav) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When sentinel is NOT visible, the nav is stuck
        nav.classList.toggle('is-stuck', !entry.isIntersecting)
      },
      { threshold: 0 },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  // When reserveHeight is OFF, use Fragment so the sticky element is a direct
  // child of the page scroll container — required for `position: sticky` to work.
  // When reserveHeight is ON, use a wrapper <div> to reserve space when the nav is stuck.
  if (!reserveHeight) {
    return (
      <>
        {/* Invisible sentinel — sits right above the nav */}
        <div ref={sentinelRef} style={{ height: 1, marginBottom: -1 }} />
        <div ref={navRef} className={className}>
          {children}
        </div>
      </>
    )
  }

  return (
    <div ref={placeholderRef}>
      {/* Invisible sentinel — sits right above the nav */}
      <div ref={sentinelRef} style={{ height: 1, marginBottom: -1 }} />
      <div ref={navRef} className={className}>
        {children}
      </div>
    </div>
  )
}
