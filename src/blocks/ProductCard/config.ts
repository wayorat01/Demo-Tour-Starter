import { Block } from 'payload'
import { backgroundColor } from '@/fields/color'
import { designVersionPreview } from '@/components/AdminDashboard/DesignVersionPreview/config'

export const allWowtourProductCardDesignVersions = [
    {
        label: 'WOW Service Card 1',
        value: 'WOWTOUR_PRODUCT_CARD_1',
        image: '/admin/previews/tourType/wowtour_tourCard1.png',
    },
    {
        label: 'WOW Service Card 2',
        value: 'WOWTOUR_PRODUCT_CARD_2',
        image: '/admin/previews/tourType/wowtour_tourCard2.png',
    },
    {
        label: 'WOW Service Card 3',
        value: 'WOWTOUR_PRODUCT_CARD_3',
        image: '/admin/previews/tourType/wowtour_tourCard3.png',
    },
    {
        label: 'WOW Service Card 4',
        value: 'WOWTOUR_PRODUCT_CARD_4',
        image: '/admin/previews/tourType/wowtour_tourCard4.png',
    },
    {
        label: 'WOW Service Card 5',
        value: 'WOWTOUR_PRODUCT_CARD_5',
        image: '/admin/previews/tourType/wowtour_visaCard5.png',
    },
    {
        label: 'WOW Service Card 6',
        value: 'WOWTOUR_PRODUCT_CARD_6',
        image: '/admin/previews/tourType/wowtour_tourCard6.png',
    },
] as const

export type WowtourProductCardDesignVersion =
    (typeof allWowtourProductCardDesignVersions)[number]['value']

export const WowtourProductCardBlock: Block = {
    slug: 'wowtourProductCard',
    interfaceName: 'WowtourProductCardBlock',
    labels: {
        singular: { en: 'WOW ServiceByType', th: 'WOW ServiceByType' },
        plural: { en: 'WOW ServiceByType Blocks', th: 'WOW ServiceByType Blocks' },
    },
    fields: [
        backgroundColor,
        designVersionPreview(allWowtourProductCardDesignVersions),

        // ============================================
        // 1. Product Type — เลือกประเภทสินค้า
        // ============================================
        {
            name: 'productType',
            type: 'select',
            required: true,
            label: { en: 'Product Type', th: 'ประเภทสินค้า (Product Type)' },
            defaultValue: 'admission',
            options: [
                { label: { en: 'Admission Tickets', th: 'บัตรเข้าชม' }, value: 'admission' },
                { label: { en: 'Cruise', th: 'เรือสำราญ' }, value: 'cruise' },
                { label: { en: 'Car Rental', th: 'รถเช่า' }, value: 'car_rental' },
            ],
            admin: {
                description: {
                    en: 'Select the product type for this block — each type will connect to a different API',
                    th: 'เลือกประเภทสินค้าสำหรับ Block นี้ — แต่ละประเภทจะเชื่อมต่อกับ API คนละตัว',
                },
            },
        },

        // ============================================
        // 2. Heading Section
        // ============================================
        {
            name: 'headingSettings',
            type: 'group',
            label: { en: 'Heading', th: 'หัวข้อ (Heading)' },
            fields: [
                {
                    name: 'title',
                    type: 'text',
                    localized: true,
                    label: { en: 'Heading Title', th: 'หัวข้อ' },
                    admin: {
                        description: {
                            en: 'Custom heading title (leave empty to use default based on Product Type)',
                            th: 'หัวข้อ (ถ้าไม่กรอก จะใช้ค่าเริ่มต้นตามประเภทสินค้า)',
                        },
                    },
                },
                {
                    name: 'showHeadingIcon',
                    type: 'checkbox',
                    defaultValue: true,
                    label: { en: 'Show Heading Icon', th: 'แสดงไอคอนหัวข้อ' },
                    admin: {
                        description: { en: 'Show/hide icon next to heading', th: 'เปิด/ปิด Icon ข้างหน้า Heading' },
                    },
                },
                {
                    name: 'headingIcon',
                    type: 'upload',
                    relationTo: 'media',
                    label: { en: 'Heading Icon', th: 'รูปไอคอนหัวข้อ' },
                    admin: {
                        description: {
                            en: 'Custom icon (leave empty to use default icon based on Product Type)',
                            th: 'ไอคอนที่กำหนดเอง (ถ้าไม่กรอก จะใช้ไอคอนเริ่มต้นตามประเภทสินค้า)',
                        },
                        condition: (_, siblingData) => siblingData?.showHeadingIcon === true,
                    },
                },
                {
                    name: 'showDescription',
                    type: 'checkbox',
                    defaultValue: false,
                    label: { en: 'Show Description', th: 'แสดงคำอธิบาย' },
                },
                {
                    name: 'description',
                    type: 'textarea',
                    localized: true,
                    label: { en: 'Description', th: 'คำอธิบายเพิ่มเติม' },
                    admin: {
                        condition: (_, siblingData) => siblingData?.showDescription === true,
                    },
                },
            ],
        },

        // ============================================
        // 3. Mock Items — ข้อมูลตัวอย่าง (จะถูกแทนที่ด้วย API ในอนาคต)
        // ============================================
        {
            name: 'items',
            type: 'array',
            label: { en: 'Product Items', th: 'รายการสินค้า' },
            admin: {
                description: {
                    en: 'Add product items manually — will be replaced by API integration in the future',
                    th: 'เพิ่มรายการสินค้าด้วยตนเอง — จะถูกแทนที่ด้วยการเชื่อมต่อ API ในอนาคต',
                },
            },
            fields: [
                {
                    name: 'coverImage',
                    type: 'upload',
                    relationTo: 'media',
                    required: true,
                    label: { en: 'Cover Image', th: 'รูปปก' },
                },
                {
                    name: 'title',
                    type: 'text',
                    required: true,
                    localized: true,
                    label: { en: 'Product Title', th: 'ชื่อสินค้า' },
                },
                {
                    name: 'shortDescription',
                    type: 'textarea',
                    localized: true,
                    label: { en: 'Short Description', th: 'คำอธิบายสั้น' },
                    admin: {
                        description: { en: 'Brief description shown on the card', th: 'คำอธิบายสั้นที่แสดงบนการ์ด' },
                    },
                },
                {
                    type: 'row',
                    fields: [
                        {
                            name: 'location',
                            type: 'text',
                            localized: true,
                            label: { en: 'Location', th: 'สถานที่ / เมือง' },
                            admin: { width: '50%' },
                        },
                        {
                            name: 'duration',
                            type: 'text',
                            localized: true,
                            label: { en: 'Duration', th: 'ระยะเวลา' },
                            admin: {
                                width: '50%',
                                description: { en: 'e.g. "1 Day", "3 Days 2 Nights"', th: 'เช่น "1 วัน", "3 วัน 2 คืน"' },
                            },
                        },
                    ],
                },
                {
                    type: 'row',
                    fields: [
                        {
                            name: 'price',
                            type: 'number',
                            label: { en: 'Starting Price (฿)', th: 'ราคาเริ่มต้น (บาท)' },
                            admin: { width: '50%' },
                        },
                        {
                            name: 'originalPrice',
                            type: 'number',
                            label: { en: 'Original Price (฿)', th: 'ราคาเดิม (บาท)' },
                            admin: {
                                width: '50%',
                                description: { en: 'Show strikethrough price if set', th: 'แสดงราคาขีดฆ่าถ้ากรอก' },
                            },
                        },
                    ],
                },
                {
                    name: 'linkUrl',
                    type: 'text',
                    label: { en: 'Detail Link URL', th: 'ลิงก์ไปหน้ารายละเอียด' },
                    admin: {
                        description: { en: 'URL to the product detail page', th: 'URL ไปหน้ารายละเอียดสินค้า' },
                    },
                },
                {
                    name: 'badge',
                    type: 'text',
                    localized: true,
                    label: { en: 'Badge Text', th: 'ป้ายข้อความ (Badge)' },
                    admin: {
                        description: {
                            en: 'e.g. "Best Seller", "New", "Hot Deal"',
                            th: 'เช่น "ยอดนิยม", "ใหม่", "Hot Deal"',
                        },
                    },
                },
            ],
        },

        // ============================================
        // 4. Card Settings
        // ============================================
        {
            name: 'cardSettings',
            type: 'group',
            label: { en: 'Card Settings', th: 'ตั้งค่าการ์ด (Card Settings)' },
            fields: [
                {
                    name: 'borderRadius',
                    type: 'number',
                    label: { en: 'Border Radius', th: 'ความมนของขอบการ์ด (Border Radius)' },
                    defaultValue: 12,
                    admin: {
                        description: { en: '(default: 12px)', th: 'ปรับความมนของขอบการ์ด (default: 12px)' },
                    },
                },
            ],
        },

        {
            name: 'columnsPerRow',
            type: 'select',
            label: { en: 'Columns Per Row', th: 'จำนวนคอลัมน์ต่อแถว' },
            defaultValue: '4',
            options: [
                { label: '2 Columns', value: '2' },
                { label: '3 Columns', value: '3' },
                { label: '4 Columns', value: '4' },
                { label: '5 Columns', value: '5' },
            ],
        },
        {
            name: 'maxItemsToShow',
            type: 'select',
            label: { en: 'Max Items to Show', th: 'จำนวนรายการสูงสุดที่แสดง' },
            defaultValue: 'showAll',
            options: [
                { label: 'Show All', value: 'showAll' },
                { label: '2 Items', value: '2' },
                { label: '3 Items', value: '3' },
                { label: '4 Items', value: '4' },
                { label: '6 Items', value: '6' },
                { label: '8 Items', value: '8' },
            ],
        },


    ],
}
