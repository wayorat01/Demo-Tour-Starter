# UC-SYS-008: Internal Activity Log

**Status:** ⚪️ To Do
**Developer:** [ ]
**UX/UI:** [ ]

**As a** Administrator

**I want to** ให้ระบบเก็บ Log ทุก Action ของ Admin อัตโนมัติ

**So that** สามารถตรวจสอบย้อนหลังได้ว่าใครทำอะไร เมื่อไหร่

**Platform:** Platform Backoffice

---

**Workflow:**

```mermaid
flowchart TD
    Admin([👤 Admin]) -->|1. ทำ Action ใดก็ตาม| CMS[⚙️ Payload CMS]
    CMS -->|2. AfterChange/AfterDelete Hook| Logger[📝 Activity Logger]
    Logger -->|3. บันทึก Log| LogDB[(📁 ActivityLogs Collection)]
    
    SuperAdmin([👨‍💼 Super Admin]) -->|4. เข้าดู Logs| LogView[/📊 Activity Log Viewer/]
    LogView -->|5. Filter/Search| LogDB

    classDef user fill:#e1f5fe,stroke:#039be5,stroke-width:2px;
    classDef system fill:#fff3e0,stroke:#fb8c00,stroke-width:2px;
    classDef data fill:#f3e5f5,stroke:#8e24aa,stroke-width:2px;
    classDef screen fill:#e8f5e9,stroke:#43a047,stroke-width:2px;

    class Admin,SuperAdmin user;
    class CMS,Logger system;
    class LogDB data;
    class LogView screen;
```

**Field Spec:**

| Field Name | Field Type | Detail | Validation |
|:---|:---|:---|:---|
| action | select | Login, Create, Update, Delete, StatusChange | Required |
| collection | text | ชื่อ Collection ที่ถูก Action เช่น pages, program-tours | Required |
| documentId | text | ID ของ Document ที่ถูกแก้ไข | Required |
| userId | relationship | User ที่ทำ Action | Required |
| tenantId | relationship | Tenant ที่ User สังกัด | Required |
| timestamp | datetime | วันเวลาที่เกิด Action | Auto-generated |
| changes | json | สรุปฟิลด์ที่เปลี่ยนแปลง (before/after) | Optional |

**Checklist:**

| # | Task | Assign | Status |
|:--|:-----|:-------|:-------|
| 1 | ทุก Action (Create, Update, Delete) ต้องถูกบันทึก Log อัตโนมัติ | DEV | ⚪️ To Do |
| 2 | Log ต้องมี userId, timestamp, collection, action ครบถ้วน | DEV | ⚪️ To Do |
| 3 | Super Admin สามารถค้นหาและ Filter Log ได้ตาม User, Action, Collection, วันที่ | DEV, UX/UI | ⚪️ To Do |
| 4 | Agent Admin ดู Log ได้เฉพาะของ Tenant ตนเอง | DEV | ⚪️ To Do |
| 5 | Log data ต้องไม่สามารถแก้ไข/ลบได้ (Immutable) | DEV, UX/UI | ⚪️ To Do |

---
