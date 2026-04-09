# 🔍 Module: Search & SEO

> ระบบค้นหาเนื้อหาและ SEO Optimization
> รวม Full-text Search, Meta Tags, OpenGraph Image Generation, และ Redirects

---

## 🏗️ Architecture Overview

```mermaid
flowchart TB
    subgraph "Search System"
        SP["🔌 Search Plugin\n(@payloadcms/plugin-search)"]
        SC["📚 Search Collection\n(auto-indexed)"]
        SA["🔍 Search Action\n(Server Action)"]
        SU["🔎 Search UI\n(Frontend Component)"]
    end

    subgraph "SEO System"
        SEO["🏷️ SEO Plugin\n(@payloadcms/plugin-seo)"]
        OG["🖼️ OpenGraph\nImage Generator"]
        META["📋 Default Meta\n(PageConfig Global)"]
        RED["🔀 Redirects Plugin"]
    end

    subgraph "Content Sources"
        PG["Pages"]
        PT["Posts"]
    end

    PG & PT --> SP
    SP -->|"beforeSync hook"| SC
    SC --> SA
    SA --> SU

    PG & PT --> SEO
    SEO --> META
    META --> OG
    RED --> PG & PT
```

---

## 📊 Entity Relationship Diagram

```mermaid
erDiagram
    SEARCH {
        string id PK
        string title "indexed title"
        string slug
        json doc "relationTo + value"
        number priority "search ranking"
        json meta
        string extractedText "full text content"
        string description
        timestamp updatedAt
    }

    PAGES {
        string id PK
        string title
        json meta "SEO fields"
        string metaTitle
        string metaDescription
        upload metaImage
    }

    POSTS {
        string id PK
        string title
        json meta "SEO fields"
    }

    REDIRECTS {
        string id PK
        string from "source URL"
        json to "target (reference or URL)"
        string type "301 | 302"
    }

    PAGE_CONFIG {
        string id PK
        group defaultMeta
        string defaultTitle
        string defaultDescription
        group openGraph
        upload backgroundImage
        string textColor
        string textPosition
    }

    SEARCH }o--|| PAGES : "doc.relationTo = pages"
    SEARCH }o--|| POSTS : "doc.relationTo = posts"
    REDIRECTS }o--o| PAGES : "to.reference"
    REDIRECTS }o--o| POSTS : "to.reference"
```

---

## 🔄 User Journey: ค้นหาเนื้อหา

```mermaid
sequenceDiagram
    actor Visitor
    participant FE as Frontend
    participant SA as Server Action
    participant DB as MongoDB (search collection)

    Visitor->>FE: พิมพ์คำค้นหา
    FE->>FE: Debounce input (300ms)
    FE->>SA: search(query, limit)

    alt No Query
        SA->>DB: Find recent 5 items
        DB-->>SA: Recent results
    end

    alt With Query
        SA->>DB: Search by title, extractedText, description
        DB-->>SA: Matched results (sorted by priority)
    end

    SA-->>FE: SearchResponse {results, totalDocs}
    FE->>FE: Render search results
    Visitor->>FE: คลิกผลลัพธ์
    FE->>FE: Navigate to /slug or /posts/slug
```

---

## 🔀 SEO Meta Resolution Flow

```mermaid
flowchart TD
    A["Page Request"] --> B["generateMeta()"]
    B --> C{"Page has meta fields?"}

    C -->|"Yes"| D["Use Page Meta\n(title, description, image)"]
    C -->|"No"| E["Fetch PageConfig.defaultMeta"]

    D --> F["Merge with OpenGraph settings"]
    E --> F

    F --> G{"OG Background Image?"}
    G -->|"Yes"| H["Generate OG Image\n(/next/og endpoint)"]
    G -->|"No"| I["Use meta.image or default"]

    H --> J["Sharp renders image\nwith text overlay"]
    J --> K["Return OG Image URL"]
    I --> K

    K --> L["Generate HTML meta tags"]
    L --> M["<meta property='og:image'>"]
    L --> N["<meta property='og:title'>"]
    L --> O["<meta name='description'>"]
    L --> P["<title>"]
```

---

## 📝 State Diagram: Search Index

```mermaid
stateDiagram-v2
    [*] --> NotIndexed : Page/Post สร้างใหม่

    NotIndexed --> Indexing : beforeSync hook triggered
    Indexing --> Indexed : Search document created

    state Indexing {
        [*] --> ExtractText
        ExtractText : แยกข้อความจาก rich text
        ExtractText --> CalculatePriority
        CalculatePriority : คำนวณ priority score
        CalculatePriority --> SaveIndex
        SaveIndex : บันทึกลง search collection
    }

    Indexed --> Updating : Page/Post แก้ไข
    Updating --> Indexed : Re-index complete

    Indexed --> [*] : Page/Post ถูกลบ
```

---

## 🔀 Redirect Flow

```mermaid
flowchart TD
    A["Visitor เข้า URL"] --> B["PayloadRedirects Component"]
    B --> C["Fetch redirects from DB"]
    C --> D{"URL matches redirect?"}

    D -->|"Yes"| E{"Redirect type?"}
    E -->|"301"| F["Permanent Redirect"]
    E -->|"302"| G["Temporary Redirect"]
    F & G --> H["Redirect to target URL"]

    D -->|"No"| I["Render normal page"]
```

---

## ⚙️ Search Configuration Details

### beforeSync Hook

ก่อนบันทึกเข้า Search collection จะ:
1. **Extract Text** — แยกข้อความจาก Lexical rich text content
2. **Calculate Priority** — คำนวณ priority สำหรับ ranking
3. **Format Data** — จัดรูปแบบ title, slug, meta

### Search Fields

| Field | ค้นหาได้ | คำอธิบาย |
|-------|:--------:|----------|
| `title` | ✅ | ชื่อหน้า/บทความ |
| `meta.extractedText` | ✅ | เนื้อหาทั้งหมด |
| `meta.description` | ✅ | Meta description |
| `slug` | ❌ | URL slug |
| `priority` | ❌ | ใช้ sort เท่านั้น |

### SEO Plugin Fields (per Page/Post)

| Field | คำอธิบาย |
|-------|----------|
| `meta.title` | SEO Title (auto-generate available) |
| `meta.description` | Meta Description |
| `meta.image` | OG Image (upload) |
| Overview | SEO score preview |
| Preview | Search result preview |

---

## 🔑 Key Files

| File | คำอธิบาย |
|------|----------|
| `src/search/beforeSync.ts` | Search indexing hook (text extraction) |
| `src/search/fieldOverrides.ts` | Custom search fields |
| `src/search/Component.tsx` | Search UI component (9KB) |
| `src/actions/search.ts` | Server action for search (217 lines) |
| `src/utilities/generateMeta.ts` | Meta tag generation |
| `src/utilities/generateOGImage.tsx` | OpenGraph image rendering |
| `src/utilities/extractTextFromDocument.ts` | Rich text → plain text |
| `src/utilities/getRedirects.ts` | Fetch redirects |
| `src/components/PayloadRedirects/` | Redirect handler component |
| `src/app/(frontend)/next/og/` | OG image API route |
| `src/globals/PageConfig/config.ts` | Default meta & OG settings |

---

## ⚙️ API Endpoints

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| GET | `/api/search` | Search collection (raw) |
| GET | `/api/search?where[title][contains]=query` | Search by title |
| POST | Server Action `search()` | Full-text search (preferred) |
| GET | `/api/redirects` | List all redirects |
| GET | `/next/og?title=...&description=...` | Generate OG Image |
| GET | `/api/globals/page-config` | Default meta settings |

---

## 🔧 Environment Variables

| Variable | คำอธิบาย |
|----------|----------|
| `PAYLOAD_PUBLIC_SERVER_URL` | Base URL for OG image and preview |
