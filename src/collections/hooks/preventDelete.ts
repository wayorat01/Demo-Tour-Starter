import type { CollectionBeforeDeleteHook } from 'payload'
import { APIError } from 'payload'

type PreventDeleteConfig = {
  collection: any
  field: string
  label: string
}

export const preventDeleteIfInUse =
  (checks: PreventDeleteConfig[]): CollectionBeforeDeleteHook =>
  async ({ req, id }) => {
    for (const check of checks) {
      const result = await req.payload.find({
        collection: check.collection,
        where: {
          [check.field]: {
            equals: id,
          },
        },
        depth: 0,
        limit: 1,
      })

      if (result.totalDocs > 0) {
        throw new APIError(
          `Cannot delete this item because it is referenced by at least ${result.totalDocs} document(s) in the "${check.label}" collection. Please reassign or remove it from those documents first.`,
          400,
          null,
          true,
        )
      }
    }
  }
