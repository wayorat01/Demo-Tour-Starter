# 🌏 Module: Tour Management (TourCategories, InterTours)

> ระบบจัดการทัวร์ต่างประเทศ — เฉพาะสำหรับ WOW Tour
> รวมหมวดหมู่ทัวร์, ข้อมูลทัวร์, Menu Dropdown, และ Blocks สำหรับแสดงทัวร์

---

## 🏗️ Architecture Overview

```mermaid
flowchart TB
    subgraph "Tour Management Module"
        TC["🗂️ TourCategories\n(Asia, Europe, etc.)"]
        IT["✈️ InterTours\n(ทัวร์ญี่ปุ่น, ทัวร์เกาหลี)"]
        TC -->|"category"| IT
    end

    subgraph "Display Components"
        NB["🧭 Navbar Tour Menu\n(TourCategoryMenu)"]
        PC["🌍 PopularCountry Block"]
        ST["🔍 SearchTour Block"]
    end

    IT --> NB
    IT --> PC
    TC --> NB
    TC --> ST

    subgraph "External (Future)"
        API["🔗 External Tour API\n(externalApiId field)"]
    end

    API -.->|"Future sync"| IT
```

---

## 📊 Entity Relationship Diagram

```mermaid
erDiagram
    TOUR_CATEGORIES {
        string id PK
        string title "localized (EN/DE)"
        string slug UK "e.g., asia, europe"
        upload icon "FK -> Media"
        number order "display order"
    }

    INTER_TOURS {
        string id PK
        string title "localized (e.g., ทัวร์ญี่ปุ่น)"
        string slug UK "URL slug"
        string category FK "FK -> TourCategories"
        upload flagIcon "FK -> Media (country flag)"
        number tourCount "จำนวนทัวร์"
        boolean isActive "แสดง/ซ่อน"
        number order "display order"
        string externalApiId "ID จาก API ภายนอก (อนาคต)"
    }

    MEDIA {
        string id PK
        string url
        string alt
    }

    TOUR_CATEGORIES ||--o{ INTER_TOURS : "has many tours"
    TOUR_CATEGORIES ||--o| MEDIA : "icon"
    INTER_TOURS ||--o| MEDIA : "flagIcon"
```

---

## 🔄 User Journey: จัดการทัวร์

```mermaid
sequenceDiagram
    actor Admin
    participant CMS as Payload Admin Panel
    participant DB as MongoDB
    participant FE as Frontend

    Note over Admin, FE: 1. สร้างหมวดหมู่ทัวร์
    Admin->>CMS: ไป Tour Categories
    Admin->>CMS: สร้างหมวด "Asia" (slug: asia)
    Admin->>CMS: อัพโหลด Category Icon
    CMS->>DB: Save TourCategory

    Note over Admin, FE: 2. สร้างทัวร์
    Admin->>CMS: ไป International Tours
    Admin->>CMS: สร้าง "ทัวร์ญี่ปุ่น"
    Admin->>CMS: เลือก Category = Asia
    Admin->>CMS: อัพโหลด Flag Icon 🇯🇵
    Admin->>CMS: ตั้ง tourCount = 15
    Admin->>CMS: ตั้ง isActive = true
    CMS->>DB: Save InterTour

    Note over Admin, FE: 3. ตั้งค่า Menu
    Admin->>CMS: ไป Header Global
    Admin->>CMS: เพิ่ม Nav Item -> Tour Category Menu
    Admin->>CMS: เลือกทัวร์ที่จะแสดง
    CMS->>DB: Save Header
    CMS->>FE: Revalidate Header cache
    FE-->>Admin: ✅ Menu แสดง Tour Dropdown
```

---

## 🧭 Navbar Tour Menu Flow

```mermaid
flowchart TD
    A["Header Global Config"] --> B["Navbar Component\n(wowtour_navbar5)"]
    B --> C["Nav Items Array"]
    C --> D{"Block Type?"}

    D -->|"TourCategoryMenu"| E["TourCategoryMenu Block"]
    D -->|"SimpleLinks"| F["SimpleLinks"]
    D -->|"MultiColumnLinks"| G["MultiColumnLinks"]
    D -->|"Other Blocks"| H["Other Menu Blocks"]

    E --> I["Fetch InterTours\nby selected tours"]
    I --> J["Group by TourCategory"]
    J --> K["Render Category Tabs"]
    K --> L["Show Tour Cards\nwith Flag Icons"]
    L --> M["🖥️ Tour Dropdown Menu"]
```

---

## 📝 State Diagram: Tour Visibility

```mermaid
stateDiagram-v2
    [*] --> Active : สร้างทัวร์ใหม่\n(isActive: true)
    Active --> Inactive : ตั้ง isActive: false
    Inactive --> Active : ตั้ง isActive: true
    Active --> [*] : ลบทัวร์

    state Active {
        [*] --> Visible
        Visible : แสดงใน Menu
        Visible : แสดงใน PopularCountry Block
        Visible : แสดงใน SearchTour Block
    }

    state Inactive {
        [*] --> Hidden
        Hidden : ซ่อนจากทุก Component
        Hidden : ข้อมูลยังอยู่ใน DB
    }
```

---

## 📦 WOW Tour Custom Blocks

### PopularCountry Block (`wowtourPopularCountry`)
- แสดงประเทศยอดนิยม
- 5 design variants
- ดึงข้อมูลจาก InterTours

### SearchTour Block (`wowtourSearchTour`)
- ช่องค้นหาทัวร์
- 3 design variants
- Filter by TourCategories

---

## 🔑 Key Files

| File | คำอธิบาย |
|------|----------|
| `src/collections/TourCategories.ts` | Tour Categories collection config |
| `src/collections/InterTours.ts` | International Tours collection config |
| `src/blocks/PopularCountry/` | Popular Country block (5 designs) |
| `src/blocks/SearchTour/` | Search Tour block (3 designs) |
| `src/globals/Header/navbar/blocks/TourCategoryMenu.tsx` | Navbar tour dropdown component |
| `src/globals/Header/navbar/blocks/CategoryGrid.tsx` | Category grid for menu |

---

## ⚙️ API Endpoints

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| GET | `/api/tour-categories` | รายการหมวดทัวร์ทั้งหมด |
| GET | `/api/tour-categories?sort=order` | เรียงตาม display order |
| POST | `/api/tour-categories` | สร้างหมวดทัวร์ใหม่ |
| GET | `/api/intertours` | รายการทัวร์ทั้งหมด |
| GET | `/api/intertours?where[isActive][equals]=true` | เฉพาะทัวร์ที่ active |
| GET | `/api/intertours?where[category][equals]=:catId` | Filter by category |
| GET | `/api/intertours?sort=order&depth=2` | เรียง + populate relations |
