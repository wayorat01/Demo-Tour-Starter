import { Block } from 'payload'
import { backgroundColor } from '@/fields/color'
import { designVersionPreview } from '@/components/AdminDashboard/DesignVersionPreview/config'

export const allWowtourPopularCountryDesignVersions = [
  {
    label: 'WowTour Popular Country 1 (Circular Images)',
    value: 'WOWTOUR_POPULAR_COUNTRY_1',
    image: '/admin/previews/popularCountry/wowtour_popularCountry1.jpg',
  },
  {
    label: 'WowTour Popular Country 2 (4:3 Ratio)',
    value: 'WOWTOUR_POPULAR_COUNTRY_2',
    image: '/admin/previews/popularCountry/wowtour_popularCountry2.png',
  },
  {
    label: 'WowTour Popular Country 3',
    value: 'WOWTOUR_POPULAR_COUNTRY_3',
    image: '/admin/previews/popularCountry/wowtour_popularCountry3.png',
  },
  {
    label: 'WowTour Popular Country 4 (Tilted Cards)',
    value: 'WOWTOUR_POPULAR_COUNTRY_4',
    image: '/admin/previews/popularCountry/wowtour_popularCountry4.png',
  },
] as const

export type WowtourPopularCountryDesignVersion =
  (typeof allWowtourPopularCountryDesignVersions)[number]['value']

/**
 * Get default border radius based on design version
 */
const getDefaultBorderRadius = (designVersion: string): number => {
  if (designVersion === 'WOWTOUR_POPULAR_COUNTRY_1') {
    return 999 // Circular for V1
  }
  return 0 // Square corners for V2 & V3
}

/**
 * Get max items threshold before slide/showAll mode appears
 */
const getMaxItemsThreshold = (designVersion: string): number => {
  if (designVersion === 'WOWTOUR_POPULAR_COUNTRY_1') {
    return 5
  }
  if (designVersion === 'WOWTOUR_POPULAR_COUNTRY_4') {
    return 4
  }
  return 8 // V2 & V3
}

export const WowtourPopularCountryBlock: Block = {
  slug: 'wowtourPopularCountry',
  interfaceName: 'WowtourPopularCountryBlock',
  labels: {
    singular: { en: 'Popular Country', th: 'ประเทศยอดนิยม (Popular Country)' },
    plural: { en: 'Popular Country Blocks', th: 'บล็อกประเทศยอดนิยม (Popular Country Blocks)' },
  },
  fields: [
    backgroundColor,
    designVersionPreview(allWowtourPopularCountryDesignVersions),

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
          defaultValue: 'ทัวร์ประเทศยอดนิยม',
          localized: true,
          label: { en: 'Heading', th: 'หัวข้อ (Heading)' },
          admin: {
            description: { en: 'block', th: 'หัวข้อหลักของ block นี้' },
          },
        },
        {
          name: 'showHeadingIcon',
          type: 'checkbox',
          defaultValue: false,
          label: { en: 'Show Heading Icon', th: 'แสดงไอคอนหัวข้อ' },
          admin: {
            description: { en: '/ Icon Heading', th: 'เปิด/ปิด Icon ข้างหน้า Heading' },
          },
        },
        {
          name: 'headingIcon',
          type: 'upload',
          relationTo: 'media',
          label: { en: 'Heading Icon Image', th: 'รูปไอคอนหัวข้อ' },
          admin: {
            description: { en: 'SVG', th: 'รับไฟล์ SVG หรือไฟล์รูปภาพ' },
            condition: (_, siblingData) => siblingData?.showHeadingIcon === true,
          },
        },
        {
          name: 'showDescription',
          type: 'checkbox',
          defaultValue: false,
          label: { en: 'Show Description', th: 'แสดงคำอธิบาย' },
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
          label: { en: 'Additional Description', th: 'คำอธิบายเพิ่มเติม' },
          admin: {
            description: { en: 'Heading', th: 'คำอธิบายเพิ่มเติมใต้ Heading' },
            condition: (_, siblingData) => siblingData?.showDescription === true,
          },
        },
      ],
    },

    // ============================================
    // 2. Popular Country Items
    // ============================================
    {
      name: 'countries',
      type: 'array',
      label: { en: 'Popular Countries', th: 'ประเทศยอดนิยม (Popular Countries)' },
      labels: {
        singular: 'Country',
        plural: 'Countries',
      },
      admin: {
        description: { en: 'Add unlimited popular countries', th: 'เพิ่มประเทศยอดนิยมได้ไม่จำกัด' },
      },
      fields: [
        {
          name: 'pageCountriesLink',
          type: 'relationship',
          relationTo: 'intertours',
          label: { en: 'Countries Page Link', th: 'ลิงก์หน้าประเทศ (Page Countries Link)' },
          admin: {
            description: {
              en: 'Tour Title International Tours',
              th: 'เลือก Tour Title จากหน้า International Tours',
            },
          },
        },
        {
          name: 'tourDescription',
          type: 'textarea',
          label: { en: 'Tour Details', th: 'รายละเอียดทัวร์' },
          localized: true,
          admin: {
            description: {
              en: '( WowTour Popular Country 3 )',
              th: 'รายละเอียดทัวร์ที่จะแสดงใต้ชื่อประเทศ (ใช้กับ WowTour Popular Country 3 เท่านั้น)',
            },
            condition: (data) => {
              const layout = data?.layout || []
              return layout.some(
                (block: any) =>
                  block.blockType === 'wowtourPopularCountry' &&
                  block.designVersion === 'WOWTOUR_POPULAR_COUNTRY_3',
              )
            },
          },
        },
      ],
    },

    // ============================================
    // 3. Display Mode
    // ============================================
    {
      name: 'displayMode',
      type: 'select',
      label: { en: 'Display Mode', th: 'รูปแบบการแสดงผล (Display Mode)' },
      defaultValue: 'slide',
      options: [
        { label: 'Slide', value: 'slide' },
        { label: { en: 'Show All', th: 'Show All (แสดงทั้งหมด)' }, value: 'showAll' },
      ],
      admin: {
        condition: (_, { designVersion = '' } = {}) =>
          designVersion !== 'WOWTOUR_POPULAR_COUNTRY_2' &&
          designVersion !== 'WOWTOUR_POPULAR_COUNTRY_3',
        description: {
          en: '(V1: 5 items, V2&V3: 8 items, V4: 4 items)',
          th: 'เลือกรูปแบบการแสดงผลเมื่อมีจำนวนเกินกว่าที่กำหนด (V1: 5 items, V2&V3: 8 items, V4: 4 items)',
        },
      },
    },

    // ============================================
    // 4. Show Image Setting
    // ============================================
    {
      name: 'imageSettings',
      type: 'group',
      label: { en: 'Image Settings', th: 'ตั้งค่ารูปภาพ (Image Setting)' },
      fields: [
        {
          name: 'borderRadius',
          type: 'number',
          label: { en: 'Image Border Radius', th: 'ความมนของขอบรูป (Border Radius)' },
          defaultValue: 999,
          admin: {
            description: {
              en: 'border radius (V1 default: 999px, V2&V3 default: 0px)',
              th: 'ปรับขนาด border radius สำหรับทุกรูป (V1 default: 999px, V2&V3 default: 0px)',
            },
          },
        },
        // Hover Settings
        {
          name: 'showBorderOnHover',
          type: 'checkbox',
          defaultValue: false,
          label: { en: 'Show Border on Hover', th: 'แสดงเส้นขอบเมื่อใช้เมาส์ชี้' },
          admin: {
            description: { en: 'hover', th: 'แสดงเส้นขอบรอบรูปเมื่อ hover' },
          },
        },
        {
          name: 'hoverColor',
          type: 'select',
          label: {
            en: 'Hover Overlay & Border Color',
            th: 'สีเมื่อใช้เมาส์ชี้ (Overlay & Border)',
          },
          defaultValue: 'primary',
          options: [
            { label: 'Primary', value: 'primary' },
            { label: 'Secondary', value: 'secondary' },
          ],
          admin: {
            description: {
              en: 'overlay border hover',
              th: 'สีที่ใช้สำหรับ overlay และ border เมื่อ hover',
            },
            condition: (data) => {
              const layout = data?.layout || []
              return !layout.some(
                (block: any) =>
                  block.blockType === 'wowtourPopularCountry' &&
                  block.designVersion === 'WOWTOUR_POPULAR_COUNTRY_3',
              )
            },
          },
        },
      ],
    },
  ],
}
