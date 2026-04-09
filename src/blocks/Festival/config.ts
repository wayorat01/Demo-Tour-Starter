import { Block } from 'payload'
import { backgroundColor } from '@/fields/color'
import { designVersionPreview } from '@/components/AdminDashboard/DesignVersionPreview/config'

export const allFestivalTourDesignVersions = [
  {
    label: 'WowTour Festival Tour 1 (Grid + Month Filter)',
    value: 'WOWTOUR_FESTIVAL_TOUR_1',
    image: '',
  },
  {
    label: 'WowTour Festival Tour 2 (Modern Card + Gradient)',
    value: 'WOWTOUR_FESTIVAL_TOUR_2',
    image: '',
  },
] as const

export type FestivalTourDesignVersion = (typeof allFestivalTourDesignVersions)[number]['value']

export const FestivalTourBlock: Block = {
  slug: 'wowtourFestivalTour',
  interfaceName: 'WowtourFestivalTourBlock',
  labels: {
    singular: 'WowTour Festival Tour',
    plural: 'WowTour Festival Tour Blocks',
  },
  fields: [
    backgroundColor,
    designVersionPreview(allFestivalTourDesignVersions),

    // ============================================
    // 1. Heading Section
    // ============================================
    {
      name: 'headingSettings',
      type: 'group',
      label: 'Heading',
      fields: [
        {
          name: 'heading',
          type: 'text',
          defaultValue: 'เที่ยวตามเทศกาล',
          localized: true,
          label: 'Heading',
          admin: {
            description: { en: 'block', th: 'หัวข้อหลักของ block นี้' },
          },
        },
        {
          name: 'showHeadingIcon',
          type: 'checkbox',
          defaultValue: true,
          label: 'Show Heading Icon',
          admin: {
            description: { en: '/ Icon Heading', th: 'เปิด/ปิด Icon ข้างหน้า Heading' },
          },
        },
        {
          name: 'headingIcon',
          type: 'upload',
          relationTo: 'media',
          label: 'Heading Icon',
          admin: {
            description: { en: 'SVG', th: 'รับไฟล์ SVG หรือไฟล์รูปภาพ' },
            condition: (_, siblingData) => siblingData?.showHeadingIcon === true,
          },
        },
        {
          name: 'showDescription',
          type: 'checkbox',
          defaultValue: false,
          label: 'Show Description',
          admin: {
            description: {
              en: '/ Description Heading',
              th: 'เปิด/ปิด Description ที่อยู่ภายใต้ Heading',
            },
          },
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: 'Description',
          admin: {
            description: { en: 'Heading', th: 'คำอธิบายเพิ่มเติมใต้ Heading' },
            condition: (_, siblingData) => siblingData?.showDescription === true,
          },
        },
      ],
    },
  ],
}
