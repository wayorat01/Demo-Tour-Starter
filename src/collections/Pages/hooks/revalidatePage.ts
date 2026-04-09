import type { CollectionAfterChangeHook } from 'payload'

import { revalidatePath } from 'next/cache'

import type { Page } from '../../../payload-types'
import localization from '@/localization.config'

const nonDefaultLocale = localization.locales.filter(
  (locale) => locale !== localization.defaultLocale,
)

export const revalidatePage: CollectionAfterChangeHook<Page> = ({
  doc,
  previousDoc,
  req: { payload },
}) => {
  try {
    if (doc._status === 'published') {
      const url =
        (doc?.breadcrumbs && doc.breadcrumbs.length > 0
          ? doc.breadcrumbs[doc.breadcrumbs.length - 1].url
          : `/${doc.slug}`) || `/${doc.slug}`
      const path = doc.slug === 'home' ? '/' : url

      payload.logger.info(`Revalidating page at path: ${path}`)

      revalidatePath(path)
      nonDefaultLocale.forEach((locale) => {
        revalidatePath(`/${locale}${path}`)
      })
    }

    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      const url =
        (previousDoc?.breadcrumbs && previousDoc.breadcrumbs.length > 0
          ? previousDoc.breadcrumbs[previousDoc.breadcrumbs.length - 1].url
          : `/${previousDoc.slug}`) || `/${previousDoc.slug}`
      const oldPath = previousDoc.slug === 'home' ? '/' : url

      payload.logger.info(`Revalidating old page at path: ${oldPath}`)

      revalidatePath(oldPath)
      nonDefaultLocale.forEach((locale) => {
        revalidatePath(`/${locale}${oldPath}`)
      })
    }
  } catch (error) {
    payload.logger.error(`Error in revalidatePage: ${error}`)
  }

  return doc
}
