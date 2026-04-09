import { Block } from 'payload'
import { backgroundColor } from '@/fields/color'
import { designVersionPreview } from '@/components/AdminDashboard/DesignVersionPreview/config'

export const allWowtourGalleryAlbumDesignVersions = [
  {
    label: 'WowTour Gallery Album 1 (Vertical Cards)',
    value: 'WOWTOUR_GALLERY_ALBUM_1',
    image: '/admin/previews/galleryAlbum/wowtour_galleryAlbum1.jpg',
  },
  {
    label: 'WowTour Gallery Album 2 (Mosaic Grid)',
    value: 'WOWTOUR_GALLERY_ALBUM_2',
    image: '/admin/previews/galleryAlbum/wowtour_galleryAlbum2.png',
  },
  {
    label: 'WowTour Gallery Album 3 (Card Grid)',
    value: 'WOWTOUR_GALLERY_ALBUM_3',
    image: '/admin/previews/galleryAlbum/wowtour_galleryAlbum3.png',
  },
  {
    label: 'WowTour Gallery Album 4 (Filmstrip)',
    value: 'WOWTOUR_GALLERY_ALBUM_4',
    image: '/admin/previews/galleryAlbum/wowtour_galleryAlbum4.png',
  },
  {
    label: 'WowTour Gallery Album 5\n(Mosaic Journey)',
    value: 'WOWTOUR_GALLERY_ALBUM_5',
    image: '/admin/previews/galleryAlbum/wowtour_galleryAlbum5.png',
  },
] as const

export type WowtourGalleryAlbumDesignVersion =
  (typeof allWowtourGalleryAlbumDesignVersions)[number]['value']

export const WowtourGalleryAlbumBlock: Block = {
  slug: 'wowtourGalleryAlbum',
  interfaceName: 'WowtourGalleryAlbumBlock',
  labels: {
    singular: { en: 'Gallery Album', th: 'อัลบั้มแกลลอรี่ (Gallery Album)' },
    plural: { en: 'Gallery Album Blocks', th: 'บล็อกอัลบั้มแกลลอรี่ (Gallery Albums)' },
  },
  fields: [
    backgroundColor,
    designVersionPreview(allWowtourGalleryAlbumDesignVersions),

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
          defaultValue: 'Gallery Album',
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
        {
          name: 'tagline',
          type: 'text',
          defaultValue: 'The journey is the destination',
          localized: true,
          label: { en: 'Tagline', th: 'ข้อความรอง (Tagline)' },
          admin: {
            description: {
              en: 'Tagline Heading ( "The journey is the destination")',
              th: 'ข้อความ Tagline ด้านล่าง Heading (เช่น "The journey is the destination")',
            },
          },
        },
      ],
    },

    // ============================================
    // 2. Album Selection (Custom eye-toggle UI)
    // ============================================
    {
      name: 'albums',
      type: 'relationship',
      relationTo: 'gallery-albums',
      hasMany: true,
      label: { en: 'Select Gallery', th: 'เลือกแกลลอรี่' },
      admin: {
        components: {
          Field: {
            path: '@/components/AdminDashboard/GalleryAlbumSelector',
          },
        },
      },
    },
    {
      name: 'hiddenAlbumIds',
      type: 'json',
      label: 'Hidden Album IDs',
      admin: {
        hidden: true,
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
          defaultValue: 16,
          admin: {
            description: { en: '(default: 16px)', th: 'ปรับความมนของขอบการ์ด (default: 16px)' },
          },
        },
      ],
    },

    // ============================================
    // 3.5 Albums Per Row (hidden for Gallery 5)
    // ============================================
    {
      name: 'albumsPerRow',
      type: 'select',
      label: { en: 'Albums Per Row', th: 'จำนวนอัลบั้มต่อแถว' },
      defaultValue: '5',
      options: [
        { label: { en: '3 Albums / Row', th: '3 อัลบั้ม / แถว' }, value: '3' },
        { label: { en: '4 Albums / Row', th: '4 อัลบั้ม / แถว' }, value: '4' },
        { label: { en: '5 Albums / Row', th: '5 อัลบั้ม / แถว' }, value: '5' },
        { label: { en: '6 Albums / Row', th: '6 อัลบั้ม / แถว' }, value: '6' },
      ],
      admin: {
        description: {
          en: '1 (default: 5)',
          th: 'เลือกจำนวนอัลบั้มที่จะแสดงต่อ 1 แถว (default: 5)',
        },
        condition: (_, siblingData) => siblingData?.designVersion !== 'WOWTOUR_GALLERY_ALBUM_5',
      },
    },

    // ============================================
    // 4. Display Mode (hidden for Gallery 5)
    // ============================================
    {
      name: 'displayMode',
      type: 'select',
      label: { en: 'Display Mode', th: 'รูปแบบการแสดงผล' },
      defaultValue: 'showAll',
      options: [
        { label: { en: 'Show All (Grid)', th: 'แสดงทั้งหมด (Grid)' }, value: 'showAll' },
        { label: 'Slide', value: 'slide' },
      ],
      admin: {
        description: { en: 'Grid Slide', th: 'เลือกว่าจะแสดงแบบ Grid ทั้งหมด หรือแบบเลื่อน Slide' },
        condition: (_, siblingData) => siblingData?.designVersion !== 'WOWTOUR_GALLERY_ALBUM_5',
      },
    },

    // ============================================
    // 5. Button Settings
    // ============================================
    {
      name: 'buttonSettings',
      type: 'group',
      label: { en: 'Button Settings', th: 'ตั้งค่าปุ่ม (Button Settings)' },
      fields: [
        {
          name: 'showButton',
          type: 'checkbox',
          defaultValue: true,
          label: { en: 'Show "View All" Button', th: 'แสดงปุ่ม "ดูแกลลอรี่ทั้งหมด"' },
          admin: {
            description: { en: '/ ""', th: 'เปิด/ปิดปุ่ม "ดูแกลลอรี่ทั้งหมด"' },
          },
        },
        {
          name: 'buttonText',
          type: 'text',
          defaultValue: 'ดูแกลลอรี่ทั้งหมด',
          localized: true,
          label: { en: 'Button Text', th: 'ข้อความบนปุ่ม' },
          admin: {
            description: { en: 'Button text', th: 'ข้อความบนปุ่ม' },
            condition: (_, siblingData) => siblingData?.showButton === true,
          },
        },
        {
          name: 'buttonLink',
          type: 'text',
          defaultValue: '/gallery',
          label: { en: 'Button Link', th: 'ลิงก์ของปุ่ม' },
          admin: {
            description: {
              en: '(default: /gallery)',
              th: 'ลิงก์ที่ปุ่มจะพาไป (default: /gallery)',
            },
            condition: (_, siblingData) => siblingData?.showButton === true,
          },
        },
      ],
    },

    // ============================================
    // 6. Slider Settings (แสดงเมื่อเลือก Slide)
    // ============================================
    {
      name: 'sliderSettings',
      type: 'group',
      label: { en: 'Slider Settings', th: 'ตั้งค่าสไลเดอร์ (Slider Settings)' },
      admin: {
        condition: (_, siblingData) =>
          siblingData?.designVersion !== 'WOWTOUR_GALLERY_ALBUM_5' &&
          siblingData?.displayMode === 'slide',
      },
      fields: [
        {
          name: 'autoPlayDelay',
          type: 'number',
          label: { en: 'Auto Play Delay (ms)', th: 'ระยะเวลาเลื่อนอัตโนมัติ (ms)' },
          defaultValue: 5000,
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
