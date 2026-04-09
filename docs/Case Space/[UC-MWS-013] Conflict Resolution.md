# UC-MWS-013: Conflict Resolution

**Status:** ⚪️ To Do
**Developer:** [ ]
**UX/UI:** [ ]

**As a** Administrator, Admin(Agent)

**I want to** ตรวจจับและจัดการข้อมูลทัวร์ที่ซ้ำกันข้าม Source

**So that** ไม่มี Duplicate Products แสดงบนเว็บ และใช้ข้อมูลจากแหล่งที่ดีที่สุด

**Platform:** Platform Backoffice

---

**Workflow:**

```mermaid
flowchart TD
    Sync[⚙️ Sync Engine] -->|1. Upsert ทัวร์ใหม่| Detect{🔍 ตรวจจับ Duplicate?}
    Detect -->|ไม่ซ้ำ| Save[💾 Save ปกติ]
    Detect -->|ซ้ำ (ชื่อ+ประเทศ+วันเดินทาง)| Flag[🚩 Flag as Conflict]
    Flag -->|2. แสดงใน Admin UI| Resolver[/⚖️ Conflict Resolution UI/]
    Resolver -->|3. Admin เลือกแหล่ง| Merge[📋 ใช้ข้อมูลจาก Source ที่เลือก]
    Merge -->|4. ซ่อน/ลบตัวซ้ำ| Done[✅ Resolved]

    classDef system fill:#fff3e0,stroke:#fb8c00,stroke-width:2px;
    classDef decision fill:#fce4ec,stroke:#e53935,stroke-width:2px;
    classDef screen fill:#e8f5e9,stroke:#43a047,stroke-width:2px;

    class Sync,Merge system;
    class Detect decision;
    class Flag,Save data;
    class Resolver,Done screen;
```

**Field Spec:**

| Field Name | Field Type | Detail | Validation |
|:---|:---|:---|:---|
| conflictGroup | text | กลุ่ม Duplicate (hash ของชื่อ+ประเทศ+วัน) | Auto-generated |
| duplicateIds | array | IDs ของ Products ที่ซ้ำกัน | Auto-detected |
| preferredSource | relationship | Source ที่เลือกใช้ | Admin-selected |
| resolveStrategy | select | use-priority, manual, merge-fields | Default: use-priority |
| isResolved | checkbox | แจ้งว่า Conflict ถูกจัดการแล้ว | Default: false |

**Checklist:**

| # | Task | Assign | Status |
|:--|:-----|:-------|:-------|
| 1 | ระบบต้องตรวจจับ Products ที่มีชื่อ/ประเทศ/วันเดินทาง ซ้ำกันข้าม Source | DEV | ⚪️ To Do |
| 2 | Conflicts ต้องแสดงใน Admin UI ให้ Admin เลือกจัดการ | UX/UI | ⚪️ To Do |
| 3 | Default strategy: ใช้ข้อมูลจาก Source ที่ priority สูงกว่า | DEV | ⚪️ To Do |
| 4 | Admin สามารถ Override ด้วยการเลือก Source เอง (manual) | DEV | ⚪️ To Do |
| 5 | Products ที่ถูก Resolve แล้วต้องไม่แสดงซ้ำบนหน้า Frontend | UX/UI | ⚪️ To Do |

---
