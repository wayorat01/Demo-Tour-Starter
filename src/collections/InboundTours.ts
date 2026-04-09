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

export const InboundTours: CollectionConfig = {
    slug: 'inbound-tours',
    labels: {
        singular: { en: 'Inbound Tour', th: 'ทัวร์ในประเทศ' },
        plural: { en: 'Inbound Tours', th: 'ทัวร์ในประเทศ' },
    },
    access: {
        create: canAccessTour('inboundTours', 'create'),
        delete: canAccessTour('inboundTours', 'delete'),
        read: anyone,
        update: authenticated,
    },
    versions: { drafts: false, maxPerDoc: 5 },
    hooks: {
        beforeDelete: [
            preventDeleteIfInUse([
                { collection: 'inbound-tours', field: 'parentCountry', label: 'Inbound Tours (Cities)' },
            ]),
        ],
        afterDelete: [revalidateToursAfterDelete],
        afterChange: [revalidateToursAfterChange],
        beforeChange: [
            ({ data }) => {
                if (data) {
                    if (Array.isArray(data.tourPrograms)) {
                        for (const program of data.tourPrograms) {
                            // Auto-fill countryName from InboundTour title
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

                    // Auto-fill meta.image from featuredImage if not set
                    if (data.featuredImage && !data.meta?.image) {
                        if (!data.meta) data.meta = {}
                        const imgId = typeof data.featuredImage === 'object' ? data.featuredImage.id : data.featuredImage
                        if (imgId) data.meta.image = imgId
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
            beforeListTable: ['@/components/ImportInboundToursButton#ImportInboundToursButton'],
        },
    },
    fields: [
        {
            name: 'title',
            type: 'text',
            required: true,
            label: { en: 'Tour Title', th: 'ชื่อทัวร์' },
            access: { update: requireTourUpdateAll('inboundTours') },
            admin: {
                description: { en: 'e.g., Chiang Mai Tour, Phuket Tour (displayed on main website)', th: 'e.g., ทัวร์เชียงใหม่, ทัวร์ภูเก็ต (ชื่อนี้จะแสดงบนหน้าเว็บหลัก)' },
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
            access: { update: requireTourUpdateAll('inboundTours') },
            admin: {
                description: { en: 'e.g., Chiang Mai Tour, Phuket Tour (English data storage)', th: 'e.g., Chiang Mai Tour, Phuket Tour (เก็บข้อมูลภาษาอังกฤษไว้เฉยๆ)' },
            },
        },
        {
            name: 'slug',
            type: 'text',
            required: true,
            unique: true,
            label: { en: 'Slug', th: 'ลิงก์ Slug (URL)' },
            access: { update: requireTourUpdateAll('inboundTours') },
            admin: {
                description: { en: 'URL slug (e.g., chiang-mai, phuket)', th: 'URL slug (เช่น chiang-mai, phuket)' },
            },
        },
        {
            name: 'description',
            type: 'richText',
            label: { en: 'Tour Description — th', th: 'รายละเอียดทัวร์ — th' },
            access: { update: requireTourInfoUpdate('inboundTours') },
            admin: {
                description: { en: 'Tour description displayed below Hero Banner', th: 'รายละเอียดทัวร์ที่จะแสดงใต้ Hero Banner' },
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
            required: false,
            label: { en: 'Category', th: 'หมวดหมู่ทัวร์' },
            access: { update: requireTourUpdateAll('inboundTours') },
            admin: {
                description: { en: 'Select tour category (Asia, Europe, etc.)', th: 'เลือกหมวดหมู่ทัวร์ (เอเชีย, ยุโรป ฯลฯ)' },
            },
        },
        {
            name: 'parentCountry',
            type: 'relationship',
            relationTo: 'inbound-tours',
            label: { en: 'Parent Country', th: 'ประเทศหลัก (Parent Country)' },
            access: { update: requireTourUpdateAll('inboundTours') },
            admin: {
                description: { en: 'If \"City\" → select parent country / If \"Country\" → leave empty', th: 'ถ้าเป็น "เมือง" → เลือกประเทศหลัก / ถ้าเป็น "ประเทศ" → ปล่อยว่าง' },
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
            access: { update: requireTourUpdateAll('inboundTours') },
            admin: {
                description: { en: '2-letter flag code, e.g., TH (if available)', th: 'รหัสธงชาติ 2 ตัวอักษร เช่น TH (ถ้ามี)' },
            },
        },
        {
            name: 'heroBanner',
            type: 'upload',
            relationTo: 'media',
            label: { en: 'Hero Banner', th: 'รูป Hero Banner' },
            access: { update: requireTourInfoUpdate('inboundTours') },
            admin: {
                description: { en: 'Hero Banner background — recommended 1920×400 px', th: 'รูปพื้นหลัง Hero Banner — ขนาดแนะนำ 1920×400 px' },
            },
        },
        {
            name: 'featuredImage',
            type: 'upload',
            relationTo: 'media',
            label: { en: 'Featured Image', th: 'รูปประจำทัวร์' },
            access: { update: requireTourInfoUpdate('inboundTours') },
            admin: {
                description: { en: 'Featured thumbnail image for the tour', th: 'รูปภาพขนาดย่อ (Thumbnail) สำหรับปกทัวร์' },
            },
        },
        {
            name: 'tourCount',
            type: 'number',
            defaultValue: 0,
            label: { en: 'Tour Count', th: 'จำนวนโปรแกรมทัวร์' },
            access: { update: requireTourUpdateAll('inboundTours') },
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
            access: { update: requireTourInfoUpdate('inboundTours') },
            admin: {
                description: { en: 'Show/hide this tour in the menu', th: 'แสดง/ซ่อนทัวร์นี้ในเมนู' },
            },
        },

        {
            name: 'externalApiId',
            type: 'text',
            label: { en: 'External API ID', th: 'External API ID' },
            access: { update: requireTourUpdateAll('inboundTours') },
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
                            overrides: { access: { update: requireTourSEO('inboundTours') } },
                        }),
                        MetaImageField({
                            relationTo: 'media',
                            hasGenerateFn: true,
                            overrides: { access: { update: requireTourSEO('inboundTours') } },
                        }),
                        MetaDescriptionField({
                            hasGenerateFn: true,
                            overrides: { access: { update: requireTourSEO('inboundTours') } },
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
