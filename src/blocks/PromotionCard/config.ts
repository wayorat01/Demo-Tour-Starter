import { Block } from 'payload'
import { backgroundColor } from '@/fields/color'
import { designVersionPreview } from '@/components/AdminDashboard/DesignVersionPreview/config'

export const allWowtourPromotionCardDesignVersions = [
  {
    label: 'WowTour Promotion Card 1 (4 Column Grid + Lightbox)',
    value: 'WOWTOUR_PROMOTION_CARD_1',
    image: '/admin/previews/promotionCard/wowtour_promotionCard1.jpg',
  },
] as const

export type WowtourPromotionCardDesignVersion =
  (typeof allWowtourPromotionCardDesignVersions)[number]['value']

export const WowtourPromotionCardBlock: Block = {
  slug: 'wowtourPromotionCard',
  interfaceName: 'WowtourPromotionCardBlock',
  labels: {
    singular: 'WOW Promotion Card',
    plural: 'WOW Promotion Card Blocks',
  },
  fields: [
    backgroundColor,
    designVersionPreview(allWowtourPromotionCardDesignVersions),

    // ============================================
    // 1. Heading Section
    // ============================================
    {
      name: 'headingSettings',
      type: 'group',
      label: { en: 'Heading', th: 'หัวข้อ (Heading)' },
      fields: [
        {
          name: 'heading',
          type: 'text',
          localized: true,
          label: { en: 'Heading', th: 'หัวข้อ (Heading)' },
          admin: {
            description: { en: 'Promotion Card block', th: 'หัวข้อหลักของ Promotion Card block' },
          },
        },
        {
          name: 'showDescription',
          type: 'checkbox',
          defaultValue: false,
          label: { en: 'Show Description', th: 'แสดงคำอธิบาย' },
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: { en: 'Translated Text', th: 'คำอธิบายเพิ่มเติม' },
          admin: {
            condition: (_, siblingData) => siblingData?.showDescription === true,
          },
        },
      ],
    },

    // ============================================
    // 2. Promotion Items
    // ============================================
    {
      name: 'elements',
      label: { en: '(Promotion Items)', th: 'รายการโปรโมชั่น (Promotion Items)' },
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        description: {
          en: 'Add unlimited promotion images — recommended multiples of 4',
          th: 'เพิ่มรูปโปรโมชั่นได้ไม่จำกัด — แนะนำจำนวนที่หาร 4 ลงตัว',
        },
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: { en: 'Translated Text', th: 'รูปโปรโมชั่น' },
        },
        {
          name: 'title',
          type: 'text',
          localized: true,
          label: { en: '(Title)', th: 'หัวข้อ (Title)' },
          admin: {
            description: { en: '( lightbox)', th: 'ชื่อโปรโมชั่น (แสดงใน lightbox)' },
          },
        },
        {
          name: 'imageHeight',
          type: 'select',
          options: ['12rem', '14rem', '16rem', '18rem', '20rem', '22rem', '24rem', '26rem'],
          defaultValue: '18rem',
          label: { en: '(Image Height)', th: 'ความสูงของรูป (Image Height)' },
          admin: {
            description: { en: '(default: 18rem)', th: 'ปรับความสูงของรูป (default: 18rem)' },
          },
        },
      ],
    },
  ],
}
