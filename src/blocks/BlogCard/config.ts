import { Block } from 'payload'
import { HeadingFeature, ParagraphFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { designVersionPreview } from '@/components/AdminDashboard/DesignVersionPreview/config'
import { linkGroup } from '@/fields/linkGroup'

export const allBlogCardDesignVersions = [
  {
    label: 'WowTour Blog Card 1',
    value: 'WOWTOUR_BLOGCARD1',
    image: '/admin/previews/blog/wowtour_blogCard1.jpeg',
  },
  {
    label: 'WowTour Blog Card 2',
    value: 'WOWTOUR_BLOGCARD2',
    image: '/admin/previews/blog/wowtour_blogCard2.jpeg',
  },
  {
    label: 'WowTour Blog Card 3',
    value: 'WOWTOUR_BLOGCARD3',
    image: '/admin/previews/blog/wowtour_blogCard3.jpeg',
  },
  {
    label: 'WowTour Blog Card 4',
    value: 'WOWTOUR_BLOGCARD4',
    image: '/admin/previews/blog/wowtour_blogCard4.jpeg',
  },
  {
    label: 'WowTour Blog Card 5',
    value: 'WOWTOUR_BLOGCARD5',
    image: '/admin/previews/blog/wowtour_blogCard5.jpeg',
  },
  {
    label: 'WowTour Blog Card 6',
    value: 'WOWTOUR_BLOGCARD6',
    image: '/admin/previews/blog/wowtour_blogCard6.jpeg',
  },
] as const

export type BlogCardDesignVersion = (typeof allBlogCardDesignVersions)[number]

export const WowtourBlogCardBlock: Block = {
  slug: 'wowtourBlogCard',
  interfaceName: 'WowtourBlogCardBlock',
  labels: {
    singular: { en: 'Blog Section', th: 'บทความท่องเที่ยว (Blog Section)' },
    plural: { en: 'Blog Sections', th: 'บล็อกบทความท่องเที่ยว (Blog Sections)' },
  },
  fields: [
    designVersionPreview(allBlogCardDesignVersions),
    {
      name: 'sectionTitle',
      type: 'text',
      defaultValue: 'บทความแนะนำ',
      admin: {
        description: { en: 'Section', th: 'หัวข้อ Section' },
      },
    },
    {
      name: 'sectionDescription',
      type: 'textarea',
      defaultValue: 'บทความท่องเที่ยวและไลฟ์สไตล์ที่คัดสรรมาเพื่อคุณ',
      admin: {
        description: { en: 'Description below heading', th: 'คำอธิบายใต้หัวข้อ' },
      },
    },
    {
      name: 'sectionIconImage',
      type: 'upload',
      relationTo: 'media',
      label: { en: 'Section Icon', th: 'ไอคอนส่วน (Section Icon)' },
      admin: {
        description: {
          en: '/SVG Icon section',
          th: 'อัพโหลดไฟล์รูปภาพ/SVG เป็น Icon สำหรับ section',
        },
      },
    },

    // ============================================
    // Decorative Image (Compass) Settings — Blog Card 4
    // ============================================
    {
      name: 'decorativeSettings',
      type: 'group',
      label: { en: 'Decorative Compass Image', th: '🧭 ภาพพื้นหลังตกแต่ง (Compass)' },
      admin: {
        description: {
          en: '(compass) section',
          th: 'ตั้งค่าภาพตกแต่ง (compass) ฝั่งขวาของ section',
        },
        condition: (data) => {
          const layoutData = data?.layout || []
          const currentBlock = layoutData.find?.(
            (block: any) => block?.blockType === 'wowtourBlogCard',
          )
          return currentBlock?.designVersion === 'WOWTOUR_BLOGCARD4'
        },
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: { en: 'Decorative Image', th: 'รูปภาพตกแต่ง' },
          admin: {
            description: {
              en: '/SVG ( compass )',
              th: 'อัพโหลดรูปภาพ/SVG สำหรับตกแต่ง (ถ้าไม่ตั้ง จะใช้ลาย compass เริ่มต้น)',
            },
          },
        },
        {
          name: 'positionPreset',
          type: 'select',
          label: { en: 'Position Preset', th: 'ตำแหน่ง Preset' },
          defaultValue: 'topRight',
          options: [
            { label: { en: 'Top Left', th: 'บนซ้าย (Top Left)' }, value: 'topLeft' },
            { label: { en: 'Top Center', th: 'บนกลาง (Top Center)' }, value: 'topCenter' },
            { label: { en: 'Top Right', th: 'บนขวา (Top Right)' }, value: 'topRight' },
            { label: { en: 'Center Left', th: 'กลางซ้าย (Center Left)' }, value: 'centerLeft' },
            { label: { en: 'Center', th: 'กลาง (Center)' }, value: 'center' },
            { label: { en: 'Center Right', th: 'กลางขวา (Center Right)' }, value: 'centerRight' },
            { label: { en: 'Bottom Left', th: 'ล่างซ้าย (Bottom Left)' }, value: 'bottomLeft' },
            {
              label: { en: 'Bottom Center', th: 'ล่างกลาง (Bottom Center)' },
              value: 'bottomCenter',
            },
            { label: { en: 'Bottom Right', th: 'ล่างขวา (Bottom Right)' }, value: 'bottomRight' },
          ],
          admin: {
            description: { en: 'Select decorative image position', th: 'เลือกตำแหน่งของภาพตกแต่ง' },
          },
        },
        {
          name: 'width',
          type: 'number',
          label: { en: 'Width (px)', th: 'ความกว้าง (px)' },
          defaultValue: 280,
          admin: {
            description: { en: '(default: 280px)', th: 'ความกว้างของภาพตกแต่ง (default: 280px)' },
          },
        },
        {
          name: 'height',
          type: 'number',
          label: { en: 'Height (px)', th: 'ความสูง (px)' },
          defaultValue: 280,
          admin: {
            description: { en: '(default: 280px)', th: 'ความสูงของภาพตกแต่ง (default: 280px)' },
          },
        },
        {
          name: 'opacity',
          type: 'number',
          label: { en: 'Opacity (0-100)', th: 'ความโปร่งใส (0-100)' },
          defaultValue: 20,
          min: 0,
          max: 100,
          admin: {
            description: {
              en: '(0 = , 100 = , default: 20)',
              th: 'ความโปร่งใสของรูปภาพ (0 = ซ่อน, 100 = ทึบเต็ม, default: 20)',
            },
          },
        },
      ],
    },
    {
      name: 'viewAllLink',
      type: 'text',
      defaultValue: '/blog',
      admin: {
        description: { en: '\"View All Articles\" button link', th: 'ลิงก์ปุ่ม "ดูบทความทั้งหมด"' },
        condition: (data) => {
          const layoutData = data?.layout || []
          const currentBlock = layoutData.find?.(
            (block: any) => block?.blockType === 'wowtourBlogCard',
          )
          return currentBlock?.designVersion !== 'WOWTOUR_BLOGCARD6'
        },
      },
    },
    {
      name: 'viewAllLabel',
      type: 'text',
      defaultValue: 'ดูบทความทั้งหมด',
      admin: {
        description: { en: 'View All', th: 'ข้อความปุ่ม View All' },
        condition: (data) => {
          const layoutData = data?.layout || []
          const currentBlock = layoutData.find?.(
            (block: any) => block?.blockType === 'wowtourBlogCard',
          )
          return currentBlock?.designVersion !== 'WOWTOUR_BLOGCARD6'
        },
      },
    },
    {
      name: 'sortOrder',
      type: 'select',
      label: { en: 'Article Sort Order', th: 'ลำดับการแสดงบทความ' },
      defaultValue: 'publishedAt_desc',
      options: [
        {
          label: { en: 'Published (Newest First)', th: 'วันที่เผยแพร่ (ใหม่ → เก่า)' },
          value: 'publishedAt_desc',
        },
        {
          label: { en: 'Published (Oldest First)', th: 'วันที่เผยแพร่ (เก่า → ใหม่)' },
          value: 'publishedAt_asc',
        },
        {
          label: { en: 'Created (Newest First)', th: 'วันที่สร้าง (ใหม่ → เก่า)' },
          value: 'createdAt_desc',
        },
        {
          label: { en: 'Created (Oldest First)', th: 'วันที่สร้าง (เก่า → ใหม่)' },
          value: 'createdAt_asc',
        },
        {
          label: { en: 'Updated (Newest First)', th: 'วันที่อัปเดตล่าสุด (ใหม่ → เก่า)' },
          value: 'updatedAt_desc',
        },
        {
          label: { en: 'Updated (Oldest First)', th: 'วันที่อัปเดตล่าสุด (เก่า → ใหม่)' },
          value: 'updatedAt_asc',
        },
        { label: { en: 'Title (A → Z)', th: 'ชื่อบทความ (ก → ฮ)' }, value: 'title_asc' },
        { label: { en: 'Title (Z → A)', th: 'ชื่อบทความ (ฮ → ก)' }, value: 'title_desc' },
      ],
      admin: {
        description: { en: 'Select article sort order', th: 'เลือกลำดับการเรียงบทความที่นำมาแสดง' },
      },
    },
    {
      name: 'showExcerpt',
      type: 'checkbox',
      label: { en: 'Show Excerpt', th: 'แสดง Excerpt (เนื้อหาย่อ)' },
      defaultValue: false,
      admin: {
        description: {
          en: '/ — Blog Card 5',
          th: 'เปิด/ปิดการแสดงเนื้อหาย่อของบทความใต้ชื่อเรื่อง — สำหรับ Blog Card 5',
        },
        condition: (data) => {
          const layoutData = data?.layout || []
          const currentBlock = layoutData.find?.(
            (block: any) => block?.blockType === 'wowtourBlogCard',
          )
          return (
            currentBlock?.designVersion === 'WOWTOUR_BLOGCARD5' ||
            currentBlock?.designVersion === 'WOWTOUR_BLOGCARD6'
          )
        },
      },
    },

    // ============================================
    // Banners (Blog Card 3 only)
    // ============================================
    {
      name: 'banners',
      type: 'array',
      label: { en: 'Promotion Banner (Card 3)', th: 'แบนเนอร์โปรโมชัน (สำหรับ Blog Card 3)' },
      maxRows: 2,
      admin: {
        description: { en: '( 2 )', th: 'แบนเนอร์โปรโมชั่นฝั่งขวา (สูงสุด 2 รายการ)' },
        condition: (data) => {
          const layoutData = data?.layout || []
          const currentBlock = layoutData.find?.(
            (block: any) => block?.blockType === 'wowtourBlogCard',
          )
          return currentBlock?.designVersion === 'WOWTOUR_BLOGCARD3'
        },
      },
      fields: [
        {
          name: 'bannerImage',
          type: 'upload',
          relationTo: 'media',
          label: { en: 'Banner Image', th: 'รูปภาพแบนเนอร์' },
          required: true,
          admin: {
            description: { en: 'Banner image', th: 'รูปภาพแบนเนอร์' },
          },
        },
        {
          name: 'bannerTitle',
          type: 'text',
          label: { en: 'Banner Heading', th: 'หัวข้อแบนเนอร์' },
          admin: {
            description: {
              en: 'Banner heading (overlay on image)',
              th: 'หัวข้อแบนเนอร์ (แสดงทับบนรูป)',
            },
          },
        },
        {
          name: 'bannerDescription',
          type: 'text',
          label: { en: 'Banner Details', th: 'รายละเอียดแบนเนอร์' },
          admin: {
            description: {
              en: 'Banner description (overlay on image)',
              th: 'คำอธิบายแบนเนอร์ (แสดงทับบนรูป)',
            },
          },
        },
        {
          name: 'bannerLink',
          type: 'text',
          label: { en: 'Banner Link', th: 'ลิงก์แบนเนอร์' },
          admin: {
            description: {
              en: 'Banner click link (optional)',
              th: 'ลิงก์เมื่อคลิกแบนเนอร์ (ไม่บังคับ)',
            },
          },
        },
      ],
    },

    // ============================================
    // Card Settings
    // ============================================
    {
      name: 'cardSettings',
      type: 'group',
      label: { en: 'Card Settings', th: 'ตั้งค่าการ์ด (Card Settings)' },
      fields: [
        {
          name: 'borderRadius',
          type: 'number',
          label: { en: 'Card Border Radius', th: 'ความมนของมุมการ์ด (Border Radius)' },
          defaultValue: 12,
          admin: {
            description: {
              en: 'Banner (default: 12px)',
              th: 'ปรับความมนของขอบการ์ดและ Banner (default: 12px)',
            },
            condition: (data) => {
              const layoutData = data?.layout || []
              const currentBlock = layoutData.find?.(
                (block: any) => block?.blockType === 'wowtourBlogCard',
              )
              return (
                currentBlock?.designVersion !== 'WOWTOUR_BLOGCARD5' &&
                currentBlock?.designVersion !== 'WOWTOUR_BLOGCARD6'
              )
            },
          },
        },
        {
          name: 'imageBorderRadius',
          type: 'number',
          label: { en: 'Image Border Radius', th: 'ความมนของมุมรูปภาพ (Border Radius)' },
          defaultValue: 0,
          min: 0,
          max: 100,
          admin: {
            description: {
              en: '(default: 0px, : 100px) — Blog Card 5',
              th: 'ปรับความมนของขอบรูปภาพ (default: 0px, สูงสุด: 100px) — สำหรับ Blog Card 5',
            },
            condition: (data) => {
              const layoutData = data?.layout || []
              const currentBlock = layoutData.find?.(
                (block: any) => block?.blockType === 'wowtourBlogCard',
              )
              return (
                currentBlock?.designVersion === 'WOWTOUR_BLOGCARD5' ||
                currentBlock?.designVersion === 'WOWTOUR_BLOGCARD6'
              )
            },
          },
        },
      ],
    },
  ],
}
