# UC-MGT-001: Manual Product Creation

**Status:** ⚪️ To Do
**Developer:** [ ]
**UX/UI:** [ ]

**As a** Admin(Agent)

**I want to** สร้างสินค้าทัวร์แบบ Manual ได้เอง (ไม่ต้องรอ API Sync)

**So that** ขายทัวร์ที่ Agent จัดเองและไม่มีใน PM ได้

**Platform:** Platform Backoffice

---

**Workflow:**

```mermaid
flowchart TD
    Agent([👤 Agent Admin]) -->|1. เข้า Manual Products| Check{📦 แพ็กเกจ ปกติ/Plus?}
    Check -->|ใช่| Form[/📝 สร้างสินค้าทัวร์ใหม่/]
    Check -->|ไม่ใช่ (Budget)| Block[❌ "ฟีเจอร์นี้สำหรับ ปกติ/Plus"]
    Form -->|2. กรอกข้อมูล + อัปโหลดรูป| Fill[📋 รายละเอียดทัวร์]
    Fill -->|3. บันทึก| Save[💾 Save to ProgramTours]
    Save -->|4. Revalidate| Cache[♻️ ล้าง Cache หน้าที่เกี่ยวข้อง]

    classDef user fill:#e1f5fe,stroke:#039be5,stroke-width:2px;
    classDef decision fill:#fce4ec,stroke:#e53935,stroke-width:2px;
    classDef screen fill:#e8f5e9,stroke:#43a047,stroke-width:2px;
    classDef system fill:#fff3e0,stroke:#fb8c00,stroke-width:2px;

    class Agent user;
    class Check decision;
    class Form,Fill,Block screen;
    class Save,Cache system;
```

**Field Spec:**

| Field Name | Field Type | Required | Detail | Validation |
|:---|:---|:---|:---|:---|
| tourTitle | text | Y | ชื่อโปรแกรมทัวร์ | Max 200 chars |
| productCode | text | Y | รหัสสินค้า | Unique per Tenant |
| country | relationship | Y | ประเทศปลายทาง | เลือกจาก InterTours |
| price | number | Y | ราคาเริ่มต้น (บาท) | Min 0 |
| duration | text | N | ระยะเวลา เช่น "5 วัน 3 คืน" | — |
| description | richtext | N | รายละเอียดโปรแกรม | — |
| images | upload (array) | N | รูปภาพสินค้า | Max 10 รูป |
| departureDates | array | N | วันเดินทาง + ราคาต่อ Period | — |
| isManual | boolean | — | flag บอกว่าเป็น Manual Product (ไม่ถูก Sync ทับ) | Auto: true |
| isVisible | boolean | — | เปิด/ปิดแสดงผลบนหน้าเว็บ | Default: true |

**Checklist:**

| # | Task | Assign | Status |
|:--|:-----|:-------|:-------|
| 1 | ฟีเจอร์นี้ใช้ได้เฉพาะแพ็กเกจ ปกติ/Plus เท่านั้น | DEV | ⚪️ To Do |
| 2 | Agent สามารถสร้าง/แก้ไข/ลบสินค้า Manual ได้ | DEV, UX/UI | ⚪️ To Do |
| 3 | สินค้า Manual ต้องไม่ถูก Sync Job ลบหรือเขียนทับ (flag `isManual=true`) | DEV | ⚪️ To Do |
| 4 | รหัสสินค้าต้องไม่ซ้ำภายใน Tenant เดียวกัน | DEV | ⚪️ To Do |
| 5 | เมื่อบันทึก ระบบต้อง Revalidate Cache หน้าที่เกี่ยวข้อง | DEV, UX/UI | ⚪️ To Do |

---
