# 🎨 Module: Theme & Layout Configuration

> ระบบจัดการ Theme, Header, Footer, และ Page Config
> ควบคุมหน้าตาเว็บไซต์ทั้งหมดจาก Admin Panel

---

## 🏗️ Architecture Overview

```mermaid
flowchart TB
    subgraph "Theme & Layout Globals"
        TC["🎨 ThemeConfig\n(Colors, Fonts, Radius)"]
        HD["🧭 Header\n(Navbar, Top Bar)"]
        FT["📋 Footer\n(Links, Social, Legal)"]
        PC["⚙️ PageConfig\n(Identity, Meta, OG)"]
    end

    subgraph "CSS Variable System"
        CSS["CSS Custom Properties\n(--background, --primary, etc.)"]
    end

    subgraph "Components"
        NB1["Navbar v1"]
        NB3["Navbar v3"]
        NB4["Navbar v4"]
        NB5["Navbar v5"]
        WN5["WowTour Navbar v5"]
        WN6["WowTour Navbar v6"]
        WN7["WowTour Navbar v7"]
        FT1["Footer v1-v8"]
    end

    TC --> CSS
    CSS --> NB1 & NB3 & NB4 & NB5 & WN5 & WN6 & WN7
    CSS --> FT1
    HD -->|"designVersion"| NB1 & NB3 & NB4 & NB5 & WN5 & WN6 & WN7
    FT -->|"designVersion"| FT1
    PC --> CSS
```

---

## 📊 Entity Relationship Diagram

```mermaid
erDiagram
    THEME_CONFIG {
        string id PK
        group typography
        string bodyFont "select: kanit, noto-sans-thai, noto-sans-thai-looped"
        string headingFont "select"
        string radius "CSS value (e.g., 0.6rem)"
        group regularColors
        hsl background
        hsl foreground
        hsl card
        hsl primary
        hsl secondary
        hsl muted
        hsl accent
        hsl destructive
        group darkColors
        hsl darkBackground
        hsl darkForeground
        hsl darkPrimary
    }

    HEADER {
        string id PK
        string designVersion "1-7"
        upload logo "FK -> Media"
        string backgroundColor
        group colorSettings
        string gradientColor "สีพื้นหลัง Container บนสุด (H3,4,6)"
        string topContainerTextColor "สีตัวอักษร Container บนสุด (H4,6)"
        string headerBackground "สีพื้นหลัง Header"
        string menuTextColor "สีตัวอักษรเมนู"
        string menuActiveColor "สีตัวอักษร Hover/Active"
        string navBarBackground "สีพื้นหลัง Container เมนู"
        group topBar
        string topBarBackgroundColor "HSL"
        boolean showSocialLabels
        array socialLinks
        group businessHours
        array contacts
        group tourismLicense
        group mainNavBar
        string navBarBackgroundColor "HSL"
        array navItems "menu items"
    }

    FOOTER {
        string id PK
        string designVersion "1-8"
        upload logo "FK -> Media"
        string copyright
        string subline "localized"
        array legalLinks
        array socialLinks
        array navItems "3 columns max"
    }

    PAGE_CONFIG {
        string id PK
        group siteIdentity
        upload favicon "FK -> Media"
        string siteName "localized"
        string siteTagline "localized"
        upload sitePreviewImage "FK -> Media"
        group homepageSettings
        relationship homepage "FK -> Pages"
        group defaultMeta
        string metaTitle
        string metaDescription
        group openGraph
        upload backgroundImage
        string textColor
        string textPosition
    }

    HEADER ||--o| MEDIA : "logo"
    FOOTER ||--o| MEDIA : "logo"
    PAGE_CONFIG ||--o| MEDIA : "favicon"
    PAGE_CONFIG ||--o| MEDIA : "sitePreviewImage"
    PAGE_CONFIG ||--o| PAGES : "homepage"
```

---

## 🔄 User Journey: ตั้งค่า Theme

```mermaid
sequenceDiagram
    actor Admin
    participant CMS as Payload Admin
    participant DB as MongoDB
    participant FE as Frontend

    Note over Admin, FE: 1. ตั้งค่าสี Theme
    Admin->>CMS: ไป ThemeConfig
    Admin->>CMS: เลือก Body Font = "kanit"
    Admin->>CMS: เลือก Heading Font = "noto-sans-thai"
    Admin->>CMS: ตั้ง Primary Color (HSL picker)
    Admin->>CMS: ตั้ง Background, Foreground colors
    Admin->>CMS: Save
    CMS->>DB: Save ThemeConfig
    CMS->>FE: Revalidate (afterChange hook)

    Note over Admin, FE: 2. ตั้งค่า Header
    Admin->>CMS: ไป Header Global
    Admin->>CMS: เลือก Design Version = 6 (WowTour)
    Admin->>CMS: อัพโหลด Logo
    Admin->>CMS: ตั้งค่า Top Bar (social, contacts)
    Admin->>CMS: ตั้งค่า Nav Items (menus)
    Admin->>CMS: Save
    CMS->>FE: Revalidate Header

    Note over Admin, FE: 3. ตั้งค่า Footer
    Admin->>CMS: ไป Footer Global
    Admin->>CMS: เลือก Design Version = 6
    Admin->>CMS: ตั้ง Copyright, Social Links
    Admin->>CMS: Save
    CMS->>FE: Revalidate Footer

    FE-->>Admin: ✅ เว็บไซต์อัพเดตทันที
```

---

## 🔀 Theme Application Flow

```mermaid
flowchart TD
    A["Page Request"] --> B["Fetch ThemeConfig from DB"]
    B --> C["Generate CSS Variables"]

    C --> D["--background: hsl(...)"]
    C --> E["--primary: hsl(...)"]
    C --> F["--font-body: kanit"]
    C --> G["--font-heading: noto-sans-thai"]
    C --> H["--radius: 0.6rem"]

    D & E & F & G & H --> I["Inject via ThemeProvider"]
    I --> J["Apply to all Components"]

    K["Fetch Header Global"] --> L{"designVersion?"}
    L -->|"1"| M["Navbar1"]
    L -->|"3"| N["Navbar3"]
    L -->|"4"| O["Navbar4"]
    L -->|"5"| P["Navbar5"]
    L -->|"6"| Q["WowTour Navbar5"]

    R["Fetch Footer Global"] --> S{"designVersion?"}
    S -->|"1-8"| T["Footer variant"]
```

---

## 📝 State Diagram: Design Version Selection

```mermaid
stateDiagram-v2
    [*] --> SelectVersion : Admin เลือก Design Version

    state Header {
        [*] --> V1 : "1 (left aligned)"
        [*] --> V2 : "2 (centered)"
        [*] --> V3 : "3 (split nav)"
        [*] --> V4 : "4 (minimal)"
        [*] --> V5 : "5 (mega menu)"
        [*] --> V6 : "6 (WowTour full)"
        [*] --> V7 : "7 (License + Logo + Nav)"

        state V6 {
            [*] --> TopBar
            TopBar : Social Links
            TopBar : Business Hours
            TopBar : Contact Numbers
            TopBar : Tourism License
            TopBar --> MainNav
            MainNav : Logo
            MainNav : Menu Items
          MainNav : Tour Dropdown
        }
    }

    state SubmenuBlocks {
        [*] --> TourCategoryMenu : "International Tours"
        TourCategoryMenu : Section Title (เช่น 'เอเชีย')
        TourCategoryMenu : Underline Color (Hex)
        TourCategoryMenu : เลือก Categories (Asia, Europe ฯลฯ)
        TourCategoryMenu : เลือก Tours (Inter/Inbound)
        TourCategoryMenu : Grid Columns (2, 3, 4)
    }
```

### Navbar Submenu Blocks (v3, v5)

นอกจากเมนูลิงก์ปกติ (Sub Item) แล้ว ในเวอร์ชัน 3 และ 5 สามารถใช้บล็อกพิเศษเพื่อสร้าง Layout เมนูที่ซับซ้อนขึ้นได้:

#### 🟢 Tour Category Menu (ใหม่)
ออกแบบมาสำหรับแสดงทัวร์ตามหมวดหมู่ใน Mega Menu:
- **Section Title:** หัวข้อเมนู (เช่น 'เอเชีย', 'ยุโรป')
- **Underline Color:** สีของเส้นใต้หัวข้อ (Hex code)
- **Tour Category:** เลือกหมวดหมู่ทัวร์จาก CMS (สามารถเลือกได้หลายหมวดหมู่พร้อมกัน)
- **Tours to Display:** เลือกทัวร์ที่ต้องการแสดงแบบเจาะจง (กรองอัตโนมัติตามหมวดหมู่ที่เลือก)
- **Grid Columns:** เลือกจำนวนคอลัมน์ในการแสดงผล (2, 3 หรือ 4 คอลัมน์)

---

### Preview: Header 6 (WowTour Full)

![Header 6 Preview — Info Bar + Logo + Mega Menu](../images/header6-preview.png)

---

## 🎨 ThemeConfig Color System

| Color Variable | คำอธิบาย | Regular | Dark |
|---------------|----------|---------|------|
| `background` | พื้นหลัง | ✅ | ✅ |
| `foreground` | ข้อความหลัก | ✅ | ✅ |
| `primary` | สีหลัก | ✅ | ✅ |
| `secondary` | สีรอง | ✅ | ✅ |
| `muted` | สีจาง | ✅ | ✅ |
| `accent` | สีเน้น | ✅ | ✅ |
| `card` | พื้นหลัง Card | ✅ | ✅ |
| `popover` | พื้นหลัง Popover | ✅ | ✅ |
| `destructive` | สีแจ้งเตือน | ✅ | ✅ |
| `border` | เส้นขอบ | ✅ | ✅ |
| `input` | Input field | ✅ | ✅ |
| `ring` | Focus ring | ✅ | ✅ |
| `chart-1~5` | สีกราฟ | ✅ | ✅ |
| `success` | สำเร็จ | ✅ | - |
| `warning` | เตือน | ✅ | - |
| `error` | ข้อผิดพลาด | ✅ | - |

---

## 🔑 Key Files

| File | คำอธิบาย |
|------|----------|
| `src/globals/ThemeConfig/config.ts` | ThemeConfig global (1024 lines) |
| `src/globals/ThemeConfig/hooks/revalidateThemeConfig.ts` | Revalidation hook |
| `src/globals/Header/config.ts` | Header global config (332 lines) |
| `src/globals/Header/navbar/navbar.config.ts` | Navbar field configuration |
| `src/globals/Header/navbar/navbar1.tsx` | Navbar design v1 |
| `src/globals/Header/navbar/wowtour_navbar5.tsx` | WowTour navbar v5 |
| `src/globals/Header/navbar/wowtour_navbar6.tsx` | WowTour navbar v6 |
| `src/globals/Header/navbar/wowtour_navbar7.tsx` | WowTour navbar v7 |
| `src/globals/Header/navbar/NavLinkActive.tsx` | Active state marker (client component) |
| `src/globals/Header/navbar/StickyNavDetector.tsx` | Sticky scroll detector |
| `src/globals/Header/navbar/blocks/` | Menu block renderers (10 files) |
| `src/globals/Footer/config.ts` | Footer global config |
| `src/globals/PageConfig/config.ts` | PageConfig global config |
| `src/globals/PageConfig/SiteIdentityPreview.tsx` | Admin preview component |
| `src/globals/PageConfig/hooks/revalidatePageConfig.ts` | Revalidation hook |
| `src/providers/Theme/` | Theme provider (6 files) |
| `src/fields/colorPicker/` | HSL color picker field (6 files) |
| `src/fields/gradientPicker/` | Gradient/Solid color picker (presets: Primary, Secondary, White, Black ฯลฯ) |
| `src/cssVariables.ts` | CSS variable definitions |

---

## 🎯 Header Color CSS Variables

| CSS Variable | คำอธิบาย | ตั้งค่าจาก field | ใช้ใน |
|---|---|---|---|
| `--header-gradient` | สีพื้นหลัง Container บนสุด (solid) | `gradientColor` | H3, H4, H6 |
| `--header-gradient-full` | สีพื้นหลัง Container บนสุด (gradient) | `gradientColor` | H3, H4, H6 |
| `--header-top-text` | สีตัวอักษร Container บนสุด | `topContainerTextColor` | H4, H6 |
| `--header-bg` | สีพื้นหลัง Header | `headerBackground` | ทุก version |
| `--header-menu-text` | สีตัวอักษรเมนู | `menuTextColor` | ทุก version |
| `--header-accent` | สีตัวอักษร Hover/Active | `menuActiveColor` | ทุก version |
| `--header-nav-bg` | สีพื้นหลัง Container เมนู | `navBarBackground` | H1, H3, H6, H7 |

---

## ⚙️ API Endpoints

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| GET | `/api/globals/themeConfig` | Get theme config |
| PATCH | `/api/globals/themeConfig` | Update theme (Admin) |
| GET | `/api/globals/header` | Get header config |
| PATCH | `/api/globals/header` | Update header |
| GET | `/api/globals/footer` | Get footer config |
| PATCH | `/api/globals/footer` | Update footer |
| GET | `/api/globals/page-config` | Get page config |
| PATCH | `/api/globals/page-config` | Update page config (Admin) |
