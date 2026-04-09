import { backgroundColor } from '@/fields/color'
import { colorPickerField } from '@/fields/colorPicker'
import { Block } from 'payload'
import { allWowtourSearchTourDesignVersions } from '@/blocks/SearchTour/config'
import { designVersionPreview } from '@/components/AdminDashboard/DesignVersionPreview/config'

export const allBannerSlideDesignVersions = [
  {
    label: 'WowTour BannerSlide 1',
    value: 'wowtour_bannerslide1',
    image: '/admin/previews/hero/wowtour_BannerSlide1.jpg',
  },
  {
    label: 'WowTour BannerSlide 2',
    value: 'wowtour_bannerSlide2',
    image: '/admin/previews/hero/wowtour_BannerSlide2.jpg',
  },
] as const

export type BannerSlideDesignVersion = (typeof allBannerSlideDesignVersions)[number]

export const BannerSlideBlock: Block = {
  slug: 'bannerSlide',
  interfaceName: 'BannerSlideBlock',
  labels: {
    singular: 'WOW BannerSlide',
    plural: 'WOW BannerSlide Blocks',
  },
  fields: [
    designVersionPreview(allBannerSlideDesignVersions),

    // ============================================
    // WowTour HeroBanner 1 fields
    // ============================================
    {
      name: 'heroBanner1Settings',
      label: 'HeroBanner 1 Settings',
      type: 'group',
      admin: {
        condition: (_, { designVersion }) => designVersion === 'wowtour_heroBanner1',
        description: { en: 'Hero Banner', th: 'Hero Banner พร้อมกล่องค้นหาทัวร์' },
      },
      fields: [
        backgroundColor,
        {
          name: 'sliderImages',
          label: 'Slider Images',
          type: 'array',
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
        },

        // ============================================
        // Search Box Settings
        // ============================================
        {
          name: 'searchBoxSettings',
          type: 'group',
          label: 'Search Box Settings',
          admin: {
            description: {
              en: 'Search box settings on Hero Banner',
              th: 'ตั้งค่ากล่องค้นหาบน Hero Banner',
            },
          },
          fields: [
            // --- Design Version ---
            {
              name: 'searchDesignVersion',
              type: 'select',
              defaultValue: 'WOWTOUR_SEARCH_TOUR_1',
              label: { en: 'Design Version', th: 'Design Version กล่องค้นหา' },
              options: allWowtourSearchTourDesignVersions.map((v) => ({
                label: v.label,
                value: v.value,
              })),
              admin: {
                description: {
                  en: 'Choose search box display style',
                  th: 'เลือกรูปแบบการแสดงผลกล่องค้นหาทัวร์',
                },
              },
            },

            // --- Background Container ---
            {
              name: 'backgroundSettings',
              type: 'group',
              label: 'Background Container',
              admin: {
                description: {
                  en: 'Search container background settings',
                  th: 'ตั้งค่าพื้นหลังของ container กล่องค้นหา',
                },
              },
              fields: [
                {
                  name: 'backgroundType',
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
                      en: 'Choose between solid color, gradient, or image background',
                      th: 'เลือกระหว่างใช้สีพื้น, ไล่สี (Gradient) หรือรูปภาพเป็นพื้นหลัง',
                    },
                  },
                },
                colorPickerField({
                  name: 'backgroundColor',
                  label: { en: 'Translated Text', th: 'สีพื้นหลัง' },
                  defaultValue: 'hsl(0, 70%, 60%)',
                  admin: {
                    description: {
                      en: 'Select container background color',
                      th: 'เลือกสีพื้นหลังของ container',
                    },
                    condition: (_, siblingData) => siblingData?.backgroundType === 'color',
                  },
                }),
                colorPickerField({
                  name: 'gradientStartColor',
                  label: 'Start Color',
                  defaultValue: 'hsl(173, 100%, 46%)',
                  admin: {
                    description: { en: 'Gradient start color', th: 'สีเริ่มต้นของ gradient' },
                    condition: (_, siblingData) => siblingData?.backgroundType === 'gradient',
                  },
                }),
                colorPickerField({
                  name: 'gradientEndColor',
                  label: 'End Color',
                  defaultValue: 'hsl(214, 97%, 61%)',
                  admin: {
                    description: { en: 'Gradient end color', th: 'สีสิ้นสุดของ gradient' },
                    condition: (_, siblingData) => siblingData?.backgroundType === 'gradient',
                  },
                }),
                {
                  name: 'gradientType',
                  type: 'select',
                  label: 'Gradient Type',
                  defaultValue: 'linear',
                  options: [
                    { label: 'Linear', value: 'linear' },
                    { label: 'Radial', value: 'radial' },
                  ],
                  admin: {
                    description: {
                      en: 'Choose gradient type: Linear or Radial',
                      th: 'เลือกรูปแบบ gradient: Linear (เส้นตรง) หรือ Radial (วงกลม)',
                    },
                    condition: (_, siblingData) => siblingData?.backgroundType === 'gradient',
                  },
                },
                {
                  name: 'gradientPosition',
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
                    description: { en: 'Gradient direction', th: 'ทิศทางของ gradient' },
                    condition: (_, siblingData) => siblingData?.backgroundType === 'gradient',
                  },
                },
                {
                  name: 'backgroundImage',
                  type: 'upload',
                  relationTo: 'media',
                  label: { en: 'Translated Text', th: 'รูปภาพพื้นหลัง' },
                  admin: {
                    description: {
                      en: 'Upload background image for container',
                      th: 'อัพโหลดรูปภาพสำหรับพื้นหลัง container',
                    },
                    condition: (_, siblingData) => siblingData?.backgroundType === 'image',
                  },
                },
              ],
            },

            // --- Search Section Settings ---
            {
              name: 'sectionSettings',
              type: 'group',
              label: 'Search Section Settings',
              admin: {
                description: { en: 'Search section settings', th: 'ตั้งค่ากล่อง section ค้นหา' },
              },
              fields: [
                colorPickerField({
                  name: 'sectionBgColor',
                  label: { en: 'Translated Text', th: 'สีพื้นหลังกล่องค้นหา' },
                  defaultValue: 'hsl(0, 0%, 100%)',
                  admin: {
                    description: {
                      en: 'Select search box background color',
                      th: 'เลือกสีพื้นหลังของกล่องค้นหา',
                    },
                  },
                }),
                {
                  name: 'sectionOpacity',
                  type: 'number',
                  label: { en: '(%)', th: 'ค่าโปร่งแสง (%)' },
                  defaultValue: 100,
                  min: 0,
                  max: 100,
                  admin: {
                    description: {
                      en: 'Adjust search box opacity (0% = fully transparent, 100% = opaque)',
                      th: 'ปรับค่าความโปร่งแสงของกล่องค้นหา (0% = โปร่งใสทั้งหมด, 100% = ทึบ)',
                    },
                    step: 1,
                  },
                },
                {
                  name: 'sectionBorderRadius',
                  type: 'number',
                  label: 'Border Radius (px)',
                  defaultValue: 16,
                  admin: {
                    description: {
                      en: 'Adjust search box border radius (px)',
                      th: 'ปรับขอบมนของกล่องค้นหา (หน่วย px)',
                    },
                  },
                },
              ],
            },

            // --- Heading ---
            {
              name: 'headingSettings',
              type: 'group',
              label: 'Heading',
              fields: [
                {
                  name: 'heading',
                  type: 'text',
                  defaultValue: 'ค้นหาโปรแกรมทัวร์',
                  localized: true,
                  label: { en: 'Heading', th: 'หัวข้อ' },
                  admin: {
                    description: { en: 'Search box main heading', th: 'หัวข้อหลักของกล่องค้นหา' },
                  },
                },
                {
                  name: 'showHeadingIcon',
                  type: 'checkbox',
                  defaultValue: false,
                  label: { en: 'Icon', th: 'แสดง Icon หัวข้อ' },
                  admin: {
                    description: {
                      en: 'Show/hide icon before heading',
                      th: 'เปิด/ปิด Icon ข้างหน้าหัวข้อ',
                    },
                  },
                },
                {
                  name: 'headingIcon',
                  type: 'upload',
                  relationTo: 'media',
                  label: { en: 'Icon', th: 'Icon หัวข้อ' },
                  admin: {
                    description: {
                      en: 'Upload icon (SVG or image file)',
                      th: 'อัพโหลด Icon (รองรับไฟล์ SVG หรือรูปภาพ)',
                    },
                    condition: (_, siblingData) => siblingData?.showHeadingIcon === true,
                  },
                },
              ],
            },
          ],
        },
      ],
    },

    // ============================================
    // WowTour HeroBanner 2 fields
    // ============================================
    {
      name: 'heroBanner2Settings',
      label: 'HeroBanner 2 Settings',
      type: 'group',
      admin: {
        condition: (_, { designVersion }) => designVersion === 'wowtour_heroBanner2',
        description: {
          en: 'Hero Banner + Banner Slide',
          th: 'Hero Banner พร้อมกล่องค้นหาทัวร์ด้านซ้าย + Banner Slide ด้านขวา',
        },
      },
      fields: [
        backgroundColor,
        {
          name: 'sliderImages',
          label: { en: 'Slider Images', th: 'Slider Images (ด้านขวา)' },
          type: 'array',
          minRows: 1,
          maxRows: 10,
          admin: {
            description: {
              en: 'Right-side Banner Slide images (recommended 800×600 px)',
              th: 'รูปภาพสำหรับ Banner Slide ด้านขวา (แนะนำ 800×600 px)',
            },
          },
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
        },

        // Search Box Settings
        {
          name: 'searchBoxSettings',
          type: 'group',
          label: { en: 'Search Box Settings', th: 'Search Box Settings (ด้านซ้าย)' },
          admin: {
            description: {
              en: 'Left-side search box settings on Hero Banner',
              th: 'ตั้งค่ากล่องค้นหาบน Hero Banner ด้านซ้าย',
            },
          },
          fields: [
            {
              name: 'searchDesignVersion',
              type: 'select',
              defaultValue: 'WOWTOUR_SEARCH_TOUR_1',
              label: { en: 'Design Version', th: 'Design Version กล่องค้นหา' },
              options: allWowtourSearchTourDesignVersions.map((v) => ({
                label: v.label,
                value: v.value,
              })),
              admin: {
                description: {
                  en: 'Choose search box display style',
                  th: 'เลือกรูปแบบการแสดงผลกล่องค้นหาทัวร์',
                },
              },
            },

            // Background Container
            {
              name: 'backgroundSettings',
              type: 'group',
              label: 'Background Container',
              admin: {
                description: {
                  en: 'Search container background settings',
                  th: 'ตั้งค่าพื้นหลังของ container กล่องค้นหา',
                },
              },
              fields: [
                {
                  name: 'backgroundType',
                  type: 'select',
                  label: { en: 'Translated Text', th: 'ประเภทพื้นหลัง' },
                  defaultValue: 'color',
                  options: [
                    { label: { en: 'Translated Text', th: 'สีพื้น' }, value: 'color' },
                    { label: { en: '(Gradient)', th: 'ไล่สี (Gradient)' }, value: 'gradient' },
                    { label: { en: 'Translated Text', th: 'รูปภาพ' }, value: 'image' },
                  ],
                },
                colorPickerField({
                  name: 'backgroundColor',
                  label: { en: 'Translated Text', th: 'สีพื้นหลัง' },
                  defaultValue: 'hsl(0, 70%, 60%)',
                  admin: {
                    description: {
                      en: 'Select container background color',
                      th: 'เลือกสีพื้นหลังของ container',
                    },
                    condition: (_, siblingData) => siblingData?.backgroundType === 'color',
                  },
                }),
                colorPickerField({
                  name: 'gradientStartColor',
                  label: 'Start Color',
                  defaultValue: 'hsl(173, 100%, 46%)',
                  admin: {
                    condition: (_, siblingData) => siblingData?.backgroundType === 'gradient',
                  },
                }),
                colorPickerField({
                  name: 'gradientEndColor',
                  label: 'End Color',
                  defaultValue: 'hsl(214, 97%, 61%)',
                  admin: {
                    condition: (_, siblingData) => siblingData?.backgroundType === 'gradient',
                  },
                }),
                {
                  name: 'gradientType',
                  type: 'select',
                  label: 'Gradient Type',
                  defaultValue: 'linear',
                  options: [
                    { label: 'Linear', value: 'linear' },
                    { label: 'Radial', value: 'radial' },
                  ],
                  admin: {
                    condition: (_, siblingData) => siblingData?.backgroundType === 'gradient',
                  },
                },
                {
                  name: 'gradientPosition',
                  type: 'select',
                  label: 'Position',
                  defaultValue: 'to right',
                  options: [
                    { label: 'To Right', value: 'to right' },
                    { label: 'To Left', value: 'to left' },
                    { label: 'To Bottom', value: 'to bottom' },
                    { label: 'To Top', value: 'to top' },
                  ],
                  admin: {
                    condition: (_, siblingData) => siblingData?.backgroundType === 'gradient',
                  },
                },
                {
                  name: 'backgroundImage',
                  type: 'upload',
                  relationTo: 'media',
                  label: { en: 'Translated Text', th: 'รูปภาพพื้นหลัง' },
                  admin: {
                    condition: (_, siblingData) => siblingData?.backgroundType === 'image',
                  },
                },
              ],
            },

            // Section Settings
            {
              name: 'sectionSettings',
              type: 'group',
              label: 'Search Section Settings',
              fields: [
                colorPickerField({
                  name: 'sectionBgColor',
                  label: { en: 'Translated Text', th: 'สีพื้นหลังกล่องค้นหา' },
                  defaultValue: 'hsl(0, 0%, 100%)',
                }),
                {
                  name: 'sectionOpacity',
                  type: 'number',
                  label: { en: '(%)', th: 'ค่าโปร่งแสง (%)' },
                  defaultValue: 100,
                  min: 0,
                  max: 100,
                },
                {
                  name: 'sectionBorderRadius',
                  type: 'number',
                  label: 'Border Radius (px)',
                  defaultValue: 16,
                },
              ],
            },

            // Heading
            {
              name: 'headingSettings',
              type: 'group',
              label: 'Heading',
              fields: [
                {
                  name: 'heading',
                  type: 'text',
                  defaultValue: 'ค้นหาโปรแกรมทัวร์',
                  localized: true,
                  label: { en: 'Heading', th: 'หัวข้อ' },
                },
                {
                  name: 'showHeadingIcon',
                  type: 'checkbox',
                  defaultValue: false,
                  label: { en: 'Icon', th: 'แสดง Icon หัวข้อ' },
                },
                {
                  name: 'headingIcon',
                  type: 'upload',
                  relationTo: 'media',
                  label: { en: 'Icon', th: 'Icon หัวข้อ' },
                  admin: {
                    condition: (_, siblingData) => siblingData?.showHeadingIcon === true,
                  },
                },
              ],
            },
          ],
        },
      ],
    },

    // ============================================
    // WowTour HeroBanner 3 fields
    // ============================================
    {
      name: 'heroBanner3Settings',
      label: 'HeroBanner 3 Settings',
      type: 'group',
      admin: {
        condition: (_, { designVersion }) =>
          designVersion === 'wowtour_heroBanner3' || designVersion === 'wowtour_heroBanner4',
        description: { en: 'Hero Banner', th: 'Hero Banner กล่องค้นหาตรงกลาง' },
      },
      fields: [
        backgroundColor,
        {
          name: 'sliderImages',
          label: { en: 'Slider Images', th: 'Slider Images (เต็มจอ)' },
          type: 'array',
          minRows: 1,
          maxRows: 10,
          admin: {
            description: {
              en: 'Banner Slide images (recommended 1920×600 px)',
              th: 'รูปภาพสำหรับ Banner Slide (แนะนำ 1920×600 px)',
            },
          },
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
        },

        // Search Box Settings
        {
          name: 'searchBoxSettings',
          type: 'group',
          label: 'Search Box Settings',
          admin: {
            description: {
              en: 'Search box settings on Hero Banner',
              th: 'ตั้งค่ากล่องค้นหาบน Hero Banner',
            },
          },
          fields: [
            {
              name: 'searchDesignVersion',
              type: 'select',
              defaultValue: 'WOWTOUR_SEARCH_TOUR_1',
              label: { en: 'Design Version', th: 'Design Version กล่องค้นหา' },
              options: allWowtourSearchTourDesignVersions.map((v) => ({
                label: v.label,
                value: v.value,
              })),
              admin: {
                description: {
                  en: 'Choose search box display style',
                  th: 'เลือกรูปแบบการแสดงผลกล่องค้นหาทัวร์',
                },
              },
            },

            // Background Container
            {
              name: 'backgroundSettings',
              type: 'group',
              label: 'Background Container',
              admin: {
                description: {
                  en: 'Search container background settings',
                  th: 'ตั้งค่าพื้นหลังของ container กล่องค้นหา',
                },
              },
              fields: [
                {
                  name: 'backgroundType',
                  type: 'select',
                  label: { en: 'Translated Text', th: 'ประเภทพื้นหลัง' },
                  defaultValue: 'color',
                  options: [
                    { label: { en: 'Translated Text', th: 'สีพื้น' }, value: 'color' },
                    { label: { en: '(Gradient)', th: 'ไล่สี (Gradient)' }, value: 'gradient' },
                    { label: { en: 'Translated Text', th: 'รูปภาพ' }, value: 'image' },
                  ],
                },
                colorPickerField({
                  name: 'backgroundColor',
                  label: { en: 'Translated Text', th: 'สีพื้นหลัง' },
                  defaultValue: 'hsl(0, 70%, 60%)',
                  admin: {
                    description: {
                      en: 'Select container background color',
                      th: 'เลือกสีพื้นหลังของ container',
                    },
                    condition: (_, siblingData) => siblingData?.backgroundType === 'color',
                  },
                }),
                colorPickerField({
                  name: 'gradientStartColor',
                  label: 'Start Color',
                  defaultValue: 'hsl(173, 100%, 46%)',
                  admin: {
                    condition: (_, siblingData) => siblingData?.backgroundType === 'gradient',
                  },
                }),
                colorPickerField({
                  name: 'gradientEndColor',
                  label: 'End Color',
                  defaultValue: 'hsl(214, 97%, 61%)',
                  admin: {
                    condition: (_, siblingData) => siblingData?.backgroundType === 'gradient',
                  },
                }),
                {
                  name: 'gradientType',
                  type: 'select',
                  label: 'Gradient Type',
                  defaultValue: 'linear',
                  options: [
                    { label: 'Linear', value: 'linear' },
                    { label: 'Radial', value: 'radial' },
                  ],
                  admin: {
                    condition: (_, siblingData) => siblingData?.backgroundType === 'gradient',
                  },
                },
                {
                  name: 'gradientPosition',
                  type: 'select',
                  label: 'Position',
                  defaultValue: 'to right',
                  options: [
                    { label: 'To Right', value: 'to right' },
                    { label: 'To Left', value: 'to left' },
                    { label: 'To Bottom', value: 'to bottom' },
                    { label: 'To Top', value: 'to top' },
                  ],
                  admin: {
                    condition: (_, siblingData) => siblingData?.backgroundType === 'gradient',
                  },
                },
                {
                  name: 'backgroundImage',
                  type: 'upload',
                  relationTo: 'media',
                  label: { en: 'Translated Text', th: 'รูปภาพพื้นหลัง' },
                  admin: {
                    condition: (_, siblingData) => siblingData?.backgroundType === 'image',
                  },
                },
              ],
            },

            // Section Settings
            {
              name: 'sectionSettings',
              type: 'group',
              label: 'Search Section Settings',
              fields: [
                colorPickerField({
                  name: 'sectionBgColor',
                  label: { en: 'Translated Text', th: 'สีพื้นหลังกล่องค้นหา' },
                  defaultValue: 'hsl(0, 0%, 100%)',
                }),
                {
                  name: 'sectionOpacity',
                  type: 'number',
                  label: { en: '(%)', th: 'ค่าโปร่งแสง (%)' },
                  defaultValue: 100,
                  min: 0,
                  max: 100,
                },
                {
                  name: 'sectionBorderRadius',
                  type: 'number',
                  label: 'Border Radius (px)',
                  defaultValue: 16,
                },
              ],
            },

            // Heading
            {
              name: 'headingSettings',
              type: 'group',
              label: 'Heading',
              fields: [
                {
                  name: 'heading',
                  type: 'text',
                  defaultValue: 'ค้นหาโปรแกรมทัวร์',
                  localized: true,
                  label: { en: 'Heading', th: 'หัวข้อ' },
                },
                {
                  name: 'showHeadingIcon',
                  type: 'checkbox',
                  defaultValue: false,
                  label: { en: 'Icon', th: 'แสดง Icon หัวข้อ' },
                },
                {
                  name: 'headingIcon',
                  type: 'upload',
                  relationTo: 'media',
                  label: { en: 'Icon', th: 'Icon หัวข้อ' },
                  admin: {
                    condition: (_, siblingData) => siblingData?.showHeadingIcon === true,
                  },
                },
              ],
            },
          ],
        },
      ],
    },

    // ============================================
    // WowTour BannerSlide 1 fields
    // ============================================
    {
      name: 'bannerSlide1Settings',
      label: 'Banner Slide 1 Settings',
      type: 'group',
      admin: {
        condition: (_, { designVersion }) => designVersion === 'wowtour_bannerslide1',
      },
      fields: [
        backgroundColor,
        {
          name: 'sliderImages',
          label: 'Slider Images (Left Side)',
          type: 'array',
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
        {
          name: 'sideImage',
          label: 'Side Image (Right Side)',
          type: 'upload',
          relationTo: 'media',
          required: true,
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
        },
      ],
    },

    // ============================================
    // WowTour BannerSlide 2 fields
    // ============================================
    {
      name: 'bannerSlide2Settings',
      label: 'Banner Slide 2 Settings',
      type: 'group',
      admin: {
        condition: (_, { designVersion }) => designVersion === 'wowtour_bannerSlide2',
      },
      fields: [
        backgroundColor,
        {
          name: 'banners',
          label: 'Banners (400x200 px)',
          type: 'array',
          minRows: 1,
          admin: {
            description: {
              en: 'Add promotion banner images, recommended size 400x200 px',
              th: 'เพิ่มรูปแบนเนอร์โปรโมชั่น ขนาดที่แนะนำ 400x200 px',
            },
          },
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: true,
              label: { en: 'Translated Text', th: 'รูปแบนเนอร์' },
            },
            {
              name: 'link',
              type: 'text',
              label: { en: '(URL)', th: 'ลิงก์ (URL)' },
              admin: {
                description: {
                  en: 'Link when banner is clicked (optional)',
                  th: 'ลิงก์เมื่อคลิกรูปแบนเนอร์ (ถ้ามี)',
                },
              },
            },
            {
              name: 'openInNewTab',
              type: 'checkbox',
              label: { en: 'Translated Text', th: 'เปิดลิงก์ในแท็บใหม่' },
              defaultValue: false,
            },
          ],
        },

        // Card Settings แบบเดิม
        {
          name: 'cardSettings',
          type: 'group',
          label: 'Card Settings',
          fields: [
            {
              name: 'borderRadius',
              type: 'number',
              label: 'Border Radius (px)',
              defaultValue: 12,
              admin: {
                description: {
                  en: 'Adjust image border radius (default: 12px)',
                  th: 'ปรับความมนของภาพ (default: 12px)',
                },
              },
            },
            {
              name: 'maxVisibleCards',
              type: 'number',
              label: 'Max Visible Banners',
              defaultValue: 3,
              admin: {
                description: {
                  en: 'Number of banners shown before switching to Slider (default: 3)',
                  th: 'จำนวนแบนเนอร์ที่แสดงก่อนจะเป็น Slider (default: 3)',
                },
              },
            },
            {
              name: 'displayMode',
              type: 'select',
              label: 'Display Mode',
              defaultValue: 'slide',
              options: [
                { label: 'Slide', value: 'slide' },
                { label: { en: 'Show All', th: 'Show All (แสดงทั้งหมด)' }, value: 'showAll' },
              ],
              admin: {
                description: {
                  en: 'Display mode when banners exceed Max Visible count',
                  th: 'รูปแบบการแสดงผลเมื่อมีจำนวนเกินกว่า Max Visible Banners',
                },
              },
            },
          ],
        },

        // Slider Settings แบบเดิม
        {
          name: 'sliderSettings',
          type: 'group',
          label: 'Slider Settings',
          fields: [
            {
              name: 'autoPlay',
              type: 'checkbox',
              defaultValue: false,
              label: 'Auto Play',
              admin: {
                description: { en: 'Enable/disable auto play', th: 'เปิด/ปิดการเลื่อนอัตโนมัติ' },
              },
            },
            {
              name: 'autoPlayDelay',
              type: 'number',
              label: 'Auto Play Delay (ms)',
              defaultValue: 5000,
              admin: {
                description: {
                  en: 'Auto play delay in milliseconds',
                  th: 'ระยะเวลาในการเลื่อนอัตโนมัติ (ms)',
                },
                condition: (_, siblingData) => siblingData?.autoPlay === true,
              },
            },
            {
              name: 'loop',
              type: 'checkbox',
              defaultValue: true,
              label: 'Loop',
              admin: {
                description: { en: 'Enable/disable loop', th: 'เปิด/ปิดการวนลูป' },
              },
            },
          ],
        },
      ],
    },
  ],
}
