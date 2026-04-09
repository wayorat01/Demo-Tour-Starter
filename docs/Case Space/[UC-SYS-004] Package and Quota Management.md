# UC-SYS-004: Package & Quota Management

**Status:** ⚪️ To Do
**Developer:** [ ]
**UX/UI:** [ ]

**As a** Administrator

**I want to** สร้างและกำหนดแพ็กเกจพร้อมโควต้าให้ Agent แต่ละราย

**So that** Agent ใช้งานฟีเจอร์ได้ตามแพ็กเกจที่สมัคร และระบบควบคุมปริมาณการใช้งานได้

**Platform:** Platform Backoffice

---

**Workflow:**

```mermaid
flowchart TD
    Admin([👨‍💼 Administrator]) -->|1. เข้าหน้า Package Management| PkgList[/📋 รายการแพ็กเกจ/]
    PkgList -->|2. สร้าง/แก้ไข Package| PkgForm[/📝 ฟอร์มแพ็กเกจ/]
    PkgForm -->|3. กำหนดโควต้า & ฟีเจอร์| Save[💾 บันทึก]
    Save -->|4. ผูกกับ Tenant| Tenant[(📁 Tenants Collection)]

    Agent([👤 Agent]) -->|5. สร้าง Info Page| Check{✅ ตรวจโควต้า}
    Check -->|เหลือโควต้า| Create[📄 สร้างหน้าใหม่ได้]
    Check -->|เต็มโควต้า| Block[❌ แจ้ง "เต็มโควต้า"]

    classDef user fill:#e1f5fe,stroke:#039be5,stroke-width:2px;
    classDef system fill:#fff3e0,stroke:#fb8c00,stroke-width:2px;
    classDef decision fill:#fce4ec,stroke:#e53935,stroke-width:2px;
    classDef screen fill:#e8f5e9,stroke:#43a047,stroke-width:2px;

    class Admin,Agent user;
    class Save,Tenant system;
    class Check decision;
    class PkgList,PkgForm,Create,Block screen;
```

**Field Spec:**

| Field Name | Field Type | Detail | Validation |
|:---|:---|:---|:---|
| packageName | select | Starter Budget, Starter, Core Budget, Core, Plus | Required |
| infoPageQuota | number | Starter Budget=3, Starter=5, Core Budget=8, Core=8, Plus=15 | Min 0 |
| featuredTourQuota | number | Starter Budget=1, Starter=1, Core Budget=3, Core=3, Plus=5 | Min 0 |
| enableBlockEditor | boolean | false สำหรับ Budget, true สำหรับ ปกติ/Plus | — |
| enableBookingSystem | boolean | false สำหรับ Budget (ใช้ Lead Gen), true สำหรับ ปกติ/Plus | — |
| enableVisaPage | boolean | true เฉพาะ Plus | — |
| enableManualProduct | boolean | false สำหรับ Budget, true สำหรับ ปกติ/Plus | — |

**Checklist:**

| # | Task | Assign | Status |
|:--|:-----|:-------|:-------|
| 1 | Administrator สามารถสร้าง/แก้ไข/ลบแพ็กเกจได้ | DEV, UX/UI | ⚪️ To Do |
| 2 | โควต้า Info Page ไม่นับรวมหน้า Home และ About Us | UX/UI | ⚪️ To Do |
| 3 | เมื่อ Agent สร้างหน้าเกินโควต้า ระบบต้อง Block และแจ้งข้อความ | DEV, UX/UI | ⚪️ To Do |
| 4 | ฟีเจอร์ที่ถูกปิดในแพ็กเกจต้องไม่แสดงในหลังบ้านของ Agent | DEV | ⚪️ To Do |
| 5 | การเปลี่ยนแพ็กเกจต้องมีผลทันทีต่อฟีเจอร์และโควต้า | DEV | ⚪️ To Do |

---
