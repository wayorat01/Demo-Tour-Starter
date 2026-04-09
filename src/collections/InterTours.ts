import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import {
    requireDesignPermission,
    requireTourInfoUpdate,
    requireTourSEO,
    requireTourUpdateAll,
    canAccessTour,
} from '../access/isAgentStarter'
import { preventDeleteIfInUse } from './hooks/preventDelete'
import {
    MetaDescriptionField,
    MetaImageField,
    MetaTitleField,
    OverviewField,
    PreviewField,
} from '@payloadcms/plugin-seo/fields'
import {
    revalidateToursAfterChange,
    revalidateToursAfterDelete,
} from './hooks/revalidateInterTours'

export const InterTours: CollectionConfig = {
    slug: 'intertours',
    labels: {
        singular: { en: 'International Tour', th: 'ทัวร์ต่างประเทศ' },
        plural: { en: 'International Tours', th: 'ทัวร์ต่างประเทศ' },
    },
    access: {
        create: canAccessTour('intertours', 'create'),
        delete: canAccessTour('intertours', 'delete'),
        read: anyone,
        update: authenticated, // field-level access is used for granular control
    },
    versions: { drafts: false, maxPerDoc: 5 },
    hooks: {
        beforeDelete: [
            preventDeleteIfInUse([
                { collection: 'intertours', field: 'parentCountry', label: 'International Tours (Cities)' },
            ]),
        ],
        afterDelete: [revalidateToursAfterDelete],
        afterChange: [revalidateToursAfterChange],
        beforeChange: [
            ({ data }) => {
                if (data) {
                    if (Array.isArray(data.tourPrograms)) {
                        for (const program of data.tourPrograms) {
                            // Auto-fill countryName from InterTour title
                            if (data.title) {
                                program.countryName = data.title
                            }

                            // Sanitize tags — remove null/undefined/invalid entries
                            if (Array.isArray(program.tags)) {
                                program.tags = program.tags.filter((t: any) => {
                                    if (t == null) return false
                                    if (typeof t === 'object' && !t.id) return false
                                    return true
                                })
                            }
                        }
                    }

                    // Auto-fill meta.image from thumbnail if not set
                    if (data.thumbnail && !data.meta?.image) {
                        if (!data.meta) data.meta = {}
                        const thumbId = typeof data.thumbnail === 'object' ? data.thumbnail.id : data.thumbnail
                        if (thumbId) data.meta.image = thumbId
                    }
                }
                return data
            },
        ],
    },
    admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'title_en', 'slug', 'category', 'parentCountry', 'tourCount', 'isActive'],
        group: { en: 'Tours', th: 'ทัวร์' },
        components: {
            beforeListTable: ['@/components/ImportInterToursButton#ImportInterToursButton'],
        },
    },
    fields: [
        {
            name: 'title',
            type: 'text',
            required: true,
            label: { en: 'Tour Title', th: 'ชื่อทัวร์' },
            access: { update: requireTourUpdateAll('interTours') },
            admin: {
                description: { en: 'e.g., Japan Tour, Korea Tour (displayed on main website)', th: 'e.g., ทัวร์ญี่ปุ่น, ทัวร์เกาหลี (ชื่อนี้จะแสดงบนหน้าเว็บหลัก)' },
            },
            hooks: {
                afterRead: [
                    ({ value }) => {
                        // Compatibility layer: if DB still has old localized object { en: '...' }
                        if (typeof value === 'object' && value !== null) {
                            return value.th || ''
                        }
                        return value
                    },
                ],
            },
        },
        {
            name: 'title_en',
            type: 'text',
            label: { en: 'Tour Title — en', th: 'ชื่อทัวร์ (EN)' },
            access: { update: requireTourUpdateAll('interTours') },
            admin: {
                description: { en: 'e.g., Japan Tour, Korea Tour (English data storage)', th: 'e.g., Japan Tour, Korea Tour (เก็บข้อมูลภาษาอังกฤษไว้เฉยๆ)' },
            },
        },
        {
            name: 'slug',
            type: 'text',
            required: true,
            unique: true,
            label: { en: 'Slug', th: 'ลิงก์ Slug (URL)' },
            access: { update: requireTourUpdateAll('interTours') },
            admin: {
                description: { en: 'URL slug (will be synced from API in the future)', th: 'URL slug (จะสังค์จาก API ในอนาคต)' },
            },
        },
        {
            name: 'thumbnail',
            type: 'upload',
            relationTo: 'media',
            label: { en: 'Thumbnail', th: 'รูปประจำทัวร์' },
            access: { update: requireTourInfoUpdate('intertours') },
            admin: {
                description:
                    { en: 'Tour image for listing page and cards — recommended 800×600 px (4:3 ratio)\n⚠️ Please use copyright-free or properly licensed images only', th: 'รูปภาพประจำทัวร์ สำหรับแสดงในหน้ารวมและ Card — ขนาดแนะนำ 800×600 px (อัตราส่วน 4:3)\n⚠️ กรุณาใช้รูปภาพที่ไม่มีลิขสิทธิ์ หรือมีสิทธิ์ใช้งานอย่างถูกต้องเท่านั้น' },
            },
        },
        {
            name: 'description',
            type: 'richText',
            label: { en: 'Tour Description — th', th: 'รายละเอียดทัวร์ — th' },
            access: { update: requireTourInfoUpdate('intertours') },
            admin: {
                description: { en: 'Tour description displayed below Hero Banner on /intertours/[slug] page', th: 'รายละเอียดทัวร์ที่จะแสดงใต้ Hero Banner ในหน้า /intertours/[slug] (หน้าเว็บดึงตัวนี้)' },
            },
            hooks: {
                afterRead: [
                    ({ value }) => {
                        // Compatibility for old localized objects
                        if (typeof value === 'object' && value !== null && !value.root) {
                            return value.th || value
                        }
                        return value
                    },
                ],
            },
        },

        {
            name: 'category',
            type: 'relationship',
            relationTo: 'tour-categories',
            required: true,
            label: { en: 'Category', th: 'หมวดหมู่ทัวร์' },
            access: { update: requireTourUpdateAll('interTours') },
            admin: {
                description: { en: 'Select tour category (Asia, Europe, etc.)', th: 'เลือกหมวดหมู่ทัวร์ (เอเชีย, ยุโรป ฯลฯ)' },
            },
        },
        {
            name: 'parentCountry',
            type: 'relationship',
            relationTo: 'intertours',
            label: { en: 'Parent Country', th: 'ประเทศหลัก (Parent Country)' },
            access: { update: requireTourUpdateAll('interTours') },
            admin: {
                description: { en: 'If \"City\" → select parent country / If \"Country\" → leave empty', th: 'ถ้าเป็น "เมือง" → เลือกประเทศหลัก (เช่น ทัวร์โตเกียว → ทัวร์ญี่ปุ่น) / ถ้าเป็น "ประเทศ" → ปล่อยว่าง' },
            },
        },
        {
            name: 'flagIcon',
            type: 'upload',
            relationTo: 'media',
            label: { en: 'Flag Icon', th: 'ไอคอนธงชาติ' },
            admin: {
                description: { en: 'Country flag or tour icon', th: 'รูปธงชาติหรือไอคอนทัวร์' },
            },
        },
        {
            name: 'flagCode',
            type: 'text',
            label: { en: 'Flag Code', th: 'รหัสธงชาติ' },
            access: { update: requireTourUpdateAll('interTours') },
            admin: {
                description: { en: '2-letter flag code, e.g., JP, KR (if available)', th: 'รหัสธงชาติ 2 ตัวอักษร เช่น JP, KR (ถ้ามี)' },
            },
        },
        {
            name: 'heroBanner',
            type: 'upload',
            relationTo: 'media',
            label: { en: 'Hero Banner', th: 'รูป Hero Banner' },
            access: { update: requireTourInfoUpdate('intertours') },
            admin: {
                description: { en: 'Hero Banner background image — recommended 1920×400 px (~5:1 ratio)', th: 'รูปพื้นหลัง Hero Banner หน้าประเทศ — ขนาดแนะนำ 1920×400 px (อัตราส่วน ~5:1)' },
            },
        },
        {
            name: 'tourCount',
            type: 'number',
            defaultValue: 0,
            label: { en: 'Tour Count', th: 'จำนวนโปรแกรมทัวร์' },
            access: { update: requireTourUpdateAll('interTours') },
            admin: {
                description: { en: 'Tour program count (auto-counted from ProgramTours matching this slug)', th: 'จำนวนโปรแกรมทัวร์ (นับอัตโนมัติจาก ProgramTours ที่ countrySlug ตรงกับ slug)' },
                readOnly: true,
            },
        },
        {
            name: 'isActive',
            type: 'checkbox',
            defaultValue: true,
            label: { en: 'Active', th: 'เปิดใช้งาน' },
            access: { update: requireTourInfoUpdate('intertours') },
            admin: {
                description: { en: 'Show/hide this tour in the menu', th: 'แสดง/ซ่อนทัวร์นี้ในเมนู' },
            },
        },

        {
            name: 'externalApiId',
            type: 'text',
            label: { en: 'External API ID', th: 'External API ID' },
            access: { update: requireTourUpdateAll('interTours') },
            admin: {
                description: { en: 'ID from external API (for future sync)', th: 'ID จาก API ภายนอก (สำหรับการเชื่อมต่อในอนาคต)' },
                condition: () => false, // Hidden for now
            },
        },

        // ============================================
        // Tabs: Tour Programs + SEO
        // ============================================
        {
            type: 'tabs',
            tabs: [
                {
                    name: 'meta',
                    label: { en: 'SEO', th: 'การทำ SEO' },
                    fields: [
                        OverviewField({
                            titlePath: 'meta.title',
                            descriptionPath: 'meta.description',
                            imagePath: 'meta.image',
                        }),
                        MetaTitleField({
                            hasGenerateFn: true,
                            overrides: { access: { update: requireTourSEO('intertours') } },
                        }),
                        MetaImageField({
                            relationTo: 'media',
                            hasGenerateFn: true,
                            overrides: { access: { update: requireTourSEO('intertours') } },
                        }),
                        MetaDescriptionField({
                            hasGenerateFn: true,
                            overrides: { access: { update: requireTourSEO('intertours') } },
                        }),
                        PreviewField({
                            hasGenerateFn: true,
                            titlePath: 'meta.title',
                            descriptionPath: 'meta.description',
                        }),
                    ],
                },
            ],
        },
    ],
}
