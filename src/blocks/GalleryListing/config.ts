import { Block } from 'payload'
import { designVersionPreview } from '@/components/AdminDashboard/DesignVersionPreview/config'

export const allGalleryListingDesignVersions = [
  {
    label: 'WowTour Gallery Listing 1',
    value: 'WOWTOUR_GALLERYLISTING1',
    image: '/admin/previews/gallery/wowtour_galleryListing1.png',
  },
] as const

export type GalleryListingDesignVersion = (typeof allGalleryListingDesignVersions)[number]

export const WowtourGalleryListingBlock: Block = {
  slug: 'wowtourGalleryListing',
  interfaceName: 'WowtourGalleryListingBlock',
  labels: {
    singular: 'Gallery Listing',
    plural: 'Gallery Listings',
  },
  fields: [
    designVersionPreview(allGalleryListingDesignVersions),
    {
      name: 'sectionTitle',
      type: 'text',
      defaultValue: 'แกลลอรี่ภาพท่องเที่ยว',
      admin: {
        description: { en: 'listing', th: 'หัวข้อหน้า listing' },
      },
    },
    {
      name: 'sectionDescription',
      type: 'textarea',
      defaultValue: 'รวมคอลเลคชั่นรูปภาพสถานที่ท่องเที่ยวจากทั่วทุกมุมโลก',
      admin: {
        description: { en: 'Description below heading', th: 'คำอธิบายใต้หัวข้อ' },
      },
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'all',
      options: [
        { label: { en: 'Translated Text', th: 'แสดงทั้งหมด' }, value: 'all' },
        { label: { en: '(Curated)', th: 'เลือกเอง (Curated)' }, value: 'curated' },
      ],
      admin: {
        description: { en: 'Gallery data source', th: 'แหล่งข้อมูลแกลลอรี่ที่จะแสดง' },
      },
    },
    {
      name: 'curatedAlbums',
      type: 'relationship',
      relationTo: 'gallery-albums',
      hasMany: true,
      admin: {
        description: { en: 'Select albums to display', th: 'เลือกอัลบั้มที่ต้องการแสดง' },
        condition: (_, siblingData) => siblingData?.source === 'curated',
      },
    },
    {
      name: 'albumsPerPage',
      type: 'number',
      defaultValue: 20,
      admin: {
        description: { en: 'Albums per page', th: 'จำนวนอัลบั้มต่อหน้า' },
      },
    },
  ],
}
