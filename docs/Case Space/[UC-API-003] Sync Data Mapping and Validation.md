# UC-API-003: Sync Data Mapping & Validation

**Status:** ⚪️ To Do
**Developer:** [ ]
**UX/UI:** [ ]

**As a** Administrator

**I want to** ให้ข้อมูลที่ Sync เข้ามาถูก Map เข้า Collection ที่ถูกต้องพร้อมตรวจสอบความถูกต้อง

**So that** ข้อมูลทัวร์ในระบบมีคุณภาพ ไม่มีข้อมูลขยะ

**Platform:** Platform Backoffice

---

**Workflow:**

```mermaid
flowchart TD
    API[🌐 External API Response] -->|1. รับข้อมูลดิบ| Parser[⚙️ Data Parser]
    Parser -->|2. Map fields| Mapper{📋 Field Mapping}
    Mapper -->|InterTours| IT[(📁 InterTours Collection)]
    Mapper -->|ProgramTours| PT[(📁 ProgramTours Collection)]
    Mapper -->|InboundTours| IB[(📁 InboundTours Collection)]
    
    Parser -->|3. Validate| Valid{✅ Validation}
    Valid -->|ผ่าน| Save[💾 Upsert]
    Valid -->|ไม่ผ่าน (ขาด field บังคับ)| Skip[⏭️ Skip + Log Warning]

    classDef system fill:#fff3e0,stroke:#fb8c00,stroke-width:2px;
    classDef data fill:#f3e5f5,stroke:#8e24aa,stroke-width:2px;
    classDef decision fill:#fce4ec,stroke:#e53935,stroke-width:2px;

    class API,Parser,Save system;
    class IT,PT,IB data;
    class Mapper,Valid decision;
    class Skip system;
```

**Field Spec:**

| Field Name | Field Type | Detail | Validation |
|:---|:---|:---|:---|
| tourCode | text | รหัสทัวร์จาก API → map เป็น `productCode` | Required, Unique per Tenant |
| title | text | ชื่อโปรแกรมทัวร์ | Required |
| country | relationship | ประเทศ → map ไป `intertours` Collection | Required |
| price | number | ราคาเริ่มต้น | Min 0 |
| departureDate | date | วันเดินทาง | Valid Date |
| airline | text | สายการบิน | — |
| itinerary | richtext/json | รายละเอียดโปรแกรมทัวร์ | — |
| images | array of url | รูปภาพทัวร์จาก API | ดาวน์โหลดเก็บใน Media Collection |

**Checklist:**

| # | Task | Assign | Status |
|:--|:-----|:-------|:-------|
| 1 | ข้อมูลจาก API ต้องถูก Map เข้า Collection ที่ถูกต้อง (InterTours, ProgramTours, InboundTours) | DEV | ⚪️ To Do |
| 2 | Field บังคับ (tourCode, title, country) ต้องถูกตรวจสอบ — หากขาดต้อง Skip & Log | DEV | ⚪️ To Do |
| 3 | tourCode ที่ซ้ำกันต้อง Upsert (อัปเดตข้อมูลเดิม) ไม่สร้างซ้ำ | DEV | ⚪️ To Do |
| 4 | รูปภาพจาก API ต้องถูกดาวน์โหลดและเก็บใน Media Collection | DEV | ⚪️ To Do |
| 5 | มี Log สรุปจำนวน Record ที่ Map สำเร็จ/ไม่สำเร็จ | DEV | ⚪️ To Do |

---
