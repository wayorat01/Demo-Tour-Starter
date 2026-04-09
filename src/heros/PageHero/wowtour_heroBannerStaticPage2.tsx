import React from 'react'
import type { Page } from '@/payload-types'
import { PublicContextProps } from '@/utilities/publicContextProps'
import Image from 'next/image'
import Link from 'next/link'
import { Home } from 'lucide-react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

// Helper: convert linear → radial position
function linearToRadialPosition(pos: string): string {
  const map: Record<string, string> = {
    'to top': 'center bottom',
    'to top right': 'bottom left',
    'to right': 'center left',
    'to bottom right': 'top left',
    'to bottom': 'center top',
    'to bottom left': 'top right',
    'to left': 'center right',
    'to top left': 'bottom right',
  }
  return map[pos] || 'center'
}

// Helper: generate background CSS
function generateBannerBg(props: {
  enableGradient?: boolean | null
  solidColor?: string | null
  startColor?: string | null
  endColor?: string | null
  gradientType?: string | null
  gradientPosition?: string | null
  defaultColor: string
}): string {
  const {
    enableGradient,
    solidColor,
    startColor,
    endColor,
    gradientType,
    gradientPosition,
    defaultColor,
  } = props

  if (!enableGradient) {
    return solidColor || defaultColor
  }

  const sc = startColor || defaultColor
  const ec = endColor || defaultColor
  const type = gradientType || 'linear'
  const position = gradientPosition || 'to right'

  if (type === 'radial') {
    return `radial-gradient(circle at ${linearToRadialPosition(position)}, ${sc}, ${ec})`
  }
  return `linear-gradient(${position}, ${sc}, ${ec})`
}

export const WowtourBanner1: React.FC<
  Page['hero'] & { publicContext: PublicContextProps }
> = async ({
  sideImage,
  bannerTitle,
  bannerTitleColor,
  sideImageSize,
  bannerRadiusTopLeft,
  bannerRadiusTopRight,
  bannerRadiusBottomLeft,
  bannerRadiusBottomRight,
  enableBannerGradient,
  bannerBgColor,
  bannerGradientStartColor,
  bannerGradientEndColor,
  bannerGradientType,
  bannerGradientPosition,
  enableTitleDropShadow,
  titleDropShadowColor,
  titleDropShadowOpacity,
  heroSubtitle,
  breadcrumbItems,
  breadcrumbs: heroBreadcrumbs,
  publicContext,
}: any) => {
  // Prioritize page-level breadcrumbs (from nested-docs plugin), fallback to hero-internal
  const breadcrumbs =
    breadcrumbItems && breadcrumbItems.length > 0 ? breadcrumbItems : heroBreadcrumbs || []
  // Generate background
  const background = generateBannerBg({
    enableGradient: enableBannerGradient,
    solidColor: bannerBgColor,
    startColor: bannerGradientStartColor,
    endColor: bannerGradientEndColor,
    gradientType: bannerGradientType,
    gradientPosition: bannerGradientPosition,
    defaultColor: '#EF6164',
  })

  // Fetch page title if bannerTitle is not set
  let pageTitle = bannerTitle || ''
  if (!pageTitle) {
    try {
      const payload = await getPayload({ config: configPromise })
      const slug = publicContext?.cleanSlugs?.[publicContext.cleanSlugs.length - 1] || 'home'
      const pages = await payload.find({
        collection: 'pages',
        where: { slug: { equals: slug } },
        locale: publicContext?.locale || 'en',
        limit: 1,
        select: { title: true },
      })
      if (pages.docs.length > 0) {
        pageTitle = pages.docs[0].title || ''
      }
    } catch (e) {
      console.error('[WowtourBanner1] Failed to fetch page title:', e)
    }
  }

  // Border radius 4 corners
  const borderRadius = `${bannerRadiusTopLeft || 0}px ${bannerRadiusTopRight || 0}px ${bannerRadiusBottomRight || 0}px ${bannerRadiusBottomLeft || 0}px`

  // Drop shadow for title
  const shadowEnabled = enableTitleDropShadow !== false // default true
  let textShadow: string | undefined
  if (shadowEnabled) {
    const shadowColor = titleDropShadowColor || '#000000'
    const opacity = parseInt(titleDropShadowOpacity || '30', 10) / 100
    // Convert hex to rgba
    const r = parseInt(shadowColor.slice(1, 3), 16)
    const g = parseInt(shadowColor.slice(3, 5), 16)
    const b = parseInt(shadowColor.slice(5, 7), 16)
    textShadow = `0 2px 4px rgba(${r}, ${g}, ${b}, ${opacity})`
  }

  // Side image size (percentage of banner height)
  const imgSizePercent = sideImageSize || '100'
  const imgHeightClass =
    {
      '60': 'h-[60%]',
      '70': 'h-[70%]',
      '80': 'h-[80%]',
      '90': 'h-[90%]',
      '100': 'h-[100%]',
    }[imgSizePercent] || 'h-[100%]'

  return (
    <section
      className="relative mb-8 flex h-[180px] w-full items-center overflow-hidden sm:h-[220px] md:h-[260px] lg:h-[300px]"
      style={{ background, borderRadius }}
    >
      <div className="relative container mx-auto flex h-full w-full items-center justify-between px-6 md:px-10">
        {/* Left Side: Breadcrumbs + Title + Subtitle */}
        <div className="relative z-10 flex w-[65%] items-center justify-start sm:w-2/3 md:w-1/2">
          <div className="w-full">
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="mb-3 flex items-center gap-1.5 text-sm text-white/70">
                <Link
                  href="/"
                  className="flex items-center gap-1 transition-colors hover:text-white"
                >
                  <Home className="size-3.5" />
                  <span>หน้าแรก</span>
                </Link>
                {breadcrumbs &&
                  breadcrumbs.length > 0 &&
                  breadcrumbs
                    .filter(
                      (item) =>
                        item.url !== '/' &&
                        item.url !== '' &&
                        item.label?.toLowerCase() !== 'home' &&
                        item.label !== 'หน้าแรก',
                    )
                    .map((item: any, idx: number) => {
                      return (
                        <React.Fragment key={item.id ? `${item.id}-${idx}` : idx}>
                          <span className="text-white">/</span>
                          {item.url ? (
                            <Link href={item.url} className="hover:text-amber-500 hover:underline">
                              {item.label}
                            </Link>
                          ) : (
                            <span className="font-medium text-amber-500">{item.label}</span>
                          )}
                        </React.Fragment>
                      )
                    })}
              </nav>
            )}

            {/* Title */}
            {pageTitle && (
              <h1
                className="text-4xl leading-[1.3] font-medium"
                style={{ color: bannerTitleColor || '#FFFFFF', textShadow }}
              >
                {pageTitle}
              </h1>
            )}

            {/* Subtitle */}
            {heroSubtitle && (
              <p className="mt-2 text-sm text-white/80 md:text-base">{heroSubtitle}</p>
            )}
          </div>
        </div>

        {/* Right Side: Image */}
        {sideImage && typeof sideImage === 'object' && sideImage.url && (
          <div className="absolute top-0 right-4 bottom-0 z-0 flex h-full max-w-[45%] items-end justify-end sm:right-6 sm:items-center md:right-10 md:max-w-[50%]">
            <Image
              src={sideImage.url}
              alt={sideImage.alt || 'Banner Image'}
              width={sideImage.width || 400}
              height={sideImage.height || 300}
              className={`object-contain object-right-bottom sm:object-right ${imgHeightClass} my-auto w-auto`}
              priority
            />
          </div>
        )}
      </div>
    </section>
  )
}

export default WowtourBanner1
