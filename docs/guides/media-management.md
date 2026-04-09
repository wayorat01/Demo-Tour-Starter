# 🖼️ Module: Media Management

> ระบบจัดการไฟล์ Media (รูปภาพ, วิดีโอ)
> รวม Upload, Storage, และ Optimization

---

## 🏗️ Architecture Overview

```mermaid
flowchart TB
    subgraph "Upload Flow"
        A["👤 Admin อัพโหลดไฟล์"] --> B["Payload CMS\nMedia Collection"]
        B --> C{"Storage Backend?"}
        C -->|"Development"| D["📁 Local\n/public/media/"]
        C -->|"Production"| E["☁️ Wasabi S3\n(@payloadcms/storage-s3)"]
        E --> F2["🌐 BunnyCDN\n(CDN cache layer)"]
    end

    subgraph "Usage"
        F["Pages (Hero, Blocks)"]
        G["Posts (Banner, Content)"]
        H["Header/Footer (Logo)"]
        I["TourCategories (Icon)"]
        J["InterTours (Flag Icon)"]
        K["PageConfig (Favicon, OG Image)"]
        L["OpenGraph Image Generator"]
        M["WOW ServiceByType (Tickets, Cruises, Cars)"]
    end

    B --> F & G & H & I & J & K & M
    B --> L

    subgraph "Processing"
        S["Sharp Image Processing\n(resize, optimize, WebP)"]
    end

    B --> S
```

---

## 📊 Entity Relationship Diagram

```mermaid
erDiagram
    MEDIA {
        string id PK
        string alt "Alternative text"
        json caption "Lexical rich text (localized)"
        string url "File URL"
        string filename
        string mimeType
        number filesize
        number width
        number height
        timestamp createdAt
    }

    PAGES ||--o{ MEDIA : "hero.images, meta.image"
    POSTS ||--o| MEDIA : "bannerImage, meta.image"
    HEADER ||--o| MEDIA : "logo, socialLinks.customIcon"
    FOOTER ||--o| MEDIA : "logo"
    TOUR_CATEGORIES ||--o| MEDIA : "icon"
    INTER_TOURS ||--o| MEDIA : "flagIcon"
    PAGE_CONFIG ||--o| MEDIA : "favicon, sitePreviewImage, openGraph.backgroundImage"
```

---

## 🔄 User Journey: อัพโหลดและใช้งาน Media

```mermaid
sequenceDiagram
    actor Admin
    participant CMS as Payload Admin
    participant Sharp as Sharp (Image Processing)
    participant Storage as Storage (Local/Vercel Blob)
    participant FE as Frontend

    Admin->>CMS: เลือกไฟล์รูปภาพ
    CMS->>Sharp: Process image (resize, optimize)
    Sharp-->>CMS: Processed image
    CMS->>Storage: Upload file

    alt Local Development
        Storage-->>CMS: Saved to /public/media/
    end

    alt Vercel Production
        Storage-->>CMS: Saved to Vercel Blob
    end

    CMS->>CMS: Save metadata (alt, caption, url)
    CMS-->>Admin: ✅ Image ready to use

    Note over Admin, FE: ใช้งานรูปภาพ
    Admin->>CMS: เลือก Media ใน Page/Block field
    CMS->>CMS: Create relationship reference
    FE->>Storage: Fetch image by URL
    Storage-->>FE: Serve image
    FE-->>Admin: 🖥️ Image displayed on page
```

---

## 📝 State Diagram: Media Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Uploading : Admin เลือกไฟล์
    Uploading --> Processing : File received
    Processing --> Stored : Sharp processed + saved
    Stored --> InUse : เลือกใช้ใน Page/Block
    InUse --> Stored : Remove from Page/Block
    Stored --> [*] : Delete from Media library

    state Processing {
        [*] --> Resize
        Resize --> Optimize
        Optimize --> SaveToStorage
    }

    state InUse {
        [*] --> Referenced
        Referenced : ใช้ใน Hero images
        Referenced : ใช้ใน Block content
        Referenced : ใช้เป็น Logo
        Referenced : ใช้เป็น Favicon
        Referenced : ใช้เป็น OG Image
    }
```

---

## ⚙️ Configuration Details

### Media Collection Fields

| Field | Type | คำอธิบาย |
|-------|------|----------|
| `alt` | text | Alternative text (accessibility) |
| `caption` | richText | Caption (localized, Lexical editor) |

### Storage Configuration

| Environment | Storage | Config |
|------------|---------|--------|
| Local Dev | File System | `staticDir: /public/media/` |
| Production | Wasabi S3 + BunnyCDN | `@payloadcms/storage-s3` plugin |

### Image Processing (Sharp v0.32.6)

| Feature | คำอธิบาย |
|---------|----------|
| Resize | Auto-resize to optimize |
| Format | Support JPEG, PNG, WebP, SVG, ICO |
| Quality | Optimized for web delivery |

### 📌 WebP-First Media Policy (2026-04-02)

> **กฎ:** ไฟล์รูปภาพทั้งหมดที่อัปโหลดเข้าระบบ **ต้องเป็นนามสกุล `.webp`** เพื่อประสิทธิภาพการโหลดหน้าเว็บ

- `.webp` รองรับพื้นหลังโปร่งใส (alpha channel) เหมือน `.png`
- ไฟล์เล็กกว่า PNG/JPEG 40-60% โดยไม่เสียคุณภาพ
- หากต้อง convert ไฟล์เก่า ใช้ Sharp: `sharp(input).webp({ quality: 80 }).toFile(output)`
- สิ่งที่ถูก convert แล้ว: รูปรถเช่า (12), เรือสำราญ (6), บัตรเข้าชม (12), ไอคอนภาค/โลโก้ต่างๆ

---

## 🔑 Key Files

| File | คำอธิบาย |
|------|----------|
| `src/collections/Media.ts` | Media collection configuration |
| `src/components/Media/` | Media rendering components (4 files) |
| `src/utilities/generateOGImage.tsx` | OG Image generator using Media |
| `public/media/` | Local media storage directory |

---

## ⚙️ API Endpoints

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| GET | `/api/media` | List media files |
| GET | `/api/media/:id` | Get media details |
| POST | `/api/media` | Upload new media file |
| PATCH | `/api/media/:id` | Update media (alt, caption) |
| DELETE | `/api/media/:id` | Delete media file |

---

## 🔧 Environment Variables

| Variable | คำอธิบาย |
|----------|----------|
| `S3_BUCKET` | ชื่อ Bucket ใน Wasabi S3 |
| `S3_ACCESS_KEY_ID` | Access Key สำหรับ S3 |
| `S3_SECRET_ACCESS_KEY` | Secret Key สำหรับ S3 |
| `S3_ENDPOINT` | Wasabi endpoint URL |
| `S3_REGION` | Wasabi region (e.g. `ap-southeast-1`) |
