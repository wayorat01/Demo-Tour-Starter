import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { canAccessCollection } from '../access/isAgentStarter'
import { serverUrl as NEXT_PUBLIC_SERVER_URL } from '@/config/server'
import {
    MetaDescriptionField,
    MetaTitleField,
    OverviewField,
    PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const ProgramTours: CollectionConfig = {
    slug: 'program-tours',
    labels: {
        singular: { en: 'Program Tour', th: 'โปรแกรมทัวร์' },
        plural: { en: 'Program Tours', th: 'โปรแกรมทัวร์' },
    },
    access: {
        create: canAccessCollection('programTours', 'create'),
        delete: canAccessCollection('programTours', 'delete'),
        read: anyone,
        update: canAccessCollection('programTours', 'update'),
    },
    hooks: {
        afterRead: [
            ({ doc }) => {
                const newDoc = { ...doc }

                // Auto-fill displayTitle on read if missing
                if (!newDoc.displayTitle) {
                    const code = newDoc.productCode || ''
                    const name = newDoc.productName || ''
                    newDoc.displayTitle = code ? `${code} — ${name}` : name
                }

                // ===== Auto-populate SEO fields on read if empty =====
                const tourCode = newDoc.productCode || ''
                const tourName = newDoc.productName || ''
                if (!newDoc.meta) newDoc.meta = {}

                const meta = { ...newDoc.meta }

                // Title: "TourCode - TourName" (SEO green zone: 50-60 chars)
                if (!meta.title) {
                    const seoTitle = tourCode ? `${tourCode} - ${tourName}` : tourName
                    meta.title = seoTitle.length > 60
                        ? seoTitle.substring(0, 57) + '...'
                        : seoTitle
                }

                // Description: Tour Highlights (SEO green zone: 100-150 chars)
                if (!meta.description) {
                    const highlight = newDoc.highlight || ''
                    if (highlight) {
                        const clean = highlight.replace(/\s+/g, ' ').trim()
                        meta.description = clean.length > 150
                            ? clean.substring(0, 147) + '...'
                            : clean
                    }
                }

                // Image: Main Image URL (urlPic)
                if (!meta.image && newDoc.urlPic) {
                    meta.image = newDoc.urlPic
                }

                newDoc.meta = meta
                return newDoc
            },
        ],
        beforeChange: [
            ({ data }) => {
                if (data) {
                    // Auto-generate displayTitle
                    const code = data.productCode || ''
                    const name = data.productName || ''
                    data.displayTitle = code ? `${code} — ${name}` : name

                    // ===== Auto-fill SEO fields if empty =====
                    if (!data.meta) data.meta = {}
                    const meta = { ...data.meta }

                    // Title
                    if (!meta.title) {
                        const seoTitle = code ? `${code} - ${name}` : name
                        meta.title = seoTitle.length > 60
                            ? seoTitle.substring(0, 57) + '...'
                            : seoTitle
                    }

                    // Description
                    if (!meta.description) {
                        const highlight = data.highlight || ''
                        if (highlight) {
                            const clean = highlight.replace(/\s+/g, ' ').trim()
                            meta.description = clean.length > 150
                                ? clean.substring(0, 147) + '...'
                                : clean
                        }
                    }

                    // Image
                    if (!meta.image && data.urlPic) {
                        meta.image = data.urlPic
                    }

                    data.meta = meta
                }
                return data
            },
        ],
        afterChange: [
            async ({ doc, previousDoc, req }) => {
                const slugs = new Set<{ type: 'country' | 'city', slug: string }>()
                if (doc.countrySlug) slugs.add({ type: 'country', slug: doc.countrySlug })
                if (doc.citySlug) slugs.add({ type: 'city', slug: doc.citySlug })
                if (previousDoc?.countrySlug && previousDoc.countrySlug !== doc.countrySlug) slugs.add({ type: 'country', slug: previousDoc.countrySlug })
                if (previousDoc?.citySlug && previousDoc.citySlug !== doc.citySlug) slugs.add({ type: 'city', slug: previousDoc.citySlug })

                for (const item of Array.from(slugs)) {
                    try {
                        const isCountry = item.type === 'country'
                        const condition = isCountry
                            ? { slug: { equals: item.slug }, parentCountry: { exists: false } }
                            : { slug: { equals: item.slug }, parentCountry: { exists: true } }

                        const inters = await req.payload.find({ collection: 'intertours', where: condition, limit: 1 })
                        if (inters.docs.length > 0) {
                            const countCond: any = isCountry ? { countrySlug: { equals: item.slug } } : { citySlug: { equals: item.slug } }
                            const countResult = await req.payload.count({ collection: 'program-tours', where: countCond })
                            await req.payload.update({
                                collection: 'intertours',
                                id: inters.docs[0].id,
                                data: { tourCount: countResult.totalDocs },
                                context: { skipAutoTagHook: true }
                            })
                        } else {
                            const inbounds = await req.payload.find({ collection: 'inbound-tours', where: condition, limit: 1 })
                            if (inbounds.docs.length > 0) {
                                const countCond: any = isCountry ? { countrySlug: { equals: item.slug } } : { citySlug: { equals: item.slug } }
                                const countResult = await req.payload.count({ collection: 'program-tours', where: countCond })
                                await req.payload.update({
                                    collection: 'inbound-tours',
                                    id: inbounds.docs[0].id,
                                    data: { tourCount: countResult.totalDocs },
                                    context: { skipAutoTagHook: true }
                                })
                            }
                        }
                    } catch (e) {}
                }
                return doc
            }
        ],
        afterDelete: [
            async ({ doc, req }) => {
                const slugs = new Set<{ type: 'country' | 'city', slug: string }>()
                if (doc.countrySlug) slugs.add({ type: 'country', slug: doc.countrySlug })
                if (doc.citySlug) slugs.add({ type: 'city', slug: doc.citySlug })

                for (const item of Array.from(slugs)) {
                    try {
                        const isCountry = item.type === 'country'
                        const condition = isCountry
                            ? { slug: { equals: item.slug }, parentCountry: { exists: false } }
                            : { slug: { equals: item.slug }, parentCountry: { exists: true } }

                        const inters = await req.payload.find({ collection: 'intertours', where: condition, limit: 1 })
                        if (inters.docs.length > 0) {
                            const countCond: any = isCountry ? { countrySlug: { equals: item.slug } } : { citySlug: { equals: item.slug } }
                            const countResult = await req.payload.count({ collection: 'program-tours', where: countCond })
                            await req.payload.update({
                                collection: 'intertours',
                                id: inters.docs[0].id,
                                data: { tourCount: countResult.totalDocs },
                                context: { skipAutoTagHook: true }
                            })
                        } else {
                            const inbounds = await req.payload.find({ collection: 'inbound-tours', where: condition, limit: 1 })
                            if (inbounds.docs.length > 0) {
                                const countCond: any = isCountry ? { countrySlug: { equals: item.slug } } : { citySlug: { equals: item.slug } }
                                const countResult = await req.payload.count({ collection: 'program-tours', where: countCond })
                                await req.payload.update({
                                    collection: 'inbound-tours',
                                    id: inbounds.docs[0].id,
                                    data: { tourCount: countResult.totalDocs },
                                    context: { skipAutoTagHook: true }
                                })
                            }
                        }
                    } catch (e) {}
                }
            }
        ],
    },
    admin: {
        useAsTitle: 'displayTitle',
        defaultColumns: ['productName', 'productCode', 'countryName', 'cityName', 'continent', 'airlineName', 'stayDay', 'priceProduct'],
        group: { en: 'Tours', th: 'ทัวร์' },
        preview: (data) => {
            const countrySlug = typeof data?.countrySlug === 'string' ? data.countrySlug : ''
            const productCode = typeof data?.productCode === 'string' ? data.productCode : ''
            return countrySlug && productCode
                ? `${NEXT_PUBLIC_SERVER_URL}/tour/${countrySlug}/${productCode}`
                : ''
        },
        components: {
            beforeListTable: [
                '@/components/SyncProgramToursButton#SyncProgramToursButton',
                '@/components/SyncItineraryButton#SyncItineraryButton',
            ],
        },
    },
    fields: [
        // displayTitle สำหรับ useAsTitle (ค้นหาด้วยรหัสทัวร์ได้)
        {
            name: 'displayTitle',
            type: 'text',
            admin: { hidden: true },
        },
        // ============================================
        // Product Info — ข้อมูลหลักจาก API
        // ============================================
        {
            type: 'tabs',
            tabs: [
                {
                    label: { en: 'Tour Info', th: 'ข้อมูลทัวร์' },
                    fields: [
                        {
                            name: 'productId',
                            type: 'number',
                            label: { en: 'Product ID', th: 'รหัสสินค้า (Product ID)' },
                            admin: {
                                description: 'API field: product_id',
                                readOnly: true,
                            },
                        },
                        {
                            name: 'productCode',
                            type: 'text',
                            label: { en: 'Tour Code', th: 'รหัสทัวร์ (Product Code)' },
                            index: true,
                            admin: {
                                description: 'API field: product_code',
                                readOnly: true,
                            },
                        },
                        {
                            name: 'productName',
                            type: 'text',
                            label: { en: 'Tour Name', th: 'ชื่อทัวร์ (Product Name)' },
                            index: true,
                            admin: {
                                description: 'API field: product_name',
                                readOnly: true,
                            },
                        },
                        {
                            name: 'productSlug',
                            type: 'text',
                            label: { en: 'Tour Slug', th: 'Slug ทัวร์' },
                            admin: {
                                description: 'API field: product_slug',
                                readOnly: true,
                            },
                        },
                        {
                            name: 'isCanConfirm',
                            type: 'checkbox',
                            label: { en: 'Can Confirm', th: 'ยืนยันได้ (Can Confirm)' },
                            admin: {
                                description: 'API field: is_can_confirm',
                                readOnly: true,
                            },
                        },
                        {
                            name: 'titlePackage',
                            type: 'text',
                            label: { en: 'Package Name', th: 'ชื่อแพ็กเกจ (Title Package)' },
                            admin: {
                                description: 'API field: title_package',
                                readOnly: true,
                            },
                        },
                        {
                            type: 'row',
                            fields: [
                                {
                                    name: 'starRating',
                                    type: 'number',
                                    label: { en: 'Star Rating', th: 'ระดับดาว (Star Rating)' },
                                    admin: {
                                        description: 'API field: star_rating',
                                        readOnly: true,
                                        width: '50%',
                                    },
                                },
                                {
                                    name: 'starHotel',
                                    type: 'number',
                                    label: { en: 'Hotel Stars', th: 'ดาวโรงแรม (Star Hotel)' },
                                    admin: {
                                        description: 'API field: star_hotel',
                                        readOnly: true,
                                        width: '50%',
                                    },
                                },
                            ],
                        },
                        {
                            name: 'supplierName',
                            type: 'text',
                            label: { en: 'Supplier Name', th: 'ชื่อซัพพลายเออร์ (Supplier Name)' },
                            admin: {
                                description: { en: 'API field: suppliername (from productdetails)', th: 'API field: suppliername (จาก productdetails)' },
                                readOnly: true,
                            },
                        },
                        {
                            name: 'productTags',
                            type: 'json',
                            label: { en: 'Tour Tags', th: 'แท็กทัวร์ (Tags)' },
                            admin: {
                                description: { en: 'API field: tags (from productdetails)', th: 'API field: tags (จาก productdetails)' },
                                readOnly: true,
                            },
                        },
                        {
                            name: 'festivals',
                            type: 'json',
                            label: { en: 'Festivals', th: 'เทศกาล (Festivals)' },
                            admin: {
                                description: { en: 'Matching slugHoliday — auto-updated on sync', th: 'slugHoliday ที่ตรงกับทัวร์นี้ เช่น ["songkran-day","chakri-day"] — อัปเดตอัตโนมัติตอน sync' },
                                readOnly: true,
                            },
                        },
                    ],
                },

                // ============================================
                // Tab: รูปภาพ
                // ============================================
                {
                    label: { en: 'Images', th: 'รูปภาพ' },
                    fields: [
                        {
                            name: 'urlPic',
                            type: 'text',
                            label: { en: 'Main Image (URL)', th: 'รูปภาพหลัก (URL)' },
                            admin: {
                                description: 'API field: url_pic',
                                readOnly: true,
                            },
                        },
                        {
                            name: 'urlPicMultisize',
                            type: 'group',
                            label: { en: 'Multi-size Images', th: 'รูปหลายขนาด (Multi-size)' },
                            admin: {
                                description: 'API field: url_pic_multisize',
                            },
                            fields: [
                                {
                                    name: 'tourdetail',
                                    type: 'text',
                                    label: { en: 'Tour Detail Image', th: 'รูปหน้ารายละเอียด (Tour Detail)' },
                                    admin: {
                                        description: 'API field: url_pic_multisize.tourdetail',
                                        readOnly: true,
                                    },
                                },
                                {
                                    name: 'itemslide',
                                    type: 'text',
                                    label: { en: 'Slide Image', th: 'รูปสไลด์ (Item Slide)' },
                                    admin: {
                                        description: 'API field: url_pic_multisize.itemslide',
                                        readOnly: true,
                                    },
                                },
                                {
                                    name: 'tourlist',
                                    type: 'text',
                                    label: { en: 'Tour List Image', th: 'รูปรายการทัวร์ (Tour List)' },
                                    admin: {
                                        description: 'API field: url_pic_multisize.tourlist',
                                        readOnly: true,
                                    },
                                },
                            ],
                        },
                    ],
                },

                // ============================================
                // Tab: รายละเอียด
                // ============================================
                {
                    label: { en: 'Details', th: 'รายละเอียด' },
                    fields: [
                        {
                            name: 'highlight',
                            type: 'textarea',
                            label: { en: 'Tour Highlights', th: 'ไฮไลท์ทัวร์ (Highlight)' },
                            admin: {
                                description: 'API field: highlight',
                                readOnly: true,
                            },
                        },
                        {
                            name: 'destination',
                            type: 'text',
                            label: { en: 'Destination', th: 'จุดหมายปลายทาง (Destination)' },
                            admin: {
                                description: 'API field: destination',
                                readOnly: true,
                            },
                        },
                        {
                            name: 'food',
                            type: 'text',
                            label: { en: 'Food', th: 'อาหาร (Food)' },
                            admin: {
                                description: 'API field: food',
                                readOnly: true,
                            },
                        },
                        {
                            type: 'row',
                            fields: [
                                {
                                    name: 'stayDay',
                                    type: 'number',
                                    label: { en: 'Stay Days', th: 'จำนวนวัน (Stay Day)' },
                                    admin: {
                                        description: 'API field: stay_day',
                                        readOnly: true,
                                        width: '50%',
                                    },
                                },
                                {
                                    name: 'stayNight',
                                    type: 'number',
                                    label: { en: 'Stay Nights', th: 'จำนวนคืน (Stay Night)' },
                                    admin: {
                                        description: 'API field: stay_night',
                                        readOnly: true,
                                        width: '50%',
                                    },
                                },
                            ],
                        },
                    ],
                },

                // ============================================
                // Tab: สายการบิน
                // ============================================
                {
                    label: { en: 'Airline', th: 'สายการบิน' },
                    fields: [
                        {
                            name: 'airlineCode',
                            type: 'text',
                            label: { en: 'Airline Code', th: 'รหัสสายการบิน (Airline Code)' },
                            index: true,
                            admin: {
                                description: 'API field: airlinecode',
                                readOnly: true,
                            },
                        },
                        {
                            name: 'airlineName',
                            type: 'text',
                            label: { en: 'Airline Name', th: 'ชื่อสายการบิน (Airline Name)' },
                            admin: {
                                description: 'API field: airline_name',
                                readOnly: true,
                            },
                        },
                        {
                            name: 'urlAirlinePic',
                            type: 'text',
                            label: { en: 'Airline Logo (URL)', th: 'โลโก้สายการบิน (URL)' },
                            admin: {
                                description: 'API field: url_airline_pic',
                                readOnly: true,
                            },
                        },
                    ],
                },

                // ============================================
                // Tab: ราคา
                // ============================================
                {
                    label: { en: 'Price', th: 'ราคา' },
                    fields: [
                        {
                            type: 'row',
                            fields: [
                                {
                                    name: 'priceProduct',
                                    type: 'number',
                                    label: { en: 'Price', th: 'ราคา (Price Product)' },
                                    index: true,
                                    admin: {
                                        description: 'API field: price_product',
                                        readOnly: true,
                                        width: '50%',
                                    },
                                },
                                {
                                    name: 'priceAmountCallDiscount',
                                    type: 'number',
                                    label: { en: 'Discounted Price', th: 'ราคาหลังส่วนลด (Discount Price)' },
                                    admin: {
                                        description: 'API field: price_amount_call_discount',
                                        readOnly: true,
                                        width: '50%',
                                    },
                                },
                            ],
                        },
                        {
                            type: 'row',
                            fields: [
                                {
                                    name: 'productDiscountDisplay',
                                    type: 'number',
                                    label: { en: 'Discount Display', th: 'ส่วนลดที่แสดง (Discount Display)' },
                                    admin: {
                                        description: 'API field: product_discount_display',
                                        readOnly: true,
                                        width: '33%',
                                    },
                                },
                                {
                                    name: 'productPriceBeforeDiscount',
                                    type: 'number',
                                    label: { en: 'Price Before Discount', th: 'ราคาก่อนลด (Price Before Discount)' },
                                    admin: {
                                        description: 'API field: product_price_before_discount',
                                        readOnly: true,
                                        width: '33%',
                                    },
                                },
                                {
                                    name: 'discountPercent',
                                    type: 'text',
                                    label: { en: 'Discount %', th: 'เปอร์เซ็นต์ส่วนลด (Discount %)' },
                                    admin: {
                                        description: 'API field: discountpercent',
                                        readOnly: true,
                                        width: '33%',
                                    },
                                },
                            ],
                        },
                    ],
                },

                // ============================================
                // Tab: ประเทศ / เมือง
                // ============================================
                {
                    label: { en: 'Country/City', th: 'ประเทศ/เมือง' },
                    fields: [
                        {
                            name: 'continent',
                            type: 'text',
                            label: { en: 'Continent', th: 'ทวีป (Continent)' },
                            index: true,
                            admin: {
                                description: { en: 'Mapped from InterTours → TourCategory (e.g., Asia, Europe)', th: 'Map จาก InterTours → TourCategory (เช่น เอเชีย, ยุโรป)' },
                                readOnly: true,
                            },
                        },
                        {
                            type: 'row',
                            fields: [
                                {
                                    name: 'countryName',
                                    type: 'text',
                                    label: { en: 'Country Name', th: 'ชื่อประเทศ (Country Name)' },
                                    index: true,
                                    admin: {
                                        description: 'API field: country_name',
                                        readOnly: true,
                                        width: '50%',
                                    },
                                },
                                {
                                    name: 'countrySlug',
                                    type: 'text',
                                    label: { en: 'Country Slug', th: 'Slug ประเทศ (Country Slug)' },
                                    index: true,
                                    admin: {
                                        description: 'API field: country_slug',
                                        readOnly: true,
                                        width: '50%',
                                    },
                                },
                            ],
                        },
                        {
                            type: 'row',
                            fields: [
                                {
                                    name: 'cityName',
                                    type: 'text',
                                    label: { en: 'City Name', th: 'ชื่อเมือง (City Name)' },
                                    admin: {
                                        description: 'API field: city_name',
                                        readOnly: true,
                                        width: '50%',
                                    },
                                },
                                {
                                    name: 'citySlug',
                                    type: 'text',
                                    label: { en: 'City Slug', th: 'Slug เมือง (City Slug)' },
                                    admin: {
                                        description: 'API field: city_slug',
                                        readOnly: true,
                                        width: '50%',
                                    },
                                },
                            ],
                        },
                    ],
                },

                // ============================================
                // Tab: ลิงก์ดาวน์โหลด
                // ============================================
                {
                    label: { en: 'Download Links', th: 'ลิงก์ดาวน์โหลด' },
                    fields: [
                        {
                            name: 'urlPdf',
                            type: 'text',
                            label: { en: 'PDF Link', th: 'ลิงก์ PDF' },
                            admin: {
                                description: 'API field: url_pdf',
                                readOnly: true,
                            },
                        },
                        {
                            name: 'urlWord',
                            type: 'text',
                            label: { en: 'Word Link', th: 'ลิงก์ Word' },
                            admin: {
                                description: 'API field: url_word',
                                readOnly: true,
                            },
                        },
                        {
                            name: 'urlBanner',
                            type: 'text',
                            label: { en: 'Banner Link', th: 'ลิงก์ Banner' },
                            admin: {
                                description: 'API field: url_banner',
                                readOnly: true,
                            },
                        },
                    ],
                },

                // ============================================
                // Tab: สถานะ
                // ============================================
                {
                    label: { en: 'Status', th: 'สถานะ' },
                    fields: [
                        {
                            name: 'soldout',
                            type: 'text',
                            label: { en: 'Sold Out Status', th: 'สถานะ Sold Out' },
                            admin: {
                                description: { en: 'API field: soldout (\"true\" / \"false\")', th: 'API field: soldout (ค่า "true" / "false")' },
                                readOnly: true,
                            },
                        },
                        {
                            name: 'periodStart',
                            type: 'text',
                            label: { en: 'First Departure Date', th: 'วันเริ่มเดินทางแรก (Period Start)' },
                            index: true,
                            admin: {
                                description: 'API field: period_start',
                                readOnly: true,
                            },
                        },
                    ],
                },

                // ============================================
                // Tab: ช่วงเวลาเดินทาง (Periods)
                // ============================================
                {
                    label: { en: 'Travel Period', th: 'ช่วงเวลาเดินทาง' },
                    fields: [
                        {
                            name: 'periods',
                            type: 'array',
                            label: { en: 'Travel Periods', th: 'ช่วงเวลาเดินทาง (Periods)' },
                            labels: {
                                singular: 'Period',
                                plural: 'Periods',
                            },
                            admin: {
                                description: { en: 'API field: periods[] — all travel period data from API', th: 'API field: periods[] — ข้อมูลช่วงเวลาเดินทางทั้งหมดจาก API' },
                                readOnly: true,
                            },
                            fields: [
                                {
                                    name: 'periodId',
                                    type: 'number',
                                    label: { en: 'Period ID', th: 'รหัสช่วงเวลา (Period ID)' },
                                    admin: {
                                        description: 'API field: period_id',
                                        readOnly: true,
                                    },
                                },
                                {
                                    type: 'row',
                                    fields: [
                                        {
                                            name: 'periodStart',
                                            type: 'text',
                                            label: { en: 'Start Date (Display)', th: 'วันเริ่ม (แสดง)' },
                                            admin: {
                                                description: 'API field: period_start',
                                                readOnly: true,
                                                width: '50%',
                                            },
                                        },
                                        {
                                            name: 'periodEnd',
                                            type: 'text',
                                            label: { en: 'End Date (Display)', th: 'วันสิ้นสุด (แสดง)' },
                                            admin: {
                                                description: 'API field: period_end',
                                                readOnly: true,
                                                width: '50%',
                                            },
                                        },
                                    ],
                                },
                                {
                                    type: 'row',
                                    fields: [
                                        {
                                            name: 'periodStartValue',
                                            type: 'text',
                                            label: { en: 'Start Date (ISO)', th: 'วันเริ่ม (ISO)' },
                                            admin: {
                                                description: 'API field: period_start_value',
                                                readOnly: true,
                                                width: '50%',
                                            },
                                        },
                                        {
                                            name: 'periodEndValue',
                                            type: 'text',
                                            label: { en: 'End Date (ISO)', th: 'วันสิ้นสุด (ISO)' },
                                            admin: {
                                                description: 'API field: period_end_value',
                                                readOnly: true,
                                                width: '50%',
                                            },
                                        },
                                    ],
                                },
                                {
                                    type: 'collapsible',
                                    label: { en: 'Period Pricing', th: '💰 ราคา Period' },
                                    admin: { initCollapsed: true },
                                    fields: [
                                        {
                                            name: 'price',
                                            type: 'number',
                                            label: { en: 'Starting Price', th: 'ราคาเริ่มต้น (Price)' },
                                            admin: {
                                                description: 'API field: price',
                                                readOnly: true,
                                            },
                                        },
                                        {
                                            type: 'row',
                                            fields: [
                                                {
                                                    name: 'priceAdultsDouble',
                                                    type: 'number',
                                                    label: { en: 'Adult (Twin)', th: 'ผู้ใหญ่ พักคู่ (Adults Double)' },
                                                    admin: {
                                                        description: 'API field: price_adults_double',
                                                        readOnly: true,
                                                        width: '33%',
                                                    },
                                                },
                                                {
                                                    name: 'priceAdultsSingle',
                                                    type: 'number',
                                                    label: { en: 'Adult (Single)', th: 'ผู้ใหญ่ พักเดี่ยว (Adults Single)' },
                                                    admin: {
                                                        description: 'API field: price_adults_single',
                                                        readOnly: true,
                                                        width: '33%',
                                                    },
                                                },
                                                {
                                                    name: 'priceAdultsTriple',
                                                    type: 'number',
                                                    label: { en: 'Adult (Triple)', th: 'ผู้ใหญ่ พักสาม (Adults Triple)' },
                                                    admin: {
                                                        description: 'API field: price_adults_triple',
                                                        readOnly: true,
                                                        width: '33%',
                                                    },
                                                },
                                            ],
                                        },
                                        {
                                            type: 'row',
                                            fields: [
                                                {
                                                    name: 'priceChildWithbed',
                                                    type: 'number',
                                                    label: { en: 'Child (With Bed)', th: 'เด็ก มีเตียง (Child With Bed)' },
                                                    admin: {
                                                        description: 'API field: price_child_withbed',
                                                        readOnly: true,
                                                        width: '33%',
                                                    },
                                                },
                                                {
                                                    name: 'priceChildNobed',
                                                    type: 'number',
                                                    label: { en: 'Child (No Bed)', th: 'เด็ก ไม่มีเตียง (Child No Bed)' },
                                                    admin: {
                                                        description: 'API field: price_child_nobed',
                                                        readOnly: true,
                                                        width: '33%',
                                                    },
                                                },
                                                {
                                                    name: 'priceJoinland',
                                                    type: 'number',
                                                    label: { en: 'Join Land Price', th: 'ราคา Join Land' },
                                                    admin: {
                                                        description: 'API field: price_joinland',
                                                        readOnly: true,
                                                        width: '33%',
                                                    },
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    type: 'collapsible',
                                    label: { en: 'Seats & Group', th: '💺 ที่นั่ง & กรุ๊ป' },
                                    admin: { initCollapsed: true },
                                    fields: [
                                        {
                                            type: 'row',
                                            fields: [
                                                {
                                                    name: 'numberSeats',
                                                    type: 'number',
                                                    label: { en: 'Number of Seats', th: 'จำนวนที่นั่ง (Number Seats)' },
                                                    admin: {
                                                        description: 'API field: number_seats',
                                                        readOnly: true,
                                                        width: '33%',
                                                    },
                                                },
                                                {
                                                    name: 'groupsize',
                                                    type: 'number',
                                                    label: { en: 'Group Size', th: 'ขนาดกรุ๊ป (Group Size)' },
                                                    admin: {
                                                        description: 'API field: groupsize',
                                                        readOnly: true,
                                                        width: '33%',
                                                    },
                                                },
                                                {
                                                    name: 'seatremain',
                                                    type: 'number',
                                                    label: { en: 'Remaining Seats', th: 'ที่นั่งเหลือ (Seat Remain)' },
                                                    admin: {
                                                        description: 'API field: seatremain',
                                                        readOnly: true,
                                                        width: '33%',
                                                    },
                                                },
                                            ],
                                        },
                                        {
                                            name: 'periodSoldout',
                                            type: 'text',
                                            label: { en: 'Period Sold Out Status', th: 'สถานะ Sold Out ของช่วงนี้' },
                                            admin: {
                                                description: { en: 'API field: period_soldout (\"true\" / \"false\")', th: 'API field: period_soldout (ค่า "true" / "false")' },
                                                readOnly: true,
                                            },
                                        },
                                    ],
                                },
                                {
                                    type: 'collapsible',
                                    label: { en: 'Period Discount', th: '🔖 ส่วนลด Period' },
                                    admin: { initCollapsed: true },
                                    fields: [
                                        {
                                            type: 'row',
                                            fields: [
                                                {
                                                    name: 'discountDisplay',
                                                    type: 'number',
                                                    label: { en: 'Discount Display', th: 'ส่วนลดที่แสดง (Discount Display)' },
                                                    admin: {
                                                        description: 'API field: discount_display',
                                                        readOnly: true,
                                                        width: '50%',
                                                    },
                                                },
                                                {
                                                    name: 'priceBeforeDiscount',
                                                    type: 'number',
                                                    label: { en: 'Price Before Discount', th: 'ราคาก่อนลด (Price Before Discount)' },
                                                    admin: {
                                                        description: 'API field: price_before_discount',
                                                        readOnly: true,
                                                        width: '50%',
                                                    },
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    name: 'periodAirlineCode',
                                    type: 'text',
                                    label: { en: 'Airline Code (Period)', th: 'รหัสสายการบิน (Period)' },
                                    admin: {
                                        description: 'API field: periods[].airlinecode',
                                        readOnly: true,
                                    },
                                },
                                {
                                    name: 'urlAirlinePicIcon',
                                    type: 'text',
                                    label: { en: 'Airline Icon (URL)', th: 'ไอคอนสายการบิน (URL)' },
                                    admin: {
                                        description: 'API field: periods[].url_airline_pic_icon',
                                        readOnly: true,
                                    },
                                },
                                {
                                    type: 'row',
                                    fields: [
                                        {
                                            name: 'deposit',
                                            type: 'number',
                                            label: { en: 'Deposit', th: 'เงินมัดจำ (Deposit)' },
                                            admin: {
                                                description: 'API field: deposit',
                                                readOnly: true,
                                                width: '33%',
                                            },
                                        },
                                        {
                                            name: 'depositDate',
                                            type: 'text',
                                            label: { en: 'Deposit Deadline', th: 'วันครบกำหนดมัดจำ (Deposit Date)' },
                                            admin: {
                                                description: 'API field: deposit_date',
                                                readOnly: true,
                                                width: '33%',
                                            },
                                        },
                                        {
                                            name: 'numberDeposit',
                                            type: 'number',
                                            label: { en: 'Deposit Amount', th: 'จำนวนเงินมัดจำ (Number Deposit)' },
                                            admin: {
                                                description: 'API field: number_deposit',
                                                readOnly: true,
                                                width: '33%',
                                            },
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },

                // ============================================
                // Tab: ข้อมูลเพิ่มเติม
                // ============================================
                {
                    label: { en: 'Additional Info', th: 'ข้อมูลเพิ่มเติม' },
                    fields: [
                        {
                            name: 'extendedProperties2',
                            type: 'group',
                            label: { en: 'Extended Properties', th: 'ข้อมูลเพิ่มเติม (Extended Properties)' },
                            admin: {
                                description: 'API field: extended_properties2',
                            },
                            fields: [
                                {
                                    name: 'visa',
                                    type: 'text',
                                    label: { en: 'Visa', th: 'วีซ่า (Visa)' },
                                    admin: {
                                        description: 'API field: extended_properties2.visa',
                                        readOnly: true,
                                    },
                                },
                                {
                                    name: 'visaText',
                                    type: 'text',
                                    label: { en: 'Visa Text', th: 'ข้อความวีซ่า (Visa Text)' },
                                    admin: {
                                        description: 'API field: extended_properties2.visaText',
                                        readOnly: true,
                                    },
                                },
                                {
                                    name: 'urlVdo',
                                    type: 'text',
                                    label: { en: 'Video URL', th: 'ลิงก์วิดีโอ (URL Video)' },
                                    admin: {
                                        description: 'API field: extended_properties2.url_vdo',
                                        readOnly: true,
                                    },
                                },
                                {
                                    name: 'freeText',
                                    type: 'text',
                                    label: { en: 'Free Text', th: 'ข้อความเพิ่มเติม (Free Text)' },
                                    admin: {
                                        description: 'API field: extended_properties2.free_text',
                                        readOnly: true,
                                    },
                                },
                                {
                                    name: 'freeDay',
                                    type: 'text',
                                    label: { en: 'Free Days', th: 'วันฟรี (Free Day)' },
                                    admin: {
                                        description: 'API field: extended_properties2.free_day',
                                        readOnly: true,
                                    },
                                },
                            ],
                        },
                        {
                            name: 'lastSyncedAt',
                            type: 'date',
                            label: { en: 'Last Synced', th: 'ซิงค์ล่าสุดเมื่อ (Last Synced)' },
                            admin: {
                                description: { en: 'Last API sync date/time', th: 'วันเวลาที่ดึงข้อมูลจาก API ล่าสุด' },
                                readOnly: true,
                                date: {
                                    pickerAppearance: 'dayAndTime',
                                },
                            },
                        },
                    ],
                },

                // ============================================
                // รายละเอียดการเดินทาง Tab (Itinerary)
                // ============================================
                {
                    label: { en: 'Itinerary', th: 'รายละเอียดการเดินทาง' },
                    fields: [
                        {
                            name: 'itinerarySummary',
                            type: 'textarea',
                            label: { en: 'Itinerary Summary', th: 'สรุปรายละเอียดการเดินทาง (Itinerary Summary)' },
                            admin: {
                                description: { en: 'Auto-pulled from API field: itinerary_summary (mode: productdetails) on Sync', th: 'ดึงอัตโนมัติจาก API field: itinerary_summary (mode: productdetails) ตอน Sync' },
                                readOnly: true,
                            },
                        },
                        {
                            name: 'itinerary',
                            type: 'array',
                            label: { en: 'Itinerary Details', th: 'รายละเอียดการเดินทาง (Itinerary)' },
                            labels: {
                                singular: { en: 'Day', th: 'วัน' },
                                plural: { en: 'Itinerary Items', th: 'รายการเดินทาง' },
                            },
                            admin: {
                                description: { en: 'Auto-pulled from API mode: itinerarybasic on Sync', th: 'ดึงอัตโนมัติจาก API mode: itinerarybasic ตอน Sync' },
                            },
                            fields: [
                                {
                                    name: 'dayTitle',
                                    type: 'text',
                                    required: true,
                                    label: { en: 'Day Title', th: 'หัวข้อ (Day Title)' },
                                    admin: {
                                        description: { en: 'e.g., Day 1, Day 2 — from API field: type', th: 'เช่น Day 1, Day 2 — จาก API field: type' },
                                        readOnly: true,
                                    },
                                },
                                {
                                    name: 'dayContent',
                                    type: 'textarea',
                                    label: { en: 'Content', th: 'เนื้อหา (Content)' },
                                    admin: {
                                        description: { en: 'HTML content for each day — from API field: content', th: 'เนื้อหา HTML ของแต่ละวัน — จาก API field: content' },
                                        readOnly: true,
                                    },
                                },
                            ],
                        },
                    ],
                },

                // ============================================
                // SEO Tab
                // ============================================
                {
                    name: 'meta',
                    label: { en: 'SEO', th: 'การทำ SEO' },
                    fields: [
                        OverviewField({
                            titlePath: 'meta.title',
                            descriptionPath: 'meta.description',
                        }),
                        MetaTitleField({
                            hasGenerateFn: false,
                        }),
                        {
                            name: 'image',
                            type: 'text',
                            label: { en: 'Meta Image — en', th: 'Meta Image — en' },
                            admin: {
                                description: { en: 'OG Image URL — auto-populated from Main Image (urlPic)', th: 'URL รูปภาพ OG — ดึงอัตโนมัติจาก Main Image (urlPic)' },
                            },
                        },
                        {
                            name: 'imagePreview',
                            type: 'ui',
                            admin: {
                                components: {
                                    Field: '@/components/SEO/MetaImagePreview#MetaImagePreview',
                                },
                            },
                        },
                        MetaDescriptionField({
                            hasGenerateFn: false,
                        }),
                        PreviewField({
                            hasGenerateFn: false,
                            titlePath: 'meta.title',
                            descriptionPath: 'meta.description',
                        }),
                        {
                            name: 'socialPreview',
                            type: 'ui',
                            admin: {
                                components: {
                                    Field: '@/components/SEO/SocialSharePreview#SocialSharePreview',
                                },
                            },
                        },
                    ],
                },
            ],
        },
    ],
}
