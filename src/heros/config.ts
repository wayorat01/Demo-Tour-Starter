import type { Field } from 'payload'
import { colorPickerField } from '@/fields/colorPicker'

import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/fields/linkGroup'
import { link } from '@/fields/link'
import { icon } from '@/components/Icon/config'
import { customHeroFields } from './CustomHero/config'
import { backgroundColor } from '@/fields/color'
import { designVersionDescription } from '@/components/AdminDashboard/DesignVersionDescription'
import { designVersionPreview } from '@/components/AdminDashboard/DesignVersionPreview/config'
import { MotionText } from '@/blocks/LexicalBlocks/MotionText/config'

/* TODO:
13 -> X
30 -> X
16 -> X




29 -> rating
31 -> 3 images
37 -> 3 images
38 -> 3 images
15 -> rating
27 -> tagline
26 -> tagline, badge-link
55 -> tagline, badge-link
21 -> tagline, badge-link (+ dritter button checken ob neues feld oder array aufteilen?)
53 -> headline aus richtext rauslösen, icons (faces mit textinfo), tagline
28 -> 5 icons
32 -> 14 icons
12 -> 1 - 5 icons, tagline
51 -> 4 icons, tagline
57 -> 4 icons, tagline
50 -> 2 icons, badge-link
24 -> icon, 4 USPs: icon, headline, description
25 -> icon, 3-4 USPs: icon, headline
20 -> 2-5 USPs: icon, headline, description, time
45 -> badge, 3 USPs: icon, headline, description

33 -> pricing: headline, price, description


What should happen with the two big boxes? Image or Tex?
18 -> 2 images + 14 icons

*/

export const allHeroDesignVersions = [
  { label: 'no Hero', value: 'none' },
  { label: 'HERO1', value: '1', image: '/admin/previews/hero/hero1.jpeg' },
  { label: 'HERO2', value: '2', image: '/admin/previews/hero/hero2.jpeg' },
  { label: 'HERO3', value: '3', image: '/admin/previews/hero/hero3.jpeg' },
  { label: 'HERO4', value: '4', image: '/admin/previews/hero/hero4.jpeg' },
  { label: 'HERO5', value: '5', image: '/admin/previews/hero/hero5.jpeg' },
  { label: 'HERO6', value: '6', image: '/admin/previews/hero/hero6.jpeg' },
  { label: 'HERO12', value: '12', image: '/admin/previews/hero/hero12.jpeg' },
  { label: 'HERO101', value: '101', image: '/admin/previews/hero/hero101.webp' },
  { label: 'HERO112', value: '112', image: '/admin/previews/hero/hero112.jpeg' },
  { label: 'HERO195', value: '195', image: '/admin/previews/hero/hero195.webp' },
  { label: 'HERO220', value: '220', image: '/admin/previews/hero/hero220.jpeg' },
  { label: 'HERO214', value: '214', image: '/admin/previews/hero/hero214.webp' },
  { label: 'HERO219', value: '219', image: '/admin/previews/hero/hero219.webp' },
  {
    label: 'WowTour HeroBanner 1',
    value: 'wowtour_heroBanner1',
    image: '/admin/previews/hero/wowtour_heroBanner1.png',
  },
  {
    label: 'WowTour HeroBanner 2',
    value: 'wowtour_heroBanner2',
    image: '/admin/previews/hero/wowtour_heroBanner2.jpg',
  },
  {
    label: 'WowTour HeroBanner 3',
    value: 'wowtour_heroBanner3',
    image: '/admin/previews/hero/wowtour_heroBanner3.jpg',
  },
  {
    label: 'WowTour HeroBanner 4',
    value: 'wowtour_heroBanner4',
    image: '/admin/previews/hero/wowtour_heroBanner4.jpg',
  },

  {
    label: 'WowTour Static Page Hero 2',
    value: 'wowtour_heroBannerStaticPage2',
    image: '/admin/previews/hero/wowtour_heroBannerStaticPage2.jpg',
  },
  {
    label: 'WowTour Static Page Hero 1',
    value: 'wowtour_heroBannerStaticPage1',
    image: '/admin/previews/hero/wowtour_heroBannerStaticPage1.jpg',
  },
] as const

export type HeroDesignVersion = (typeof allHeroDesignVersions)[number]

export const hero: Field = {
  name: 'hero',
  type: 'group',
  interfaceName: 'Hero',
  fields: [
    backgroundColor,
    designVersionPreview(allHeroDesignVersions),
    {
      name: 'badge',
      type: 'text',
      localized: true,
      admin: {
        condition: (_, { designVersion = '' } = {}) =>
          ['1', '2', '3', '4', '5', '6', '12', '112'].includes(designVersion),
      },
    },
    icon({
      name: 'badgeIcon',
      admin: {
        condition: (_, { designVersion = '' } = {}) =>
          ['1', '2', '3', '4', '5', '6'].includes(designVersion),
      },
    }),
    {
      name: 'tagline',
      type: 'text',
      localized: true,
      admin: {
        condition: (_, { designVersion = '' } = {}) =>
          ['3', '27', '26', '55', '21', '53', '12', '51', '57', '112', '220'].includes(
            designVersion,
          ),
      },
    },
    link({
      appearances: false,
      disableLabel: true,
      overrides: {
        name: 'badgeLink',
        admin: {
          condition: (_, { designVersion } = { designVersion: '' }) =>
            ['26', '55', '21', '50'].includes(designVersion),
        },
      },
    }),
    link({
      appearances: false,
      disableIcon: true,
      overrides: {
        name: 'buttonLink',
        label: 'Button Link',
        admin: {
          condition: (_, { designVersion } = { designVersion: '' }) =>
            ['214'].includes(designVersion),
        },
      },
    }),
    {
      name: 'richText',
      type: 'richText',
      localized: true,
      admin: {
        condition: (_, { designVersion = '' } = {}) =>
          ['1', '2', '3', '4', '5', '6', '12', '101', '112', '195', '214', '219'].includes(
            designVersion,
          ),
      },
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1'] }),
            BlocksFeature({
              blocks: [MotionText],
            }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: false,
    },
    linkGroup({
      overrides: {
        maxRows: 2,
        admin: {
          condition: (_, { designVersion = '' } = {}) =>
            ['1', '2', '3', '4', '5', '6', '12', '101', '112', '195'].includes(designVersion),
        },
      },
    }),
    {
      name: 'images',
      type: 'upload',
      admin: {
        condition: (_, { designVersion = '' } = {}) =>
          [
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '12',
            '31',
            '37',
            '38',
            '18',
            '112',
            '220',
            '214',
          ].includes(designVersion),
      },
      relationTo: 'media',
      hasMany: true,
      maxRows: 3,
    },
    designVersionDescription(
      'description112',
      (_, { designVersion } = {}) => ['112'].includes(designVersion),
      {
        en: 'Just use a single image here as background image',
        de: 'Nur ein Bild hier als Hintergrund-Bild verwenden',
      },
    ),
    {
      name: 'icons',
      type: 'upload',
      admin: {
        condition: (_, { designVersion = '' } = {}) =>
          ['3', '53', '28', '32', '12', '51', '57', '50', '18', '112', '101', '219'].includes(
            designVersion,
          ),
      },
      relationTo: 'media',
      hasMany: true,
      maxRows: 14,
    },
    designVersionDescription(
      'description219',
      (_, { designVersion } = {}) => ['219'].includes(designVersion),
      {
        en: 'Use 14 logo images here',
        de: 'Verwende hier 14 Logo-Bilder',
      },
    ),
    {
      name: 'USPs',
      type: 'array',
      admin: {
        condition: (_, { designVersion = '' } = {}) =>
          ['24', '25', '20', '45'].includes(designVersion),
      },
      fields: [
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'richText',
          type: 'richText',
          localized: true,
          editor: lexicalEditor({
            features: ({ rootFeatures }) => {
              return [
                ...rootFeatures,
                HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
                FixedToolbarFeature(),
                InlineToolbarFeature(),
              ]
            },
          }),
          label: false,
        },
      ],
    },
    {
      name: 'statsItems',
      label: 'Stats Items',
      type: 'array',
      admin: {
        condition: (_, { designVersion = '' } = {}) => ['112'].includes(designVersion),
      },
      maxRows: 3,
      defaultValue: [
        {
          title: 'Courses by Experts',
          value: '87',
        },
        {
          title: 'Hours of Content',
          value: '200+',
        },
        {
          title: 'User Satisfaction Rating',
          value: '100%',
        },
      ],
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
        },
        {
          name: 'value',
          type: 'text',
          localized: true,
        },
      ],
    },
    {
      name: 'pricing',
      type: 'group',
      admin: {
        condition: (_, { designVersion = '' } = {}) => ['33'].includes(designVersion),
      },
      fields: [
        {
          name: 'headline',
          type: 'text',
          localized: true,
        },
        {
          name: 'price',
          type: 'text',
          localized: true,
        },
        {
          name: 'description',
          type: 'text',
          localized: true,
        },
      ],
    },
    {
      name: 'rating',
      type: 'number',
      max: 5,
      min: 1,
      admin: {
        condition: (_, { designVersion = '' } = {}) =>
          ['3', '4', '7', '15'].includes(designVersion),
      },
    },
    ...customHeroFields,
    {
      name: 'presentationVideo',
      type: 'group',
      admin: {
        condition: (_, { designVersion = '' } = {}) =>
          ['112', '220', '101'].includes(designVersion),
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          localized: true,
          defaultValue: 'Presentation Video',
        },
        {
          name: 'videoDuration',
          type: 'text',
          localized: true,
          defaultValue: '2 min',
        },
        {
          name: 'videoUrl',
          type: 'text',
          localized: true,
          defaultValue: 'https://library.shadcnblocks.com/videos/block/landscape.mp4',
        },
      ],
    },
    {
      name: 'tabs',
      type: 'array',
      admin: {
        condition: (_, { designVersion = '' } = {}) => ['195'].includes(designVersion),
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
          required: true,
        },
        {
          name: 'icon',
          type: 'select',
          options: [
            { label: 'Square Kanban', value: 'SquareKanban' },
            { label: 'Bar Chart', value: 'BarChart' },
            { label: 'Pie Chart', value: 'PieChart' },
            { label: 'Database', value: 'Database' },
            { label: 'Layers', value: 'Layers' },
          ],
          required: true,
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
      maxRows: 5,
    },
    // WowTour HeroBanner 1 & 2 fields
    {
      name: 'sliderImages',
      label: 'Slider Images',
      type: 'array',
      admin: {
        condition: (_, { designVersion = '' } = {}) =>
          [
            'wowtour_heroBanner1',
            'wowtour_heroBanner2',
            'wowtour_heroBanner3',
            'wowtour_heroBanner4',
          ].includes(designVersion),
      },
      minRows: 1,
      maxRows: 10,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'url',
          label: 'Link URL (optional)',
          type: 'text',
        },
        {
          name: 'newTab',
          label: 'Open in new tab',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
    // === WowTour Banner 1: Banner Title (text) ===
    {
      name: 'bannerTitle',
      label: { en: 'Page Title', th: 'ชื่อหน้า' },
      type: 'text',
      localized: true,
      admin: {
        description: {
          en: 'If empty, automatically uses Page title',
          th: 'หากไม่กรอก จะดึงจากชื่อ Page อัตโนมัติ',
        },
        condition: (_, { designVersion = '' } = {}) =>
          designVersion === 'wowtour_heroBannerStaticPage2',
      },
    },
    // === WowTour Banner 1: Banner Title Color ===
    colorPickerField({
      name: 'bannerTitleColor',
      label: { en: 'Title Color', de: 'Title Color', th: 'สีชื่อหน้า' },
      defaultValue: '#FFFFFF',
      admin: {
        description: { en: 'Select color for page title', th: 'เลือกสีสำหรับชื่อหน้า' },
        condition: (_, { designVersion = '' } = {}) =>
          designVersion === 'wowtour_heroBannerStaticPage2',
      },
    }),
    // === WowTour Banner 1: Drop Shadow for Title ===
    {
      name: 'enableTitleDropShadow',
      label: { en: 'Enable Drop Shadow', th: 'เปิดใช้ Drop Shadow' },
      type: 'checkbox',
      defaultValue: true,
      admin: {
        condition: (_, { designVersion = '' } = {}) =>
          designVersion === 'wowtour_heroBannerStaticPage2',
      },
    },
    {
      type: 'row',
      admin: {
        condition: (_, { designVersion = '', enableTitleDropShadow } = {}) =>
          designVersion === 'wowtour_heroBannerStaticPage2' && enableTitleDropShadow,
      },
      fields: [
        colorPickerField({
          name: 'titleDropShadowColor',
          label: { en: 'Shadow Color', th: 'สีเงา' },
          defaultValue: '#000000',
          admin: { width: '50%' },
        }),
        {
          name: 'titleDropShadowOpacity',
          label: { en: 'Shadow intensity (%)', th: 'ความเข้มของเงา (%)' },
          type: 'select',
          defaultValue: '30',
          options: [
            { label: '10%', value: '10' },
            { label: '20%', value: '20' },
            { label: '30%', value: '30' },
            { label: '40%', value: '40' },
            { label: '50%', value: '50' },
            { label: '60%', value: '60' },
            { label: '70%', value: '70' },
            { label: '80%', value: '80' },
            { label: '90%', value: '90' },
            { label: '100%', value: '100' },
          ],
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'sideImage',
      label: 'Side Image (Right Side)',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (_, { designVersion = '' } = {}) =>
          ['wowtour_heroBanner1', 'wowtour_heroBannerStaticPage2'].includes(designVersion),
      },
    },
    // === WowTour Banner 1: Side Image Size ===
    {
      name: 'sideImageSize',
      label: { en: 'Side image size', th: 'ขนาดรูปภาพด้านข้าง' },
      type: 'select',
      defaultValue: '100',
      options: [
        { label: { en: 'Small (60%)', th: 'เล็ก (60%)' }, value: '60' },
        { label: { en: '- (70%)', th: 'เล็ก-กลาง (70%)' }, value: '70' },
        { label: { en: 'Medium (80%)', th: 'กลาง (80%)' }, value: '80' },
        { label: { en: '- (90%)', th: 'กลาง-ใหญ่ (90%)' }, value: '90' },
        { label: { en: '(100%)', th: 'เต็ม (100%)' }, value: '100' },
      ],
      admin: {
        description: { en: 'Banner', th: 'ปรับขนาดรูปภาพด้านขวาของ Banner (เปอร์เซ็นต์ความสูง)' },
        condition: (_, { designVersion = '' } = {}) =>
          designVersion === 'wowtour_heroBannerStaticPage2',
      },
    },
    {
      name: 'autoPlayDelay',
      label: 'Auto Play Speed',
      type: 'select',
      defaultValue: '10000',
      options: [
        { label: 'Fast (5s)', value: '5000' },
        { label: 'Normal (10s)', value: '10000' },
        { label: 'Slow (15s)', value: '15000' },
        { label: 'Very Slow (20s)', value: '20000' },
      ],
      admin: {
        condition: (_, { designVersion = '' } = {}) =>
          [
            'wowtour_heroBanner1',
            'wowtour_heroBanner2',
            'wowtour_heroBanner3',
            'wowtour_heroBanner4',
          ].includes(designVersion),
      },
    },
    // ============================================
    // Search Box Settings (for wowtour_heroBanner1 & 2)
    // ============================================
    {
      type: 'collapsible',
      label: 'Search Box Settings',
      admin: {
        initCollapsed: true,
        description: { en: 'Hero Banner', th: 'ตั้งค่ากล่องค้นหาบน Hero Banner' },
        condition: (_, { designVersion = '' } = {}) =>
          [
            'wowtour_heroBanner1',
            'wowtour_heroBanner2',
            'wowtour_heroBanner3',
            'wowtour_heroBanner4',
          ].includes(designVersion),
      },
      fields: [
        // --- Design Version กล่องค้นหา ---
        {
          name: 'searchDesignVersion',
          type: 'select',
          defaultValue: 'WOWTOUR_SEARCH_TOUR_1',
          label: { en: 'Design Version', th: 'Design Version กล่องค้นหา' },
          options: [{ label: 'WowTour Search Tour 1', value: 'WOWTOUR_SEARCH_TOUR_1' }],
          admin: {
            description: { en: 'Translated Text', th: 'เลือกรูปแบบการแสดงผลกล่องค้นหาทัวร์' },
          },
        },

        // --- Background Container ---
        {
          name: 'searchBgType',
          type: 'select',
          label: { en: 'Translated Text', th: 'ประเภทพื้นหลัง' },
          defaultValue: 'color',
          options: [
            { label: { en: 'Translated Text', th: 'สีพื้น' }, value: 'color' },
            { label: { en: '(Gradient)', th: 'ไล่สี (Gradient)' }, value: 'gradient' },
            { label: { en: 'Translated Text', th: 'รูปภาพ' }, value: 'image' },
          ],
          admin: {
            description: {
              en: ', (Gradient)',
              th: 'เลือกระหว่างใช้สีพื้น, ไล่สี (Gradient) หรือรูปภาพเป็นพื้นหลังกล่องค้นหา',
            },
            condition: (_, siblingData) => siblingData?.designVersion !== 'wowtour_heroBanner3',
          },
        },
        colorPickerField({
          name: 'searchBgColor',
          label: { en: 'Translated Text', th: 'สีพื้นหลัง' },
          defaultValue: 'hsl(0, 70%, 60%)',
          admin: {
            description: { en: 'container', th: 'เลือกสีพื้นหลังของ container กล่องค้นหา' },
            condition: (_, siblingData) =>
              siblingData?.searchBgType === 'color' &&
              siblingData?.designVersion !== 'wowtour_heroBanner3',
          },
        }),
        colorPickerField({
          name: 'searchGradientStartColor',
          label: 'Start Color',
          defaultValue: 'hsl(173, 100%, 46%)',
          admin: {
            description: { en: 'gradient', th: 'สีเริ่มต้นของ gradient' },
            condition: (_, siblingData) =>
              siblingData?.searchBgType === 'gradient' &&
              siblingData?.designVersion !== 'wowtour_heroBanner3',
          },
        }),
        colorPickerField({
          name: 'searchGradientEndColor',
          label: 'End Color',
          defaultValue: 'hsl(214, 97%, 61%)',
          admin: {
            description: { en: 'gradient', th: 'สีสิ้นสุดของ gradient' },
            condition: (_, siblingData) =>
              siblingData?.searchBgType === 'gradient' &&
              siblingData?.designVersion !== 'wowtour_heroBanner3',
          },
        }),
        {
          name: 'searchGradientType',
          type: 'select',
          label: 'Gradient Type',
          defaultValue: 'linear',
          options: [
            { label: 'Linear', value: 'linear' },
            { label: 'Radial', value: 'radial' },
          ],
          admin: {
            description: { en: 'gradient', th: 'เลือกรูปแบบ gradient' },
            condition: (_, siblingData) =>
              siblingData?.searchBgType === 'gradient' &&
              siblingData?.designVersion !== 'wowtour_heroBanner3',
          },
        },
        {
          name: 'searchGradientPosition',
          type: 'select',
          label: 'Position',
          defaultValue: 'to right',
          options: [
            { label: 'To Right', value: 'to right' },
            { label: 'To Left', value: 'to left' },
            { label: 'To Bottom', value: 'to bottom' },
            { label: 'To Top', value: 'to top' },
            { label: 'Top Left', value: 'to top left' },
            { label: 'Top Right', value: 'to top right' },
            { label: 'Bottom Left', value: 'to bottom left' },
            { label: 'Bottom Right', value: 'to bottom right' },
          ],
          admin: {
            description: { en: 'gradient', th: 'ทิศทางของ gradient' },
            condition: (_, siblingData) =>
              siblingData?.searchBgType === 'gradient' &&
              siblingData?.designVersion !== 'wowtour_heroBanner3',
          },
        },
        {
          name: 'searchBgImage',
          type: 'upload',
          relationTo: 'media',
          label: { en: 'Translated Text', th: 'รูปภาพพื้นหลัง' },
          admin: {
            description: {
              en: 'container',
              th: 'อัพโหลดรูปภาพสำหรับพื้นหลัง container กล่องค้นหา',
            },
            condition: (_, siblingData) =>
              siblingData?.searchBgType === 'image' &&
              siblingData?.designVersion !== 'wowtour_heroBanner3',
          },
        },

        // --- Search Section Settings ---
        colorPickerField({
          name: 'searchSectionBgColor',
          label: { en: 'Translated Text', th: 'สีพื้นหลังกล่องค้นหา' },
          defaultValue: 'hsl(0, 0%, 100%)',
          admin: {
            description: { en: 'Translated Text', th: 'เลือกสีพื้นหลังของกล่องค้นหา' },
            condition: (_, siblingData) => siblingData?.designVersion !== 'wowtour_heroBanner3',
          },
        }),
        {
          name: 'searchSectionOpacity',
          type: 'number',
          label: { en: '(%)', th: 'ค่าโปร่งแสง (%)' },
          defaultValue: 100,
          min: 0,
          max: 100,
          admin: {
            description: {
              en: '(0% = , 100% = )',
              th: 'ปรับค่าความโปร่งแสงของกล่องค้นหา (0% = โปร่งใสทั้งหมด, 100% = ทึบ)',
            },
            step: 1,
            condition: (_, siblingData) => siblingData?.designVersion !== 'wowtour_heroBanner3',
          },
        },
        {
          name: 'searchSectionBorderRadius',
          type: 'number',
          label: 'Border Radius (px)',
          defaultValue: 16,
          admin: {
            description: { en: '( px)', th: 'ปรับขอบมนของกล่องค้นหา (หน่วย px)' },
            condition: (_, siblingData) => siblingData?.designVersion !== 'wowtour_heroBanner3',
          },
        },
      ],
    },
    {
      name: 'borderRadius',
      label: 'Border Radius',
      type: 'select',
      defaultValue: 'none',
      options: [
        { label: 'None (0px)', value: 'none' },
        { label: 'Small (sm)', value: 'rounded-sm' },
        { label: 'Medium (md)', value: 'rounded-md' },
        { label: 'Large (lg)', value: 'rounded-lg' },
        { label: 'Extra Large (xl)', value: 'rounded-xl' },
        { label: '2x Large (2xl)', value: 'rounded-2xl' },
        { label: '3x Large (3xl)', value: 'rounded-3xl' },
        { label: 'Full (full)', value: 'rounded-full' },
      ],
      admin: {
        condition: () => false,
      },
    },
    // === WowTour Banner 1: Border Radius 4 มุม ===
    {
      type: 'collapsible',
      label: { en: 'Border Radius', th: 'Border Radius (มุมโค้ง)' },
      admin: {
        initCollapsed: false,
        description: { en: '4 ( px)', th: 'ปรับความโค้งมนแยกทั้ง 4 มุม (หน่วย px)' },
        condition: (_, { designVersion = '' } = {}) =>
          designVersion === 'wowtour_heroBannerStaticPage2',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'bannerRadiusTopLeft',
              label: { en: '(px)', th: 'มุมบนซ้าย (px)' },
              type: 'select',
              defaultValue: '0',
              options: Array.from({ length: 11 }, (_, i) => ({
                label: `${i * 5}px`,
                value: `${i * 5}`,
              })),
              admin: { width: '25%' },
            },
            {
              name: 'bannerRadiusTopRight',
              label: { en: '(px)', th: 'มุมบนขวา (px)' },
              type: 'select',
              defaultValue: '0',
              options: Array.from({ length: 11 }, (_, i) => ({
                label: `${i * 5}px`,
                value: `${i * 5}`,
              })),
              admin: { width: '25%' },
            },
            {
              name: 'bannerRadiusBottomLeft',
              label: { en: '(px)', th: 'มุมล่างซ้าย (px)' },
              type: 'select',
              defaultValue: '0',
              options: Array.from({ length: 11 }, (_, i) => ({
                label: `${i * 5}px`,
                value: `${i * 5}`,
              })),
              admin: { width: '25%' },
            },
            {
              name: 'bannerRadiusBottomRight',
              label: { en: '(px)', th: 'มุมล่างขวา (px)' },
              type: 'select',
              defaultValue: '0',
              options: Array.from({ length: 11 }, (_, i) => ({
                label: `${i * 5}px`,
                value: `${i * 5}`,
              })),
              admin: { width: '25%' },
            },
          ],
        },
      ],
    },
    // === WowTour Banner 1: Gradient Background ===
    {
      type: 'collapsible',
      label: { en: 'Banner', th: 'พื้นหลัง Banner' },
      admin: {
        initCollapsed: false,
        description: {
          en: 'Banner ( Gradient)',
          th: 'เลือกสีพื้นหลัง Banner (สีเดียว หรือ Gradient)',
        },
        condition: (_, { designVersion = '' } = {}) =>
          designVersion === 'wowtour_heroBannerStaticPage2',
      },
      fields: [
        {
          name: 'enableBannerGradient',
          label: { en: 'Gradient', th: 'เปิดใช้ Gradient' },
          type: 'checkbox',
          defaultValue: false,
        },
        colorPickerField({
          name: 'bannerBgColor',
          label: { en: 'Banner Color', de: 'Bannerfarbe' },
          defaultValue: '#EF6164',
          admin: {
            condition: (_, siblingData) => !siblingData?.enableBannerGradient,
            description: {
              en: 'Solid background color for banner.',
              de: 'Einfarbiger Hintergrund für Banner.',
            },
          },
        }),
        {
          type: 'row',
          admin: {
            condition: (_, siblingData) => siblingData?.enableBannerGradient,
          },
          fields: [
            colorPickerField({
              name: 'bannerGradientStartColor',
              label: { en: 'Start Color', de: 'Startfarbe' },
              defaultValue: '#EF6164',
              admin: { width: '50%' },
            }),
            colorPickerField({
              name: 'bannerGradientEndColor',
              label: { en: 'End Color', de: 'Endfarbe' },
              defaultValue: '#8B0D11',
              admin: { width: '50%' },
            }),
          ],
        },
        {
          type: 'row',
          admin: {
            condition: (_, siblingData) => siblingData?.enableBannerGradient,
          },
          fields: [
            {
              name: 'bannerGradientType',
              label: 'Gradient Type',
              type: 'select',
              defaultValue: 'linear',
              options: [
                { label: 'Linear', value: 'linear' },
                { label: 'Radial', value: 'radial' },
              ],
              admin: { width: '50%' },
            },
            {
              name: 'bannerGradientPosition',
              label: 'Position',
              type: 'select',
              defaultValue: 'to right',
              options: [
                { label: 'Top', value: 'to top' },
                { label: 'Top Right', value: 'to top right' },
                { label: 'Right', value: 'to right' },
                { label: 'Bottom Right', value: 'to bottom right' },
                { label: 'Bottom', value: 'to bottom' },
                { label: 'Bottom Left', value: 'to bottom left' },
                { label: 'Left', value: 'to left' },
                { label: 'Top Left', value: 'to top left' },
              ],
              admin: { width: '50%' },
            },
          ],
        },
      ],
    },
    // WowTour HeroBanner Static Page 1 fields
    {
      ...colorPickerField({
        name: 'heroGradientFrom',
        label: 'Start Color',
        defaultValue: 'hsl(173, 100%, 46%)',
      }),
      admin: {
        ...colorPickerField({
          name: 'heroGradientFrom',
          label: 'Start Color',
          defaultValue: 'hsl(173, 100%, 46%)',
        }).admin,
        condition: (_, { designVersion = '' } = {}) =>
          designVersion === 'wowtour_heroBannerStaticPage1',
      },
    },
    {
      ...colorPickerField({
        name: 'heroGradientTo',
        label: 'End Color',
        defaultValue: 'hsl(214, 97%, 61%)',
      }),
      admin: {
        ...colorPickerField({
          name: 'heroGradientTo',
          label: 'End Color',
          defaultValue: 'hsl(214, 97%, 61%)',
        }).admin,
        condition: (_, { designVersion = '' } = {}) =>
          designVersion === 'wowtour_heroBannerStaticPage1',
      },
    },
    {
      name: 'heroGradientType',
      label: 'Gradient Type',
      type: 'select',
      defaultValue: 'linear',
      options: [
        { label: 'Linear', value: 'linear' },
        { label: 'Radial', value: 'radial' },
        { label: 'Conic', value: 'conic' },
      ],
      admin: {
        condition: (_, { designVersion = '' } = {}) =>
          designVersion === 'wowtour_heroBannerStaticPage1',
      },
    },
    {
      name: 'heroGradientPosition',
      label: 'Position',
      type: 'select',
      defaultValue: 'to right',
      options: [
        { label: 'To Right', value: 'to right' },
        { label: 'To Left', value: 'to left' },
        { label: 'To Bottom', value: 'to bottom' },
        { label: 'To Top', value: 'to top' },
        { label: 'To Bottom Right', value: 'to bottom right' },
        { label: 'To Bottom Left', value: 'to bottom left' },
        { label: 'To Top Right', value: 'to top right' },
        { label: 'To Top Left', value: 'to top left' },
        { label: 'Center (for Radial)', value: 'circle at center' },
        { label: 'Top Right (for Radial)', value: 'circle at top right' },
        { label: 'Top Left (for Radial)', value: 'circle at top left' },
        { label: 'Bottom Right (for Radial)', value: 'circle at bottom right' },
        { label: 'Bottom Left (for Radial)', value: 'circle at bottom left' },
      ],
      admin: {
        condition: (_, { designVersion = '' } = {}) =>
          designVersion === 'wowtour_heroBannerStaticPage1',
      },
    },
    {
      name: 'heroHeading',
      label: 'Heading',
      type: 'text',
      localized: true,
      admin: {
        condition: (_, { designVersion = '' } = {}) =>
          designVersion === 'wowtour_heroBannerStaticPage1',
      },
    },
    {
      name: 'heroSubtitle',
      label: 'Subtitle',
      type: 'text',
      localized: true,
      admin: {
        condition: (_, { designVersion = '' } = {}) =>
          ['wowtour_heroBannerStaticPage1', 'wowtour_heroBannerStaticPage2'].includes(
            designVersion,
          ),
      },
    },
    {
      name: 'breadcrumbs',
      label: 'Breadcrumbs',
      type: 'array',
      admin: {
        condition: (_, { designVersion = '' } = {}) =>
          ['wowtour_heroBannerStaticPage1', 'wowtour_heroBannerStaticPage2'].includes(
            designVersion,
          ),
      },
      maxRows: 5,
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'url',
          label: 'Link URL (leave empty for current page)',
          type: 'text',
        },
      ],
    },
  ],
  label: false,
}
