import type { Field } from 'payload'

import deepMerge from '@/utilities/deepMerge'
import { icon } from '@/components/Icon/config'

export type LinkAppearances =
  | 'default'
  | 'outline'
  | 'inline'
  | 'destructive'
  | 'ghost'
  | 'secondary'

export const appearanceOptions: Record<LinkAppearances, { label: string; value: string }> = {
  default: {
    label: 'Default',
    value: 'default',
  },
  outline: {
    label: 'Outline',
    value: 'outline',
  },
  inline: {
    label: 'Inline',
    value: 'inline',
  },
  destructive: {
    label: 'Destructive',
    value: 'destructive',
  },
  ghost: {
    label: 'Ghost',
    value: 'ghost',
  },
  secondary: {
    label: 'Secondary',
    value: 'secondary',
  },
}

type LinkType = (options?: {
  appearances?: LinkAppearances[] | false
  disableLabel?: boolean
  disableIcon?: boolean
  overrides?: Record<string, unknown>
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'clear'
}) => Field

export const link: LinkType = ({
  appearances,
  disableLabel = false,
  disableIcon = false,
  overrides = {},
} = {}) => {
  const linkResult: Field = {
    name: 'link',
    type: 'group',
    admin: {
      hideGutter: true,
    },
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'type',
            type: 'radio',
            admin: {
              layout: 'horizontal',
              width: '50%',
            },
            defaultValue: 'reference',
            options: [
              {
                label: { en: 'Internal link', th: 'ลิงก์ภายในเว็บ (Internal link)' },
                value: 'reference',
              },
              {
                label: { en: 'Custom URL', th: 'ลิงก์ภายนอก/ระบุเอง (Custom URL)' },
                value: 'custom',
              },
            ],
          },
          {
            name: 'newTab',
            type: 'checkbox',
            admin: {
              style: {
                alignSelf: 'flex-end',
              },
              width: '50%',
            },
            label: { en: 'Open in new tab', th: 'เปิดลิงก์ในแท็บใหม่' },
          },
        ],
      },
    ],
  }

  /**
   * This link component should be related to
   */
  const relationTo = 'pages'

  const linkTypes: Field[] = [
    {
      name: 'reference',
      type: 'relationship',
      relationTo: [relationTo],
      maxDepth: 1,
      required: true,
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'reference',
      },
      label: { en: 'Document to link to', th: 'เลือกหน้าเว็บที่ต้องการลิงก์ไป' },
    },
    {
      name: 'section',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'reference',
        components: {
          Field: {
            path: '@/components/AdminDashboard/SectionSelect',
            serverProps: {
              relationTo,
            },
          },
        },
      },
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      localized: true,
      label: { en: 'Custom URL', th: 'ระบุ URL' },
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'custom',
      },
    },
  ]

  if (!disableLabel) {
    const linkTypesWithWidths = linkTypes.map((linkType) => ({
      ...linkType,
      admin: {
        ...linkType.admin,
        width: '50%',
      },
    })) as Field[]

    linkResult.fields.push({
      type: 'row',
      fields: [
        ...linkTypesWithWidths,
        {
          name: 'label',
          type: 'text',
          localized: true,
          admin: {
            width: '50%',
          },
          label: { en: 'Label', th: 'ข้อความที่แสดง (Label)' },
          required: true,
        },
      ],
    })
  } else {
    linkResult.fields = [...linkResult.fields, ...linkTypes]
  }

  if (!disableIcon) {
    linkResult.fields.push({
      type: 'row',
      fields: [
        icon({
          name: 'iconBefore',
          label: { en: 'Icon Before', th: 'ไอคอนด้านหน้า' },
        }),
        icon({
          name: 'iconAfter',
          label: { en: 'Icon After', th: 'ไอคอนด้านหลัง' },
        }),
      ],
    })
  }

  if (appearances !== false) {
    let appearanceOptionsToUse = Object.values(appearanceOptions)

    if (appearances) {
      appearanceOptionsToUse = appearances.map((appearance) => appearanceOptions[appearance])
    }

    linkResult.fields.push({
      type: 'row',
      fields: [
        {
          name: 'appearance',
          type: 'select',
          admin: {
            description: 'Choose how the link should be rendered.',
          },
          defaultValue: 'default',
          options: appearanceOptionsToUse,
        },
        {
          name: 'size',
          type: 'select',
          options: ['default', 'sm', 'lg', 'icon', 'clear'],
        },
      ],
    })
  }

  return deepMerge(linkResult, overrides)
}
