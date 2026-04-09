import { Block } from 'payload'
import { designVersionPreview } from '@/components/AdminDashboard/DesignVersionPreview/config'

export const allBlogListingDesignVersions = [
  {
    label: 'WowTour Blog Listing 1',
    value: 'WOWTOUR_BLOGLISTING1',
    image: '/admin/previews/blog/WowTour Blog Listing.jpg',
  },
] as const

export type BlogListingDesignVersion = (typeof allBlogListingDesignVersions)[number]

export const WowtourBlogListingBlock: Block = {
  slug: 'wowtourBlogListing',
  interfaceName: 'WowtourBlogListingBlock',
  labels: {
    singular: 'Blog Listing',
    plural: 'Blog Listings',
  },
  imageURL: '/admin/previews/blog/WowTour Blog Listing.jpg',
  fields: [
    designVersionPreview(allBlogListingDesignVersions),
    {
      name: 'source',
      type: 'select',
      defaultValue: 'all',
      options: [
        { label: { en: 'Translated Text', th: 'แสดงทั้งหมด' }, value: 'all' },
        { label: { en: '(Curated)', th: 'เลือกเอง (Curated)' }, value: 'curated' },
        { label: { en: 'Translated Text', th: 'กรองตามแท็ก' }, value: 'by_tag' },
      ],
      admin: {
        description: { en: 'Article data source', th: 'แหล่งข้อมูลบทความที่จะแสดง' },
      },
    },
    {
      name: 'curatedPosts',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
      admin: {
        description: { en: 'Select articles to display', th: 'เลือกบทความที่ต้องการแสดง' },
        condition: (_, siblingData) => siblingData?.source === 'curated',
      },
    },
    {
      name: 'filterTags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: {
        description: {
          en: 'Show only articles with these tags',
          th: 'แสดงเฉพาะบทความที่มีแท็กเหล่านี้',
        },
        condition: (_, siblingData) => siblingData?.source === 'by_tag',
      },
    },
    {
      name: 'postsPerPage',
      type: 'number',
      defaultValue: 12,
      admin: {
        description: { en: 'Articles per page', th: 'จำนวนบทความต่อหน้า' },
      },
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'grid',
      options: [
        { label: 'Grid', value: 'grid' },
        { label: 'List', value: 'list' },
      ],
      admin: {
        description: { en: 'Display format', th: 'รูปแบบการแสดงผล' },
      },
    },
  ],
}
