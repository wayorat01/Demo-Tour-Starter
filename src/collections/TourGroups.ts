import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { canAccessCollection } from '../access/isAgentStarter'

export const TourGroups: CollectionConfig = {
  slug: 'tour-groups',
  labels: {
    singular: { en: 'Tour Group', th: 'กลุ่มทัวร์' },
    plural: { en: 'Tour Groups', th: 'กลุ่มทัวร์' },
  },
  access: {
    create: canAccessCollection('tourGroups', 'create'),
    delete: canAccessCollection('tourGroups', 'delete'),
    read: anyone,
    update: canAccessCollection('tourGroups', 'update'),
  },
  versions: { drafts: false, maxPerDoc: 5 },
  admin: {
    useAsTitle: 'displayTitle',
    defaultColumns: ['displayTitle', 'groupKey', 'tourCount', 'isActive', 'sortOrder'],
    group: { en: 'Tours', th: 'ทัวร์' },
  },
  hooks: {
    afterRead: [
      ({ doc }) => {
        // Auto-fill displayTitle on read if it was missing in the database
        if (!doc.displayTitle) {
          doc.displayTitle = doc.label
            ? `${doc.label} (${doc.groupKey || ''})`
            : doc.groupKey || 'Untitled Group'
        }
        return doc
      },
    ],
    beforeChange: [
      ({ data }) => {
        // Persist displayTitle so relationship fields can search/display it
        if (data) {
          data.displayTitle = data.label
            ? `${data.label} (${data.groupKey || ''})`
            : data.groupKey || ''
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'displayTitle',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'groupKey',
      type: 'text',
      required: true,
      unique: true,
      label: 'Group Key',
      admin: {
        description: {
          en: 'Group code from API, e.g., group1, group2 — auto-updated on sync',
          th: 'รหัสกลุ่มจาก API เช่น group1, group2 — อัปเดตอัตโนมัติตอน sync',
        },
      },
    },
    {
      name: 'label',
      type: 'text',
      label: { en: 'Group Name', th: 'ชื่อกลุ่ม (Label)' },
      admin: {
        description: {
          en: 'Display name on website, e.g., Popular Tours, Recommended Tours',
          th: 'ชื่อที่แสดงบนเว็บ เช่น ทัวร์ยอดนิยม, ทัวร์แนะนำ',
        },
      },
    },
    {
      name: 'tours',
      type: 'relationship',
      relationTo: 'program-tours',
      hasMany: true,
      label: { en: 'Tours in Group', th: 'ทัวร์ในกลุ่ม' },
      admin: {
        description: {
          en: 'Tours in this group — auto-updated on sync',
          th: 'รายการทัวร์ที่อยู่ในกลุ่มนี้ — อัปเดตอัตโนมัติตอน sync',
        },
      },
    },
    {
      name: 'tourCount',
      type: 'number',
      defaultValue: 0,
      label: { en: 'Tour Count', th: 'จำนวนทัวร์' },
      admin: {
        readOnly: true,
        description: {
          en: 'Tour count in group — auto-updated',
          th: 'จำนวนทัวร์ในกลุ่ม — อัปเดตอัตโนมัติ',
        },
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      label: { en: 'Display Order', th: 'ลำดับการแสดง' },
      admin: {
        description: { en: 'Lower number = displayed first', th: 'ตัวเลขน้อย = แสดงก่อน' },
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      label: { en: 'Enabled', th: 'เปิดใช้งาน' },
    },
  ],
}
