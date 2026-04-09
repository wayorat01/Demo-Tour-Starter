import type { GlobalConfig } from 'payload'

import { revalidateHeader } from './hooks/revalidateHeader'
import { navbar } from './navbar/navbar.config'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { serverUrl as NEXT_PUBLIC_SERVER_URL } from '@/config/server'
import localization from '@/localization.config'
import { authenticated } from '@/access/authenticated'
import { designVersionPreview } from '@/components/AdminDashboard/DesignVersionPreview/config'

export const allHeaderDesignVersions = [
  {
    label: 'WowTour Navbar 1 \n(Left Align Menu)',
    value: '1',
    image: '/admin/previews/header/wowtour_navbar1.png',
  },
  {
    label: 'WowTour Navbar 2 \n(Center Menu)',
    value: '2',
    image: '/admin/previews/header/wowtour_navbar2.png',
  },
  {
    label: 'WowTour Navbar 3 \n(Left Align Menu with Home Icon)',
    value: '3',
    image: '/admin/previews/header/wowtour_navbar3.png',
  },
  {
    label: 'WowTour Navbar 4 \n(Center Menu With Top Bar)',
    value: '4',
    image: '/admin/previews/header/wowtour_navbar4.png',
  },
  {
    label: 'WowTour Navbar 5 \n(Right Align Menu)',
    value: '6',
    image: '/admin/previews/header/wowtour_navbar5.jpg',
  },
  {
    label: 'WowTour Navbar 6 \n(Info Bar + Center Logo + Nav)',
    value: '7',
    image: '/admin/previews/header/wowtour_navbar6.png',
  },
  {
    label: 'WowTour Navbar 7 \n(License + Logo + Nav)',
    value: '8',
    image: '/admin/previews/header/wowtour_navbar7.png',
  },
] as const

export type HeaderDesignVersion = (typeof allHeaderDesignVersions)[number]

export const Header: GlobalConfig = {
  slug: 'header',
  label: { en: 'Header', th: 'เมนูด้านบน' },
  access: {
    read: () => true,
    update: authenticated,
  },
  admin: {
    description: 'Theme configuration (For live preview config has to be saved)',
    livePreview: {
      url: () => {
        const path = generatePreviewPath({
          slug: 'home',
          breadcrumbs: undefined,
          collection: 'pages',
          locale: localization.defaultLocale,
        })

        return `${NEXT_PUBLIC_SERVER_URL}${path}`
      },
    },
    preview: () => {
      const path = generatePreviewPath({
        slug: 'home',
        breadcrumbs: undefined,
        collection: 'pages',
        locale: localization.defaultLocale,
      })

      return `${NEXT_PUBLIC_SERVER_URL}${path}`
    },
  },
  fields: [
    designVersionPreview(allHeaderDesignVersions, { defaultValue: '1' }),
    {
      name: 'colorSettings',
      type: 'group',
      label: 'Color Settings',
      admin: {
        description: {
          en: 'Header color settings (defaults used if empty)',
          th: 'ตั้งค่าสีส่วนต่างๆ ของ Header (ถ้าไม่ตั้งค่าจะใช้สีเริ่มต้น)',
        },
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'gradientColor',
              type: 'text',
              label: { en: 'Container', th: 'สีพื้นหลัง Container บนสุด' },
              validate: () => true as const,
              admin: {
                description: {
                  en: 'Top bar color (working hours/social links bar)',
                  th: 'สีของแถบด้านบนสุด (เช่น แถบเวลาทำการ/Social Links)',
                },
                condition: (data) =>
                  data?.designVersion === '3' ||
                  data?.designVersion === '4' ||
                  data?.designVersion === '6' ||
                  data?.designVersion === '7' ||
                  data?.designVersion === '8',
                width: '50%',
                components: {
                  Field: '@/fields/gradientPicker/GradientPickerComponent#GradientPickerComponent',
                },
              },
            },
            {
              name: 'topContainerTextColor',
              type: 'select',
              label: { en: 'Container', th: 'สีตัวอักษร Container บนสุด' },
              validate: () => true as const,
              admin: {
                description: {
                  en: 'Top bar text and icon color',
                  th: 'สีตัวอักษรและไอคอนของแถบด้านบนสุด',
                },
                condition: (data) =>
                  data?.designVersion === '4' ||
                  data?.designVersion === '6' ||
                  data?.designVersion === '7' ||
                  data?.designVersion === '8',
                width: '50%',
                components: {
                  Field: '@/fields/colorSelect/ColorSelectComponent#ColorSelectComponent',
                },
              },
              options: [
                { label: 'White', value: 'white' },
                { label: 'Black', value: 'black' },
                { label: 'Foreground', value: 'foreground' },
                { label: 'Primary', value: 'primary' },
                { label: 'Secondary', value: 'secondary' },
                { label: 'Accent', value: 'accent' },
                { label: 'Muted Foreground', value: 'muted-foreground' },
              ],
            },
          ],
        },
        {
          name: 'headerBackground',
          type: 'text',
          label: { en: 'Header', th: 'สีพื้นหลัง Header' },
          defaultValue: 'background',
          validate: () => true as const,
          admin: {
            description: { en: 'Main Header background color', th: 'สีพื้นหลังของ Header หลัก' },
            components: {
              Field: '@/fields/gradientPicker/GradientPickerComponent#GradientPickerComponent',
            },
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'menuTextColor',
              type: 'select',
              label: { en: 'Translated Text', th: 'สีตัวอักษรเมนู' },
              defaultValue: 'foreground',
              validate: () => true as const,
              admin: {
                description: {
                  en: 'Menu text color (normal) — shared across all designs',
                  th: 'สีตัวอักษรของเมนู (ปกติ) ใช้ร่วมกันทุก Design Version',
                },
                width: '50%',
                components: {
                  Field: '@/fields/colorSelect/ColorSelectComponent#ColorSelectComponent',
                },
              },
              options: [
                { label: 'Foreground', value: 'foreground' },
                { label: 'Primary', value: 'primary' },
                { label: 'Secondary', value: 'secondary' },
                { label: 'Accent', value: 'accent' },
                { label: 'Muted Foreground', value: 'muted-foreground' },
                { label: 'White', value: 'white' },
                { label: 'Black', value: 'black' },
              ],
            },
            {
              name: 'menuActiveColor',
              type: 'select',
              label: { en: 'Hover Active', th: 'สีตัวอักษรเมนูกรณี Hover และ Active เมนู' },
              defaultValue: 'primary',
              validate: () => true as const,
              admin: {
                description: {
                  en: 'hover active ( Design Version)',
                  th: 'สีของข้อความเมนูตอน hover และ active (ใช้ร่วมกันทุก Design Version)',
                },
                width: '50%',
                components: {
                  Field: '@/fields/colorSelect/ColorSelectComponent#ColorSelectComponent',
                },
              },
              options: [
                { label: 'Primary', value: 'primary' },
                { label: 'Secondary', value: 'secondary' },
                { label: 'Accent', value: 'accent' },
                { label: 'Foreground', value: 'foreground' },
                { label: 'Muted Foreground', value: 'muted-foreground' },
                { label: 'White', value: 'white' },
                { label: 'Black', value: 'black' },
              ],
            },
          ],
        },
        {
          name: 'navBarBackground',
          type: 'text',
          label: { en: 'Container', th: 'สีพื้นหลัง Container เมนู' },
          defaultValue: 'card',
          validate: () => true as const,
          admin: {
            description: {
              en: 'Navigation ( Header 1, 3, 6)',
              th: 'สีพื้นหลังของแถบ Navigation (ใช้ใน Header 1, 3, 6)',
            },
            condition: (data) =>
              data?.designVersion === '1' ||
              data?.designVersion === '3' ||
              data?.designVersion === '7' ||
              data?.designVersion === '8',
            components: {
              Field: '@/fields/gradientPicker/GradientPickerComponent#GradientPickerComponent',
            },
          },
        },
      ],
    },

    // General dropdown settings — applies to non-Tour-Category dropdowns
    {
      name: 'generalDropdownSettings',
      type: 'group',
      label: { en: 'Dropdown', th: 'ตั้งค่าเมนู Dropdown' },
      admin: {
        description: {
          en: 'dropdown ( dropdown Block Tour Category)',
          th: 'ตั้งค่าการแสดงผลของเมนู dropdown ทั่วไป (ยกเว้น dropdown จาก Block Tour Category)',
        },
        condition: (data) => {
          const items = (data as any)?.richItems || (data as any)?.items || []
          return items.some(
            (item: any) =>
              item.blockType === 'sub' ||
              (item.blockType === 'submenu' &&
                !item.blocks?.some((b: any) => b.blockType === 'tourCategoryMenu')),
          )
        },
      },
      fields: [
        {
          name: 'dropdownBgColor',
          type: 'text',
          label: { en: 'Dropdown', th: 'สีพื้นหลัง Dropdown' },
          validate: () => true as const,
          admin: {
            description: {
              en: 'dropdown menu — preset gradient',
              th: 'สีพื้นหลังของ dropdown menu — เลือก preset หรือสร้าง gradient เอง',
            },
            components: {
              Field: '@/fields/gradientPicker/GradientPickerComponent#GradientPickerComponent',
            },
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'dropdownTextColor',
              type: 'select',
              label: { en: 'Dropdown', th: 'สีตัวอักษร Dropdown' },
              validate: () => true as const,
              admin: {
                description: { en: 'dropdown menu', th: 'สีตัวอักษรของ dropdown menu' },
                width: '50%',
                components: {
                  Field: '@/fields/colorSelect/ColorSelectComponent#ColorSelectComponent',
                },
              },
              options: [
                { label: 'Foreground', value: 'foreground' },
                { label: 'Primary', value: 'primary' },
                { label: 'Secondary', value: 'secondary' },
                { label: 'Accent', value: 'accent' },
                { label: 'Muted Foreground', value: 'muted-foreground' },
                { label: 'White', value: 'custom:#ffffff' },
                { label: 'Black', value: 'custom:#000000' },
              ],
            },
            {
              name: 'dropdownHoverColor',
              type: 'select',
              label: {
                en: 'Dropdown (Hover Active)',
                th: 'สีพื้นหลังตัวอักษร Dropdown (Hover และ Active)',
              },
              validate: () => true as const,
              admin: {
                description: { en: 'hover active', th: 'สีพื้นหลังเมื่อ hover หรือ active' },
                width: '50%',
                components: {
                  Field: '@/fields/colorSelect/ColorSelectComponent#ColorSelectComponent',
                },
              },
              options: [
                { label: 'Primary', value: 'primary' },
                { label: 'Secondary', value: 'secondary' },
                { label: 'Accent', value: 'accent' },
                { label: 'Muted', value: 'muted' },
                { label: 'Card', value: 'card' },
                { label: 'White (10%)', value: 'custom:rgba(255,255,255,0.1)' },
                { label: 'White (20%)', value: 'custom:rgba(255,255,255,0.2)' },
                { label: 'Black (10%)', value: 'custom:rgba(0,0,0,0.1)' },
                { label: 'Black (20%)', value: 'custom:rgba(0,0,0,0.2)' },
              ],
            },
          ],
        },
      ],
    },

    // Dropdown menu settings — only visible when a Tour Category Menu block exists
    {
      name: 'dropdownSettings',
      type: 'group',
      label: { en: 'Dropdown Tour Category', th: 'ตั้งค่าเมนู Dropdown Tour Category' },
      admin: {
        description: {
          en: 'dropdown — dropdown Block Tour Category',
          th: 'ตั้งค่าการแสดงผลของ dropdown — มีผลเฉพาะ dropdown ที่ใช้ Block Tour Category เท่านั้น',
        },
        condition: (data) => {
          const items = (data as any)?.richItems || (data as any)?.items || []
          return items.some(
            (item: any) =>
              item.blockType === 'submenu' &&
              item.blocks?.some((b: any) => b.blockType === 'tourCategoryMenu'),
          )
        },
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'showFlags',
              type: 'checkbox',
              label: { en: 'Translated Text', th: 'แสดงธงชาติ' },
              defaultValue: true,
              admin: {
                description: {
                  en: 'Show/hide flag icon before tour name',
                  th: 'แสดง/ซ่อน รูปธงชาติหน้าชื่อทัวร์',
                },
                width: '50%',
              },
            },
            {
              name: 'showTourCount',
              type: 'checkbox',
              label: { en: 'Product', th: 'แสดงจำนวน Product' },
              defaultValue: true,
              admin: {
                description: { en: '/ badge Product', th: 'แสดง/ซ่อน badge จำนวน Product' },
                width: '50%',
              },
            },
          ],
        },
        {
          name: 'dropdownBgColor',
          type: 'text',
          label: { en: 'Dropdown', th: 'สีพื้นหลัง Dropdown' },
          validate: () => true as const,
          admin: {
            description: {
              en: 'dropdown menu — preset gradient',
              th: 'สีพื้นหลังของ dropdown menu — เลือก preset หรือสร้าง gradient เอง',
            },
            components: {
              Field: '@/fields/gradientPicker/GradientPickerComponent#GradientPickerComponent',
            },
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'dropdownTextColor',
              type: 'select',
              label: { en: 'Dropdown', th: 'สีตัวอักษร Dropdown' },
              validate: () => true as const,
              admin: {
                description: { en: 'dropdown menu', th: 'สีตัวอักษรของ dropdown menu' },
                width: '50%',
                components: {
                  Field: '@/fields/colorSelect/ColorSelectComponent#ColorSelectComponent',
                },
              },
              options: [
                { label: 'Foreground', value: 'foreground' },
                { label: 'Primary', value: 'primary' },
                { label: 'Secondary', value: 'secondary' },
                { label: 'Accent', value: 'accent' },
                { label: 'Muted Foreground', value: 'muted-foreground' },
                { label: 'White', value: 'custom:#ffffff' },
                { label: 'Black', value: 'custom:#000000' },
              ],
            },
            {
              name: 'dropdownHoverColor',
              type: 'select',
              label: {
                en: 'Dropdown (Hover Active)',
                th: 'สีพื้นหลังตัวอักษร Dropdown (Hover และ Active)',
              },
              validate: () => true as const,
              admin: {
                description: {
                  en: 'hover active',
                  th: 'สีพื้นหลังของรายการทัวร์เมื่อ hover หรือ active',
                },
                width: '50%',
                components: {
                  Field: '@/fields/colorSelect/ColorSelectComponent#ColorSelectComponent',
                },
              },
              options: [
                { label: 'Primary', value: 'primary' },
                { label: 'Secondary', value: 'secondary' },
                { label: 'Accent', value: 'accent' },
                { label: 'Muted', value: 'muted' },
                { label: 'Card', value: 'card' },
                { label: 'White (10%)', value: 'custom:rgba(255,255,255,0.1)' },
                { label: 'White (20%)', value: 'custom:rgba(255,255,255,0.2)' },
                { label: 'Black (10%)', value: 'custom:rgba(0,0,0,0.1)' },
                { label: 'Black (20%)', value: 'custom:rgba(0,0,0,0.2)' },
              ],
            },
          ],
        },
        {
          type: 'row',
          admin: {
            condition: (data) => (data as any)?.dropdownSettings?.showTourCount !== false,
          },
          fields: [
            {
              name: 'badgeTextColor',
              type: 'select',
              label: { en: 'Product', th: 'สีตัวอักษรจำนวน Product' },
              validate: () => true as const,
              admin: {
                description: { en: 'badge Product', th: 'สีตัวอักษรของ badge จำนวน Product' },
                width: '50%',
                components: {
                  Field: '@/fields/colorSelect/ColorSelectComponent#ColorSelectComponent',
                },
              },
              options: [
                { label: 'White', value: 'custom:#ffffff' },
                { label: 'Black', value: 'custom:#000000' },
                { label: 'Foreground', value: 'foreground' },
                { label: 'Primary Foreground', value: 'primary-foreground' },
                { label: 'Primary', value: 'primary' },
                { label: 'Secondary', value: 'secondary' },
                { label: 'Accent', value: 'accent' },
              ],
            },
            {
              name: 'badgeBgColor',
              type: 'select',
              label: { en: 'Product', th: 'สีพื้นหลังตัวอักษรจำนวน Product' },
              validate: () => true as const,
              admin: {
                description: { en: 'badge Product', th: 'สีพื้นหลังของ badge จำนวน Product' },
                width: '50%',
                components: {
                  Field: '@/fields/colorSelect/ColorSelectComponent#ColorSelectComponent',
                },
              },
              options: [
                { label: 'Primary', value: 'primary' },
                { label: 'Secondary', value: 'secondary' },
                { label: 'Accent', value: 'accent' },
                { label: 'Muted', value: 'muted' },
                { label: 'Card', value: 'card' },
                { label: 'White', value: 'custom:#ffffff' },
                { label: 'Black', value: 'custom:#000000' },
              ],
            },
          ],
        },
      ],
    },

    {
      name: 'topBar',
      type: 'group',
      label: { en: 'Top Bar', th: 'แถบด้านบน' },
      admin: {
        condition: (data) =>
          data?.designVersion === '1' ||
          data?.designVersion === '2' ||
          data?.designVersion === '3' ||
          data?.designVersion === '4' ||
          data?.designVersion === '6' ||
          data?.designVersion === '7' ||
          data?.designVersion === '8',
        description: {
          en: 'Configure the top bar section with social links, business hours, and contact info.',
          th: 'ตั้งค่าแถบด้านบน แสดง Social Links, เวลาทำการ, และข้อมูลติดต่อ',
        },
      },
      fields: [
        {
          name: 'showSocialIcons',
          type: 'checkbox',
          label: { en: 'Show Social Icons', th: 'แสดงไอคอน Social' },
          defaultValue: true,
          admin: {
            description: {
              en: 'Show social media icons (from Company Info)',
              th: 'แสดงไอคอน Social Media (ดึงจากข้อมูลบริษัท)',
            },
          },
        },
        {
          name: 'showSocialLabels',
          type: 'checkbox',
          label: { en: 'Show Social Media Labels', th: 'แสดงชื่อ Social Media' },
          defaultValue: true,
          admin: {
            description: {
              en: 'Display text labels next to social media icons.',
              th: 'แสดงข้อความชื่อถัดจากไอคอน Social Media',
            },
            condition: (data) =>
              data?.designVersion !== '2' &&
              data?.designVersion !== '3' &&
              (data as any)?.topBar?.showSocialIcons !== false,
          },
        },

        {
          name: 'showBusinessHours',
          type: 'checkbox',
          label: { en: 'Show Business Hours', th: 'แสดงเวลาทำการ' },
          defaultValue: true,
          admin: {
            condition: (data) => data?.designVersion !== '2',
            description: {
              en: 'Show working hours (from Company Info)',
              th: 'แสดงเวลาทำการ (ดึงจากข้อมูลบริษัท)',
            },
          },
        },
        {
          name: 'showContacts',
          type: 'checkbox',
          label: { en: 'Show Contact Numbers', th: 'แสดงเบอร์โทร' },
          defaultValue: true,
          admin: {
            description: {
              en: 'Show phone number (from Company Info)',
              th: 'แสดงเบอร์โทร (ดึงจากข้อมูลบริษัท)',
            },
          },
        },
        {
          name: 'showTourismLicense',
          type: 'checkbox',
          label: { en: 'Show Tourism License', th: 'แสดงเลขทะเบียน ททท.' },
          defaultValue: false,
          admin: {
            description: {
              en: 'Show TAT license (from Company Info)',
              th: 'แสดงเลขทะเบียน ททท. (ดึงจากข้อมูลบริษัท)',
            },
            condition: (data) => data?.designVersion !== '2' && data?.designVersion !== '3',
          },
        },
      ],
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: () => false,
        description: {
          en: 'Header',
          th: 'โลโก้ของเว็บไซต์สำหรับ Header (ถ้าไม่ใส่จะใช้โลโก้บริษัทอัตโนมัติ)',
        },
      },
    },
    {
      name: 'isSearchEnabled',
      type: 'checkbox',
      label: { en: 'Translated Text', th: 'เปิดใช้งานปุ่มค้นหา' },
      defaultValue: true,
      admin: {
        description: { en: 'Navbar', th: 'แสดงปุ่มค้นหาบน Navbar' },
        condition: () => false,
      },
    },
    ...navbar,
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
