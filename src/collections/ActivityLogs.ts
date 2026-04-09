import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access/isAdmin'
import { hasPermission } from '@/utilities/checkPermission'

/**
 * ActivityLogs — ระบบ Activity Log
 *
 * เก็บ log การ สร้าง/แก้ไข/ลบ/login ทุก collection + globals
 * - Immutable: admin/ผู้มีสิทธิ์ดูได้อย่างเดียว เพิ่มลบแก้ไขไม่ได้
 * - Fire-and-forget: เขียน log แบบ async ไม่ block request หลัก
 *
 * NOTE: เพิ่ม permission 'canViewActivityLogs' ใน Roles collection
 * เพื่อให้ role อื่นนอกจาก admin สามารถดู activity logs ได้
 * โดยไม่ต้องแก้ code — แค่ไปติ๊กใน admin panel
 */
export const ActivityLogs: CollectionConfig = {
  slug: 'activity-logs',
  labels: {
    singular: 'Activity Log',
    plural: 'Activity Logs',
  },
  access: {
    // Admin หรือ role ที่มี canViewActivityLogs เห็นได้
    read: (args) => isAdmin(args) || hasPermission('canViewActivityLogs')(args),
    // ห้าม create/update/delete ผ่าน API — log ถูกเขียนจาก hooks เท่านั้น
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  admin: {
    group: 'System',
    defaultColumns: ['action', 'targetCollection', 'documentTitle', 'user', 'timestamp'],
    description: {
      th: 'บันทึกกิจกรรมระบบ — สร้าง แก้ไข ลบ เข้าสู่ระบบ (อัตโนมัติ แก้ไขไม่ได้)',
      en: 'System activity logs — create, update, delete, login (auto-generated, immutable)',
    },
    components: {
      beforeListTable: ['@/components/ExportActivityLogsButton#ExportActivityLogsButton'],
    },
  },
  fields: [
    {
      name: 'action',
      type: 'select',
      required: true,
      options: [
        { label: 'สร้าง (Create)', value: 'create' },
        { label: 'แก้ไข (Update)', value: 'update' },
        { label: 'ลบ (Delete)', value: 'delete' },
        { label: 'เข้าสู่ระบบ (Login)', value: 'login' },
      ],
      index: true,
    },
    {
      name: 'targetCollection',
      type: 'text',
      required: true,
      label: 'Collection / Global',
      index: true,
      admin: {
        description: 'ชื่อ collection หรือ global ที่ถูกแก้ไข',
      },
    },
    {
      name: 'documentId',
      type: 'text',
      label: 'Document ID',
      admin: {
        description: 'ID ของ document ที่ถูกแก้ไข',
      },
    },
    {
      name: 'documentTitle',
      type: 'text',
      label: 'Document Title',
      admin: {
        description: 'ชื่อ/slug ของ document (สำหรับอ่านง่าย)',
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      label: 'ผู้ดำเนินการ',
      admin: {
        description: 'ผู้ใช้ที่ทำ action นี้',
      },
    },
    {
      name: 'timestamp',
      type: 'date',
      required: true,
      index: true,
      label: 'เวลา',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'changes',
      type: 'json',
      label: 'Changes',
      admin: {
        description: 'Top-level fields ที่เปลี่ยนแปลง (เฉพาะ update)',
      },
    },
  ],
  timestamps: false, // ใช้ field timestamp ของเราเอง ไม่ต้อง createdAt/updatedAt
}
