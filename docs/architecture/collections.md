# 📦 Collections & Globals Reference

## Collections (19)

| Collection | Slug | คำอธิบาย | Access |
|-----------|------|----------|--------|
| **Pages** | `pages` | หน้าเว็บไซต์พร้อม Hero, Layout Blocks, SEO | authenticated / publishedOrAuth |
| **Posts** | `posts` | บทความ/บล็อก พร้อม Rich Text, SEO, Categories | authenticated / publishedOrAuth |
| **Media** | `media` | ไฟล์รูปภาพ/วิดีโอ พร้อม alt, caption | authenticated / anyone read |
| **Categories** | `categories` | หมวดหมู่สำหรับ Posts | authenticated / anyone read |
| **Users** | `users` | ผู้ใช้ระบบ (Admin, Editor) + OAuth2 | isAdmin create / authenticated read |
| **Roles** | `roles` | สิทธิ์ผู้ใช้ (permissions-based) | isAdmin / authenticated read |
| **TourCategories** | `tour-categories` | หมวดหมูทัวร์ (Asia, Europe, etc.) | authenticated / anyone read |
| **InterTours** | `intertours` | ข้อมูลทัวร์ต่างประเทศ (ประเทศ+เมือง) พร้อม `parentCountry` self-reference | authenticated / anyone read |
| **InboundTours** | `inbound-tours` | ข้อมูลทัวร์ในประเทศ (จังหวัด+เมือง) พร้อม `parentCountry` self-reference | authenticated / anyone read |
| **ProgramTours** | `programtour` | โปรแกรมทัวร์ sync จาก API — ราคา, สายการบิน, ช่วงเดินทาง, ทวีป | authenticated / anyone read |
| **TourGroups** | `tour-groups` | กลุ่มทัวร์ (เช่น ทัวร์ยอดนิยม, ทัวร์โปรโมชั่น) — relationship ไป ProgramTours, ใช้ใน TourType block | authenticated / anyone read |
| **GalleryAlbums** | `gallery-albums` | อัลบั้มรูปภาพ พร้อม cover image, images array, SEO | authenticated / anyone read |
| **Tags** | `tags` | แท็กสำหรับโปรแกรมทัวร์ | authenticated / anyone read |
| **Testimonials** | `testimonials` | รีวิวจากลูกค้า + rating | authenticated / anyone read |
| **Bookings** | `bookings` | ข้อมูลการจองทัวร์ (ชื่อ, เบอร์โทร, ทัวร์ที่จอง, สถานะ) | authenticated / admin only |
| **Festivals** | `festivals` | ข้อมูลเทศกาลและวันหยุดสำคัญ | authenticated / anyone read |
| **Airlines** | `airlines` | ข้อมูลสายการบิน (ชื่อ, โลโก้) | authenticated / anyone read |
| **CustomLandingPages** | `custom-landing-pages` | Landing pages รวมโปรแกรมทัวร์ custom + SEO | authenticated / anyone read |
| **AuditLogs** | `audit-logs` | บันทึกกิจกรรมระบบ (สร้าง/แก้/ลบ/login) — immutable, fire-and-forget | isAdmin or canViewAuditLogs / ห้าม create/update/delete |

## Versions

| Collection | maxPerDoc | drafts | หมายเหตุ |
|-----------|-----------|--------|----------|
| Pages, Posts | 5 | ✅ | มีอยู่เดิม |
| InterTours, InboundTours, CustomLandingPages | 5 | ❌ | content ที่แก้ไขบ่อย |
| GalleryAlbums, Festivals, Testimonials | 5 | ❌ | content ที่แก้ไขได้ |
| TourCategories, Categories, Tags, TourGroups | 5 | ❌ | taxonomy/กลุ่ม |
| ProgramTours, Bookings, Airlines | — | — | ❌ ไม่เปิด (API/form data) |
| Media, Users, Roles, AuditLogs | — | — | ❌ ไม่เปิด (system data) |

## Globals (6)

| Global | Slug | คำอธิบาย |
|--------|------|----------|
| **Header** | `header` | Navbar (v1-7), Top Bar, Social Links, Mega Menu (Blocks-based v3, v5) |
| **Footer** | `footer` | Footer Layout, Legal Links, Social Links (8 designs) |
| **CompanyInfo** | `company-info` | ข้อมูลบริษัท: โลโก้, ชื่อ, เบอร์ Call Center, Hotline, Social Links |
| **ThemeConfig** | `themeConfig` | สี, Typography, Radius, Dark Mode Variables |
| **PageConfig** | `page-config` | Site Identity (favicon, name), Homepage Settings, Default Meta |
| **ApiSetting** | `api-setting` | External API endpoint + key (Tourprox) |

## Access Control Policies

| Policy | ใช้กับ | สิทธิ์ |
|--------|--------|--------|
| `anyone` | Media (read) | ทุกคนอ่านได้ |
| `authenticated` | Collections (CRUD) | ต้อง login |
| `authenticatedOrPublished` | Pages, Posts (read) | Published = ทุกคนอ่าน, Draft = ต้อง login |
| `isAdmin` | Users (create), Roles, AuditLogs (fallback) | Admin เท่านั้น |
| `isAdminOrSelf` | Users (update) | Admin หรือเจ้าของ profile |
| `hasPermission('canViewAuditLogs')` | AuditLogs (read) | role ที่มี permission นี้ (ติ๊กใน admin) |

