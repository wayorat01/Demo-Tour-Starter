# UC-DPS-002: Info Page Management

**Status:** ⚪️ To Do
**Developer:** [ ]
**UX/UI:** [ ]

**As a** Admin(Agent)

**I want to** สร้างและจัดการ Info Page (หน้าข้อมูลทั่วไป) ผ่าน Block Editor

**So that** แสดงข้อมูลบริษัท บริการ และข้อมูลอื่นๆ บนเว็บไซต์ได้

**Platform:** Front End, Platform Backoffice

---

**Workflow:**

```mermaid
flowchart TD
    Agent([👤 Agent Admin]) -->|1. กด "สร้างหน้าใหม่"| Check{✅ ตรวจโควต้า Info Page}
    Check -->|เหลือโควต้า| Editor[/📝 Page Editor/]
    Check -->|เต็มโควต้า| Block[❌ "โควต้าเพจเต็ม กรุณาอัปเกรด"]
    Editor -->|2. เลือก Hero + เพิ่ม Block| Build[🧩 ประกอบหน้า]
    Build -->|3. Preview| Preview[👁️ ดูตัวอย่าง]
    Preview -->|4. Publish| Live[🌐 หน้าใหม่แสดงบนเว็บ]

    classDef user fill:#e1f5fe,stroke:#039be5,stroke-width:2px;
    classDef system fill:#fff3e0,stroke:#fb8c00,stroke-width:2px;
    classDef decision fill:#fce4ec,stroke:#e53935,stroke-width:2px;
    classDef screen fill:#e8f5e9,stroke:#43a047,stroke-width:2px;

    class Agent user;
    class Check decision;
    class Editor,Build,Preview,Live,Block screen;
```

**Field Spec:**

| Field Name | Field Type | Detail | Validation |
|:---|:---|:---|:---|
| title | text | ชื่อหน้า | Required |
| slug | text | URL path เช่น `about-us`, `contact-us` | Required, Unique per Tenant |
| hero | group | เลือก Hero Banner Design Version | Optional |
| layout | blocks array | Block Editor สำหรับประกอบเนื้อหา | — |
| status | select | Draft, Published | Default: Draft |
| quotaCheck | beforeValidate hook | ตรวจจำนวนหน้าปัจจุบัน vs โควต้าแพ็กเกจ | Block ถ้าเกินโควต้า |

**Checklist:**

| # | Task | Assign | Status |
|:--|:-----|:-------|:-------|
| 1 | Agent สามารถสร้าง Info Page ใหม่ได้ภายในโควต้าแพ็กเกจ | DEV, UX/UI | ⚪️ To Do |
| 2 | หากเกินโควต้า ระบบต้อง Block การสร้างพร้อมแจ้งข้อความ | DEV | ⚪️ To Do |
| 3 | โควต้าไม่นับรวมหน้า Home และ About Us (หน้าบังคับ) | UX/UI | ⚪️ To Do |
| 4 | Agent สามารถ Preview ก่อน Publish ได้ | DEV, UX/UI | ⚪️ To Do |
| 5 | URL slug ต้องไม่ซ้ำภายใน Tenant เดียวกัน | DEV | ⚪️ To Do |

---
