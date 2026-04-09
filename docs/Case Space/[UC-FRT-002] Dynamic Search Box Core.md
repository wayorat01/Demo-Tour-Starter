# UC-FRT-002: Dynamic Search Box — Core / Core Budget

**Status:** ⚪️ To Do
**Developer:** [ ]
**UX/UI:** [ ]

**As a** End-User

**I want to** ค้นหาทัวร์ด้วยฟิลด์ขั้นสูง (สายการบิน, ช่วงราคา) เพิ่มจาก Starter

**So that** กรองทัวร์ได้แม่นยำยิ่งขึ้น

**Platform:** Front End

---

**Workflow:**

```mermaid
flowchart TD
    User([👤 End-User]) -->|1. ใช้ Search Box| Search[/🔍 Search Box (Core)/]
    Search --> StarterFields[📋 ฟิลด์ Starter ทั้งหมด]
    Search -->|+ เพิ่ม| Airline[✈️ Dropdown สายการบิน]
    Search -->|+ เพิ่ม| PriceRange[💰 Price Range Slider]
    StarterFields & Airline & PriceRange -->|2. กดค้นหา| Results[/📋 Search Results/]

    classDef user fill:#e1f5fe,stroke:#039be5,stroke-width:2px;
    classDef screen fill:#e8f5e9,stroke:#43a047,stroke-width:2px;

    class User user;
    class Search,StarterFields,Airline,PriceRange,Results screen;
```

**Field Spec:**

| Field Name | Field Type | Required | Detail | Validation |
|:---|:---|:---|:---|:---|
| ฟิลด์ทั้งหมดของ Starter | — | — | ดู UC-FRT-001 | — |
| สายการบิน | select/dropdown | N | ดึงรายชื่อสายการบินจากข้อมูลทัวร์จริง | Options จาก DB |
| ช่วงราคา | range slider | N | ดึงค่า Min/Max จากราคาทัวร์จริงในระบบ | Min ≤ Max |

**Checklist:**

| # | Task | Assign | Status |
|:--|:-----|:-------|:-------|
| 1 | แสดงฟิลด์ทั้งหมดของ Starter + สายการบิน + ช่วงราคา | DEV | ⚪️ To Do |
| 2 | ช่วงราคา Slider ต้องดึง Min/Max จากข้อมูลราคาจริง | DEV | ⚪️ To Do |
| 3 | รายชื่อสายการบินต้องดึงจากข้อมูลจริง | DEV | ⚪️ To Do |
| 4 | ผลค้นหาต้องกรองตามฟิลด์ที่เลือกทั้งหมดอย่างถูกต้อง | DEV | ⚪️ To Do |
| 5 | รองรับ Responsive Design | UX/UI | ⚪️ To Do |

---
