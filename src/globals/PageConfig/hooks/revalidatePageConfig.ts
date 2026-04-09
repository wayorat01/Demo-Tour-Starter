import type { GlobalAfterChangeHook } from 'payload'
import { revalidateTag } from 'next/cache'

export const revalidatePageConfig: GlobalAfterChangeHook = async ({ doc, req: { payload } }) => {
  payload.logger.info(`Revalidating globalpage config`)
  revalidateTag('global_page-config')
  revalidateTag('global_page-config_v3')
  revalidateTag('page-config')
  revalidateTag('pages')
}
