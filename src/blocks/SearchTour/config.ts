import { Block } from 'payload'
import { colorPickerField } from '@/fields/colorPicker'

export const allWowtourSearchTourDesignVersions = [
    {
        label: 'WowTour Search Tour 1',
        value: 'WOWTOUR_SEARCH_TOUR_1',
    },
] as const

export type WowtourSearchTourDesignVersion =
    (typeof allWowtourSearchTourDesignVersions)[number]['value']

export const WowtourSearchTourBlock: Block = {
    slug: 'wowtourSearchTour',
    interfaceName: 'WowtourSearchTourBlock',
    labels: {
        singular: 'WowTour Search Tour',
        plural: 'WowTour Search Tour Blocks',
    },
    fields: [
        // ============================================
        // Design Version
        // ============================================
        {
            name: 'designVersion',
            type: 'select',
            defaultValue: 'WOWTOUR_SEARCH_TOUR_1',
            label: 'Design Version',
            options: allWowtourSearchTourDesignVersions.map((v) => ({
                label: v.label,
                value: v.value,
            })),
            admin: {
                description: { en: 'Choose search box display style', th: 'เลือกรูปแบบการแสดงผลกล่องค้นหาทัวร์' },
            },
        },

        // ============================================
        // 1. Background Container
        // ============================================
        {
            name: 'backgroundSettings',
            type: 'group',
            label: 'Background Container',
            admin: {
                description: { en: 'container', th: 'ตั้งค่าพื้นหลังของ container ใหญ่' },
            },
            fields: [
                {
                    name: 'backgroundType',
                    type: 'select',
                    label: { en: 'Translated Text', th: 'ประเภทพื้นหลัง' },
                    defaultValue: 'color',
                    options: [
                        { label: { en: 'Translated Text', th: 'สีพื้น' }, value: 'color' },
                        { label: { en: '(Gradient)', th: 'ไล่สี (Gradient)' }, value: 'gradient' },
                        { label: { en: 'Translated Text', th: 'รูปภาพ' }, value: 'image' },
                    ],
                    admin: {
                        description: { en: 'Choose between solid color, gradient, or image background', th: 'เลือกระหว่างใช้สีพื้น, ไล่สี (Gradient) หรือรูปภาพเป็นพื้นหลัง' },
                    },
                },
                // --- สีพื้น ---
                colorPickerField({
                    name: 'backgroundColor',
                    label: { en: 'Translated Text', th: 'สีพื้นหลัง' },
                    defaultValue: 'hsl(0, 70%, 60%)',
                    admin: {
                        description: { en: 'container', th: 'เลือกสีพื้นหลังของ container ใหญ่' },
                        condition: (_, siblingData) => siblingData?.backgroundType === 'color',
                    },
                }),
                // --- Gradient ---
                colorPickerField({
                    name: 'gradientStartColor',
                    label: 'Start Color',
                    defaultValue: 'hsl(173, 100%, 46%)',
                    admin: {
                        description: { en: 'Gradient start color', th: 'สีเริ่มต้นของ gradient' },
                        condition: (_, siblingData) => siblingData?.backgroundType === 'gradient',
                    },
                }),
                colorPickerField({
                    name: 'gradientEndColor',
                    label: 'End Color',
                    defaultValue: 'hsl(214, 97%, 61%)',
                    admin: {
                        description: { en: 'Gradient end color', th: 'สีสิ้นสุดของ gradient' },
                        condition: (_, siblingData) => siblingData?.backgroundType === 'gradient',
                    },
                }),
                {
                    name: 'gradientType',
                    type: 'select',
                    label: 'Gradient Type',
                    defaultValue: 'linear',
                    options: [
                        { label: 'Linear', value: 'linear' },
                        { label: 'Radial', value: 'radial' },
                    ],
                    admin: {
                        description: { en: 'Choose gradient type: Linear or Radial', th: 'เลือกรูปแบบ gradient: Linear (เส้นตรง) หรือ Radial (วงกลม)' },
                        condition: (_, siblingData) => siblingData?.backgroundType === 'gradient',
                    },
                },
                {
                    name: 'gradientPosition',
                    type: 'select',
                    label: 'Position',
                    defaultValue: 'to right',
                    options: [
                        { label: 'To Right', value: 'to right' },
                        { label: 'To Left', value: 'to left' },
                        { label: 'To Bottom', value: 'to bottom' },
                        { label: 'To Top', value: 'to top' },
                        { label: 'Top Left', value: 'to top left' },
                        { label: 'Top Right', value: 'to top right' },
                        { label: 'Bottom Left', value: 'to bottom left' },
                        { label: 'Bottom Right', value: 'to bottom right' },
                    ],
                    admin: {
                        description: { en: 'gradient ( Linear = , Radial = )', th: 'ทิศทางของ gradient (สำหรับ Linear = ทิศทาง, สำหรับ Radial = จุดศูนย์กลาง)' },
                        condition: (_, siblingData) => siblingData?.backgroundType === 'gradient',
                    },
                },
                // --- รูปภาพ ---
                {
                    name: 'backgroundImage',
                    type: 'upload',
                    relationTo: 'media',
                    label: { en: 'Translated Text', th: 'รูปภาพพื้นหลัง' },
                    admin: {
                        description: { en: 'container', th: 'อัพโหลดรูปภาพสำหรับพื้นหลัง container ใหญ่' },
                        condition: (_, siblingData) => siblingData?.backgroundType === 'image',
                    },
                },
            ],
        },

        // ============================================
        // 2. Search Section Settings
        // ============================================
        {
            name: 'sectionSettings',
            type: 'group',
            label: 'Search Section Settings',
            admin: {
                description: { en: 'Search section settings', th: 'ตั้งค่ากล่อง section ค้นหา' },
            },
            fields: [
                colorPickerField({
                    name: 'sectionBgColor',
                    label: { en: 'Translated Text', th: 'สีพื้นหลังกล่องค้นหา' },
                    defaultValue: 'hsl(0, 0%, 100%)',
                    admin: {
                        description: { en: 'Select search box background color', th: 'เลือกสีพื้นหลังของกล่องค้นหา' },
                    },
                }),
                {
                    name: 'sectionOpacity',
                    type: 'number',
                    label: { en: '(%)', th: 'ค่าโปร่งแสง (%)' },
                    defaultValue: 100,
                    min: 0,
                    max: 100,
                    admin: {
                        description: { en: 'Adjust search box opacity (0% = fully transparent, 100% = opaque)', th: 'ปรับค่าความโปร่งแสงของกล่องค้นหา (0% = โปร่งใสทั้งหมด, 100% = ทึบ)' },
                        step: 1,
                    },
                },
                {
                    name: 'sectionBorderRadius',
                    type: 'number',
                    label: 'Border Radius (px)',
                    defaultValue: 16,
                    admin: {
                        description: { en: 'Adjust search box border radius (px)', th: 'ปรับขอบมนของกล่องค้นหา (หน่วย px)' },
                    },
                },
            ],
        },

        // ============================================
        // 3. Heading Settings
        // ============================================
        {
            name: 'headingSettings',
            type: 'group',
            label: 'Heading',
            fields: [
                {
                    name: 'heading',
                    type: 'text',
                    defaultValue: 'ค้นหาโปรแกรมทัวร์',
                    localized: true,
                    label: { en: 'Heading', th: 'หัวข้อ' },
                    admin: {
                        description: { en: 'Search box main heading', th: 'หัวข้อหลักของกล่องค้นหา' },
                    },
                },
                {
                    name: 'showHeadingIcon',
                    type: 'checkbox',
                    defaultValue: false,
                    label: { en: 'Icon', th: 'แสดง Icon หัวข้อ' },
                    admin: {
                        description: { en: 'Show/hide icon before heading', th: 'เปิด/ปิด Icon ข้างหน้าหัวข้อ' },
                    },
                },
                {
                    name: 'headingIcon',
                    type: 'upload',
                    relationTo: 'media',
                    label: { en: 'Icon', th: 'Icon หัวข้อ' },
                    admin: {
                        description: { en: 'Upload icon (SVG or image file)', th: 'อัพโหลด Icon (รองรับไฟล์ SVG หรือรูปภาพ)' },
                        condition: (_, siblingData) => siblingData?.showHeadingIcon === true,
                    },
                },
            ],
        },

        // ============================================
        // Removed: Search Fields Configuration now strictly uses Global Settings
        // ============================================
    ],
}

