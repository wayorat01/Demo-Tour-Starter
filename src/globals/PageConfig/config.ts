import { GlobalConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { revalidatePageConfig } from './hooks/revalidatePageConfig'
import { allWowtourTourTypeDesignVersions } from '@/blocks/TourType/config'
import { designVersionPreview } from '@/components/AdminDashboard/DesignVersionPreview/config'
export const PageConfig: GlobalConfig = {
  slug: 'page-config',
  label: { en: 'Page Config', th: 'ตั้งค่าหน้าเว็บ' },
  access: {
    read: () => true,
    update: isAdmin,
  },
  hooks: {
    afterChange: [revalidatePageConfig],
  },
  versions: {
    drafts: false,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ============================================
        // Tab 1: 🌐 อัตลักษณ์เว็บไซต์
        // ============================================
        {
          name: 'siteIdentity',
          label: { en: '🌐 Site Identity', th: '🌐 อัตลักษณ์เว็บไซต์' },
          description: {
            en: 'Configure favicon, site name, and tagline',
            th: 'ตั้งค่า favicon, ชื่อเว็บไซต์ และคำโปรย',
          },
          fields: [
            {
              name: 'favicon',
              type: 'upload',
              relationTo: 'media',
              label: 'Favicon',
              admin: {
                description: {
                  en: 'Upload favicon for browser tab (recommended 32x32 or 64x64 px, .ico, .svg, .png)',
                  th: 'อัพโหลดรูป favicon สำหรับแสดงบน browser tab (แนะนำขนาด 32x32 หรือ 64x64 px, รองรับ .ico, .svg, .png)',
                },
              },
            },
            {
              name: 'siteName',
              type: 'text',
              label: { en: 'Site Name', th: 'ชื่อเว็บไซต์' },
              localized: true,
              defaultValue: 'My Website',
              admin: {
                description: {
                  en: 'Site name displayed on browser tab',
                  th: 'ชื่อเว็บไซต์ที่จะแสดงบน browser tab',
                },
              },
            },
            {
              name: 'siteTagline',
              type: 'text',
              label: { en: 'Tagline', th: 'คำโปรย (Tagline)' },
              localized: true,
              defaultValue: 'ทัวร์ต่างประเทศ คุณภาพเยี่ยม ราคาดี',
              admin: {
                description: {
                  en: 'Website slogan, e.g. "Best quality international tours"',
                  th: 'คำโปรยหรือ slogan ของเว็บไซต์ เช่น "ทัวร์ต่างประเทศ คุณภาพเยี่ยม ราคาดี"',
                },
              },
            },
            {
              type: 'text',
              name: 'ogTextColor',
              label: { en: 'OG Image (HEX)', th: 'สีข้อความ OG Image (HEX)' },
              defaultValue: '#000000',
              admin: {
                description: {
                  en: 'Text color for the OG Image title overlay, e.g. #FFFFFF (white) or #000000 (black)',
                  th: 'สีข้อความ title ที่จะวางทับบนรูป Preview เมื่อแชร์ลิงก์ เช่น #FFFFFF (ขาว) หรือ #000000 (ดำ)',
                },
              },
            },
            {
              name: 'sitePreviewImage',
              type: 'upload',
              relationTo: 'media',
              label: { en: 'OG Preview Image', th: 'รูป OG Preview Image' },
              localized: true,
              admin: {
                description: {
                  en: 'Background image for OG Image when sharing links (recommended 1200x630 px)',
                  th: 'รูปพื้นหลังที่จะใช้แสดงเป็น OG Image เมื่อแชร์ลิงก์ (แนะนำขนาด 1200x630 px)',
                },
              },
            },
            // Preview UI — custom admin component
            {
              name: 'preview',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/globals/PageConfig/SiteIdentityPreview#SiteIdentityPreview',
                },
              },
            },
          ],
        },

        // ============================================
        // Tab 2: 🏠 ตั้งค่าหน้าแรก + 🏷️ Meta + 📢 OG
        // ============================================
        {
          name: 'homepageSettings',
          label: { en: '🏠 Homepage', th: '🏠 ตั้งค่าหน้าแรก' },
          description: {
            en: 'Select a Page to use as the homepage',
            th: 'เลือก Page ที่จะใช้เป็นหน้าแรกของเว็บไซต์',
          },
          fields: [
            {
              name: 'homepage',
              type: 'relationship',
              relationTo: 'pages',
              label: { en: '(Homepage)', th: 'หน้าแรก (Homepage)' },
              admin: {
                description: {
                  en: 'Select the Page to be your homepage, displayed when users visit the website',
                  th: 'เลือก Page ที่ต้องการให้เป็นหน้าแรก เมื่อผู้ใช้เข้าเว็บไซต์จะแสดงหน้านี้',
                },
              },
            },
          ],
        },

        // ============================================
        // Tab 4: 📌 Sticky Social
        // ============================================
        {
          name: 'stickySocial',
          label: { en: '📌 Sticky Social', th: '📌 Sticky Social' },
          description: { en: 'Social Icons', th: 'ตั้งค่า Social Icons ที่ลอยติดหน้าจอทุกหน้า' },
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              label: { en: 'Sticky Social', th: 'เปิดใช้งาน Sticky Social' },
              defaultValue: false,
              admin: {
                description: {
                  en: 'Enable/disable all Sticky Social icons',
                  th: 'เปิด/ปิด Sticky Social ทั้งหมด',
                },
              },
            },
            {
              name: 'position',
              type: 'select',
              label: { en: 'Position', th: 'ตำแหน่ง' },
              defaultValue: 'left',
              options: [
                { label: { en: 'Left', th: 'ซ้าย' }, value: 'left' },
                { label: { en: 'Right', th: 'ขวา' }, value: 'right' },
              ],
              admin: {
                description: {
                  en: 'Choose position for Sticky Social (left/right)',
                  th: 'เลือกตำแหน่งที่จะแสดง Sticky Social (ซ้าย/ขวา)',
                },
                condition: (data) => data?.stickySocial?.enabled === true,
              },
            },
            {
              name: 'heading',
              type: 'text',
              label: { en: 'Heading (optional)', th: 'หัวข้อ (ไม่บังคับ)' },
              defaultValue: 'ติดต่อเรา',
              admin: {
                description: {
                  en: 'Top heading, e.g., \"Contact Us\" (hidden if empty)',
                  th: 'หัวข้อที่จะแสดงด้านบน เช่น "ติดต่อเรา" (ถ้าไม่ใส่จะไม่แสดง)',
                },
                condition: (data) => data?.stickySocial?.enabled === true,
              },
            },
            {
              name: 'qrCode',
              type: 'upload',
              relationTo: 'media',
              label: { en: 'QR Code', th: 'รูป QR Code (ไม่บังคับ)' },
              admin: {
                description: {
                  en: 'QR Code LINE QR, Facebook',
                  th: 'อัพโหลดรูป QR Code เช่น LINE QR, เพจ Facebook ฯลฯ (ถ้าไม่ใส่จะไม่แสดง)',
                },
                condition: (data) => data?.stickySocial?.enabled === true,
              },
            },
          ],
        },

        // ============================================
        // Tab 5: 📄 ตั้งค่าหน้ารายละเอียดทัวร์
        // ============================================
        {
          name: 'tourDetailSettings',
          label: { en: '📄 Tour Details', th: '📄 รายละเอียดทัวร์' },
          description: {
            en: 'Configure show/hide sections on tour detail page (affects all Tour Programs)',
            th: 'ตั้งค่าการแสดง/ซ่อนส่วนต่างๆ ของหน้ารายละเอียดทัวร์ (มีผลกับทุก Tour Program)',
          },
          fields: [
            {
              name: 'showItinerary',
              type: 'checkbox',
              defaultValue: true,
              label: { en: '(Itinerary)', th: 'แสดงรายละเอียดการเดินทาง (Itinerary)' },
              admin: {
                description: {
                  en: 'Show/hide daily itinerary program',
                  th: 'แสดง/ซ่อน โปรแกรมการเดินทางรายวัน',
                },
              },
            },
            {
              name: 'showRelatedTours',
              type: 'checkbox',
              defaultValue: true,
              label: { en: 'Show Related Tours', th: 'แสดงโปรแกรมทัวร์ใกล้เคียง' },
              admin: {
                description: {
                  en: 'Show/hide related tours (tag-based)',
                  th: 'แสดง/ซ่อน ทัวร์ที่เกี่ยวข้อง (tag-based)',
                },
              },
            },
            {
              name: 'showTags',
              type: 'checkbox',
              defaultValue: true,
              label: { en: 'Tags', th: 'แสดง Tags บนหน้ารายละเอียดทัวร์' },
              admin: {
                description: {
                  en: 'Show/hide Tags on tour detail page /tour/[slug]/[tourCode]',
                  th: 'แสดง/ซ่อน Tags บนหน้ารายละเอียดทัวร์ /tour/[slug]/[tourCode]',
                },
              },
            },
            {
              name: 'showBookingButton',
              type: 'checkbox',
              defaultValue: true,
              label: { en: 'Show Booking Button', th: 'แสดงปุ่มจองโปรแกรมทัวร์' },
              admin: {
                description: {
                  en: 'Show/hide booking button on tour detail page',
                  th: 'แสดง/ซ่อน ปุ่มจองโปรแกรมทัวร์บนหน้ารายละเอียดทัวร์',
                },
              },
            },
          ],
        },

        // ============================================
        // Tab 6: 🔍 ตั้งค่าหน้า Listing Page
        // ============================================
        {
          name: 'searchPageSettings',
          label: { en: '🔍 Listing Page', th: '🔍 Listing Page' },
          description: {
            en: 'Shared settings for /search-tour and /intertours/[slug] pages',
            th: 'ตั้งค่าที่ใช้ร่วมกันระหว่างหน้า /search-tour และ /intertours/[slug]',
          },
          fields: [
            // --- Listing Card Settings ---
            {
              name: 'listingCardSettings',
              type: 'group',
              label: 'Listing Card Settings',
              admin: {
                description: {
                  en: 'Configure Tour Card display style for results',
                  th: 'ตั้งค่ารูปแบบ Tour Card ที่แสดงผลลัพธ์',
                },
              },
              fields: [
                designVersionPreview(allWowtourTourTypeDesignVersions, {
                  name: 'cardDesignVersion',
                  defaultValue: 'WOWTOUR_TOUR_CARD_1',
                  label: 'Tour Card Design',
                  admin: {
                    description: {
                      en: 'Tour Card ( Design Version TourType Block )',
                      th: 'เลือกรูปแบบ Tour Card (ดึง Design Version จาก TourType Block อัตโนมัติ)',
                    },
                  },
                }),
                {
                  name: 'maxVisibleCards',
                  type: 'select',
                  label: { en: 'Max Visible Cards (per row)', th: 'Max Visible Cards (ต่อ 1 แถว)' },
                  defaultValue: '4',
                  options: [
                    { label: { en: '1 Card', th: '1 การ์ด' }, value: '1' },
                    { label: { en: '2 Cards', th: '2 การ์ด' }, value: '2' },
                    { label: { en: '3 Cards', th: '3 การ์ด' }, value: '3' },
                    { label: { en: '4 Cards', th: '4 การ์ด' }, value: '4' },
                  ],
                  admin: {
                    description: {
                      en: 'Number of Tour Cards per row (1-4 cards)',
                      th: 'จำนวน Tour Card ที่แสดงต่อ 1 แถว (1-4 การ์ด)',
                    },
                  },
                },
                {
                  name: 'resultsPerPage',
                  type: 'number',
                  label: 'Results Per Page',
                  defaultValue: 12,
                  admin: {
                    description: {
                      en: 'Number of Tour Cards per page',
                      th: 'จำนวน Tour Card ต่อหน้า',
                    },
                  },
                },
              ],
            },

            // --- Results Bar Settings ---
            {
              name: 'resultsBarSettings',
              type: 'group',
              label: 'Results Bar Settings',
              admin: {
                description: {
                  en: 'Configure results bar (tour count, filters)',
                  th: 'ตั้งค่า bar แสดงผลลัพธ์ (จำนวนทัวร์, ตัวกรอง)',
                },
              },
              fields: [
                {
                  name: 'showSortFilter',
                  type: 'checkbox',
                  defaultValue: true,
                  label: { en: 'Show Sort Filter', th: 'แสดงตัวเรียงลำดับ' },
                },
                {
                  name: 'sortOptions',
                  type: 'group',
                  label: { en: 'Sort Options', th: 'ตัวเลือกเรียงลำดับ' },
                  admin: {
                    description: {
                      en: 'Select sort options to display',
                      th: 'เลือกตัวเรียงลำดับที่ต้องการแสดง',
                    },
                    condition: (data) =>
                      data?.searchPageSettings?.resultsBarSettings?.showSortFilter === true,
                  },
                  fields: [
                    {
                      name: 'showPeriodLowToHigh',
                      type: 'checkbox',
                      defaultValue: true,
                      label: { en: 'Latest (periodlowtohigh)', th: 'ล่าสุด (periodlowtohight)' },
                    },
                    {
                      name: 'showPrice',
                      type: 'checkbox',
                      defaultValue: true,
                      label: { en: 'Price (price)', th: 'ราคา (price)' },
                    },
                    {
                      name: 'showPeriodNoSoldout',
                      type: 'checkbox',
                      defaultValue: true,
                      label: {
                        en: 'Available Programs (periodnosoldout)',
                        th: 'โปรแกรมที่ยังไม่เต็ม (periodnosoldout)',
                      },
                    },
                    {
                      name: 'showSupplierSeq',
                      type: 'checkbox',
                      defaultValue: false,
                      label: {
                        en: 'Supplier Sequence (supplierseq)',
                        th: 'เรียงตามซัพพลายเออร์ (supplierseq)',
                      },
                    },
                  ],
                },
              ],
            },

            // --- Hero Banner Settings (intertours) ---
            {
              name: 'heroBannerSettings',
              type: 'group',
              label: {
                en: 'Hero Banner Settings',
                th: 'Hero Banner Settings (หน้าทัวร์ตามประเทศ)',
              },
              admin: {
                description: {
                  en: 'Hero Banner /intertours/[slug]',
                  th: 'ตั้งค่า Hero Banner สำหรับหน้า /intertours/[slug]',
                },
              },
              fields: [
                {
                  name: 'showHeroBanner',
                  type: 'checkbox',
                  defaultValue: true,
                  label: { en: 'Hero Banner', th: 'แสดง Hero Banner' },
                  admin: {
                    description: {
                      en: 'Enable/disable Hero Banner showing flag + country name',
                      th: 'เปิด/ปิด Hero Banner ที่แสดง flag + ชื่อประเทศ',
                    },
                  },
                },
                {
                  name: 'showTourDescription',
                  type: 'checkbox',
                  defaultValue: true,
                  label: { en: 'Show Tour Description', th: 'แสดงรายละเอียดทัวร์' },
                  admin: {
                    description: {
                      en: 'Enable/disable tour description below Hero Banner (from International Tour data)',
                      th: 'เปิด/ปิดส่วนรายละเอียดทัวร์ที่แสดงใต้ Hero Banner (จากข้อมูลใน International Tour)',
                    },
                    condition: (data) =>
                      data?.searchPageSettings?.heroBannerSettings?.showHeroBanner === true,
                  },
                },
              ],
            },

            // --- Sidebar Filter Settings ---
            {
              name: 'sidebarFilterSettings',
              type: 'group',
              label: '🔍 Sidebar Filter Settings',
              admin: {
                description: {
                  en: 'Enable/disable Sidebar Filter for all Listing pages',
                  th: 'เปิด/ปิด ตัวกรองด้านข้าง (Sidebar Filter) สำหรับหน้า Listing ทุกหน้า',
                },
              },
              fields: [
                {
                  name: 'enabled',
                  type: 'checkbox',
                  defaultValue: true,
                  label: { en: 'Sidebar Filter', th: 'เปิดใช้งาน Sidebar Filter' },
                  admin: {
                    description: {
                      en: 'Enable/disable all Sidebar Filters',
                      th: 'เปิด/ปิด Sidebar Filter ทั้งหมด',
                    },
                  },
                },
                // 1. ช่วงราคา
                {
                  name: 'showPriceRange',
                  type: 'checkbox',
                  defaultValue: true,
                  label: { en: '1. Price Range', th: '1. ช่วงราคา' },
                  admin: {
                    condition: (data) =>
                      data?.searchPageSettings?.sidebarFilterSettings?.enabled === true,
                  },
                },
                // 2. เทศกาล
                {
                  name: 'showFestival',
                  type: 'checkbox',
                  defaultValue: true,
                  label: { en: '2. Festival Holidays', th: '2. ทัวร์วันหยุดตามเทศกาล' },
                  admin: {
                    condition: (data) =>
                      data?.searchPageSettings?.sidebarFilterSettings?.enabled === true,
                  },
                },
                // 3. จำนวนวัน
                {
                  name: 'showDuration',
                  type: 'checkbox',
                  defaultValue: true,
                  label: { en: '3. Duration (days)', th: '3. เลือกจำนวนวัน' },
                  admin: {
                    condition: (data) =>
                      data?.searchPageSettings?.sidebarFilterSettings?.enabled === true,
                  },
                },
                // 4. สายการบิน
                {
                  name: 'showAirline',
                  type: 'checkbox',
                  defaultValue: true,
                  label: { en: '4. Airline', th: '4. สายการบิน' },
                  admin: {
                    condition: (data) =>
                      data?.searchPageSettings?.sidebarFilterSettings?.enabled === true,
                  },
                },
                // 5. ระดับดาวที่พัก
                {
                  name: 'showHotelStar',
                  type: 'checkbox',
                  defaultValue: true,
                  label: { en: '5. Hotel Star Rating', th: '5. ระดับดาวที่พัก' },
                  admin: {
                    condition: (data) =>
                      data?.searchPageSettings?.sidebarFilterSettings?.enabled === true,
                  },
                },
                // 6. ทวีป
                {
                  name: 'showCategory',
                  type: 'checkbox',
                  defaultValue: true,
                  label: { en: '6. Continent', th: '6. ทวีป' },
                  admin: {
                    condition: (data) =>
                      data?.searchPageSettings?.sidebarFilterSettings?.enabled === true,
                  },
                },
                // 7. ประเทศ
                {
                  name: 'showCountry',
                  type: 'checkbox',
                  defaultValue: true,
                  label: { en: '7. Country', th: '7. ประเทศ' },
                  admin: {
                    condition: (data) =>
                      data?.searchPageSettings?.sidebarFilterSettings?.enabled === true,
                  },
                },
                // 8. เมือง
                {
                  name: 'showCity',
                  type: 'checkbox',
                  defaultValue: true,
                  label: { en: '8. City', th: '8. เมือง' },
                  admin: {
                    condition: (data) =>
                      data?.searchPageSettings?.sidebarFilterSettings?.enabled === true,
                  },
                },
                // 9. เดือน
                {
                  name: 'showMonth',
                  type: 'checkbox',
                  defaultValue: true,
                  label: { en: '9. Month', th: '9. เดือน' },
                  admin: {
                    condition: (data) =>
                      data?.searchPageSettings?.sidebarFilterSettings?.enabled === true,
                  },
                },
              ],
            },
          ],
        },

        // ============================================
        // Tab 7: 🔎 ตั้งค่ากล่องค้นหาทัวร์
        // ============================================
        {
          name: 'searchSectionSettings',
          label: { en: '🔎 Search Box', th: '🔎 กล่องค้นหา' },
          description: {
            en: '(Home, Intertours, Search Tour)',
            th: 'ตั้งค่ากล่องค้นหาที่ใช้ร่วมกันทุกหน้า (Home, Intertours, Search Tour)',
          },
          fields: [
            {
              name: 'enableSearchSection',
              type: 'checkbox',
              defaultValue: true,
              label: { en: 'Enable Search Box', th: 'เปิดใช้งานกล่องค้นหา' },
              admin: {
                description: {
                  en: 'Enable/disable search box on Listing Pages',
                  th: 'เปิด/ปิด กล่องค้นหาบนหน้า Listing Page (เช่น หน้าค้นหา หรือ หน้าทัวร์ต่างประเทศ)',
                },
              },
            },
            {
              name: 'headingSettings',
              type: 'group',
              label: 'Heading Settings',
              admin: {
                description: { en: 'Search box heading settings', th: 'ตั้งค่าหัวข้อกล่องค้นหา' },
                condition: (data) => data?.searchSectionSettings?.enableSearchSection !== false,
              },
              fields: [
                {
                  name: 'heading',
                  type: 'text',
                  defaultValue: 'ค้นหาโปรแกรมทัวร์',
                  localized: true,
                  label: { en: 'Search Box Heading', th: 'หัวข้อกล่องค้นหา' },
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
                    description: {
                      en: 'Show/hide icon before heading',
                      th: 'เปิด/ปิด Icon ข้างหน้าหัวข้อ',
                    },
                  },
                },
                {
                  name: 'headingIcon',
                  type: 'upload',
                  relationTo: 'media',
                  label: { en: 'Icon', th: 'Icon หัวข้อ' },
                  admin: {
                    description: {
                      en: 'Upload icon (SVG or image file)',
                      th: 'อัพโหลด Icon (รองรับไฟล์ SVG หรือรูปภาพ)',
                    },
                    condition: (_, siblingData) => siblingData?.showHeadingIcon === true,
                  },
                },
              ],
            },
            {
              name: 'searchFields',
              type: 'group',
              label: 'Search Fields Configuration',
              admin: {
                description: {
                  en: 'Enable/disable and configure each search field',
                  th: 'เปิด/ปิด และกำหนดชื่อแต่ละ field ค้นหา',
                },
                condition: (data) => data?.searchSectionSettings?.enableSearchSection !== false,
              },
              fields: [
                // ประเทศ
                {
                  name: 'countryField',
                  type: 'group',
                  label: { en: 'Country / City', th: 'ประเทศ / เมือง' },
                  fields: [
                    {
                      name: 'enabled',
                      type: 'checkbox',
                      defaultValue: true,
                      label: { en: 'Enabled', th: 'เปิดใช้งาน' },
                    },
                    {
                      name: 'includeCity',
                      type: 'checkbox',
                      defaultValue: false,
                      label:
                        'เปิดใช้งานแสดงเมือง / จังหวัด (หากเปิดใช้งาน Field เลือกประเทศ จะเปลี่ยนเป็น เลือกประเทศ / เมือง)',
                      admin: {
                        condition: (_, s) => s?.enabled,
                        components: {
                          Field: '@/fields/IncludeCityCheckbox#IncludeCityCheckbox',
                        },
                      },
                      hooks: {
                        beforeChange: [
                          ({ siblingData, value }) => {
                            if (value) {
                              if (!siblingData.label || siblingData.label === 'เลือกประเทศ') {
                                siblingData.label = 'เลือกประเทศ / เมือง'
                              }
                              if (
                                !siblingData.placeholder ||
                                siblingData.placeholder === 'เลือกประเทศ'
                              ) {
                                siblingData.placeholder = 'เลือกประเทศ / เมือง'
                              }
                            }
                            return value
                          },
                        ],
                      },
                    },
                    {
                      type: 'row',
                      admin: { condition: (_, s) => s?.enabled },
                      fields: [
                        {
                          name: 'label',
                          type: 'text',
                          defaultValue: 'เลือกประเทศ',
                          localized: true,
                          label: 'Label',
                        },
                        {
                          name: 'placeholder',
                          type: 'text',
                          defaultValue: 'เลือกประเทศ',
                          localized: true,
                          label: 'Placeholder',
                        },
                      ],
                    },
                  ],
                },

                // เทศกาล
                {
                  name: 'festivalField',
                  type: 'group',
                  label: { en: 'Festival Tours', th: 'ทัวร์ตามเทศกาล' },
                  fields: [
                    {
                      name: 'enabled',
                      type: 'checkbox',
                      defaultValue: false,
                      label: { en: 'Enabled', th: 'เปิดใช้งาน' },
                    },
                    {
                      type: 'row',
                      admin: { condition: (_, s) => s?.enabled },
                      fields: [
                        {
                          name: 'label',
                          type: 'text',
                          defaultValue: 'ทัวร์ตามเทศกาล',
                          localized: true,
                          label: 'Label',
                        },
                        {
                          name: 'placeholder',
                          type: 'text',
                          defaultValue: 'เลือกเทศกาล',
                          localized: true,
                          label: 'Placeholder',
                        },
                      ],
                    },
                  ],
                },
                // สายการบิน
                {
                  name: 'airlineField',
                  type: 'group',
                  label: { en: 'Airline', th: 'สายการบิน' },
                  fields: [
                    {
                      name: 'enabled',
                      type: 'checkbox',
                      defaultValue: false,
                      label: { en: 'Enabled', th: 'เปิดใช้งาน' },
                    },
                    {
                      type: 'row',
                      admin: { condition: (_, s) => s?.enabled },
                      fields: [
                        {
                          name: 'label',
                          type: 'text',
                          defaultValue: 'สายการบิน',
                          localized: true,
                          label: 'Label',
                        },
                        {
                          name: 'placeholder',
                          type: 'text',
                          defaultValue: 'เลือกสายการบิน',
                          localized: true,
                          label: 'Placeholder',
                        },
                      ],
                    },
                  ],
                },
                // รหัสทัวร์
                {
                  name: 'tourCodeField',
                  type: 'group',
                  label: {
                    en: 'Tour Code / Program / Destination',
                    th: 'รหัสทัวร์ / โปรแกรม / สถานที่ท่องเที่ยว',
                  },
                  fields: [
                    {
                      name: 'enabled',
                      type: 'checkbox',
                      defaultValue: true,
                      label: { en: 'Enabled', th: 'เปิดใช้งาน' },
                    },
                    {
                      type: 'row',
                      admin: { condition: (_, s) => s?.enabled },
                      fields: [
                        {
                          name: 'label',
                          type: 'text',
                          defaultValue: 'รหัสทัวร์',
                          localized: true,
                          label: 'Label',
                        },
                        {
                          name: 'placeholder',
                          type: 'text',
                          defaultValue: 'รหัสทัวร์',
                          localized: true,
                          label: 'Placeholder',
                        },
                      ],
                    },
                  ],
                },
                // Wholesale
                {
                  name: 'wholesaleField',
                  type: 'group',
                  label: 'Wholesale',
                  fields: [
                    {
                      name: 'enabled',
                      type: 'checkbox',
                      defaultValue: false,
                      label: { en: 'Enabled', th: 'เปิดใช้งาน' },
                    },
                    {
                      type: 'row',
                      admin: { condition: (_, s) => s?.enabled },
                      fields: [
                        {
                          name: 'label',
                          type: 'text',
                          defaultValue: 'Wholesale',
                          localized: true,
                          label: 'Label',
                        },
                        {
                          name: 'placeholder',
                          type: 'text',
                          defaultValue: 'เลือก Wholesale',
                          localized: true,
                          label: 'Placeholder',
                        },
                      ],
                    },
                  ],
                },
                // ช่วงเวลาเดินทาง
                {
                  name: 'dateRangeField',
                  type: 'group',
                  label: { en: 'Travel Date Range', th: 'ช่วงเวลาเดินทาง' },
                  fields: [
                    {
                      name: 'enabled',
                      type: 'checkbox',
                      defaultValue: true,
                      label: { en: 'Enabled', th: 'เปิดใช้งาน' },
                    },
                    {
                      type: 'row',
                      admin: { condition: (_, s) => s?.enabled },
                      fields: [
                        {
                          name: 'labelFrom',
                          type: 'text',
                          defaultValue: 'ช่วงเวลาเดินทาง',
                          localized: true,
                          label: 'Label',
                        },
                        {
                          name: 'placeholderFrom',
                          type: 'text',
                          defaultValue: 'เลือกช่วงเวลา',
                          localized: true,
                          label: 'Placeholder',
                        },
                      ],
                    },
                  ],
                },
                // เดือน
                {
                  name: 'monthField',
                  type: 'group',
                  label: { en: 'Month', th: 'เดือน' },
                  fields: [
                    {
                      name: 'enabled',
                      type: 'checkbox',
                      defaultValue: true,
                      label: { en: 'Enabled', th: 'เปิดใช้งาน' },
                    },
                    {
                      type: 'row',
                      admin: { condition: (_, s) => s?.enabled },
                      fields: [
                        {
                          name: 'label',
                          type: 'text',
                          defaultValue: 'เลือกเดือน',
                          localized: true,
                          label: 'Label',
                        },
                        {
                          name: 'placeholder',
                          type: 'text',
                          defaultValue: 'เลือกเดือน',
                          localized: true,
                          label: 'Placeholder',
                        },
                      ],
                    },
                  ],
                },
                // ช่วงราคา
                {
                  name: 'priceRangeField',
                  type: 'group',
                  label: { en: 'Price Range', th: 'ช่วงราคา (Price Range)' },
                  fields: [
                    {
                      name: 'enabled',
                      type: 'checkbox',
                      defaultValue: true,
                      label: { en: 'Enabled', th: 'เปิดใช้งาน' },
                    },
                    {
                      name: 'label',
                      type: 'text',
                      defaultValue: 'ช่วงราคา',
                      localized: true,
                      label: 'Label — ชื่อ',
                      admin: { condition: (_, s) => s?.enabled },
                    },
                    {
                      type: 'row',
                      admin: { condition: (_, s) => s?.enabled },
                      fields: [
                        {
                          name: 'minPrice',
                          type: 'number',
                          defaultValue: 0,
                          label: { en: 'Minimum Price', th: 'ราคาต่ำสุด' },
                        },
                        {
                          name: 'maxPrice',
                          type: 'number',
                          defaultValue: 1000000,
                          label: { en: 'Maximum Price', th: 'ราคาสูงสุด' },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },

        // ============================================
        // Tab: 🍪 PDPA / Cookie Consent
        // ============================================
        {
          name: 'pdpa',
          label: { en: '🍪 PDPA / Cookie', th: '🍪 PDPA / Cookie' },
          fields: [
            {
              name: 'enableCookieBanner',
              type: 'checkbox',
              label: { en: 'Cookie Consent Banner', th: 'เปิดใช้งาน Cookie Consent Banner' },
              defaultValue: true,
              admin: {
                description: {
                  en: 'Show consent banner when users first visit the website',
                  th: 'แสดง Banner ขอความยินยอมเมื่อผู้ใช้เข้าชมเว็บไซต์ครั้งแรก',
                },
              },
            },
            {
              name: 'cookieBannerText',
              type: 'textarea',
              label: { en: 'Banner', th: 'ข้อความบน Banner' },
              defaultValue:
                'บริษัทใช้คุกกี้เพื่อเพิ่มประสบการณ์และความพึงพอใจในการใช้งานเว็บไซต์ ให้สามารถเข้าถึงง่าย สะดวกในการใช้งาน และมีประสิทธิภาพยิ่งขึ้น การกด "ยอมรับ" ถือว่าคุณได้ให้อนุญาตให้เราใช้คุกกี้ทั้งหมด ตามนโยบายคุกกี้ของบริษัท',
              admin: {
                description: {
                  en: 'Text displayed on the Cookie Banner',
                  th: 'ข้อความที่แสดงบน Cookie Banner',
                },
                condition: (data: any) => data?.pdpa?.enableCookieBanner,
              },
            },
            {
              name: 'cookiePolicyUrl',
              type: 'text',
              label: { en: 'URL', th: 'URL หน้านโยบายคุกกี้' },
              defaultValue: '/cookie-policy',
              admin: {
                description: {
                  en: 'Link to cookie policy page, e.g. /cookie-policy',
                  th: 'ลิงก์ไปหน้านโยบายคุกกี้ เช่น /cookie-policy',
                },
                condition: (data: any) => data?.pdpa?.enableCookieBanner,
              },
            },
          ],
        },
      ],
    },
  ],
}
