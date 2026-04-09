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
        C -->|"Production"| E["☁️ Vercel Blob\nStorage"]
    end

    subgraph "Usage"
        F["Pages (Hero, Blocks)"]
        G["Posts (Banner, Content)"]
        H["Header/Footer (Logo)"]
        I["TourCategories (Icon)"]
        J["InterTours (Flag Icon)"]
        K["PageConfig (Favicon, OG Image)"]
        L["OpenGraph Image Generator"]
    end

    B --> F & G & H & I & J & K
    B --> L

    subgraph "Processing"
        S["Sharp Image Processing\n(resize, optimize)"]
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
| Production | Vercel Blob | `token: BLOB_READ_WRITE_TOKEN` |

### Image Processing (Sharp v0.32.6)

| Feature | คำอธิบาย |
|---------|----------|
| Resize | Auto-resize to optimize |
| Format | Support JPEG, PNG, WebP, SVG, ICO |
| Quality | Optimized for web delivery |

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
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage token (production) |
