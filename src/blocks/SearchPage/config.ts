import { Block } from 'payload'
import { allWowtourTourTypeDesignVersions } from '@/blocks/TourType/config'

// Design versions for the SearchPage block itself
export const allWowtourSearchPageDesignVersions = [
  {
    label: 'WowTour SearchTour 1',
    value: 'WOWTOUR_SEARCH_TOUR_1',
  },
] as const

export type WowtourSearchPageDesignVersion =
  (typeof allWowtourSearchPageDesignVersions)[number]['value']

export const WowtourSearchPageBlock: Block = {
  slug: 'wowtourSearchPage',
  interfaceName: 'WowtourSearchPageBlock',
  labels: {
    singular: 'WOW SearchPage',
    plural: 'WOW SearchPage Blocks',
  },
  fields: [
    // ============================================
    // Design Version (for this page block)
    // ============================================
    {
      name: 'designVersion',
      type: 'select',
      defaultValue: 'WOWTOUR_SEARCH_TOUR_1',
      label: 'Design Version',
      options: allWowtourSearchPageDesignVersions.map((v) => ({
        label: v.label,
        value: v.value,
      })),
      admin: {
        description: {
          en: 'Select search page display style',
          th: 'เลือกรูปแบบการแสดงผลของหน้าค้นหาทัวร์',
        },
      },
    },

    // ============================================
    // 2. Listing Card Settings
    // ============================================
    {
      name: 'listingCardSettings',
      type: 'group',
      label: 'Listing Card Settings',
      admin: {
        description: { en: 'Tour Card', th: 'ตั้งค่ารูปแบบ Tour Card ที่แสดงผลลัพธ์' },
      },
      fields: [
        {
          name: 'cardDesignVersion',
          type: 'select',
          defaultValue: 'WOWTOUR_TOUR_CARD_1',
          label: 'Tour Card Design',
          options: allWowtourTourTypeDesignVersions.map((v) => ({
            label: v.label,
            value: v.value,
          })),
          admin: {
            description: {
              en: 'Tour Card ( Design Version TourType Block — version TourType )',
              th: 'เลือกรูปแบบ Tour Card (ดึง Design Version จาก TourType Block อัตโนมัติ — เพิ่ม version ใหม่ที่ TourType จะปรากฏที่นี่ทันที)',
            },
          },
        },
        {
          name: 'borderRadius',
          type: 'number',
          label: 'Border Radius (px)',
          defaultValue: 16,
          admin: {
            description: {
              en: 'Card (default: 16px)',
              th: 'ปรับความมนของขอบ Card (default: 16px)',
            },
          },
        },
        {
          name: 'resultsPerPage',
          type: 'number',
          label: 'Results Per Page',
          defaultValue: 12,
          admin: {
            description: { en: 'Tour Card', th: 'จำนวน Tour Card ต่อหน้า' },
          },
        },
      ],
    },

    // ============================================
    // 3. Results Bar Settings
    // ============================================
    {
      name: 'resultsBarSettings',
      type: 'group',
      label: 'Results Bar Settings',
      admin: {
        description: { en: 'bar (, )', th: 'ตั้งค่า bar แสดงผลลัพธ์ (จำนวนทัวร์, ตัวกรอง)' },
      },
      fields: [
        {
          name: 'showSortFilter',
          type: 'checkbox',
          defaultValue: true,
          label: { en: 'Translated Text', th: 'แสดงตัวเรียงลำดับ' },
        },
        {
          name: 'sortOptions',
          type: 'group',
          label: { en: 'Translated Text', th: 'ตัวเลือกเรียงลำดับ' },
          admin: {
            description: {
              en: 'Select sort options to display',
              th: 'เลือกตัวเรียงลำดับที่ต้องการแสดง',
            },
            condition: (_, siblingData) => siblingData?.showSortFilter === true,
          },
          fields: [
            {
              name: 'showPeriodLowToHigh',
              type: 'checkbox',
              defaultValue: true,
              label: { en: '(periodlowtohight)', th: 'ล่าสุด (periodlowtohight)' },
            },
            {
              name: 'showPrice',
              type: 'checkbox',
              defaultValue: true,
              label: { en: '(price)', th: 'ราคา (price)' },
            },
            {
              name: 'showPeriodNoSoldout',
              type: 'checkbox',
              defaultValue: true,
              label: { en: '(periodnosoldout)', th: 'โปรแกรมที่ยังไม่เต็ม (periodnosoldout)' },
            },
            {
              name: 'showSupplierSeq',
              type: 'checkbox',
              defaultValue: false,
              label: { en: '(supplierseq)', th: 'เรียงตามซัพพลายเออร์ (supplierseq)' },
            },
          ],
        },
      ],
    },
  ],
}
