import { Block } from 'payload'
import { FormBlock } from '../Form/config'
import { backgroundColor } from '@/fields/color'
import { designVersionPreview } from '@/components/AdminDashboard/DesignVersionPreview/config'

export const allContactDesignVersions = [
  {
    label: 'WOWTOUR_CONTACT1',
    value: 'WOWTOUR_CONTACT1',
    image: '/admin/previews/contact/WOWTOUR_CONTACT1.webp',
  },
  {
    label: 'WOWTOUR_CONTACT2',
    value: 'WOWTOUR_CONTACT2',
    image: '/admin/previews/contact/WOWTOUR_CONTACT2.jpg',
  },
  {
    label: 'WOWTOUR_CONTACT3',
    value: 'WOWTOUR_CONTACT3',
    image: '/admin/previews/contact/WOWTOUR_CONTACT3.webp',
  },
  {
    label: 'WOWTOUR_CONTACT4',
    value: 'WOWTOUR_CONTACT4',
    image: '/admin/previews/contact/WOWTOUR_CONTACT4.webp',
  },
  {
    label: 'WOWTOUR_CONTACT5',
    value: 'WOWTOUR_CONTACT5',
    image: '/admin/previews/contact/WOWTOUR_CONTACT5.webp',
  },
  {
    label: 'WOWTOUR_CONTACT6',
    value: 'WOWTOUR_CONTACT6',
    image: '/admin/previews/contact/WOWTOUR_CONTACT6.webp',
  },
  {
    label: 'WOWTOUR_CONTACT7',
    value: 'WOWTOUR_CONTACT7',
    image: '/admin/previews/contact/WOWTOUR_CONTACT7.webp',
  },
  {
    label: 'WOWTOUR_CONTACT8',
    value: 'WOWTOUR_CONTACT8',
    image: '/admin/previews/contact/WOWTOUR_CONTACT8.webp',
  },
] as const
export type ContactDesignVersion = (typeof allContactDesignVersions)[number]['value']

export const ContactBlock: Block = {
  slug: 'contact',
  interfaceName: 'ContactBlock',
  imageURL: '/media/preview-contactus2.jpg',
  imageAltText: 'Contact Us Form — ฟอร์มติดต่อเรา',
  labels: {
    singular: 'Contact',
    plural: 'Contacts',
  },
  fields: [
    backgroundColor,
    designVersionPreview(allContactDesignVersions, { defaultValue: 'WOWTOUR_CONTACT2' }),
    {
      type: 'row',
      fields: [
        {
          name: 'heading',
          type: 'text',
          label: { en: 'Heading', th: 'หัวข้อ' },
          defaultValue: 'ติดต่อเรา',
          admin: {
            width: '50%',
            condition: (_, siblingData) => siblingData?.designVersion !== 'WOWTOUR_CONTACT1',
          },
        },
        {
          name: 'subheading',
          type: 'text',
          label: { en: 'Description', th: 'คำอธิบาย' },
          admin: {
            width: '50%',
            placeholder: 'เช่น กรอกข้อมูลด้านล่างเพื่อส่งข้อความติดต่อเรา',
            condition: (_, siblingData) => siblingData?.designVersion !== 'WOWTOUR_CONTACT1',
          },
        },
      ],
    },
    {
      name: 'mapIframe',
      type: 'textarea',
      label: 'Google Maps Embed URL',
      admin: {
        condition: (_, siblingData) => siblingData?.designVersion !== 'WOWTOUR_CONTACT1',
        description: {
          en: 'iframe embed code URL Google Maps https://www.google.com/maps/embed?pb=...',
          th: 'วาง iframe embed code หรือ URL จาก Google Maps เช่น https://www.google.com/maps/embed?pb=...',
        },
      },
    },

    {
      name: 'form',
      label: 'Form',
      type: 'blocks',
      blocks: [FormBlock],
      maxRows: 1,
    },
    {
      name: 'formPreview',
      type: 'ui',
      admin: {
        components: {
          Field: '@/blocks/Contact/FormPreview',
        },
      },
    },
    {
      name: 'showLabels',
      type: 'checkbox',
      label: { en: 'Show Form Labels', th: 'แสดง Label ของฟอร์ม' },
      defaultValue: false,
      admin: {
        description: {
          en: 'label input fields ( placeholder)',
          th: 'เปิดใช้งานเพื่อแสดง label เหนือ input fields (ถ้าปิดจะแสดงเฉพาะ placeholder)',
        },
        condition: (_, siblingData) => siblingData?.designVersion === 'WOWTOUR_CONTACT1',
      },
    },
    {
      name: 'formHeading',
      type: 'text',
      label: { en: 'Form Heading', th: 'หัวข้อฟอร์ม' },
    },
    {
      name: 'contactCardHeading',
      type: 'text',
      label: { en: 'Contact Card Heading', th: 'หัวข้อการ์ดติดต่อ' },
      admin: {
        condition: (_, siblingData) => siblingData?.designVersion === 'WOWTOUR_CONTACT1',
      },
    },
  ],
}
