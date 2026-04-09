# 📄 Module: Content Management (Pages, Posts, Blocks, Hero)

> ระบบจัดการเนื้อหาเว็บไซต์ — หัวใจหลักของ PayBlocks
> รวม Layout Builder, Block System, Hero Section, และ Blog/Posts

---

## 🏗️ Architecture Overview

```mermaid
flowchart TB
    subgraph "Content Management Module"
        direction TB
        PG["📄 Pages Collection"]
        PT["📝 Posts Collection"]
        CT["📂 Categories Collection"]

        subgraph "Page Structure"
            HERO["🎯 Hero Section"]
            BLOCKS["🧱 Layout Blocks (27+)"]
            SEO["🔍 SEO Meta"]
        end

        PG --> HERO
        PG --> BLOCKS
        PG --> SEO
        PT --> CT
    end

    subgraph "Block Types"
        B1["Feature"] & B2["CTA"] & B3["FAQ"]
        B4["Gallery"] & B5["Form"] & B6["Testimonial"]
        B7["Contact"] & B8["Banner"] & B9["Blog"]
        B10["Stat"] & B11["About"] & B12["Others..."]
    end

    BLOCKS --> B1 & B2 & B3 & B4 & B5 & B6
    BLOCKS --> B7 & B8 & B9 & B10 & B11 & B12
```

---

## 📊 Entity Relationship Diagram

```mermaid
erDiagram
    PAGES {
        string id PK
        string title
        string slug UK
        json hero
        json layout "blocks array"
        json meta "SEO data"
        date publishedAt
        boolean enableBreadcrumbs
        json breadcrumbs "nested-docs plugin"
        string _status "draft | published"
    }

    POSTS {
        string id PK
        string title
        string slug UK
        json content "Lexical rich text"
        string designVersion "BLOG18 | BLOG20"
        upload bannerImage "FK -> Media"
        number readTime "auto-calculated"
        date publishedAt
        string _status "draft | published"
    }

    CATEGORIES {
        string id PK
        string title
    }

    MEDIA {
        string id PK
        string alt
        json caption "Lexical rich text"
        string url
        string filename
    }

    USERS {
        string id PK
        string name
        string email
    }

    PAGES ||--o{ MEDIA : "hero.images"
    POSTS ||--o{ CATEGORIES : "categories (many-to-many)"
    POSTS ||--o{ USERS : "authors"
    POSTS ||--o{ POSTS : "relatedPosts"
    POSTS ||--o| MEDIA : "bannerImage"
    POSTS ||--o| MEDIA : "meta.image"
    PAGES ||--o| MEDIA : "meta.image"
```

---

## 🔄 User Journey: สร้างหน้าเว็บใหม่

```mermaid
sequenceDiagram
    actor Admin
    participant CMS as Payload Admin Panel
    participant DB as MongoDB
    participant FE as Frontend (Next.js)

    Admin->>CMS: เข้า /admin/collections/pages
    Admin->>CMS: คลิก "Create New"
    Admin->>CMS: กรอก Title
    Admin->>CMS: เลือก Hero Design Version
    Admin->>CMS: เพิ่ม Hero Content (richText, images, links)
    Admin->>CMS: สลับไป Tab "Content"
    Admin->>CMS: เพิ่ม Blocks (Feature, CTA, FAQ, etc.)
    Admin->>CMS: เลือก Design Variant ของแต่ละ Block
    Admin->>CMS: ตั้งค่า SEO (Title, Description, Image)
    Admin->>CMS: กด Publish
    CMS->>DB: Save page document
    CMS->>FE: Revalidate page cache (afterChange hook)
    FE->>DB: Fetch updated page data
    FE-->>Admin: ✅ หน้าเว็บแสดงผลตาม slug
```

---

## 🏗️ Block Rendering Flow

```mermaid
flowchart TD
    A["Page Document (from DB)"] --> B["layout: Block[]"]
    B --> C["RenderBlocks Component"]
    C --> D{"blockType?"}

    D -->|"feature"| E["FeatureBlock"]
    D -->|"cta"| F["CtaBlock"]
    D -->|"formBlock"| G["FormBlock"]
    D -->|"gallery"| H["GalleryBlock"]
    D -->|"faq"| I["FaqBlock"]
    D -->|"testimonial"| J["TestimonialBlock"]
    D -->|"contact"| K["ContactBlock"]
    D -->|"stat"| L["StatBlock"]
    D -->|"blog"| M["BlogBlock"]
    D -->|"..."| N["Other Blocks"]

    E --> O{"designVersion?"}
    O -->|"FEATURE1"| P["Feature1 Component"]
    O -->|"FEATURE2"| Q["Feature2 Component"]
    O -->|"..."| R["FeatureN Component"]

    P & Q & R --> S["Apply backgroundColor"]
    S --> T["🖥️ Rendered Section"]
```

---

## 📝 State Diagram: Page Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft : สร้างหน้าใหม่
    Draft --> Draft : แก้ไข / Autosave (100ms)
    Draft --> Published : กด Publish
    Published --> Draft : Unpublish / แก้ไข
    Published --> Published : Update & Re-publish
    Draft --> [*] : Delete

    state Draft {
        [*] --> Editing
        Editing --> Previewing : Live Preview
        Previewing --> Editing : กลับไปแก้ไข
    }

    state Published {
        [*] --> Live
        Live --> Revalidating : afterChange hook
        Revalidating --> Live : Cache cleared
    }
```

---

## 📋 Block Design Variants Reference

### Feature Block (มากที่สุด)
- `FEATURE1` - `FEATURE25+` — มากกว่า 25 รูปแบบ
- แต่ละแบบมี field conditions ที่แตกต่าง (images, icons, USPs, stats)

### CTA Block
- `CTA1` - `CTA15+` — Call-to-Action หลายรูปแบบ

### Gallery Block
- `GALLERY1` - `GALLERY6+` — รวม Lightbox, Masonry, Grid

### FAQ Block
- `FAQ1` - `FAQ5+` — Accordion แบบต่างๆ

### Testimonial Block
- `TESTIMONIAL1` - `TESTIMONIAL10+` — Review/Rating cards

### WOW TourByType Block
- `WOW Tour Card 1` - `WOW Tour Card 6` — 6 รูปแบบการ์ดทัวร์
- ดึงข้อมูลจาก Tour Groups (CMS) อัตโนมัติ
- รองรับ: รูปปก, ชื่อทัวร์, คำอธิบาย, ช่วงเดินทาง, สายการบิน, ราคา, ปุ่มดาวน์โหลด PDF/Word/Banner

### WOW ServiceByType Block (**NEW**)
- `WOW Service Card 1` - `WOW Service Card 6` — reuse style จาก TourByType ทั้ง 6 แบบ
- รองรับ 3 ประเภทสินค้า: **บัตรเข้าชม** (admission), **เรือสำราญ** (cruise), **รถเช่า** (car_rental)
- ข้อมูลกรอกด้วยมือ (Manual Items Array) — จะเชื่อม API ในอนาคต
- แต่ละ Item มี: รูปปก, ชื่อสินค้า, คำอธิบาย, สถานที่, ระยะเวลา, ราคา, Badge, ลิงก์รายละเอียด

---

## 🔑 Key Files

| File | คำอธิบาย |
|------|----------|
| `src/collections/Pages/index.ts` | Pages collection config |
| `src/collections/Posts/index.ts` | Posts collection config |
| `src/collections/Categories.ts` | Categories collection config |
| `src/heros/config.ts` | Hero field configuration (all variants) |
| `src/heros/RenderHero.tsx` | Hero renderer (routes to correct variant) |
| `src/heros/PageHero/` | 49 hero component files |
| `src/blocks/RenderBlocks.tsx` | Main block renderer |
| `src/blocks/*/config.ts` | Block field configurations |
| `src/blocks/*/Component.tsx` | Block React components |
| `src/collections/Pages/hooks/revalidatePage.ts` | Revalidation after save |
| `src/collections/Posts/hooks/revalidatePost.ts` | Post revalidation |
| `src/collections/Posts/hooks/calculcateReadTime.ts` | Auto-calculate read time |
| `src/collections/Posts/hooks/populateAuthors.ts` | Populate author data |

---

## ⚙️ API Endpoints สำหรับ Module นี้

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| GET | `/api/pages` | List pages (supports `where`, `sort`, `limit`, `depth`) |
| GET | `/api/pages?where[slug][equals]=home` | Find page by slug |
| POST | `/api/pages` | Create page |
| PATCH | `/api/pages/:id` | Update page |
| DELETE | `/api/pages/:id` | Delete page |
| GET | `/api/posts` | List posts |
| GET | `/api/posts?where[categories][in]=:catId` | Filter by category |
| POST | `/api/posts` | Create post |
| GET | `/api/categories` | List categories |
