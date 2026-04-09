import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

import { resolveLocalization } from './resolveLocalization'

type Global = keyof Config['globals']

async function getGlobal(slug: Global, locale: any, depth = 0) {
  const payload = await getPayload({ config: configPromise })

  const global = await payload.findGlobal({
    slug,
    depth,
    locale,
  })

  return resolveLocalization(JSON.parse(JSON.stringify(global)), locale)
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug
 */
export const getCachedGlobal = (slug: Global, locale: string, depth = 0) =>
  unstable_cache(async () => getGlobal(slug, locale, depth), [slug, locale, 'v3'], {
    tags: [`global_${slug}_v3`],
  })
