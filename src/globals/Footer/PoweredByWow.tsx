import React from 'react'
import Image from 'next/image'

/**
 * "Powered by WOW" branding for the footer.
 * Always displayed at the absolute bottom of every footer variant.
 */
export function PoweredByWow({
  className,
  invertLogo,
}: {
  className?: string
  invertLogo?: boolean
}) {
  return (
    <div className="flex items-center justify-center gap-1.5 py-4">
      <span className={className || 'text-muted-foreground/70 text-xs'}>Powered by</span>
      <a
        href="https://weonweb.com"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center transition-opacity duration-200"
      >
        <Image
          src="/logo-wow-140x40-1.png"
          alt="WOW - We On Web"
          width={140}
          height={40}
          className="h-[18px] w-auto object-contain"
          style={invertLogo ? { filter: 'brightness(0) invert(1)' } : undefined}
        />
      </a>
    </div>
  )
}
