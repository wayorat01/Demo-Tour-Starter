import { designVersionPreview } from '@/components/AdminDashboard/DesignVersionPreview/config'
import { backgroundColor } from '@/fields/color'
import { link } from '@/fields/link'
import { linkGroup } from '@/fields/linkGroup'
import { Page, TestimonialBlock as TestimonialBlockType } from '@/payload-types'
import { parentLayoutCondition } from '@/utilities/parentLayoutCondition'
import { HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { Block } from 'payload'

// Testimonal 2: headline, link, testimonials: { authorAvatar }
// Testimonal 3: testimonials: { icon, richText, authorName, authorDescription }
// Testimonal 4: testimonials: { richText, authorName, authorAvatar, authorDescription }
// Testimonal 6: headline richText, testimonials: { richText, authorName, authorAvatar, authorDescription }
// Testimonal 7: headline richText, link, testimonials: { richText, authorName, authorAvatar, authorDescription }

// Testimonal 13: headline, tagline, testimonials: { authorAvatar }
// Testimonal 10: { richText, authorName, authorAvatar, authorDescription }

// Testimonal 16: headline richText, tagline string, testimonials: { richText, authorAvatar }
// Testimonal 17: headline richText, tagline string, testimonials: { icon, richText, authorName, authorAvatar, authorDescription }
// Testimonal 18: headline richText, tagline string, testimonials: { richText, authorName, authorAvatar, authorDescription, stars }
// Testimonal 19: headline richText, tagline string, link, testimonials: { link, richText, authorName, authorAvatar, authorDescription, stars }

export const allTestimonialDesignVersions = [
  // "TESTIMONIAL1",
  {
    label: 'TESTIMONIAL2',
    value: 'TESTIMONIAL2',
    image: '/admin/previews/testimonial/testimonial2.webp',
  },
  {
    label: 'TESTIMONIAL3',
    value: 'TESTIMONIAL3',
    image: '/admin/previews/testimonial/testimonial3.webp',
  },
  {
    label: 'TESTIMONIAL4',
    value: 'TESTIMONIAL4',
    image: '/admin/previews/testimonial/testimonial4.webp',
  },
  // "TESTIMONIAL6",
  {
    label: 'TESTIMONIAL7',
    value: 'TESTIMONIAL7',
    image: '/admin/previews/testimonial/testimonial7.webp',
  },
  // "TESTIMONIAL8",
  // "TESTIMONIAL9",
  // "TESTIMONIAL10",
  // "TESTIMONIAL11",
  // "TESTIMONIAL12",
  // "TESTIMONIAL13",
  {
    label: 'TESTIMONIAL14',
    value: 'TESTIMONIAL14',
    image: '/admin/previews/testimonial/testimonial14.webp',
  },
  // "TESTIMONIAL15",
  // "TESTIMONIAL16",
  // "TESTIMONIAL17",
  // "TESTIMONIAL18",
  // "TESTIMONIAL19",
  {
    label: 'wowtour_testimonial2',
    value: 'wowtour_testimonial2',
    image: '/admin/previews/testimonial/testimonial20.webp',
  },
  {
    label: 'wowtour_testimonial1',
    value: 'wowtour_testimonial1',
    image: '/admin/previews/testimonial/testimonial21.webp',
  },
  {
    label: 'wowtour_testimonial3',
    value: 'wowtour_testimonial3',
    image: '/admin/previews/testimonial/testimonial22.webp',
  },
  {
    label: 'wowtour_testimonial4',
    value: 'wowtour_testimonial4',
    image: '/media/wowtour_testimonial4.jpg',
  },
  {
    label: 'wowtour_testimonial5',
    value: 'wowtour_testimonial5',
    image: '/admin/previews/testimonial/testimonial24.webp',
  },
] as const

export type TestimonialDesignVersion = (typeof allTestimonialDesignVersions)[number]

export const TestimonialBlock: Block = {
  slug: 'testimonial',
  interfaceName: 'TestimonialBlock',
  labels: {
    singular: { en: 'Testimonial', th: 'รีวิวความประทับใจ' },
    plural: { en: 'All Testimonials', th: 'รีวิวความประทับใจทั้งหมด' },
  },
  fields: [
    backgroundColor,
    designVersionPreview(allTestimonialDesignVersions),

    // ============================================
    // Heading Section (for designs 20-24)
    // ============================================
    {
      name: 'headingSettings',
      type: 'group',
      label: { en: 'Heading', th: 'หัวข้อ (Heading)' },
      admin: {
        condition: (_, { designVersion } = { designVersion: '' }) =>
          [
            'wowtour_testimonial2',
            'wowtour_testimonial1',
            'wowtour_testimonial3',
            'wowtour_testimonial4',
            'wowtour_testimonial5',
          ].includes(designVersion),
      },
      fields: [
        {
          name: 'heading',
          type: 'text',
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

    {
      name: 'headline',
      type: 'richText',
      localized: true,
      admin: {
        condition: (_, { designVersion } = { designVersion: '' }) =>
          [
            'TESTIMONIAL2',
            'TESTIMONIAL6',
            'TESTIMONIAL7',
            'TESTIMONIAL13',
            'TESTIMONIAL16',
            'TESTIMONIAL17',
            'TESTIMONIAL18',
            'TESTIMONIAL19',
          ].includes(designVersion),
      },
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
        ],
      }),
    },

    {
      name: 'tagline',
      type: 'text',
      localized: true,
      admin: {
        condition: (_, { designVersion } = { designVersion: '' }) =>
          [
            'TESTIMONIAL13',
            'TESTIMONIAL16',
            'TESTIMONIAL17',
            'TESTIMONIAL18',
            'TESTIMONIAL19',
          ].includes(designVersion),
      },
    },

    linkGroup({
      overrides: {
        admin: {
          condition: (_, { designVersion } = { designVersion: '' }) =>
            ['TESTIMONIAL7'].includes(designVersion),
        },
      },
    }),

    link({
      overrides: {
        admin: {
          condition: (_, { designVersion } = { designVersion: '' }) =>
            ['TESTIMONIAL2', 'TESTIMONIAL19'].includes(designVersion),
        },
      },
    }),

    {
      name: 'testimonial',
      labels: {
        singular: { en: 'Manual Testimonial', th: 'ข้อมูลรีวิว (Manual)' },
        plural: { en: 'Manual Testimonials', th: 'รายการรีวิวทั้งหมด (Manual)' },
      },
      admin: {
        description: { 
          en: 'Manual reviews (Only for TESTIMONIAL 2-14)', 
          th: 'ใส่ข้อมูลรีวิวที่นี่กรณีใช้ดีไซน์รุ่นเก่า (TESTIMONIAL 2-14) สำหรับรุ่นใหม่จะดึงข้อมูลอัตโนมัติ' 
        },
        condition: (_, { designVersion } = { designVersion: '' }) =>
          ![
            'wowtour_testimonial1',
            'wowtour_testimonial2',
            'wowtour_testimonial3',
            'wowtour_testimonial4',
            'wowtour_testimonial5',
          ].includes(designVersion),
      },
      type: 'array',
      fields: [
        {
          name: 'authorName',
          type: 'text',
          localized: true,
          admin: {
            condition: (parent: Page, { id }) =>
              [
                'TESTIMONIAL3',
                'TESTIMONIAL4',
                'TESTIMONIAL6',
                'TESTIMONIAL7',
                'TESTIMONIAL10',
                'TESTIMONIAL14',
                'TESTIMONIAL17',
                'TESTIMONIAL18',
                'TESTIMONIAL19',
              ].includes(
                parentLayoutCondition<TestimonialBlockType>(parent, id, 'testimonial')
                  ?.designVersion ?? '',
              ),
          },
        },
        {
          name: 'authorDescription',
          type: 'text',
          localized: true,
          admin: {
            condition: (parent: Page, { id }) =>
              [
                'TESTIMONIAL3',
                'TESTIMONIAL4',
                'TESTIMONIAL6',
                'TESTIMONIAL7',
                'TESTIMONIAL10',
                'TESTIMONIAL17',
                'TESTIMONIAL18',
                'TESTIMONIAL19',
              ].includes(
                parentLayoutCondition<TestimonialBlockType>(parent, id, 'testimonial')
                  ?.designVersion ?? '',
              ),
          },
        },
        {
          name: 'authorAvatar',
          type: 'upload',
          relationTo: 'media',
          admin: {
            condition: (parent: Page, { id }) =>
              [
                'TESTIMONIAL2',
                'TESTIMONIAL4',
                'TESTIMONIAL6',
                'TESTIMONIAL7',
                'TESTIMONIAL13',
                'TESTIMONIAL10',
                'TESTIMONIAL14',
                'TESTIMONIAL16',
                'TESTIMONIAL17',
                'TESTIMONIAL18',
                'TESTIMONIAL19',
              ].includes(
                parentLayoutCondition<TestimonialBlockType>(parent, id, 'testimonial')
                  ?.designVersion ?? '',
              ),
          },
        },
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
          admin: {
            condition: (parent: Page, { id }) =>
              ['TESTIMONIAL3', 'TESTIMONIAL17'].includes(
                parentLayoutCondition<TestimonialBlockType>(parent, id, 'testimonial')
                  ?.designVersion ?? '',
              ),
          },
        },
        {
          name: 'rating',
          type: 'number',
          min: 1,
          max: 5,
          admin: {
            condition: (parent: Page, { id }) =>
              ['TESTIMONIAL18', 'TESTIMONIAL19'].includes(
                parentLayoutCondition<TestimonialBlockType>(parent, id, 'testimonial')
                  ?.designVersion ?? '',
              ),
          },
        },
        {
          name: 'text',
          type: 'richText',
          localized: true,
          admin: {
            condition: (parent: Page, { id }) =>
              [
                'TESTIMONIAL3',
                'TESTIMONIAL4',
                'TESTIMONIAL6',
                'TESTIMONIAL7',
                'TESTIMONIAL10',
                'TESTIMONIAL14',
                'TESTIMONIAL16',
                'TESTIMONIAL17',
                'TESTIMONIAL18',
                'TESTIMONIAL19',
              ].includes(
                parentLayoutCondition<TestimonialBlockType>(parent, id, 'testimonial')
                  ?.designVersion ?? '',
              ),
          },
          editor: lexicalEditor({
            features: ({ rootFeatures }) => [
              ...rootFeatures,
              HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3'] }),
            ],
          }),
        },
        link({
          overrides: {
            admin: {
              condition: (parent: Page, { id }) =>
                ['TESTIMONIAL19'].includes(
                  parentLayoutCondition<TestimonialBlockType>(parent, id, 'testimonial')
                    ?.designVersion || '',
                ),
            },
          },
        }),
      ],
    },
  ],
}
