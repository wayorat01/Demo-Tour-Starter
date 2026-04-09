import type { Metadata } from 'next'
import type { GalleryAlbum, Page, Post } from '../payload-types'
import { mergeOpenGraph } from './mergeOpenGraph'
import { serverUrl as NEXT_PUBLIC_SERVER_URL } from '@/config/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

const getSiteIdentity = unstable_cache(
  async () => {
    const payload = await getPayload({ config: configPromise })
    const pageConfig = await payload.findGlobal({ slug: 'page-config', depth: 0 })
    return {
      siteName: (pageConfig?.siteIdentity?.siteName as string) || '',
      siteTagline: (pageConfig?.siteIdentity?.siteTagline as string) || '',
    }
  },
  ['global_site-identity'],
  { tags: ['global_page-config'] },
)

export const generateMeta = async (args: {
  doc: Page | Post | GalleryAlbum
  url: string
  locale?: string
}): Promise<Metadata> => {
  const { doc, url, locale } = args || {}

  const meta = (doc as any)?.meta
  const customOGImage =
    typeof meta?.image === 'object' &&
    meta.image !== null &&
    'url' in meta.image &&
    `${NEXT_PUBLIC_SERVER_URL}${meta.image.url}`

  const { siteName, siteTagline } = await getSiteIdentity()
  const pageTitle = doc?.meta?.title || doc?.title || ''
  const isHomePage = 'slug' in doc && doc.slug === 'home'

  // Build the title
  // NOTE: layout.tsx already has `title.template: '%s | SiteName'`
  // so we should NOT append siteName here — the template does it automatically.
  // For homepage, we use `absolute` to bypass the template entirely.
  let title: string | { absolute: string }
  if (isHomePage && siteName) {
    title = { absolute: siteTagline ? `${siteName} — ${siteTagline}` : siteName }
  } else if (pageTitle) {
    title = pageTitle
  } else if (siteName && siteTagline) {
    title = { absolute: `${siteName} — ${siteTagline}` }
  } else {
    title = siteName || 'My Website'
  }

  const description = doc?.meta?.description || siteTagline || ''

  const defaultOGImage = `${NEXT_PUBLIC_SERVER_URL}/next/og?title=${pageTitle || siteName}&locale=${locale}`

  return {
    title,
    description,
    alternates: {
        canonical: `${NEXT_PUBLIC_SERVER_URL || 'https://localhost:3000'}${url === '/' ? '' : url}`,
    },
    openGraph: mergeOpenGraph({
      title,
      description,
      url,
      images: customOGImage
        ? [
            {
              url: customOGImage,
            },
          ]
        : defaultOGImage,
    }),
  }
}
