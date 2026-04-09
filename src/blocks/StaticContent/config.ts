import { backgroundColor } from '@/fields/color'
import { colorPickerField } from '@/fields/colorPicker'
import { designVersionPreview } from '@/components/AdminDashboard/DesignVersionPreview/config'
import { ClearFormattingFeature } from '@/lexical/clearFormatting/feature.server'
import { TableCellVerticalAlignFeature } from '@/lexical/tableCellVerticalAlign/feature.server'
import {
  AlignFeature,
  BlockquoteFeature,
  ChecklistFeature,
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  IndentFeature,
  InlineToolbarFeature,
  lexicalEditor,
  OrderedListFeature,
  StrikethroughFeature,
  UnorderedListFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical'
import { Block } from 'payload'

export const allStaticContentDesignVersions = [
  {
    label: 'WowTour Static Content 1',
    value: 'STATIC_CONTENT_WOWTOUR_1',
    image: '/admin/previews/staticContent/wowtour_staticContent1.jpg',
  },
] as const

export type StaticContentDesignVersion = (typeof allStaticContentDesignVersions)[number]['value']

const borderRadiusOptions = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map((v) => ({
  label: `${v}px`,
  value: String(v),
}))

export const StaticContentBlock: Block = {
  slug: 'staticContent',
  interfaceName: 'StaticContentBlock',
  labels: {
    singular: 'WOW Static Content',
    plural: 'WOW Static Contents',
  },
  fields: [
    backgroundColor,
    designVersionPreview(allStaticContentDesignVersions),

    // === STATIC_CONTENT_WOWTOUR_1 Fields ===
    {
      name: 'bannerImage',
      type: 'upload',
      relationTo: 'media',
      label: { en: 'Banner Image', th: 'รูปแบนเนอร์' },
      admin: {
        description: {
          en: 'Horizontal banner — displayed full width',
          th: 'รูปแบนเนอร์แนวนอน จะแสดงกว้างเต็มพื้นที่',
        },
        condition: (_, { designVersion } = { designVersion: '' }) =>
          designVersion === 'STATIC_CONTENT_WOWTOUR_1',
      },
    },
    {
      name: 'bannerBorderRadius',
      type: 'select',
      label: { en: 'Border Radius', th: 'ความโค้งมุมแบนเนอร์ (Border Radius)' },
      defaultValue: '0',
      options: borderRadiusOptions,
      admin: {
        description: { en: '( px)', th: 'เลือกความโค้งของมุมภาพแบนเนอร์ (หน่วย px)' },
        width: '50%',
        condition: (_, { designVersion } = { designVersion: '' }) =>
          designVersion === 'STATIC_CONTENT_WOWTOUR_1',
      },
    },
    {
      name: 'articleSections',
      type: 'array',
      label: { en: 'Article Content', th: 'เนื้อหาบทความ' },
      admin: {
        condition: (_, { designVersion } = { designVersion: '' }) =>
          designVersion === 'STATIC_CONTENT_WOWTOUR_1',
      },
      fields: [
        {
          name: 'sectionTitle',
          type: 'text',
          label: { en: 'Main Heading', th: 'หัวข้อหลัก' },
          required: true,
        },
        {
          name: 'sectionTitleAlign',
          type: 'select',
          label: { en: 'Heading Alignment', th: 'จัดตำแหน่งหัวข้อ' },
          defaultValue: 'left',
          options: [
            { label: { en: 'Left', th: 'ชิดซ้าย' }, value: 'left' },
            { label: { en: 'Center', th: 'กึ่งกลาง' }, value: 'center' },
            { label: { en: 'Right', th: 'ชิดขวา' }, value: 'right' },
          ],
          admin: { width: '50%' },
        },
        colorPickerField({
          name: 'sectionTitleColor',
          label: { en: 'Heading Color', th: 'สีหัวข้อ' },
          defaultValue: '',
          admin: {
            width: '50%',
            description: { en: 'primary', th: 'เลือกสีหัวข้อ หรือเว้นว่างเพื่อใช้สี primary' },
          },
        }),
        {
          name: 'sectionDescription',
          type: 'richText',
          label: { en: 'Content (Table Support)', th: 'เนื้อหา (รองรับตาราง)' },
          editor: lexicalEditor({
            features: ({ rootFeatures }) => [
              ...rootFeatures,
              HeadingFeature({ enabledHeadingSizes: ['h3', 'h4'] }),
              FixedToolbarFeature(),
              InlineToolbarFeature(),
              OrderedListFeature(),
              UnorderedListFeature(),
              ChecklistFeature(),
              BlockquoteFeature(),
              HorizontalRuleFeature(),
              IndentFeature(),
              StrikethroughFeature(),
              UploadFeature({
                collections: {
                  media: {
                    fields: [
                      {
                        name: 'imageSize',
                        type: 'select',
                        label: { en: 'Image Size', th: 'ขนาดรูปภาพ' },
                        defaultValue: '100',
                        options: [
                          { label: '25%', value: '25' },
                          { label: '50%', value: '50' },
                          { label: '75%', value: '75' },
                          { label: '100%', value: '100' },
                        ],
                        admin: {
                          description: {
                            en: 'Image width size (percentage)',
                            th: 'เลือกขนาดความกว้างของรูปภาพ (เปอร์เซ็นต์)',
                          },
                        },
                      },
                      {
                        name: 'imageHAlign',
                        type: 'select',
                        label: { en: 'Horizontal Alignment', th: 'จัดตำแหน่งแนวนอน' },
                        defaultValue: 'left',
                        options: [
                          { label: { en: 'Left', th: 'ชิดซ้าย' }, value: 'left' },
                          { label: { en: 'Center', th: 'กึ่งกลาง' }, value: 'center' },
                          { label: { en: 'Right', th: 'ชิดขวา' }, value: 'right' },
                        ],
                        admin: {
                          description: {
                            en: 'Horizontal image alignment',
                            th: 'จัดตำแหน่งรูปภาพในแนวนอน',
                          },
                          width: '50%',
                        },
                      },
                      {
                        name: 'imageVAlign',
                        type: 'select',
                        label: { en: 'Vertical Alignment', th: 'จัดตำแหน่งแนวตั้ง' },
                        defaultValue: 'top',
                        options: [
                          { label: { en: 'Top', th: 'บน' }, value: 'top' },
                          { label: { en: 'Middle', th: 'กลาง' }, value: 'middle' },
                          { label: { en: 'Bottom', th: 'ล่าง' }, value: 'bottom' },
                        ],
                        admin: {
                          description: {
                            en: 'Vertical image alignment',
                            th: 'จัดตำแหน่งรูปภาพในแนวตั้ง',
                          },
                          width: '50%',
                        },
                      },
                    ],
                  },
                },
              }),
              AlignFeature(),
              EXPERIMENTAL_TableFeature() as any,
              ClearFormattingFeature(),
              TableCellVerticalAlignFeature(),
            ],
          }),
        },
      ],
    },
  ],
}
