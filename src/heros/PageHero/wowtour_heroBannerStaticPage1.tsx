import React from 'react'
import Link from 'next/link'
import { Home } from 'lucide-react'
import type { Page } from '@/payload-types'
import { PublicContextProps } from '@/utilities/publicContextProps'
import './wowtour_heroBannerStaticPage1.css'

type WowtourHeroBannerStaticPage1Props = Page['hero'] & {
  publicContext: PublicContextProps
  breadcrumbItems?: Page['breadcrumbs']
  pageTitle?: string
}

export const WowtourHeroBannerStaticPage1: React.FC<WowtourHeroBannerStaticPage1Props> = (
  props: any,
) => {
  const {
    heroHeading,
    heroSubtitle,
    breadcrumbItems,
    breadcrumbs: heroBreadcrumbs,
    pageTitle,
    heroGradientFrom,
    heroGradientTo,
    heroGradientType,
    heroGradientPosition,
  } = props
  // Prioritize page-level breadcrumbs (from nested-docs plugin), fallback to hero-internal
  const breadcrumbs =
    breadcrumbItems && breadcrumbItems.length > 0 ? breadcrumbItems : heroBreadcrumbs || []
  // Use heroHeading if available, otherwise fallback to page title
  const heading = heroHeading || pageTitle || ''

  const from = heroGradientFrom || 'hsl(173, 100%, 46%)'
  const to = heroGradientTo || 'hsl(214, 97%, 61%)'
  const type = heroGradientType || 'linear'
  const position = heroGradientPosition || 'to right'

  let gradient: string
  if (type === 'radial') {
    gradient = `radial-gradient(${position}, ${from} 0%, ${to} 100%)`
  } else if (type === 'conic') {
    gradient = `conic-gradient(from 0deg at ${position.replace('circle at ', '')}, ${from} 0%, ${to} 100%)`
  } else {
    gradient = `linear-gradient(${position}, ${from} 0%, ${to} 100%)`
  }

  return (
    <section className="wowtour-hero-static" style={{ background: gradient }}>
      <div className="container">
        {/* Breadcrumb */}
        <nav className="hero-breadcrumb">
          <Link href="/">
            <Home className="h-4 w-4" />
            หน้าแรก
          </Link>
          {breadcrumbs &&
            breadcrumbs.length > 0 &&
            breadcrumbs
              .filter(
                (crumb) =>
                  crumb.url !== '/' &&
                  crumb.url !== '' &&
                  crumb.label?.toLowerCase() !== 'home' &&
                  crumb.label !== 'หน้าแรก',
              )
              .map((crumb, index) => (
                <React.Fragment key={index}>
                  <span className="breadcrumb-separator">/</span>
                  {crumb.url ? (
                    <Link href={crumb.url}>{crumb.label}</Link>
                  ) : (
                    <span className="breadcrumb-current">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
        </nav>

        {/* Heading */}
        {heading && <h1 className="hero-heading">{heading}</h1>}

        {/* Subtitle */}
        {heroSubtitle && <p className="hero-subtitle">{heroSubtitle}</p>}
      </div>
    </section>
  )
}

export default WowtourHeroBannerStaticPage1
