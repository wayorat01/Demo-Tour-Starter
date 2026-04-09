'use server'

import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidateTag } from 'next/cache'

export const revalidateToursAfterChange: CollectionAfterChangeHook = async ({
  doc,
  req: { payload },
}) => {
  payload.logger.info(`Revalidating tours cache and header globals`)

  try {
    revalidateTag('intertours')
    revalidateTag('inbound-tours')
    revalidateTag('global_header_v3')
    revalidateTag('citiesMap_v2')
    revalidateTag('header_full_data')
  } catch {
    // Ignore errors when not in request context
  }

  return doc
}

export const revalidateToursAfterDelete: CollectionAfterDeleteHook = async ({
  doc,
  req: { payload },
}) => {
  payload.logger.info(`Revalidating tours cache and header globals`)

  try {
    revalidateTag('intertours')
    revalidateTag('inbound-tours')
    revalidateTag('global_header_v3')
    revalidateTag('citiesMap_v2')
    revalidateTag('header_full_data')
  } catch {
    // Ignore errors when not in request context
  }

  return doc
}
