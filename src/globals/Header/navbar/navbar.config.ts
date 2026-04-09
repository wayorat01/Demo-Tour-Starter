import type { Field, Block, Where } from 'payload'
import { link } from '@/fields/link'
import { icon } from '@/components/Icon/config'

// Block types for navigation submenus (only for navbar4)
const navSubmenuBlocks: Block[] = [
  // Featured Banner Block
  {
    slug: 'featuredBanner',
    imageURL: '/admin/previews/header/navbar4/featuredBanner.jpeg',
    labels: {
      plural: 'Featured Banners',
      singular: 'Featured Banner',
    },
    fields: [
      {
        type: 'text',
        name: 'title',
        label: 'Title',
        localized: true,
      },
      {
        type: 'text',
        name: 'subtitle',
        label: 'Subtitle',
        localized: true,
      },
      {
        type: 'text',
        name: 'description',
        label: 'Description',
        localized: true,
      },
      {
        name: 'image',
        type: 'upload',
        relationTo: 'media',
      },
      {
        name: 'backgroundColor',
        type: 'select',
        options: [
          { label: 'Primary', value: 'primary' },
          { label: 'Secondary', value: 'secondary' },
          { label: 'Accent', value: 'accent' },
          { label: 'Muted', value: 'muted' },
        ],
        defaultValue: 'primary',
      },
      link({
        appearances: ['default', 'outline', 'ghost', 'secondary'],
      }),
    ],
  },
  // Category Grid Block
  {
    slug: 'categoryGrid',
    labels: {
      plural: 'Category Grids',
      singular: 'Category Grid',
    },
    imageURL: '/admin/previews/header/navbar4/categoryGrid.jpeg',

    fields: [
      {
        type: 'text',
        name: 'title',
        label: 'Title',
        localized: true,
      },
      {
        type: 'array',
        name: 'items',
        label: 'Items',
        fields: [
          {
            type: 'text',
            name: 'title',
            label: 'Title',
            localized: true,
          },
          {
            type: 'text',
            name: 'description',
            label: 'Description',
            localized: true,
          },
          icon(),
          link({
            appearances: false,
          }),
        ],
      },
    ],
  },
  // Tour Category Menu Block - For International Tours
  {
    slug: 'tourCategoryMenu',
    labels: {
      plural: 'Tour Category Menus',
      singular: 'Tour Category Menu',
    },
    imageURL: '/admin/previews/header/navbar4/categoryGrid.jpeg',
    fields: [
      {
        type: 'text',
        name: 'title',
        label: 'Section Title',
        localized: true,
        admin: {
          description: { en: 'e.g.', th: 'e.g., เอเชีย, ยุโรป' },
        },
      },
      {
        name: 'underlineColor',
        type: 'text',
        defaultValue: '#f97316',
        label: 'Underline Color',
        admin: {
          description: 'Hex color for title underline (e.g., orange: #f97316)',
        },
      },
      {
        name: 'category',
        type: 'relationship',
        relationTo: 'tour-categories',
        hasMany: true,
        label: 'Tour Category',
        admin: {
          description: 'Select category to display tours from (supports multiple)',
        },
      },
      {
        name: 'tours',
        type: 'relationship',
        relationTo: ['intertours', 'inbound-tours'],
        hasMany: true,
        label: 'Tours to Display',
        filterOptions: ({ siblingData }: any) => {
          const categoryData = siblingData?.category || []
          const cats = Array.isArray(categoryData) ? categoryData : [categoryData]
          const catIds = cats
            .map((c: any) => (typeof c === 'object' ? c?.id || c?.value || c : c))
            .filter(Boolean)

          // Create an explicit array of Where objects to avoid TS union issues
          const conditions: any[] = [{ parentCountry: { exists: false } }]
          if (catIds.length > 0) {
            conditions.push({ category: { in: catIds } })
          }

          return { and: conditions } as Where
        },
        admin: {
          description:
            'Select primary tours (no parent country) from intertours or inbound-tours to show in this menu section',
        },
      },
      {
        name: 'columns',
        type: 'select',
        defaultValue: '2',
        options: [
          { label: '1 Column', value: '1' },
          { label: '2 Columns', value: '2' },
          { label: '3 Columns', value: '3' },
          { label: '4 Columns', value: '4' },
        ],
        label: 'Grid Columns',
      },
      {
        name: 'showCityHover',
        type: 'checkbox',
        label: { en: 'Show City Hover Popup', th: 'แสดง Popup เมืองเมื่อ Hover ประเทศ' },
        defaultValue: true,
        admin: {
          description: {
            en: 'Enable to show sub-city popup when user hovers over a country in the menu',
            th: 'เปิดใช้งานเพื่อแสดง popup เมืองย่อย เมื่อผู้ใช้วางเมาส์บนชื่อประเทศในเมนู',
          },
        },
      },
    ],
  },
  // Card Grid Block
  {
    slug: 'cardGrid',
    labels: {
      plural: 'Card Grids',
      singular: 'Card Grid',
    },
    imageURL: '/admin/previews/header/navbar4/cardGrid.jpeg',
    fields: [
      {
        type: 'text',
        name: 'title',
        label: 'Title',
        localized: true,
      },
      {
        type: 'array',
        name: 'cards',
        label: 'Cards',
        fields: [
          {
            type: 'text',
            name: 'title',
            label: 'Title',
            localized: true,
          },
          {
            type: 'text',
            name: 'description',
            label: 'Description',
            localized: true,
          },
          {
            type: 'array',
            name: 'links',
            label: 'Links',
            fields: [
              link({
                appearances: false,
              }),
              icon(),
            ],
          },
        ],
      },
    ],
  },
  // Feature List Block
  {
    slug: 'featureList',
    labels: {
      plural: 'Feature Lists',
      singular: 'Feature List',
    },
    fields: [
      {
        type: 'text',
        name: 'title',
        label: 'Title',
        localized: true,
      },
      {
        type: 'array',
        name: 'features',
        label: 'Features',
        fields: [
          {
            type: 'text',
            name: 'title',
            label: 'Title',
            localized: true,
          },
          {
            type: 'text',
            name: 'description',
            label: 'Description',
            localized: true,
          },
          icon(),
          link({
            appearances: false,
          }),
        ],
      },
    ],
  },
  // Simple Links Block
  {
    slug: 'simpleLinks',
    labels: {
      plural: 'Simple Links',
      singular: 'Simple Links',
    },
    fields: [
      {
        type: 'text',
        name: 'title',
        label: 'Title',
        localized: true,
      },
      {
        type: 'array',
        name: 'links',
        label: 'Links',
        fields: [
          link({
            appearances: false,
            disableIcon: true,
          }),
          icon(),
          {
            type: 'text',
            name: 'description',
            label: 'Description',
            localized: true,
          },
        ],
      },
    ],
  },
  // Featured Image Block
  {
    slug: 'featuredImage',
    imageURL: '/admin/previews/header/navbar4/featuredImage.jpeg',
    labels: {
      plural: 'Featured Images',
      singular: 'Featured Image',
    },
    fields: [
      {
        type: 'text',
        name: 'title',
        label: 'Title',
        localized: true,
      },
      {
        type: 'text',
        name: 'subtitle',
        label: 'Subtitle',
        localized: true,
      },
      {
        type: 'text',
        name: 'description',
        label: 'Description',
        localized: true,
      },
      {
        name: 'image',
        type: 'upload',
        relationTo: 'media',
      },
      {
        name: 'backgroundColor',
        type: 'select',
        options: [
          { label: 'Primary', value: 'primary' },
          { label: 'Secondary', value: 'secondary' },
          { label: 'Accent', value: 'accent' },
          { label: 'Muted', value: 'muted' },
        ],
        defaultValue: 'primary',
      },

      link({
        appearances: false,
        disableIcon: true,
        disableLabel: true,
      }),
    ],
  },
  // Multi-Column Links Block (for Design Version 6 mega menu)
  {
    slug: 'multiColumnLinks',
    labels: {
      plural: 'Multi-Column Links',
      singular: 'Multi-Column Links',
    },
    imageURL: '/admin/previews/header/navbar4/simpleLinks.jpeg',
    fields: [
      {
        type: 'text',
        name: 'title',
        label: 'Section Title',
        localized: true,
        admin: {
          description: {
            en: 'Optional header for this section (e.g., "", "")',
            th: 'Optional header for this section (e.g., "เอเชีย", "อื่นๆ")',
          },
        },
      },
      {
        type: 'number',
        name: 'columns',
        label: 'Number of Columns',
        defaultValue: 2,
        min: 1,
        max: 4,
        admin: {
          description: 'How many columns to display the links in',
        },
      },
      {
        type: 'array',
        name: 'links',
        label: 'Links',
        fields: [
          link({
            appearances: false,
          }),
          icon(),
          {
            name: 'customImage',
            type: 'upload',
            relationTo: 'media',
            label: 'Custom Icon/Image',
            admin: {
              description: 'Upload a custom icon (e.g., country flag). Overrides Lucide icon.',
            },
          },
        ],
      },
    ],
  },
]

export const navbar: Field[] = [
  {
    /**
     * Simple sub navigation block structure for navbars 1, 3, and 5
     */
    type: 'blocks',
    name: 'items',
    admin: {
      condition: (data) => ['3', '5'].includes(data?.designVersion),
      description: 'Navigation structure for navbar designs 1, 3, and 5',
    },
    blocks: [
      // Tour Category Menu Block (shared from navSubmenuBlocks)
      ...navSubmenuBlocks.filter((b) => b.slug === 'tourCategoryMenu'),
      {
        slug: 'sub',
        labels: {
          plural: 'Sub Navigation Menus',
          singular: 'Sub Navigation Menu',
        },
        fields: [
          {
            name: 'hidden',
            type: 'checkbox',
            label: { en: 'Hide this menu', th: 'ซ่อนเมนูนี้' },
            defaultValue: false,
            admin: {
              description: {
                en: 'Enable to hide this menu from the website without deleting',
                th: 'เปิดใช้งานเพื่อซ่อนเมนูนี้ออกจากหน้าเว็บ โดยไม่ต้องลบ',
              },
            },
          },
          icon(),
          {
            type: 'text',
            name: 'label',
            localized: true,
            required: true,
          },
          {
            type: 'array',
            name: 'subitems',
            label: { en: 'Sub Navigation Items', th: 'เมนูย่อย' },
            labels: {
              singular: { en: 'Sub Navigation Item', th: 'เมนูย่อย' },
              plural: { en: 'Sub Navigation Items', th: 'เมนูย่อยทั้งหมด' },
            },
            required: true,
            minRows: 2,
            maxRows: 10,
            fields: [
              link({
                appearances: false,
              }),
              {
                type: 'text',
                localized: true,
                name: 'Description',
              },
            ],
          },
        ],
      },
      {
        slug: 'link',
        labels: {
          plural: 'Links',
          singular: 'Link',
        },
        fields: [
          {
            name: 'hidden',
            type: 'checkbox',
            label: { en: 'Hide this menu', th: 'ซ่อนเมนูนี้' },
            defaultValue: false,
            admin: {
              description: {
                en: 'Enable to hide this menu from the website without deleting',
                th: 'เปิดใช้งานเพื่อซ่อนเมนูนี้ออกจากหน้าเว็บ โดยไม่ต้องลบ',
              },
            },
          },
          link({
            appearances: false,
          }),
        ],
      },
    ],
  },
  {
    /**
     * Block-based navigation structure for navbar4
     */
    type: 'blocks',
    name: 'richItems',
    label: 'Items',
    admin: {
      condition: (data) =>
        ['1', '2', '4', '5', '6', '7', '8'].includes(data?.designVersion),
      description: {
        de: 'Navigationselemente',
        en: 'Navigation elements',
      },
    },
    blocks: [
      {
        slug: 'link',
        labels: {
          plural: 'Links',
          singular: 'Link',
        },
        fields: [
          {
            name: 'hidden',
            type: 'checkbox',
            label: { en: 'Hide this menu', th: 'ซ่อนเมนูนี้' },
            defaultValue: false,
            admin: {
              description: {
                en: 'Enable to hide this menu from the website without deleting',
                th: 'เปิดใช้งานเพื่อซ่อนเมนูนี้ออกจากหน้าเว็บ โดยไม่ต้องลบ',
              },
            },
          },
          link({
            appearances: false,
          }),
        ],
      },
      {
        slug: 'submenu',
        labels: {
          plural: 'Submenu Blocks',
          singular: 'Submenu Block',
        },
        fields: [
          {
            name: 'hidden',
            type: 'checkbox',
            label: { en: 'Hide this menu', th: 'ซ่อนเมนูนี้' },
            defaultValue: false,
            admin: {
              description: {
                en: 'Enable to hide this menu from the website without deleting',
                th: 'เปิดใช้งานเพื่อซ่อนเมนูนี้ออกจากหน้าเว็บ โดยไม่ต้องลบ',
              },
            },
          },
          icon(),
          {
            type: 'text',
            name: 'label',
            label: 'Menu Label',
            localized: true,
            required: true,
          },
          {
            type: 'blocks',
            name: 'blocks',
            label: 'Submenu Blocks',
            blocks: navSubmenuBlocks,
            required: true,
            minRows: 1,
            defaultValue: async ({ req }: any) => {
              if (!req?.payload) return []

              try {
                const [asia, europe] = await Promise.all([
                  req.payload.find({
                    collection: 'tour-categories',
                    where: {
                      or: [{ title: { equals: 'ทัวร์เอเชีย' } }, { slug: { equals: 'asia' } }],
                    },
                    limit: 1,
                  }),
                  req.payload.find({
                    collection: 'tour-categories',
                    where: {
                      or: [{ title: { equals: 'ทัวร์ยุโรป' } }, { slug: { equals: 'europe' } }],
                    },
                    limit: 1,
                  }),
                ])

                const asiaId = asia.docs.length > 0 ? asia.docs[0].id : null
                const europeId = europe.docs.length > 0 ? europe.docs[0].id : null

                return [
                  {
                    blockType: 'tourCategoryMenu',
                    title: 'เอเชีย',
                    underlineColor: '#f97316',
                    category: asiaId ? [asiaId] : [],
                    tours: [],
                    columns: '2',
                  },
                  {
                    blockType: 'tourCategoryMenu',
                    title: 'ยุโรป',
                    underlineColor: '#3b82f6',
                    category: europeId ? [europeId] : [],
                    tours: [],
                    columns: '2',
                  },
                ]
              } catch (e) {
                return []
              }
            },
          },
        ],
      },
    ],
  },
  {
    type: 'array',
    name: 'buttons',
    labels: {
      singular: { en: 'Button', th: 'ปุ่ม' },
      plural: { en: 'Buttons', th: 'ปุ่มทั้งหมด' },
    },
    fields: [link()],
  },
  {
    type: 'text',
    name: 'copyright',
    label: 'Copyright',
    localized: true,
    defaultValue: 'Copyright © All Rights Reserved.',
    admin: {
      condition: (data) => data?.designVersion === '4',
    },
  },
]
