import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { canAccessCollection } from '../access/isAgentStarter'
import { slugField } from '@/fields/slug'
import {
    MetaDescriptionField,
    MetaImageField,
    MetaTitleField,
    OverviewField,
    PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { serverUrl as NEXT_PUBLIC_SERVER_URL } from '@/config/server'

export const GalleryAlbums: CollectionConfig = {
    slug: 'gallery-albums',
    labels: {
        singular: { en: 'Gallery Album', th: 'อัลบั้มรูปภาพ' },
        plural: { en: 'Gallery Albums', th: 'อัลบั้มรูปภาพ' },
    },
    access: {
        create: canAccessCollection('galleryAlbums', 'create'),
        delete: canAccessCollection('galleryAlbums', 'delete'),
        read: anyone,
        update: canAccessCollection('galleryAlbums', 'update'),
    },
    versions: { drafts: false, maxPerDoc: 5 },
    admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'slug', 'updatedAt'],
        livePreview: {
            url: ({ data }) => {
                const slug = typeof data?.slug === 'string' ? data.slug : ''
                return `${NEXT_PUBLIC_SERVER_URL}/gallery/${slug}`
            },
        },
        preview: (data) => {
            const slug = typeof data?.slug === 'string' ? data.slug : ''
            return `${NEXT_PUBLIC_SERVER_URL}/gallery/${slug}`
        },
    },
    fields: [
        {
            name: 'title',
            type: 'text',
            required: true,
            label: { en: 'Album Name', th: 'ชื่ออัลบั้ม' },
            localized: true,
            admin: {
                description: { en: 'Album name (e.g., London, Paris, Tokyo)', th: 'ชื่ออัลบั้ม (เช่น London, Paris, Tokyo)' },
            },
        },

        ...slugField(),


        {
            name: 'isHidden',
            type: 'checkbox',
            defaultValue: false,
            label: { en: 'Hide Album', th: 'ซ่อนอัลบั้ม' },
            admin: {
                description: { en: 'Hide this album from website (data not deleted)', th: 'ซ่อนอัลบั้มนี้จากหน้าเว็บ (ไม่ลบข้อมูล)' },
                position: 'sidebar',
            },
        },
        {
            name: 'coverImage',
            type: 'upload',
            relationTo: 'media',
            required: true,
            label: { en: 'Cover Image', th: 'รูปปกอัลบั้ม' },
            admin: {
                description: { en: 'Album cover image (recommended 3:4 portrait ratio)', th: 'รูปปกอัลบั้ม (แนะนำอัตราส่วน 3:4 แนวตั้ง)' },
            },
        },
        {
            type: 'tabs',
            tabs: [
                {
                    label: { en: 'Images', th: 'รูปภาพ' },
                    fields: [
                        {
                            name: 'images',
                            type: 'array',
                            label: { en: 'Album Images', th: 'รูปภาพในอัลบั้ม' },
                            labels: {
                                singular: { en: 'Image', th: 'รูปภาพ' },
                                plural: { en: 'Images', th: 'รูปภาพทั้งหมด' },
                            },
                            admin: {
                                description: { en: 'All images in album', th: 'รูปภาพทั้งหมดในอัลบั้ม' },
                            },
                            fields: [
                                {
                                    name: 'image',
                                    type: 'upload',
                                    relationTo: 'media',
                                    required: true,
                                    label: { en: 'Image', th: 'รูปภาพ' },
                                },
                                {
                                    name: 'caption',
                                    type: 'text',
                                    localized: true,
                                    label: { en: 'Caption', th: 'คำอธิบายรูปภาพ' },
                                    admin: {
                                        description: { en: 'Image caption (optional)', th: 'คำอธิบายรูปภาพ (optional)' },
                                    },
                                },
                            ],
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
