import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { canAccessCollection } from '../access/isAgentStarter'
import { serverUrl as NEXT_PUBLIC_SERVER_URL } from '@/config/server'
import {
    MetaDescriptionField,
    MetaImageField,
    MetaTitleField,
    OverviewField,
    PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const CustomLandingPages: CollectionConfig = {
    slug: 'custom-landing-pages',
    labels: {
        singular: { en: 'Landing Page', th: 'แลนดิ้งเพจ' },
        plural: { en: 'Landing Pages', th: 'แลนดิ้งเพจ' },
    },
    access: {
        create: canAccessCollection('customLandingPages', 'create'),
        delete: canAccessCollection('customLandingPages', 'delete'),
        read: anyone,
        update: canAccessCollection('customLandingPages', 'update'),
    },
    versions: { drafts: false, maxPerDoc: 5 },
    admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'slug'],
        group: { en: 'Tours', th: 'ทัวร์' },
        preview: (data) => {
            const slug = typeof data?.slug === 'string' ? data.slug : ''
            return slug ? `${NEXT_PUBLIC_SERVER_URL}/custom-landingpage/${slug}` : ''
        },
    },
    fields: [
        {
            name: 'title',
            type: 'text',
            required: true,
            label: { en: 'Landing Page Name', th: 'ชื่อแลนดิ้งเพจ' },
            admin: {
                description: { en: 'Page heading, e.g., \"Sakura Tour\", \"New Year Tour\"', th: 'ชื่อที่จะแสดงเป็น heading บนหน้าเว็บ เช่น "ทัวร์ซากุระ", "ทัวร์ปีใหม่"' },
            },
        },
        {
            name: 'slug',
            type: 'text',
            required: true,
            unique: true,
            label: 'Slug',
            admin: {
                description: { en: 'URL slug e.g., sakura-tour → /custom-landingpage/sakura-tour', th: 'URL slug เช่น sakura-tour → /custom-landingpage/sakura-tour' },
            },
        },
        {
            name: 'description',
            type: 'richText',
            label: { en: 'Tour Details', th: 'รายละเอียดทัวร์' },
            admin: {
                description: { en: 'Description displayed below Hero Banner', th: 'รายละเอียดที่จะแสดงใต้ Hero Banner' },
            },
        },
        {
            name: 'heroBanner',
            type: 'upload',
            relationTo: 'media',
            label: 'Hero Banner',
            admin: {
                description: { en: 'Hero Banner background — recommended 1920×400 px', th: 'รูปพื้นหลัง Hero Banner — ขนาดแนะนำ 1920×400 px' },
            },
        },
        // ============================================
        // Custom Tags
        // ============================================
        {
            name: 'tagDisplayMode',
            type: 'select',
            label: { en: 'Tags Display Mode', th: 'รูปแบบการแสดง Tags' },
            defaultValue: 'all',
            options: [
                { label: { en: 'Show All', th: 'แสดงทั้งหมด' }, value: 'all' },
                { label: { en: 'Slider', th: 'Slider (เลื่อนซ้าย-ขวา)' }, value: 'slider' },
            ],
            admin: {
                description: { en: 'Choose tags display mode — show all (wrap) or slide left-right', th: 'เลือกวิธีแสดง tags — แสดงทั้งหมดแบบ wrap หรือเลื่อนซ้าย-ขวา' },
            },
        },
        {
            name: 'customTags',
            type: 'array',
            label: 'Custom Tags',
            admin: {
                description: { en: 'Add tags below tour details — choose from 3 tag types', th: 'เพิ่ม tag ที่จะแสดงใต้รายละเอียดทัวร์ — เลือกประเภท tag ได้ 3 แบบ' },
            },
            fields: [
                {
                    name: 'tagType',
                    type: 'select',
                    required: true,
                    label: { en: 'Tag Type', th: 'ประเภท Tag' },
                    defaultValue: 'manual',
                    options: [
                        { label: { en: 'Custom', th: 'กำหนดเอง' }, value: 'manual' },
                        { label: { en: 'Preset (Cheapest, Popular, etc.)', th: 'Preset (ราคาถูก, ยอดนิยม ฯลฯ)' }, value: 'preset' },
                        { label: { en: 'Landing Page Link', th: 'ลิงก์ Landing Page อื่น' }, value: 'landingPage' },
                    ],
                },
                // --- Manual fields ---
                {
                    name: 'label',
                    type: 'text',
                    label: { en: 'Text', th: 'ข้อความ' },
                    admin: {
                        description: { en: 'Tag display text, e.g., \"Sakura Tour\"', th: 'ข้อความที่แสดงใน Tag เช่น "ทัวร์ซากุระ"' },
                        condition: (data, siblingData) => siblingData?.tagType === 'manual',
                    },
                },
                {
                    name: 'link',
                    type: 'text',
                    label: { en: 'Link (URL)', th: 'ลิงก์ (URL)' },
                    admin: {
                        description: { en: 'URL, e.g., /intertours/japan or https://...', th: 'URL เช่น /intertours/japan หรือ https://...' },
                        condition: (data, siblingData) => siblingData?.tagType === 'manual',
                    },
                },
                {
                    name: 'newTab',
                    type: 'checkbox',
                    label: { en: 'Open in New Tab', th: 'เปิดในแท็บใหม่' },
                    defaultValue: false,
                    admin: {
                        condition: (data, siblingData) => siblingData?.tagType === 'manual',
                    },
                },
                // --- Preset fields ---
                {
                    name: 'preset',
                    type: 'select',
                    label: { en: 'Select Preset', th: 'เลือก Preset' },
                    options: [
                        { label: { en: 'Cheapest (Low to High)', th: 'ราคาถูก (เรียงราคาต่ำ→สูง)' }, value: 'price' },
                        { label: { en: 'Nearest Departure', th: 'ใกล้เดินทาง (เรียงตามวันเดินทาง)' }, value: 'periodlowtohight' },
                    ],
                    admin: {
                        description: { en: 'Text becomes \"Page Name + preset\" with ?sort=... link', th: 'ข้อความจะเป็น "ชื่อหน้า + preset" เช่น "Test Promotion ราคาถูก" และลิงก์เป็น ?sort=...' },
                        condition: (data, siblingData) => siblingData?.tagType === 'preset',
                    },
                },
                // --- Landing Page reference ---
                {
                    name: 'landingPageRef',
                    type: 'relationship',
                    relationTo: 'custom-landing-pages',
                    label: { en: 'Select Landing Page', th: 'เลือก Landing Page' },
                    admin: {
                        description: { en: 'Uses Landing Page name as tag text and links to that page', th: 'ดึงชื่อ Landing Page มาเป็นข้อความ tag และลิงก์ไปที่หน้านั้น' },
                        condition: (data, siblingData) => siblingData?.tagType === 'landingPage',
                    },
                },
            ],
        },
        // ============================================
        // Tabs: Programs + SEO
        // ============================================
        {
            type: 'tabs',
            tabs: [
                {
                    label: { en: 'Program Tour', th: 'โปรแกรมทัวร์' },
                    fields: [
                        {
                            name: 'programs',
                            type: 'relationship',
                            relationTo: 'program-tours',
                            hasMany: true,
                            label: { en: 'Select Tour Program', th: 'เลือกโปรแกรมทัวร์' },
                            admin: {
                                description: { en: 'Select from \"Program Tours\" synced from API — multiple selection', th: 'เลือกโปรแกรมทัวร์จาก collection "โปรแกรมทัวร์" ที่ sync มาจาก API — สามารถเลือกได้หลายตัว' },
                            },
                        },
                    ],
                },
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
                        }),
                        MetaImageField({
                            relationTo: 'media',
                        }),
                        MetaDescriptionField({
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
