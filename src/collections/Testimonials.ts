import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { canAccessCollection } from '../access/isAgentStarter'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: {
    singular: { en: 'Testimonial', th: 'รีวิว(Testimonials)' },
    plural: { en: 'Testimonials', th: 'รีวิว(Testimonials)' },
  },
  access: {
    create: canAccessCollection('testimonials', 'create'),
    delete: canAccessCollection('testimonials', 'delete'),
    read: anyone,
    update: canAccessCollection('testimonials', 'update'),
  },
  versions: { drafts: false, maxPerDoc: 5 },
  admin: {
    useAsTitle: 'customerName',
    defaultColumns: ['customerName', 'tourName', 'interTour', 'rating', 'order'],
    group: { en: 'Collections', th: 'คอลเลกชัน' },
  },
  fields: [
    {
      name: 'customerName',
      type: 'text',
      required: true,
      localized: true,
      label: { en: 'Customer Name', th: 'ชื่อลูกค้า' },
    },
    {
      name: 'profileImage',
      type: 'upload',
      relationTo: 'media',
      label: { en: 'Profile Image', th: 'รูปโปรไฟล์' },
      admin: {
        description: { en: 'Customer profile photo', th: 'รูปประจำตัวลูกค้า' },
      },
    },
    {
      name: 'tourName',
      type: 'text',
      localized: true,
      label: { en: 'Tour Name', th: 'ชื่อโปรแกรมทัวร์' },
      admin: {
        description: {
          en: 'e.g., Japan Tour 5 Days 3 Nights',
          th: 'e.g., ทัวร์ญี่ปุ่น 5 วัน 3 คืน',
        },
      },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      label: { en: 'Description (Review)', th: 'รายละเอียดรีวิว' },
      admin: {
        description: { en: 'Customer review text', th: 'ข้อความรีวิวจากลูกค้า' },
      },
    },
    {
      name: 'interTour',
      type: 'relationship',
      relationTo: 'intertours',
      label: { en: 'International Tour', th: 'ทัวร์ต่างประเทศที่เกี่ยวข้อง' },
      admin: {
        description: {
          en: 'Link to international tour (optional)',
          th: 'เชื่อมโยงกับทัวร์ต่างประเทศ (ไม่บังคับ)',
        },
      },
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 5,
      label: { en: 'Rating', th: 'คะแนนดาว' },
      admin: {
        description: { en: 'Star rating (1-5)', th: 'ให้คะแนน (1-5 ดาว)' },
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: { en: 'Display Order', th: 'ลำดับการแสดงผล' },
      admin: {
        description: { en: 'Lower numbers appear first', th: 'ตัวเลขน้อยจะแสดงก่อน' },
      },
    },
  ],
}
