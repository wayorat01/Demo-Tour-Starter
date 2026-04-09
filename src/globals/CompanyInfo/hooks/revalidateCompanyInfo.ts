import type { GlobalAfterChangeHook } from 'payload'
import { revalidateTag } from 'next/cache'

export const revalidateCompanyInfo: GlobalAfterChangeHook = ({ doc, req: { payload } }) => {
  payload.logger.info(`Revalidating company-info`)

  try {
    revalidateTag('global_company-info')
    revalidateTag('global_company-info_v3')
    revalidateTag('header_full_data')
  } catch {
    // Ignore errors when not in request context
  }

  return doc
}
