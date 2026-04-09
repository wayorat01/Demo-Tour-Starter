'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

/**
 * Client component wrapper that marks the matching nav link as 'active'
 * by comparing rendered <a> hrefs with the current pathname.
 */
export function NavActiveMarker({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const links = ref.current.querySelectorAll<HTMLElement>(
      'a.wowtour-navbar1-nav-link, a.wowtour-navbar2-nav-link, a.wowtour-navbar3-nav-link, a.wowtour-navbar4-nav-link, a.wowtour-navbar5-nav-link, a.wowtour-navbar6-nav-link, a.wowtour-navbar7-nav-link, button.wowtour-navbar1-nav-link, button.wowtour-navbar2-nav-link, button.wowtour-navbar3-nav-link, button.wowtour-navbar4-nav-link, button.wowtour-navbar5-nav-link, button.wowtour-navbar6-nav-link, button.wowtour-navbar7-nav-link',
    )
    const normPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '')

    links.forEach((el) => {
      // For <a> tags, check href directly
      const href = el.getAttribute('href') || ''
      // For <button> triggers (submenu), check if any child link in the dropdown is active
      const isButton = el.tagName === 'BUTTON'

      let isActive = false
      if (!isButton && href) {
        const normUrl =
          href === '/' || href === '' || href === '/home' ? '/' : href.replace(/\/$/, '')
        if (normUrl === '/') {
          isActive = normPath === '/'
        } else {
          isActive = normPath === normUrl || normPath.startsWith(normUrl + '/')
        }
      }
      el.classList.toggle('active', isActive)
    })
  }, [pathname])

  return <div ref={ref}>{children}</div>
}
