import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { canAccessCollection } from '../access/isAgentStarter'

export const Airlines: CollectionConfig = {
  slug: 'airlines',
  labels: {
    singular: { en: 'Airline', th: 'สายการบิน' },
    plural: { en: 'Airlines', th: 'สายการบิน' },
  },
  access: {
    create: canAccessCollection('airlines', 'create'),
    delete: canAccessCollection('airlines', 'delete'),
    read: anyone,
    update: canAccessCollection('airlines', 'update'),
  },
  admin: {
    useAsTitle: 'airlineName',
    defaultColumns: ['airlineCode', 'airlineName', 'countProduct', 'urlAirlinePicIcon'],
    group: { en: 'Tours', th: 'ทัวร์' },
  },
  fields: [
    {
      name: 'airlineCode',
      type: 'text',
      required: true,
      unique: true,
      label: { en: 'Airline Code', th: 'รหัสสายการบิน (Airline Code)' },
      admin: {
        description: {
          en: 'e.g., TG, SQ, CX — used as unique key',
          th: 'เช่น TG, SQ, CX — ใช้เป็นตัวตรวจซ้ำ (unique key)',
        },
      },
    },
    {
      name: 'airlineName',
      type: 'text',
      required: true,
      label: { en: 'Airline Name', th: 'ชื่อสายการบิน (Airline Name)' },
      admin: {
        description: {
          en: 'e.g., Thai Airways, Singapore Airlines',
          th: 'เช่น Thai Airways, Singapore Airlines',
        },
      },
    },
    {
      name: 'urlAirlinePic',
      type: 'text',
      label: { en: 'Logo URL', th: 'โลโก้สายการบิน (URL)' },
      admin: {
        description: {
          en: 'Airline logo image URL (large)',
          th: 'URL รูปโลโก้สายการบิน (ขนาดใหญ่)',
        },
      },
    },
    {
      name: 'urlAirlinePicIcon',
      type: 'text',
      label: { en: 'Icon URL', th: 'ไอคอนสายการบิน (URL Icon)' },
      admin: {
        description: {
          en: 'Airline icon URL (small) from filters',
          th: 'URL รูปไอคอนสายการบิน (ขนาดเล็ก) จาก filters',
        },
      },
    },
    {
      name: 'countProduct',
      type: 'number',
      defaultValue: 0,
      label: { en: 'Tour Count', th: 'จำนวนทัวร์ (Count Product)' },
      admin: {
        description: {
          en: 'Number of products using this airline — auto-updated on sync',
          th: 'จำนวน products ที่ใช้สายการบินนี้ — อัปเดตอัตโนมัติตอน sync',
        },
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      label: 'Active',
      admin: {
        description: {
          en: 'Show/hide this airline in filter',
          th: 'แสดง/ซ่อนสายการบินนี้ใน filter',
        },
      },
    },
  ],
}
