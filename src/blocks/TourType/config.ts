import { Block } from 'payload'
import { backgroundColor } from '@/fields/color'
import { designVersionPreview } from '@/components/AdminDashboard/DesignVersionPreview/config'

export const allWowtourTourTypeDesignVersions = [
  {
    label: 'WowTour Tour Card 1',
    value: 'WOWTOUR_TOUR_CARD_1',
    image: '/admin/previews/tourType/wowtour_tourCard1.png',
  },
  {
    label: 'WowTour Tour Card 2',
    value: 'WOWTOUR_TOUR_CARD_2',
    image: '/admin/previews/tourType/wowtour_tourCard2.png',
  },
  {
    label: 'WowTour Tour Card 3',
    value: 'WOWTOUR_TOUR_CARD_3',
    image: '/admin/previews/tourType/wowtour_tourCard3.png',
  },
  {
    label: 'WowTour Tour Card 4',
    value: 'WOWTOUR_TOUR_CARD_4',
    image: '/admin/previews/tourType/wowtour_tourCard4.png',
  },
  {
    label: 'WowTour Tour Card 5',
    value: 'WOWTOUR_TOUR_CARD_5',
    image: '/admin/previews/tourType/wowtour_visaCard5.png',
  },
  {
    label: 'WowTour Tour Card 6',
    value: 'WOWTOUR_TOUR_CARD_6',
    image: '/admin/previews/tourType/wowtour_tourCard6.png',
  },
] as const

export type WowtourTourTypeDesignVersion =
  (typeof allWowtourTourTypeDesignVersions)[number]['value']

export const WowtourTourTypeBlock: Block = {
  slug: 'wowtourTourType',
  interfaceName: 'WowtourTourTypeBlock',
  labels: {
    singular: 'WOW TourType',
    plural: 'WOW TourType Blocks',
  },
  fields: [
    backgroundColor,
    designVersionPreview(allWowtourTourTypeDesignVersions),

    // ============================================
    // 1. Heading Section
    // ============================================
    {
      name: 'headingSettings',
      type: 'group',
      label: { en: 'Heading', th: 'หัวข้อ (Heading)' },
      fields: [
        // heading จะใช้ title จาก API (loadtourbytype) อัตโนมัติ ไม่ต้องกรอกเอง
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
          label: { en: 'Translated Text', th: 'รูปไอคอนหัวข้อ' },
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
          label: { en: 'Translated Text', th: 'คำอธิบายเพิ่มเติม' },
          admin: {
            description: { en: 'Heading', th: 'คำอธิบายเพิ่มเติมใต้ Heading' },
            condition: (_, siblingData) => siblingData?.showDescription === true,
          },
        },
      ],
    },

    // ============================================
    // 2. Tour Group — เลือกกลุ่มทัวร์จาก CMS
    // ============================================
    {
      name: 'tourGroup',
      type: 'relationship',
      relationTo: 'tour-groups',
      required: false,
      label: { en: 'Tour Group', th: 'เลือก Tour Group' },
      filterOptions: {
        isActive: { equals: true },
      },
      admin: {
        description: {
          en: 'Select tour groups to display — shows active groups only',
          th: 'เลือกกลุ่มทัวร์ที่ต้องการแสดง — แสดงเฉพาะกลุ่มที่เปิดใช้งาน',
        },
      },
    },

    // ============================================
    // 3. Card Settings
    // ============================================
    {
      name: 'cardSettings',
      type: 'group',
      label: { en: 'Card Settings', th: 'ตั้งค่าการ์ด (Card Settings)' },
      fields: [
        {
          name: 'borderRadius',
          type: 'number',
          label: { en: 'Border Radius', th: 'ความมนของขอบการ์ด (Border Radius)' },
          defaultValue: 12,
          admin: {
            description: { en: '(default: 12px)', th: 'ปรับความมนของขอบการ์ด (default: 12px)' },
          },
        },
      ],
    },
    {
      name: 'maxVisibleCards',
      type: 'number',
      label: { en: '(Max Visible Cards)', th: 'จำนวนการ์ดแสดงสูงสุด (Max Visible Cards)' },
      defaultValue: 4,
      admin: {
        description: {
          en: 'Slider (default: 4)',
          th: 'จำนวนการ์ดที่แสดงก่อนจะเป็น Slider (default: 4)',
        },
        condition: (_, { designVersion = '' } = {}) => {
          return false
        },
      },
    },
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
        description: {
          en: 'Max Visible Cards',
          th: 'เลือกรูปแบบการแสดงผลเมื่อมีจำนวนเกินกว่า Max Visible Cards',
        },
        condition: (_, { designVersion = '' } = {}) => true,
      },
    },
    // Columns per row — horizontal cards (Card 4, 5, 6)
    {
      name: 'columnsPerRowHorizontal',
      type: 'select',
      label: { en: 'Translated Text', th: 'จำนวนคอลัมน์ต่อแถว' },
      defaultValue: '2',
      options: [
        { label: '1 Column', value: '1' },
        { label: '2 Columns', value: '2' },
      ],
      admin: {
        description: { en: 'Select columns per row', th: 'เลือกจำนวนคอลัมน์ต่อแถว (สูงสุด 2 คอลัมน์)' },
        condition: (_, { designVersion = '', displayMode = '' } = {}) => {
          const isHorizontal = designVersion === 'WOWTOUR_TOUR_CARD_4' || designVersion === 'WOWTOUR_TOUR_CARD_5' || designVersion === 'WOWTOUR_TOUR_CARD_6'
          return displayMode === 'slide' && isHorizontal
        },
      },
    },
    // Columns per row — vertical cards (Card 1-3)
    {
      name: 'columnsPerRow',
      type: 'select',
      label: { en: 'Translated Text', th: 'จำนวนคอลัมน์ต่อแถว' },
      defaultValue: '2',
      options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
        { label: '5 Columns', value: '5' },
      ],
      admin: {
        description: { en: 'Select columns per row', th: 'เลือกจำนวนคอลัมน์ต่อแถว' },
        condition: (_, { designVersion = '', displayMode = '' } = {}) => {
          const isHorizontal = designVersion === 'WOWTOUR_TOUR_CARD_4' || designVersion === 'WOWTOUR_TOUR_CARD_5' || designVersion === 'WOWTOUR_TOUR_CARD_6'
          return displayMode === 'slide' && !isHorizontal
        },
      },
    },
    {
      name: 'maxItemsToShow',
      type: 'select',
      label: { en: 'Translated Text', th: 'จำนวนรายการสูงสุดที่แสดง' },
      defaultValue: 'showAll',
      options: [
        { label: 'Show All', value: 'showAll' },
        { label: '2 Items', value: '2' },
        { label: '3 Items', value: '3' },
        { label: '4 Items', value: '4' },
        { label: '5 Items', value: '5' },
      ],
      admin: {
        description: {
          en: 'Select number of items to display',
          th: 'เลือกจำนวนรายการที่ต้องการแสดง',
        },
        condition: (_, { designVersion = '', displayMode = '' } = {}) => {
          return displayMode === 'showAll'
        },
      },
    },

    // ============================================
    // 4. Card 6 Footer Text
    // ============================================
    {
      name: 'card6FooterText',
      type: 'text',
      label: { en: '(Card 6)', th: 'ข้อความส่วนท้าย (Card 6)' },
      defaultValue: 'สนใจซื้อทัวร์ ติดต่อเอเจ้นท์',
      admin: {
        description: {
          en: 'Footer " "',
          th: 'ข้อความ Footer ด้านล่างตารางราคา เช่น "สนใจซื้อทัวร์ ติดต่อเอเจ้นท์"',
        },
        condition: (_, { designVersion = '' } = {}) => designVersion === 'WOWTOUR_TOUR_CARD_6',
      },
    },

    // ============================================
    // 5. Slider Settings
    // ============================================
    {
      name: 'sliderSettings',
      type: 'group',
      label: { en: 'Slider Settings', th: 'ตั้งค่าสไลเดอร์ (Slider Settings)' },
      admin: {
        condition: (_, { designVersion = '', displayMode = '' } = {}) => {
          return displayMode === 'slide'
        },
      },
      fields: [
        {
          name: 'autoPlayDelay',
          type: 'select',
          label: { en: 'Auto Play Delay (ms)', th: 'ระยะเวลาในการเลื่อนอัตโนมัติ (ms)' },
          defaultValue: '10000',
          options: [
            { label: 'Fast (5s)', value: '5000' },
            { label: 'Normal (10s)', value: '10000' },
            { label: 'Slow (15s)', value: '15000' },
            { label: 'Very Slow (20s)', value: '20000' },
          ],
          admin: {
            description: {
              en: 'Auto play delay in milliseconds',
              th: 'ระยะเวลาในการเลื่อนอัตโนมัติ (ms)',
            },
          },
        },
        {
          name: 'autoPlay',
          type: 'checkbox',
          defaultValue: false,
          label: { en: 'Auto Play', th: 'เลื่อนอัตโนมัติ' },
          admin: {
            description: { en: 'Enable/disable auto play', th: 'เปิด/ปิดการเลื่อนอัตโนมัติ' },
          },
        },
        {
          name: 'loop',
          type: 'checkbox',
          defaultValue: true,
          label: { en: 'Loop', th: 'วนลูป' },
          admin: {
            description: { en: 'Enable/disable loop', th: 'เปิด/ปิดการวนลูป' },
          },
        },
      ],
    },
  ],
}
