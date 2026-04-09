import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

export const revalidateHeader: GlobalAfterChangeHook = ({ doc, req: { payload } }) => {
  payload.logger.info(`Revalidating header`)

  try {
    revalidateTag('global_header')
    revalidateTag('global_header_v3')
    revalidateTag('header_full_data')
  } catch {
    // Ignore errors when not in request context
  }

  return doc
}
