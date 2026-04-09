import { backgroundColor } from '@/fields/color'
import { link } from '@/fields/link'
import { HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { Block } from 'payload'

// About2: headline richText, text1 richText, text2 richText, 6 images, logos, counter: { value, title, optional description }
// About4: headline richText, text1 richText, text2 richText, 6 images, link
// About3: headline richText, text1 richText, text2 richText, 6 images, 6 logos, link
// About5: headline richText, text1 richText, text2 richText, 6 images, logos, counter: { value, title, optional description }

export const allAboutDesignVersions = ['ABOUT_WOWTOUR_1'] as const

export type AboutDesignVersion = (typeof allAboutDesignVersions)[number]

export const AboutBlock: Block = {
  slug: 'about',
  interfaceName: 'AboutBlock',
  labels: {
    singular: 'About',
    plural: 'multiple About',
  },
  fields: [
    backgroundColor,
    {
      name: 'designVersion',
      type: 'select',
      required: true,
      options: allAboutDesignVersions.map((version) => ({ label: version, value: version })),
    },

    {
      name: 'headline',
      type: 'richText',
      localized: true,
      admin: {
        condition: (_, { designVersion } = { designVersion: '' }) =>
          designVersion !== 'ABOUT_WOWTOUR_1',
      },
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3'] }),
        ],
      }),
    },
    {
      name: 'text1',
      type: 'richText',
      localized: true,
      admin: {
        condition: (_, { designVersion } = { designVersion: '' }) =>
          designVersion !== 'ABOUT_WOWTOUR_1',
      },
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
        ],
      }),
    },
    {
      name: 'text2',
      type: 'richText',
      localized: true,
      admin: {
        condition: (_, { designVersion } = { designVersion: '' }) =>
          designVersion !== 'ABOUT_WOWTOUR_1',
      },
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
        ],
      }),
    },
    {
      name: 'text3',
      type: 'richText',
      localized: true,
      admin: {
        condition: (_, { designVersion } = { designVersion: '' }) =>
          designVersion !== 'ABOUT_WOWTOUR_1',
      },
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h3', 'h4'] }),
        ],
      }),
    },

    link({
      overrides: {
        admin: {
          condition: (_, { designVersion } = { designVersion: '' }) =>
            ['ABOUT3', 'ABOUT4'].includes(designVersion),
        },
      },
    }),

    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: {
        condition: (_, { designVersion } = { designVersion: '' }) =>
          designVersion !== 'ABOUT_WOWTOUR_1',
      },
    },
    {
      name: 'logos',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: {
        condition: (_, { designVersion } = { designVersion: '' }) =>
          ['ABOUT3', 'ABOUT2', 'ABOUT5'].includes(designVersion),
      },
    },

    {
      name: 'counter',
      type: 'array',
      fields: [
        { name: 'value', type: 'text', required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text', required: false },
      ],
      admin: {
        condition: (_, { designVersion } = { designVersion: '' }) =>
          ['ABOUT5', 'ABOUT2', 'ABOUT3'].includes(designVersion),
      },
    },

    // === ABOUT_WOWTOUR_1 Specific Fields ===
    {
      name: 'companySlogan',
      type: 'textarea',
      label: { en: 'Translated Text', th: 'สโลแกนบริษัท' },
      admin: {
        description: {
          en: 'Short description below company name in blue frame',
          th: 'คำอธิบายสั้นๆ ใต้ชื่อบริษัทในกรอบสีฟ้า',
        },
        condition: (_, { designVersion } = { designVersion: '' }) =>
          designVersion === 'ABOUT_WOWTOUR_1',
      },
    },
    {
      name: 'tourLicenseImage',
      type: 'upload',
      relationTo: 'media',
      label: { en: 'Translated Text', th: 'รูปใบอนุญาตนำเที่ยว' },
      admin: {
        condition: (_, { designVersion } = { designVersion: '' }) =>
          designVersion === 'ABOUT_WOWTOUR_1',
      },
    },
    {
      name: 'companyCertificateImage',
      type: 'upload',
      relationTo: 'media',
      label: { en: 'Translated Text', th: 'รูปหนังสือรับรอง' },
      admin: {
        condition: (_, { designVersion } = { designVersion: '' }) =>
          designVersion === 'ABOUT_WOWTOUR_1',
      },
    },
    {
      name: 'aboutBanner',
      type: 'upload',
      relationTo: 'media',
      label: { en: 'Translated Text', th: 'รูปแบนเนอร์หลัก' },
      admin: {
        description: {
          en: 'Horizontal banner for main content section',
          th: 'รูปแบนเนอร์แนวนอน สำหรับส่วนเนื้อหาหลัก',
        },
        condition: (_, { designVersion } = { designVersion: '' }) =>
          designVersion === 'ABOUT_WOWTOUR_1',
      },
    },
    {
      name: 'aboutArticleSections',
      type: 'array',
      label: { en: 'Translated Text', th: 'บทความ (เนื้อหาหลัก)' },
      admin: {
        condition: (_, { designVersion } = { designVersion: '' }) =>
          designVersion === 'ABOUT_WOWTOUR_1',
      },
      fields: [
        {
          name: 'sectionTitle',
          type: 'text',
          label: { en: 'Heading', th: 'หัวข้อ' },
          required: true,
        },
        {
          name: 'sectionDescription',
          type: 'richText',
          label: { en: 'Content', th: 'เนื้อหา' },
          editor: lexicalEditor({
            features: ({ rootFeatures }) => [
              ...rootFeatures,
              HeadingFeature({ enabledHeadingSizes: ['h3', 'h4'] }),
            ],
          }),
        },
      ],
    },
    {
      name: 'aboutContactInfo',
      type: 'array',
      label: { en: 'Contact Info', th: 'ข้อมูลติดต่อ' },
      admin: {
        condition: (_, { designVersion } = { designVersion: '' }) =>
          designVersion === 'ABOUT_WOWTOUR_1',
      },
      fields: [
        {
          name: 'sectionTitle',
          type: 'text',
          label: { en: 'Heading', th: 'หัวข้อ' },
          required: true,
        },
        {
          name: 'sectionDescription',
          type: 'richText',
          label: { en: 'Content', th: 'เนื้อหา' },
          editor: lexicalEditor({
            features: ({ rootFeatures }) => [
              ...rootFeatures,
              HeadingFeature({ enabledHeadingSizes: ['h3', 'h4'] }),
            ],
          }),
        },
      ],
    },
  ],
}
