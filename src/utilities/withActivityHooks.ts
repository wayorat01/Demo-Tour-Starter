import type { CollectionConfig } from 'payload'
import { createActivityAfterChange, createActivityAfterDelete } from '@/hooks/activityLog'

/**
 * withActivityHooks — Wrap collection config เพื่อเพิ่ม activity hooks อัตโนมัติ
 *
 * ใช้ใน payload.config.ts:
 *   collections: [
 *     withActivityHooks(InterTours),
 *     withActivityHooks(InboundTours),
 *     ActivityLogs, // ไม่ต้อง wrap ตัวเอง
 *   ]
 */
export function withActivityHooks(collection: CollectionConfig): CollectionConfig {
  const existingHooks = collection.hooks || {}

  return {
    ...collection,
    hooks: {
      ...existingHooks,
      afterChange: [...(existingHooks.afterChange || []), createActivityAfterChange],
      afterDelete: [...(existingHooks.afterDelete || []), createActivityAfterDelete],
    },
  }
}
