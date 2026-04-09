import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import localization from '@/localization.config'
import { serverUrl as NEXT_PUBLIC_SERVER_URL } from '@/config/server'

import { backgroundColor } from '@/fields/color'
import { authenticated } from '@/access/authenticated'
import { designVersionPreview } from '@/components/AdminDashboard/DesignVersionPreview/config'

export const allFooterDesignVersions = [
  { label: 'wowtour_footer2', value: 'wowtour_footer2', image: '/media/wowtour_footer2.jpg' },
  { label: 'wowtour_footer3', value: 'wowtour_footer3', image: '/media/wowtour_footer3.jpg' },
  { label: 'wowtour_footer4', value: 'wowtour_footer4', image: '/media/wowtour_footer4.jpg' },
  { label: 'wowtour_footer5', value: 'wowtour_footer5', image: '/media/wowtour_footer5.jpg' },
  {
    label: 'wowtour_footer1',
    value: 'wowtour_footer1',
    image: '/admin/previews/footer/wowtour_footer1.jpg',
  },
] as const

export type FooterDesignVersion = (typeof allFooterDesignVersions)[number]

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: { en: 'Footer', th: 'ส่วนท้าย' },
  access: {
    read: () => true,
    update: authenticated,
  },
  admin: {
    description: 'Theme configuration (For live preview config has to be saved)',
    livePreview: {
      url: ({ req }) => {
        const path = generatePreviewPath({
          slug: 'home',
          breadcrumbs: undefined,
          collection: 'pages',
          locale: localization.defaultLocale,
          req,
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
    backgroundColor,
    designVersionPreview(allFooterDesignVersions, { defaultValue: 'wowtour_footer2' }),

    {
      name: 'showTrustBadges',
      type: 'checkbox',
      label: { en: 'Trust Badges', th: 'แสดง Trust Badges' },
      defaultValue: true,
      admin: {
        description: {
          en: 'Show Trust Badges from Company Info',
          th: 'แสดงรูป Trust Badges (VISA, Mastercard, ATTA, TAT, DBD) จากข้อมูลบริษัท',
        },
      },
    },
    /**
     * A subline/tagline to display under the logo.
     */
    {
      name: 'subline',
      type: 'text',
      localized: true,
      label: 'Subline / Tagline',
      defaultValue:
        'Components made easy. This cool starter template will help you get started with your next project.',
      admin: {
        description: 'A tagline displayed under the logo',
      },
    },
    /**
     * Legal links like imprint, privacy policy, etc. that are displayed at the bottom of the footer.
     */
    {
      name: 'legalLinks',
      label: { en: 'Legal Links', th: 'ลิงก์นโยบาย / กฎหมาย' },
      admin: {
        description: {
          en: 'Legal links like imprint, privacy policy, etc.',
          th: 'ลิงก์นโยบายความเป็นส่วนตัว, ข้อกำหนดฯลฯ',
        },
      },
      type: 'array',
      labels: {
        singular: { en: 'Legal Link', th: 'ลิงก์นโยบาย' },
        plural: { en: 'Legal Links', th: 'ลิงก์นโยบายทั้งหมด' },
      },
      fields: [
        link({
          appearances: false,
          disableIcon: true,
        }),
      ],
      maxRows: 5,
    },

    {
      name: 'navItems',
      type: 'array',
      labels: {
        singular: { en: 'Nav Item', th: 'เมนูหลัก' },
        plural: { en: 'Nav Items', th: 'เมนูหลักทั้งหมด' },
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
          required: true,
        },
        {
          name: 'subNavItems',
          type: 'array',
          labels: {
            singular: { en: 'Sub Nav Item', th: 'เมนูย่อย' },
            plural: { en: 'Sub Nav Items', th: 'เมนูย่อยทั้งหมด' },
          },
          fields: [
            link({
              appearances: false,
            }),
          ],
        },
      ],
      maxRows: 5,
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
