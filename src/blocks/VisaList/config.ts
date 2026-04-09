import { Block } from 'payload'
import { backgroundColor } from '@/fields/color'
import { designVersionPreview } from '@/components/AdminDashboard/DesignVersionPreview/config'
import { colorPickerField } from '@/fields/colorPicker'

export const allVisaListDesignVersions = [
  {
    label: 'wowtour_visaCard1',
    value: 'wowtour_visaCard1',
    image: '/admin/previews/visaList/wowtour_visaCard1.jpg',
  },
  {
    label: 'wowtour_visaCard2',
    value: 'wowtour_visaCard2',
    image: '/admin/previews/visaList/wowtour_visaCard2.jpg',
  },
  {
    label: 'wowtour_visaCard3',
    value: 'wowtour_visaCard3',
    image: '/admin/previews/visaList/wowtour_visaCard3.jpg',
  },
] as const

export type VisaListDesignVersion = (typeof allVisaListDesignVersions)[number]

export const WowtourVisaListBlock: Block = {
  slug: 'wowtourVisaList',
  interfaceName: 'WowtourVisaListBlock',
  labels: {
    singular: 'WOW Visa List',
    plural: 'WOW Visa List Blocks',
  },
  fields: [
    backgroundColor,
    designVersionPreview(allVisaListDesignVersions),

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
          defaultValue: 'บริการที่ดีที่สุด "บริการรับยื่นวีซ่า"',
          localized: true,
          label: { en: 'Heading', th: 'หัวข้อ (Heading)' },
          admin: {
            description: { en: 'Visa List block', th: 'หัวข้อหลักของ Visa List block' },
          },
        },
        {
          name: 'showDescription',
          type: 'checkbox',
          defaultValue: false,
          label: 'Show Description',
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: 'Description',
          admin: {
            condition: (_, siblingData) => siblingData?.showDescription === true,
          },
        },
      ],
    },

    // ============================================
    // 2. Grid Settings
    // ============================================
    {
      name: 'gridColumns',
      type: 'select',
      label: 'Grid Columns (Desktop)',
      defaultValue: '4',
      options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
      ],
      admin: {
        description: { en: 'Desktop', th: 'จำนวนคอลัมน์ที่แสดงบนหน้าจอ Desktop' },
      },
    },

    // ============================================
    // 3. Visa Items
    // ============================================
    {
      name: 'items',
      label: 'Visa Items',
      type: 'array',
      required: true,
      minRows: 1,
      labels: {
        singular: 'Visa Item',
        plural: 'Visa Items',
      },
      admin: {
        description: { en: 'Add unlimited visa items', th: 'เพิ่มรายการวีซ่าได้ไม่จำกัด' },
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Cover Image',
          admin: {
            description: { en: 'Visa service cover image', th: 'รูปปกของบริการวีซ่า' },
          },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
          label: 'Title',
          admin: {
            description: { en: '" (Japan)"', th: 'เช่น "บริการยื่นวีซ่าญี่ปุ่น (Japan)"' },
          },
        },
        {
          name: 'tag',
          type: 'text',
          label: 'Tag / Badge',
          admin: {
            description: { en: '"Japan_VISA"', th: 'แท็กที่แสดงบนการ์ด เช่น "Japan_VISA"' },
          },
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: 'Description',
          admin: {
            description: { en: 'Short service description', th: 'คำอธิบายสั้นๆ ของบริการ' },
          },
        },
        {
          name: 'price',
          type: 'text',
          label: 'Price',
          admin: {
            description: { en: '"7,800"', th: 'ราคาที่แสดง เช่น "฿7,800"' },
          },
        },

        // ============================================
        // Button Settings (per item)
        // ============================================
        {
          name: 'buttonSettings',
          type: 'group',
          label: { en: 'Button Settings', th: 'ตั้งค่าปุ่ม (Button Settings)' },
          admin: {
            description: {
              en: 'Card button settings — hidden if button text is empty',
              th: 'ตั้งค่าปุ่มบนการ์ด — ถ้าไม่ใส่ชื่อปุ่ม จะไม่แสดงปุ่ม',
            },
          },
          fields: [
            {
              name: 'buttonLabel',
              type: 'text',
              localized: true,
              label: { en: 'Translated Text', th: 'ข้อความบนปุ่ม' },
              admin: {
                description: {
                  en: '"", " PDF", ""',
                  th: 'ข้อความบนปุ่ม เช่น "ดูรายละเอียด", "ดาวน์โหลด PDF", "สมัครเลย"',
                },
              },
            },
            {
              name: 'buttonIcon',
              type: 'select',
              label: { en: '(Button Icon)', th: 'ไอคอนของปุ่ม (Button Icon)' },
              admin: {
                description: { en: 'Select button icon', th: 'เลือกไอคอนที่แสดงบนปุ่ม' },
              },
              options: [
                { label: { en: 'Translated Text', th: 'ไม่มี' }, value: 'none' },
                { label: { en: '📥', th: '📥 ดาวน์โหลด' }, value: 'download' },
                { label: { en: '📄', th: '📄 เอกสาร' }, value: 'document' },
                { label: { en: '👁', th: '👁 ดูรายละเอียด' }, value: 'eye' },
                { label: { en: '➡️', th: '➡️ ลูกศรขวา' }, value: 'arrow-right' },
                { label: { en: '🔗', th: '🔗 ลิงก์' }, value: 'link' },
                { label: { en: '✈️', th: '✈️ เครื่องบิน' }, value: 'plane' },
                { label: { en: '📞', th: '📞 โทรศัพท์' }, value: 'phone' },
                { label: { en: 'Translated Text', th: '✅ เช็คมาร์ก' }, value: 'check' },
              ],
            },
            {
              name: 'buttonStyle',
              type: 'select',
              label: { en: '(Button Style)', th: 'สไตล์ของปุ่ม (Button Style)' },
              defaultValue: 'primary',
              admin: {
                description: { en: 'Select button style', th: 'เลือกสไตล์ของปุ่ม' },
              },
              options: [
                { label: '🔵 Primary', value: 'primary' },
                { label: '⚫ Secondary', value: 'secondary' },
                { label: { en: '⬜ Outline', th: '⬜ Outline (ขอบ)' }, value: 'outline' },
                { label: { en: '👻 Ghost', th: '👻 Ghost (โปร่งใส)' }, value: 'ghost' },
              ],
            },
            colorPickerField({
              name: 'buttonColor',
              label: { en: '(Button Color)', th: 'สีของปุ่ม (Button Color)' },
              defaultValue: '',
              admin: {
                description: {
                  en: '( default style)',
                  th: 'เลือกสีปุ่มเอง (ถ้าไม่เลือกจะใช้สี default ของ style)',
                },
              },
            }),
            {
              name: 'buttonPdfFile',
              type: 'upload',
              relationTo: 'media',
              label: { en: 'PDF', th: 'ไฟล์ PDF จากปุ่ม' },
              admin: {
                description: {
                  en: 'PDF — /',
                  th: 'แนบไฟล์ PDF สำหรับปุ่มนี้ — กดปุ่มจะเปิด/ดาวน์โหลดไฟล์',
                },
              },
            },
            {
              name: 'buttonLink',
              type: 'text',
              label: { en: 'Button link', th: 'ลิงก์ของปุ่ม' },
              admin: {
                description: { en: '( PDF )', th: 'ลิงก์สำหรับปุ่ม (ใช้แทน PDF ถ้าไม่ได้แนบไฟล์)' },
              },
            },
          ],
        },
      ],
    },
  ],
}
