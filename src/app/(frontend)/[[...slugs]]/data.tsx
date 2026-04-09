import { cache } from 'react'
import { draftMode } from 'next/headers'
import { Config, GalleryAlbum, Page, Post } from '@/payload-types'
import { LocalizationConfig, Payload } from 'payload'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'

type CollectionReturnTypeMap = {
  pages: Page & { type: 'page' }
  posts: Post & { type: 'post' }
  'gallery-albums': GalleryAlbum & { type: 'gallery-album' }
}
/**
 * Select, in which collection we should search. Currently supported is 'pages' and 'posts'
 * For slugs with /posts/XX we should search in 'posts'
 * For every other slug we should search in 'pages'.
 * This could be enhanced in the future to support for example also case studies seperately.
 *
 * We call queryPageBySlug if we search in 'pages' and queryPostBySlug if we search in 'posts'
 */
export const queryCollectionData = async <T extends keyof CollectionReturnTypeMap>({
  cleanSlugs,
  locale,
  collection,
}: {
  cleanSlugs: string[]
  locale: string
  collection: T
}): Promise<CollectionReturnTypeMap[T] | null> => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  // Check if locale is supported
  const localizationConfig = payload.config.localization as LocalizationConfig | false

  // If localization is completely false/disabled (e.g. only 1 language), assume 'th' or default is valid
  if (localizationConfig && localizationConfig.locales) {
    const validLocales = localizationConfig.locales.map((l) => (typeof l === 'string' ? l : l.code))
    if (!validLocales.includes(locale)) {
      // locale is not supported
      return null
    }
  }

  let result: Page | Post | GalleryAlbum | null = null

  if (collection === 'pages') {
    result = await queryPageBySlug({ cleanSlugs, locale, draft, payload })
  } else if (collection === 'gallery-albums') {
    result = await queryGalleryAlbumBySlug({ cleanSlugs, locale, draft, payload })
  } else {
    result = await queryPostBySlug({ cleanSlugs, locale, draft, payload })
  }

  return result as CollectionReturnTypeMap[T] | null
}

const getCachedPostBySlug = unstable_cache(
  async (slug: string, locale: string) => {
    try {
      const payload = await getPayload({ config: configPromise })
      const result = await payload.find({
        collection: 'posts',
        draft: false,
        limit: 1,
        overrideAccess: true,
        locale: locale as Config['locale'],
        where: { slug: { equals: slug } },
      })
      return JSON.parse(JSON.stringify(result.docs || []))
    } catch {
      return []
    }
  },
  ['query_post_by_slug'],
  { revalidate: 3600, tags: ['posts'] }
)

const getCachedPageBySlug = unstable_cache(
  async (slug: string, locale: string) => {
    try {
      const payload = await getPayload({ config: configPromise })
      const result = await payload.find({
        collection: 'pages',
        draft: false,
        limit: 1,
        depth: 3,
        overrideAccess: true,
        locale: locale as Config['locale'],
        where: { slug: { equals: slug } },
      })
      return JSON.parse(JSON.stringify(result.docs || []))
    } catch {
      return []
    }
  },
  ['query_page_by_slug'],
  { revalidate: 3600, tags: ['pages'] }
)

const getCachedGalleryAlbumBySlug = unstable_cache(
  async (slug: string, locale: string) => {
    try {
      const payload = await getPayload({ config: configPromise })
      const result = await payload.find({
        collection: 'gallery-albums',
        draft: false,
        limit: 1,
        overrideAccess: true,
        locale: locale as Config['locale'],
        depth: 2,
        where: { slug: { equals: slug } },
      })
      return JSON.parse(JSON.stringify(result.docs || []))
    } catch {
      return []
    }
  },
  ['query_gallery_album_by_slug'],
  { revalidate: 3600, tags: ['gallery-albums'] }
)

export const queryPostBySlug = cache(
  async ({
    cleanSlugs,
    locale,
    draft,
    payload,
  }: {
    cleanSlugs: string[]
    locale: string
    draft: boolean
    payload: Payload
  }) => {
    const targetSlug = cleanSlugs[cleanSlugs.length - 1]
    let docs: any[] = []

    if (draft) {
      const result = await payload.find({
        collection: 'posts',
        draft,
        limit: 1,
        overrideAccess: true,
        locale: locale as Config['locale'],
        where: { slug: { equals: targetSlug } },
      })
      docs = result.docs || []
    } else {
      docs = await getCachedPostBySlug(targetSlug, locale)
    }

    if (docs?.[0]) {
      return { ...docs?.[0], type: 'post' }
    }
    return null
  },
)

export const queryPageBySlug = cache(
  async ({
    cleanSlugs,
    locale,
    draft,
    payload,
  }: {
    cleanSlugs: string[]
    locale: string
    draft: boolean
    payload: Payload
  }) => {
    let result: any = { docs: [] }
    const targetSlug = cleanSlugs[cleanSlugs.length - 1]

    try {
      if (draft) {
        result = await payload.find({
          collection: 'pages',
          draft,
          limit: 1,
          depth: 3,
          overrideAccess: true,
          locale: locale as Config['locale'],
          where: { slug: { equals: targetSlug } },
        })

        if (result.docs.length === 0) {
          result.docs = await getCachedPageBySlug(targetSlug, locale)
        }
      } else {
        result.docs = await getCachedPageBySlug(targetSlug, locale)
      }
    } catch (err: any) {
      console.error('DEBUG payload.find ERROR:', err)
    }

    const pageBreadcrumbs = result.docs?.[0]?.breadcrumbs
    const parentPath = pageBreadcrumbs?.map((item) => item.url?.split('/').pop()) || []

    // Check if URL path matches the actual parent structure
    // We remove the last item from cleanSlugs as it's the current page slug
    // Don't check that for missing results, as we want to first check our redirects in that case
    const isHomePage = cleanSlugs.length === 1 && cleanSlugs[0] === 'home'

    // Only validate path if breadcrumbs actually exist.
    // null/undefined breadcrumbs means they haven't been generated yet by nested-docs — that's NOT a mismatch.
    const hasBreadcrumbs = pageBreadcrumbs != null && pageBreadcrumbs.length > 0

    if (
      !isHomePage &&
      hasBreadcrumbs &&
      result.docs.length > 0 &&
      JSON.stringify(parentPath) !== JSON.stringify(cleanSlugs)
    ) {
      // parent path does not match
      console.warn(
        ' 404 Mismatch (queryPageBySlug): ' +
          JSON.stringify({ parentPath, cleanSlugs, docSlug: result.docs[0].slug }),
      )
      return null
    }

    if (!result.docs?.[0]) {
      return null
    }

    return { ...result.docs?.[0], type: 'page' }
  },
)

export const queryGalleryAlbumBySlug = cache(
  async ({
    cleanSlugs,
    locale,
    draft,
    payload,
  }: {
    cleanSlugs: string[]
    locale: string
    draft: boolean
    payload: Payload
  }) => {
    const targetSlug = cleanSlugs[cleanSlugs.length - 1]
    let docs: any[] = []

    if (draft) {
      const result = await payload.find({
        collection: 'gallery-albums',
        draft,
        limit: 1,
        overrideAccess: true,
        locale: locale as Config['locale'],
        depth: 2,
        where: { slug: { equals: targetSlug } },
      })
      docs = result.docs || []
    } else {
      docs = await getCachedGalleryAlbumBySlug(targetSlug, locale)
    }

    if (docs?.[0]) {
      return { ...docs?.[0], type: 'gallery-album' }
    }
    return null
  },
)
