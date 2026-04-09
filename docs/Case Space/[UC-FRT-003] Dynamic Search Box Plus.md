# UC-FRT-003: Dynamic Search Box — Plus

**Status:** ⚪️ To Do
**Developer:** [ ]
**UX/UI:** [ ]

**As a** End-User

**I want to** ค้นหาทัวร์ด้วยฟิลด์ครบทุกตัวเลือก (เมือง, ทัวร์เทศกาล) เพิ่มจาก Core

**So that** กรองทัวร์ได้ละเอียดที่สุด ตรงกับความต้องการ

**Platform:** Front End

---

**Workflow:**

```mermaid
flowchart TD
    User([👤 End-User]) -->|1. ใช้ Search Box| Search[/🔍 Search Box (Plus)/]
    Search --> CoreFields[📋 ฟิลด์ Core ทั้งหมด]
    Search -->|+ เพิ่ม| City[🏙️ Dropdown เมือง]
    Search -->|+ เพิ่ม| Festival[🎆 Dropdown ทัวร์เทศกาล]
    CoreFields & City & Festival -->|2. กดค้นหา| Results[/📋 Search Results/]

    classDef user fill:#e1f5fe,stroke:#039be5,stroke-width:2px;
    classDef screen fill:#e8f5e9,stroke:#43a047,stroke-width:2px;

    class User user;
    class Search,CoreFields,City,Festival,Results screen;
```

**Field Spec:**

| Field Name | Field Type | Required | Detail | Validation |
|:---|:---|:---|:---|:---|
| ฟิลด์ทั้งหมดของ Core | — | — | ดู UC-FRT-002 | — |
| เมือง | select/dropdown | N | ดึงรายชื่อเมืองตามประเทศที่เลือก (Cascading) | Dependent on Country |
| ทัวร์เทศกาล | select/dropdown | N | ดึงรายชื่อเทศกาลจากข้อมูลทัวร์จริง | Options จาก DB |

**Checklist:**

| # | Task | Assign | Status |
|:--|:-----|:-------|:-------|
| 1 | แสดงฟิลด์ทั้งหมดของ Core + เมือง + ทัวร์เทศกาล | DEV | ⚪️ To Do |
| 2 | Dropdown เมืองต้อง Cascade ตามประเทศที่เลือก | DEV | ⚪️ To Do |
| 3 | รายชื่อเทศกาลต้องดึงจากข้อมูลจริง | DEV | ⚪️ To Do |
| 4 | ผลค้นหาต้องกรองตามฟิลด์ทั้งหมดอย่างถูกต้อง | DEV | ⚪️ To Do |
| 5 | รองรับ Responsive Design | UX/UI | ⚪️ To Do |

---
