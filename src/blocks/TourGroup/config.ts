import { backgroundColor } from '@/fields/color'
import { colorPickerField } from '@/fields/colorPicker'
import { ClearFormattingFeature } from '@/lexical/clearFormatting/feature.server'
import {
  AlignFeature,
  BlockquoteFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  OrderedListFeature,
  StrikethroughFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { Block } from 'payload'
import { designVersionPreview } from '@/components/AdminDashboard/DesignVersionPreview/config'

export const allTourGroupDesignVersions = [
  {
    label: 'TOUR_GROUP_WOWTOUR_1',
    value: 'TOUR_GROUP_WOWTOUR_1',
    image: '/admin/previews/hero/tour_group_wowtour_1.jpg',
  },
  {
    label: 'TOUR_GROUP_WOWTOUR_2',
    value: 'TOUR_GROUP_WOWTOUR_2',
    image: '/admin/previews/hero/tour_group_wowtour_2.jpg',
  },
] as const

export type TourGroupDesignVersion = (typeof allTourGroupDesignVersions)[number]['value']

const borderRadiusOptions = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map((v) => ({
  label: `${v}px`,
  value: String(v),
}))

export const TourGroupBlock: Block = {
  slug: 'wowtourTourGroup',
  interfaceName: 'TourGroupBlock',
  labels: {
    singular: 'WOW Tour Group',
    plural: 'WOW Tour Groups',
  },
  fields: [
    backgroundColor,
    designVersionPreview(allTourGroupDesignVersions),

    // ===== Banner Section =====
    {
      name: 'bannerImage',
      type: 'upload',
      relationTo: 'media',
      label: { en: 'Banner Image', th: 'รูปภาพแบนเนอร์' },
      admin: {
        description: {
          en: 'Top banner image (recommended landscape ratio)',
          th: 'รูปภาพแบนเนอร์ด้านบน (แนะนำสัดส่วนแนวนอน)',
        },
      },
    },
    {
      name: 'bannerBorderRadius',
      type: 'select',
      label: { en: 'Banner Border Radius', th: 'ความโค้งมุมภาพแบนเนอร์ (Border Radius)' },
      defaultValue: '0',
      options: borderRadiusOptions,
      admin: { width: '50%' },
    },

    // ===== Main Title & Description =====
    {
      name: 'mainTitle',
      type: 'text',
      label: { en: 'Main Heading', th: 'หัวข้อหลัก' },
      required: true,
      admin: {
        description: {
          en: '( "...")',
          th: 'หัวข้อหลักใต้แบนเนอร์ (เช่น "จัดกรุ๊ปทัวร์ส่วนตัว...")',
        },
      },
    },
    colorPickerField({
      name: 'mainTitleColor',
      label: { en: 'Heading Color', th: 'สีหัวข้อหลัก' },
      defaultValue: '',
      admin: {
        width: '50%',
        description: { en: 'primary', th: 'เลือกสีหัวข้อหลัก หรือเว้นว่างเพื่อใช้สี primary' },
      },
    }),
    {
      name: 'mainDescription',
      type: 'richText',
      label: { en: 'Main Description', th: 'คำอธิบายหลัก' },
      admin: {
        description: {
          en: 'Main description text below heading',
          th: 'ข้อความอธิบายหลักใต้หัวข้อ',
        },
      },
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h3', 'h4'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
          OrderedListFeature(),
          UnorderedListFeature(),
          AlignFeature(),
          StrikethroughFeature(),
          ClearFormattingFeature(),
        ],
      }),
    },

    // ===== Service Items =====
    {
      name: 'serviceItems',
      type: 'array',
      label: { en: 'Services', th: 'รายการบริการ' },
      labels: {
        singular: { en: 'Service', th: 'บริการ' },
        plural: { en: 'Services', th: 'รายการบริการ' },
      },
      admin: {
        description: { en: 'Add service items by type', th: 'เพิ่มรายการบริการแต่ละประเภท' },
        initCollapsed: true,
      },
      fields: [
        {
          name: 'itemTitle',
          type: 'text',
          label: { en: 'Service Name', th: 'ชื่อบริการ' },
          required: true,
          admin: {
            description: { en: '"", ""', th: 'เช่น "ทัวร์ครอบครัว", "ทัวร์หมู่คณะ"' },
          },
        },
        {
          name: 'itemDescription',
          type: 'richText',
          label: { en: 'Service Description', th: 'รายละเอียดบริการ' },
          admin: {
            description: { en: 'Bullet list', th: 'รองรับ Bullet list, หัวข้อย่อย' },
          },
          editor: lexicalEditor({
            features: ({ rootFeatures }) => [
              ...rootFeatures,
              HeadingFeature({ enabledHeadingSizes: ['h4'] }),
              FixedToolbarFeature(),
              InlineToolbarFeature(),
              OrderedListFeature(),
              UnorderedListFeature(),
              BlockquoteFeature(),
              AlignFeature(),
              StrikethroughFeature(),
              ClearFormattingFeature(),
            ],
          }),
        },
        {
          name: 'itemImage',
          type: 'upload',
          relationTo: 'media',
          label: { en: 'Supporting Image', th: 'รูปภาพประกอบ' },
          admin: {
            description: { en: 'Service illustration image', th: 'รูปประกอบของบริการ' },
          },
        },
        {
          name: 'itemImageBorderRadius',
          type: 'select',
          label: { en: 'Image Border Radius', th: 'ความโค้งมุมรูปภาพ (Border Radius)' },
          defaultValue: '0',
          options: borderRadiusOptions,
          admin: { width: '50%' },
        },
      ],
    },
  ],
}
