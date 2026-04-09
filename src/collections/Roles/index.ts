import type { CollectionConfig, Field } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { authenticated } from '@/access/authenticated'

// Helper for generating standard collection permissions
const standardCollectionAccess = (
  name: string,
  labelTh: string,
  labelEn: string,
  hasSEO: boolean = false,
): Field => ({
  name,
  label: { en: labelEn, th: labelTh },
  type: 'group',
  admin: {
    className: 'compact-group-label',
  },
  fields: [
    {
      name: 'create',
      type: 'checkbox',
      label: { en: 'Create', th: 'สร้าง' },
      defaultValue: false,
      admin: { width: '150px' },
    },
    {
      name: 'update',
      type: 'checkbox',
      label: { en: 'Update', th: 'แก้ไข' },
      defaultValue: false,
      admin: { width: '150px' },
    },
    ...(hasSEO
      ? [
          {
            name: 'manageSEO',
            type: 'checkbox',
            label: { en: 'Manage SEO', th: 'สามารถแก้ไข SEOและMeta' },
            defaultValue: false,
            admin: { width: '220px' },
          } as Field,
        ]
      : []),
    {
      name: 'delete',
      type: 'checkbox',
      label: { en: 'Delete', th: 'ลบ' },
      defaultValue: false,
      admin: { width: '150px' },
    },
  ],
})

// Helper for generating tour collection permissions (InterTours, InboundTours)
const tourCollectionAccess = (name: string, labelTh: string, labelEn: string): Field => ({
  name,
  label: { en: labelEn, th: labelTh },
  type: 'group',
  admin: {
    className: 'compact-group-label',
  },
  fields: [
    {
      name: 'create',
      type: 'checkbox',
      label: { en: 'Create', th: 'สร้าง' },
      defaultValue: false,
      admin: { width: '80px' },
    },
    {
      name: 'updateAll',
      type: 'checkbox',
      label: { en: 'Update All Data', th: 'แก้ไขข้อมูลได้ทั้งหมด (รวมโครงสร้าง/หมวดหมู่)' },
      defaultValue: false,
      admin: { width: '310px' },
    },
    {
      name: 'updateTourInfo',
      type: 'checkbox',
      label: {
        en: 'Update Info (Thumb, Banner, Details)',
        th: 'แก้ไข รูป Thumbnail, รูป Hero Banner, รายละเอียดทัวร์',
      },
      defaultValue: false,
      admin: { width: '400px' },
    },
    {
      name: 'manageSEO',
      type: 'checkbox',
      label: { en: 'Manage SEO', th: 'การทำ SEO' },
      defaultValue: false,
      admin: { width: '150px' },
    },
    {
      name: 'delete',
      type: 'checkbox',
      label: { en: 'Delete', th: 'ลบ' },
      defaultValue: false,
      admin: { width: '100px' },
    },
  ],
})

const Roles: CollectionConfig = {
  slug: 'roles',
  labels: {
    singular: { en: 'Role', th: 'บทบาท' },
    plural: { en: 'Roles', th: 'บทบาท' },
  },
  admin: {
    useAsTitle: 'name',
    description: {
      en: 'Manage user roles and their permissions',
      de: 'Verwalten Sie Benutzerrollen und deren Berechtigungen',
    },
    hidden: ({ user }) => {
      if (!user) return true
      return user.role !== 'admin'
    },
  },
  access: {
    create: isAdmin,
    read: authenticated,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: {
          en: 'The name of the role (e.g., Admin, Editor)',
          de: 'Der Name der Rolle (z.B. Admin, Editor)',
        },
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: {
          en: 'The identifier for the role (e.g., admin, editor)',
          de: 'Die Kennung für die Rolle (z.B. admin, editor)',
        },
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.name) {
              return data.name
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: {
          en: 'A description of what this role can do',
          de: 'Eine Beschreibung der Berechtigungen dieser Rolle',
        },
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          name: 'permissions',
          label: { en: '🌐 Global Permissions', th: '🌐 ระบบทั่วไป' },
          fields: [
            {
              name: 'canManageContent',
              type: 'checkbox',
              defaultValue: false,
              label: { en: 'Can Manage Contents', th: 'จัดการเนื้อหาทั่วไป (Global)' },
              admin: {
                description: {
                  en: 'Can create and edit basic content (Wait: consider using collection list instead)',
                  de: 'Kann Inhalte erstellen und bearbeiten',
                },
              },
            },
            {
              name: 'canPublish',
              type: 'checkbox',
              defaultValue: false,
              label: { en: 'Can Publish Content', th: 'เผยแพร่เนื้อหา' },
            },
            {
              name: 'canManageUsers',
              type: 'checkbox',
              defaultValue: false,
              label: { en: 'Can Manage Users', th: 'จัดการผู้ใช้งาน' },
            },
            {
              name: 'canManageRedirects',
              type: 'checkbox',
              defaultValue: false,
              label: { en: 'Can Manage Redirects', th: 'การตั้งค่า Redirects' },
            },
            {
              name: 'canManageDesign',
              type: 'checkbox',
              defaultValue: true,
              label: { en: 'Can Manage Design', th: 'จัดการดีไซน์หน้าเว็บ' },
              admin: {
                description: {
                  en: 'Can change Design Version, add/remove Blocks on pages',
                  th: 'เปลี่ยน Design Version, เพิ่ม/ลบ Block ในหน้าเว็บได้',
                },
              },
            },
            {
              name: 'canViewActivityLogs',
              type: 'checkbox',
              defaultValue: false,
              label: { en: 'Can View Activity Logs', th: 'ดูประวัติการใช้งานระบบ' },
              admin: {
                description: {
                  en: 'Can view activity logs (system history)',
                  th: 'สามารถดู activity logs (ประวัติกิจกรรมระบบ)',
                },
              },
            },
          ],
        },
        {
          name: 'collectionAccess',
          label: { en: '📂 Standard Collections', th: '📂 สิทธิ์หน้าธรรมดา' },
          description: {
            en: 'Access control for standard content collections',
            th: 'ตั้งค่าการเข้าถึงแยกรายเมนู (สร้าง / แก้ไข / ลบ)',
          },
          fields: [
            {
              name: 'rolePresetsStandard',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/collections/Roles/ui/RolePresets.client#SelectAllStandard',
                },
              },
            },
            standardCollectionAccess('pages', 'หน้าเว็บ (Pages)', 'Pages'),
            standardCollectionAccess('posts', 'บทความ (Posts)', 'Posts', true),
            standardCollectionAccess('media', 'สื่อ/รูปภาพ (Media)', 'Media'),
            standardCollectionAccess('categories', 'หมวดหมู่บทความ (Categories)', 'Categories'),
            standardCollectionAccess(
              'tourCategories',
              'หมวดหมู่ทัวร์ (Tour Categories)',
              'Tour Categories',
            ),
            standardCollectionAccess(
              'programTours',
              'โปรแกรมทัวร์ (Program Tours)',
              'Program Tours',
            ),
            standardCollectionAccess(
              'galleryAlbums',
              'อัลบั้มรูปภาพ (Gallery Albums)',
              'Gallery Albums',
            ),
            standardCollectionAccess('tags', 'แท็ก (Tags)', 'Tags'),
            standardCollectionAccess(
              'testimonials',
              'รีวิวจากลูกค้า (Testimonials)',
              'Testimonials',
            ),
            standardCollectionAccess('bookings', 'รายการจอง (Bookings)', 'Bookings'),
            standardCollectionAccess('festivals', 'เทศกาล (Festivals)', 'Festivals'),
            standardCollectionAccess('airlines', 'สายการบิน (Airlines)', 'Airlines'),
            standardCollectionAccess('tourGroups', 'กลุ่มทัวร์ (Tour Groups)', 'Tour Groups'),
            standardCollectionAccess(
              'customLandingPages',
              'หน้าพิเศษ (Custom Landing Pages)',
              'Custom Landing Pages',
            ),
          ],
        },
        {
          name: 'tourAccess',
          label: { en: '✈️ Tour Collections', th: '✈️ สิทธิ์หน้าทัวร์' },
          description: {
            en: 'Special access control for core tour pages (InterTours / InboundTours)',
            th: 'สิทธิ์พิเศษเฉพาะเจาะจงสำหรับระบบจัดการทัวร์หลัก',
          },
          fields: [
            {
              name: 'rolePresetsTours',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/collections/Roles/ui/RolePresets.client#SelectAllTours',
                },
              },
            },
            tourCollectionAccess(
              'intertours',
              'ทัวร์ต่างประเทศ (International Tours)',
              'International Tours',
            ),
            tourCollectionAccess('inboundTours', 'ทัวร์ในประเทศ (Inbound Tours)', 'Inbound Tours'),
          ],
        },
      ],
    },
  ],
  timestamps: true,
}

export default Roles
