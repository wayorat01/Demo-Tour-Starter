# UC-MGT-003: Featured Tour (ทัวร์ดันขาย)

**Status:** ⚪️ To Do
**Developer:** [ ]
**UX/UI:** [ ]

**As a** Admin(Agent)

**I want to** เลือกทัวร์เพื่อแสดงเป็น "ทัวร์ดันขาย" บน Home Page

**So that** ทัวร์ที่ต้องการโปรโมทได้รับ Visibility สูงสุด

**Platform:** Platform Backoffice, Front End

---

**Workflow:**

```mermaid
flowchart TD
    Agent([👤 Agent Admin]) -->|1. เข้ารายการทัวร์| List[/📋 Tour List/]
    List -->|2. กด "ตั้งเป็นทัวร์ดันขาย"| Check{✅ ตรวจโควต้า}
    Check -->|เหลือโควต้า| Set[⭐ ตั้งเป็น Featured]
    Check -->|เต็มโควต้า| Block[❌ "โควต้าเต็ม: ถอดรายการเดิมก่อน"]
    Set -->|3. บันทึก + Revalidate| Home[🏠 แสดงบน Home Page]

    classDef user fill:#e1f5fe,stroke:#039be5,stroke-width:2px;
    classDef decision fill:#fce4ec,stroke:#e53935,stroke-width:2px;
    classDef screen fill:#e8f5e9,stroke:#43a047,stroke-width:2px;
    classDef system fill:#fff3e0,stroke:#fb8c00,stroke-width:2px;

    class Agent user;
    class Check decision;
    class List,Block screen;
    class Set,Home system;
```

**Field Spec:**

| Field Name | Field Type | Detail | Validation |
|:---|:---|:---|:---|
| isFeatured | boolean | true = แสดงเป็นทัวร์ดันขายบน Home | Default: false |
| featuredOrder | number | ลำดับการแสดงผล | Min 1 |
| featuredQuota | computed | Starter Budget=1, Starter=1, Core Budget=3, Core=3, Plus=5 | ตรวจสอบก่อน Save |
| beforeValidate Hook | hook | นับจำนวน isFeatured=true ของ Tenant → เทียบกับโควต้า | Block ถ้าเกิน |

**Checklist:**

| # | Task | Assign | Status |
|:--|:-----|:-------|:-------|
| 1 | Agent สามารถตั้งทัวร์เป็น "ทัวร์ดันขาย" ได้ตามโควต้าแพ็กเกจ | DEV, UX/UI | ⚪️ To Do |
| 2 | เมื่อเกินโควต้า ระบบต้อง Block และแจ้งข้อความให้ถอดรายการเดิมก่อน | DEV | ⚪️ To Do |
| 3 | ทัวร์ดันขายต้องแสดงบน Home Page ตามลำดับที่กำหนด | DEV | ⚪️ To Do |
| 4 | Agent สามารถถอดรายการทัวร์ดันขายได้ | DEV, UX/UI | ⚪️ To Do |
| 5 | เมื่อเปลี่ยนแปลงต้อง Revalidate Cache Home Page | DEV | ⚪️ To Do |

---
