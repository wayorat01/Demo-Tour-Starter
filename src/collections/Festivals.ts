import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { canAccessCollection } from '../access/isAgentStarter'

export const Festivals: CollectionConfig = {
  slug: 'festivals',
  labels: {
    singular: { en: 'Festival', th: 'เทศกาล/ฤดูกาล' },
    plural: { en: 'Festivals', th: 'เทศกาล/ฤดูกาล' },
  },
  access: {
    create: canAccessCollection('festivals', 'create'),
    delete: canAccessCollection('festivals', 'delete'),
    read: anyone,
    update: canAccessCollection('festivals', 'update'),
  },
  versions: { drafts: false, maxPerDoc: 5 },
  admin: {
    useAsTitle: 'nameHoliday',
    defaultColumns: ['nameHoliday', 'slugHoliday', 'countProduct', 'startDate'],
    group: { en: 'Tours', th: 'ทัวร์' },
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-fill link จาก slugHoliday
        if (data?.slugHoliday) {
          data.link = `/search-tour?festivals=${data.slugHoliday}`
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'slugHoliday',
      type: 'text',
      required: true,
      unique: true,
      label: { en: 'Festival Slug', th: 'Slug เทศกาล (Slug Holiday)' },
      admin: {
        description: {
          en: 'e.g., songkran-day, mayday — used as unique key',
          th: 'เช่น songkran-day, mayday — ใช้เป็นตัวตรวจซ้ำ (unique key)',
        },
      },
    },
    {
      name: 'nameHoliday',
      type: 'text',
      required: true,
      label: { en: 'Festival Name', th: 'ชื่อเทศกาล (Name Holiday)' },
      admin: {
        description: { en: 'e.g., Songkran, Labor Day', th: 'เช่น วันสงกรานต์, วันแรงงาน' },
      },
    },
    {
      name: 'countProduct',
      type: 'number',
      defaultValue: 0,
      label: { en: 'Tour Count', th: 'จำนวนทัวร์ (Count Product)' },
      admin: {
        description: {
          en: 'Number of products available during this festival — auto-updated on sync',
          th: 'จำนวน products ที่เปิดขายช่วงเทศกาลนี้ — อัปเดตอัตโนมัติตอน sync',
        },
      },
    },
    {
      name: 'startDate',
      type: 'date',
      label: { en: 'Start Date', th: 'วันเริ่มต้น (Start Date)' },
      admin: {
        description: { en: 'Festival start date', th: 'วันที่เริ่มต้นของเทศกาล' },
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'd MMM yyyy',
        },
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      label: 'Thumbnail',
      admin: {
        description: { en: 'Festival thumbnail image', th: 'รูปภาพตัวอย่างของเทศกาล' },
      },
    },
    {
      name: 'link',
      type: 'text',
      label: { en: 'Link', th: 'ลิงก์ (Link)' },
      admin: {
        description: {
          en: 'Auto-generated from festival slug: /search-tour?festivals=<slugHoliday>',
          th: 'สร้างอัตโนมัติจาก Slug เทศกาล: /search-tour?festivals=<slugHoliday>',
        },
        readOnly: true,
      },
    },
  ],
}
