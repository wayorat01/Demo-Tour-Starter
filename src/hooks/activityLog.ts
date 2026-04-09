import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

/**
 * Activity Log Hooks — Fire-and-forget pattern
 *
 * ใช้ setImmediate() + direct MongoDB insert เพื่อ:
 * 1. ไม่ block main request (fire-and-forget)
 * 2. ไม่ trigger Payload hooks ซ้อน (bypass Payload API)
 * 3. Performance ไม่กระทบ — log ถูกเขียนหลัง response ส่งกลับแล้ว
 */

function getDocTitle(doc: any): string {
  return (
    doc?.title ||
    doc?.name ||
    doc?.customerName ||
    doc?.nameHoliday ||
    doc?.displayTitle ||
    doc?.label ||
    doc?.slug ||
    doc?.globalType ||
    doc?.email ||
    ''
  )
}

function getChangedFields(previousDoc: any, doc: any): string[] | null {
  if (!previousDoc || !doc) return null
  const changed: string[] = []
  const allKeys = new Set([...Object.keys(previousDoc), ...Object.keys(doc)])
  for (const key of allKeys) {
    // Skip internal fields
    if (['_id', 'id', 'createdAt', 'updatedAt', '_status', '__v'].includes(key)) continue
    if (JSON.stringify(previousDoc[key]) !== JSON.stringify(doc[key])) {
      changed.push(key)
    }
  }
  return changed.length > 0 ? changed : null
}

function logAsync(payload: any, data: Record<string, any>) {
  setImmediate(async () => {
    try {
      const db = payload.db?.connection?.db
      if (!db) return
      await db.collection('activity-logs').insertOne({
        ...data,
        timestamp: new Date(),
      })
    } catch (err) {
      // Silent fail — activity log ไม่ควรทำให้ระบบ crash
      payload.logger?.warn?.(`[ActivityLog] Failed to write log: ${err}`)
    }
  })
}

/**
 * afterChange hook สำหรับ collections
 * Log action 'create' หรือ 'update'
 */
export const createActivityAfterChange: CollectionAfterChangeHook = ({
  collection,
  operation,
  doc,
  previousDoc,
  req,
}) => {
  // ข้าม internal operations ที่ไม่มี user (เช่น seed, migration)
  if (!req.user) return doc

  const action = operation === 'create' ? 'create' : 'update'
  const changedFields = action === 'update' ? getChangedFields(previousDoc, doc) : null

  // ถ้า update แต่ไม่มี field ที่เปลี่ยน (เช่น save ซ้ำเหมือนเดิม) ไม่ต้อง log
  if (action === 'update' && !changedFields) return doc

  logAsync(req.payload, {
    action,
    targetCollection: collection.slug,
    documentId: String(doc.id || doc._id || ''),
    documentTitle: getDocTitle(doc),
    user: req.user.id || (req.user as any)._id,
    changes: changedFields,
  })

  return doc
}

/**
 * afterDelete hook สำหรับ collections
 */
export const createActivityAfterDelete: CollectionAfterDeleteHook = ({ collection, doc, req }) => {
  if (!req.user) return doc

  logAsync(req.payload, {
    action: 'delete',
    targetCollection: collection.slug,
    documentId: String(doc.id || doc._id || ''),
    documentTitle: getDocTitle(doc),
    user: req.user.id || (req.user as any)._id,
    changes: null,
  })

  return doc
}

/**
 * afterChange hook สำหรับ globals
 */
export const createGlobalActivityAfterChange: GlobalAfterChangeHook = ({
  global,
  doc,
  previousDoc,
  req,
}) => {
  if (!req.user) return doc

  const changedFields = getChangedFields(previousDoc, doc)
  if (!changedFields) return doc

  logAsync(req.payload, {
    action: 'update',
    targetCollection: global.slug,
    documentId: global.slug,
    documentTitle: `Global: ${global.slug}`,
    user: req.user.id || (req.user as any)._id,
    changes: changedFields,
  })

  return doc
}

/**
 * afterLogin hook สำหรับ Users collection
 */
export const createActivityAfterLogin = ({ user, req }: { user: any; req: any }) => {
  logAsync(req.payload, {
    action: 'login',
    targetCollection: 'users',
    documentId: String(user.id || user._id || ''),
    documentTitle: user.name || user.email || '',
    user: user.id || (user as any)._id,
    changes: null,
  })

  return user
}
