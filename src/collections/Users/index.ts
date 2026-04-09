import { CollectionConfig, APIError } from 'payload'

import { authenticated } from '@/access/authenticated'
import { isAdmin, isAdminFieldLevel } from '@/access/isAdmin'
import { isAdminOrSelf } from '@/access/isAdminOrCreatedBy'
import { checkRole } from '@/utilities/checkRole'

import { createActivityAfterLogin } from '@/hooks/activityLog'

async function findRole(payload: any, slug: string) {
  const { docs } = await payload.find({
    collection: 'roles',
    where: {
      slug: {
        equals: slug,
      },
    },
    overrideAccess: true,
  })
  return docs[0] || null
}

const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: { en: 'User', th: 'ผู้ใช้' },
    plural: { en: 'Users', th: 'ผู้ใช้' },
  },
  auth: {
    maxLoginAttempts: 5, // ล็อคหลังใส่ผิด 5 ครั้ง
    lockTime: 600_000, // ล็อค 10 นาที (ms)
    tokenExpiration: 28800, // 8 ชั่วโมง (ทำงานได้ทั้งวัน)
  },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
  },
  access: {
    create: isAdmin,
    read: authenticated,
    update: isAdminOrSelf,
    delete: isAdminOrSelf,
    /**
     * Limit the access to the admin dashboard here
     */
    admin: ({ req: { user } }) => checkRole(['admin', 'editor', 'agent_starter'], user),
  },
  hooks: {
    afterLogin: [createActivityAfterLogin],
    beforeValidate: [
      // Password strength validation
      ({ req, data = {}, operation }) => {
        if ((operation === 'create' || operation === 'update') && data.password) {
          const pw = data.password
          const errors: string[] = []
          
          // ตรวจสอบว่าระบบหรือ Admin กำลังใช้ภาษาไทยหรืออังกฤษอยู่
          const isEn = req?.i18n?.language === 'en' || (req as any)?.locale === 'en'

          if (pw.length < 8) errors.push(isEn ? 'At least 8 characters' : 'อย่างน้อย 8 ตัวอักษร')
          if (!/[A-Z]/.test(pw)) errors.push(isEn ? 'At least 1 uppercase letter (A-Z)' : 'ตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว (A-Z)')
          if (!/[a-z]/.test(pw)) errors.push(isEn ? 'At least 1 lowercase letter (a-z)' : 'ตัวพิมพ์เล็กอย่างน้อย 1 ตัว (a-z)')
          if (!/[0-9]/.test(pw)) errors.push(isEn ? 'At least 1 number (0-9)' : 'ตัวเลขอย่างน้อย 1 ตัว (0-9)')

          if (errors.length > 0) {
            const title = isEn ? 'Weak Password Rules Info:' : 'รหัสผ่านไม่ปลอดภัย:'
            throw new APIError(`${title} ${errors.join(', ')}`, 400, undefined, true)
          }
        }
        return data
      },
      // Auto-assign role on create
      async ({ req, data = {}, operation }) => {
        if (operation === 'create') {
          try {
            // If roles are already set in the data (e.g., from admin dashboard), don't override them
            if (data.roles && Array.isArray(data.roles) && data.roles.length > 0) {
              req.payload.logger.info('User already has roles assigned, keeping existing roles')
              return data
            }

            const { totalDocs } = await req.payload.find({
              collection: 'users',
              limit: 0,
            })

            // Determine which role to assign. First user should be admin. Emails with domain
            // in ALLOWED_EMAIL_DOMAINS will be assigned admin as well
            const isAdmin =
              totalDocs === 0 ||
              (data.email &&
                process.env.ALLOWED_EMAIL_DOMAINS?.split(',').includes(data.email.split('@')[1]))

            // Find the appropriate role
            const role = await findRole(req.payload, isAdmin ? 'admin' : 'editor')

            if (role?.id) {
              req.payload.logger.info(`Assigning ${role.name}, id: ${role.id} role to new user`)
              return {
                ...data,
                roles: [role.id],
              }
            } else {
              req.payload.logger.error('No suitable role found for user')
            }
          } catch (error) {
            req.payload.logger.error(`Error in beforeValidate hook: ${error}`)
          }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'roles',
      type: 'relationship',
      relationTo: 'roles',
      hasMany: true,
      required: false,
      saveToJWT: true,
      access: {
        create: () => true,
        update: isAdminFieldLevel,
        read: () => true,
      },
      admin: {
        position: 'sidebar',
        allowCreate: false,
        description: {
          en: 'User roles determine access permissions.',
          th: 'บทบาทของผู้ใช้ กำหนดสิทธิ์การเข้าถึง',
        },
        // This field will be hidden in the create first user dialog
        // but visible when editing users or creating subsequent users
        condition: (_, __, ctx) => !!ctx.user?.id,
      },
    },
    {
      name: 'sub',
      type: 'text',
      admin: {
        description: 'This is the Oauth2 sub field',
        hidden: true,
      },
      index: true,
      access: {
        update: isAdminFieldLevel,
      },
    },
  ],
  timestamps: true,
}

export default Users
