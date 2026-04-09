# UC-MWS-017: Filter by Wholesale Source

**Status:** ⚪️ To Do
**Developer:** [ ]
**UX/UI:** [ ]

**As a** End-User

**I want to** กรองข้อมูลทัวร์ตามแหล่ง Wholesale ในหน้า Search

**So that** เห็นเฉพาะทัวร์จาก Wholesale ที่ต้องการ

**Platform:** Front End

---

**Workflow:**

```mermaid
flowchart TD
    User([👤 End-User]) -->|1. เข้าหน้า Search| Search[/🔍 Search Results/]
    Search -->|2. เลือก Filter Source| Filter[📋 Source Filter Chips]
    Filter -->|3. Query ด้วย sourceSlug| API[⚙️ Search API]
    API -->|4. คืนผลเฉพาะ Source| Results[📦 Filtered Results]

    classDef user fill:#e1f5fe,stroke:#039be5,stroke-width:2px;
    classDef system fill:#fff3e0,stroke:#fb8c00,stroke-width:2px;
    classDef screen fill:#e8f5e9,stroke:#43a047,stroke-width:2px;

    class User user;
    class API system;
    class Search,Filter,Results screen;
```

**Field Spec:**

| Field Name | Field Type | Detail | Validation |
|:---|:---|:---|:---|
| sourceFilter | select/chips | แสดง Source ทั้งหมดให้เลือก | Optional |
| sourceBadge | ui component | Badge บนการ์ดทัวร์แสดงชื่อ Source | Auto |

**Checklist:**

| # | Task | Assign | Status |
|:--|:-----|:-------|:-------|
| 1 | หน้า Search Results ต้องมี Filter by Source/Wholesale | UX/UI | ⚪️ To Do |
| 2 | การ์ดทัวร์ต้องแสดง Source Badge (ชื่อ Wholesale) | DEV | ⚪️ To Do |
| 3 | Default: แสดงทัวร์จากทุก Source | DEV | ⚪️ To Do |
| 4 | Filter ทำงานร่วมกับ Filter อื่น (ประเทศ, ราคา, สายการบิน) ได้ | DEV | ⚪️ To Do |
| 5 | URL query param ต้องรองรับ `source=xxx` สำหรับ sharing/bookmark | DEV | ⚪️ To Do |

---
