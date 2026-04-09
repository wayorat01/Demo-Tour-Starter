import type { Metadata } from 'next'

import localFont from 'next/font/local'
import React from 'react'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { serverUrl as NEXT_PUBLIC_SERVER_URL } from '@/config/server'

import { cn } from 'src/utilities/cn'
import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/globals/Footer/Component'
import { Header } from '@/globals/Header/Component'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Providers } from '@/providers'
import { CookieConsent } from '@/components/CookieConsent'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { draftMode } from 'next/headers'
import { Analytics } from '@vercel/analytics/react'
import { StickySocial } from '@/components/StickySocial/StickySocial'
import { OrganizationJsonLd } from '@/components/SEO/JsonLd'

import { ThemeConfig } from '@/globals/ThemeConfig/Component'
import localization from '@/localization.config'
import { PublicContextProps } from '@/utilities/publicContextProps'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import { getCachedGlobal } from '@/utilities/getGlobals'
import type { CompanyInfo } from '@/payload-types'

import './[[...slugs]]/globals.css'

// ============================================
// Local Fonts (ไม่ใช้ Google Fonts API)
// ============================================

const kanit = localFont({
  src: [
    // Thai subset
    {
      path: '../../../public/fonts/kanit/kanit-thai-400-normal.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/kanit/kanit-thai-500-normal.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/kanit/kanit-thai-600-normal.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/kanit/kanit-thai-700-normal.woff2',
      weight: '700',
      style: 'normal',
    },
    // Latin subset
    {
      path: '../../../public/fonts/kanit/kanit-latin-400-normal.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/kanit/kanit-latin-500-normal.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/kanit/kanit-latin-600-normal.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/kanit/kanit-latin-700-normal.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-kanit',
  display: 'swap',
})

const notoSansThai = localFont({
  src: [
    // Thai subset
    {
      path: '../../../public/fonts/noto-sans-thai/noto-sans-thai-thai-400-normal.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/noto-sans-thai/noto-sans-thai-thai-500-normal.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/noto-sans-thai/noto-sans-thai-thai-600-normal.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/noto-sans-thai/noto-sans-thai-thai-700-normal.woff2',
      weight: '700',
      style: 'normal',
    },
    // Latin subset
    {
      path: '../../../public/fonts/noto-sans-thai/noto-sans-thai-latin-400-normal.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/noto-sans-thai/noto-sans-thai-latin-500-normal.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/noto-sans-thai/noto-sans-thai-latin-600-normal.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/noto-sans-thai/noto-sans-thai-latin-700-normal.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-noto-sans-thai',
  display: 'swap',
})

const notoSansThaiLooped = localFont({
  src: [
    // Thai subset
    {
      path: '../../../public/fonts/noto-sans-thai-looped/noto-sans-thai-looped-thai-400-normal.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/noto-sans-thai-looped/noto-sans-thai-looped-thai-500-normal.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/noto-sans-thai-looped/noto-sans-thai-looped-thai-600-normal.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/noto-sans-thai-looped/noto-sans-thai-looped-thai-700-normal.woff2',
      weight: '700',
      style: 'normal',
    },
    // Latin subset
    {
      path: '../../../public/fonts/noto-sans-thai-looped/noto-sans-thai-looped-latin-400-normal.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/noto-sans-thai-looped/noto-sans-thai-looped-latin-500-normal.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/noto-sans-thai-looped/noto-sans-thai-looped-latin-600-normal.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/noto-sans-thai-looped/noto-sans-thai-looped-latin-700-normal.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-noto-sans-thai-looped',
  display: 'swap',
})

import { resolveLocalization } from '@/utilities/resolveLocalization'

const getPageConfig = (locale: string) =>
  unstable_cache(
    async () => {
      const payload = await getPayload({ config: configPromise })
      const global = await payload.findGlobal({
        slug: 'page-config',
        depth: 1,
        locale: locale as any,
      })
      return resolveLocalization(JSON.parse(JSON.stringify(global)), locale)
    },
    ['global_page-config', locale, 'v3'],
    { tags: ['global_page-config_v3'] },
  )()

export async function generateMetadata(): Promise<Metadata> {
  const pageConfig = await getPageConfig(localization.defaultLocale)
  const si = pageConfig?.siteIdentity
  const name = (si?.siteName as string) || 'My Website'
  const tagline = (si?.siteTagline as string) || ''
  const defaultTitle = tagline ? `${name} — ${tagline}` : name

  return {
    metadataBase: new URL(NEXT_PUBLIC_SERVER_URL || 'https://trieb.work'),
    title: {
      default: defaultTitle,
      template: '%s',
    },
    description: tagline || undefined,
    openGraph: mergeOpenGraph({
      siteName: name || 'WOW Tour',
      description: tagline || undefined,
    }),
  }
}

export default async function FrontendRootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  const publicContext: PublicContextProps = {
    locale: localization.defaultLocale,
    isNotFound: false,
  }

  // Fetch pageConfig + companyInfo in parallel (ไม่ต้องรอทีละอัน)
  const [pageConfigRaw, companyInfoRaw] = await Promise.all([
    getPageConfig(publicContext.locale),
    getCachedGlobal('company-info', publicContext.locale, 1)() as Promise<CompanyInfo>,
  ])
  const pageConfig = JSON.parse(JSON.stringify(pageConfigRaw))
  const siteIdentity = pageConfig?.siteIdentity
  const faviconMedia = siteIdentity?.favicon as { url?: string; mimeType?: string } | undefined
  const faviconUrl = faviconMedia?.url
  const siteName = (siteIdentity?.siteName as string) || ''
  const siteTagline = (siteIdentity?.siteTagline as string) || ''
  const companyInfo = companyInfoRaw

  return (
    <html
      className={cn(kanit.variable, notoSansThai.variable, notoSansThaiLooped.variable)}
      lang={localization.defaultLocale}
      suppressHydrationWarning
    >
      <head>
        <ThemeConfig publicContext={publicContext} />
        <InitTheme />
        {faviconUrl ? (
          <link href="/api/favicon" rel="icon" sizes="32x32" type="image/png" />
        ) : (
          <>
            <link href="/favicon.ico" rel="icon" sizes="32x32" />
            <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
          </>
        )}
        {siteName && <meta name="application-name" content={siteName} />}
        {siteTagline && <meta name="description" content={siteTagline} />}
        <OrganizationJsonLd
          name={siteName || 'WOW Tour'}
          url={NEXT_PUBLIC_SERVER_URL || 'https://localhost:3000'}
          telephone={
            (companyInfo?.hotline as string) || (companyInfo?.callCenter as string) || undefined
          }
          description={siteTagline || undefined}
        />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          {isEnabled && (
            <AdminBar
              adminBarProps={{
                preview: isEnabled,
              }}
            />
          )}
          <LivePreviewListener />
          <Analytics />
          <Header publicContext={publicContext} />
          {children}
          <Footer publicContext={publicContext} />
          {(() => {
            // Build sticky social links from Company Info (only items with showInSticky)
            const baseSocials = (
              (companyInfo?.socialLinks ?? []) as Array<{
                platform: string
                url: string
                label?: string | null
                id?: string | null
                showInSticky?: boolean | null
              }>
            ).filter((s) => s.showInSticky !== false)
            const extraItems: typeof baseSocials = []

            // Add LINE OA if not already in socialLinks
            if (companyInfo?.lineOA && !baseSocials.some((s) => s.platform === 'line')) {
              const lineUrl = companyInfo.lineLink
                ? companyInfo.lineLink
                : companyInfo.lineOA.startsWith('http')
                  ? companyInfo.lineOA
                  : `https://line.me/R/ti/p/${companyInfo.lineOA.replace('@', '%40')}`
              extraItems.push({ platform: 'line', url: lineUrl, label: companyInfo.lineOA })
            }

            // Add email if not already in socialLinks
            if (companyInfo?.email && !baseSocials.some((s) => s.platform === 'email')) {
              extraItems.push({
                platform: 'email',
                url: `mailto:${companyInfo.email}`,
                label: companyInfo.email,
              })
            }

            // Add phone (callCenter) if not already in socialLinks
            if (companyInfo?.callCenter && !baseSocials.some((s) => s.platform === 'phone')) {
              extraItems.push({
                platform: 'phone',
                url: `tel:${companyInfo.callCenter.replace(/[^\d+]/g, '')}`,
                label: companyInfo.callCenter,
              })
            }

            return (
              <StickySocial
                data={{
                  enabled: pageConfig?.stickySocial?.enabled,
                  position: pageConfig?.stickySocial?.position,
                }}
                socialLinks={[...baseSocials, ...extraItems]}
              />
            )
          })()}
          {/* PDPA Cookie Consent Banner */}
          {(pageConfig as any)?.pdpa?.enableCookieBanner !== false && (
            <CookieConsent
              bannerText={(pageConfig as any)?.pdpa?.cookieBannerText}
              cookiePolicyUrl={(pageConfig as any)?.pdpa?.cookiePolicyUrl || '/cookie-policy'}
            />
          )}
        </Providers>
      </body>
    </html>
  )
}
