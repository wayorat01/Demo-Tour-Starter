# UC-SYS-003: Multi-Tenant Architecture

**Status:** ⚪️ To Do
**Developer:** [ ]
**UX/UI:** [ ]

**As a** Administrator

**I want to** ให้ระบบรองรับ Multi-Tenant แยกข้อมูลของ Agent แต่ละรายออกจากกัน

**So that** ข้อมูลของ Agent แต่ละราย (สินค้า, การจอง, Media) ถูกแยกโดยเด็ดขาด ป้องกันการเข้าถึงข้ามกัน

**Platform:** Platform Backoffice

---

**Workflow:**

```mermaid
flowchart TD
    Agent([👤 Agent A]) -->|1. Login เข้าหลังบ้าน| Auth{🔐 Payload CMS Auth}
    Auth -->|2. ระบุ Tenant ID| ACL[🛡️ Access Control Layer]
    ACL -->|3. Filter เฉพาะ tenant_id = A| DB[(📁 MongoDB)]
    DB -->|4. คืนข้อมูลเฉพาะ Agent A| Dashboard[/📊 Admin Dashboard/]

    Agent2([👤 Agent B]) -->|Login| Auth
    Auth -->|tenant_id = B| ACL2[🛡️ ACL Filter B]
    ACL2 -->|Filter เฉพาะ B| DB

    classDef user fill:#e1f5fe,stroke:#039be5,stroke-width:2px;
    classDef system fill:#fff3e0,stroke:#fb8c00,stroke-width:2px;
    classDef data fill:#f3e5f5,stroke:#8e24aa,stroke-width:2px;
    classDef screen fill:#e8f5e9,stroke:#43a047,stroke-width:2px;

    class Agent,Agent2 user;
    class Auth,ACL,ACL2 system;
    class DB data;
    class Dashboard screen;
```

**Field Spec:**

| Field Name | Field Type | Detail | Validation |
|:---|:---|:---|:---|
| tenant_id | relationship | Foreign key เชื่อมไปที่ Collection `tenants` — ทุก Collection ต้องมีฟิลด์นี้ | Required, Auto-filled จาก User ที่ Login |
| Access Control (Read) | function | Filter query ด้วย `where: { tenant: { equals: user.tenant } }` | บังคับทุก Collection |
| Access Control (Create) | function | Auto-inject tenant_id จาก User ที่ Login ก่อน Save | ห้ามให้ User กำหนดเอง |
| Access Control (Update/Delete) | function | อนุญาตเฉพาะ Document ที่ tenant_id ตรงกับ User | Reject หาก tenant ไม่ตรง |
| Super Admin Override | role | Role `super-admin` สามารถเข้าถึงข้อมูลทุก Tenant | เฉพาะ Administrator ของแพลตฟอร์ม |

**Checklist:**

| # | Task | Assign | Status |
|:--|:-----|:-------|:-------|
| 1 | Agent A ต้องไม่สามารถเห็น/แก้ไข/ลบข้อมูลของ Agent B ได้ | DEV, UX/UI | ⚪️ To Do |
| 2 | ทุก Collection (Pages, Tours, Media, Bookings) ต้องมี tenant_id | DEV | ⚪️ To Do |
| 3 | เมื่อ Agent สร้างข้อมูลใหม่ ระบบต้อง Auto-inject tenant_id ให้อัตโนมัติ | DEV | ⚪️ To Do |
| 4 | Super Admin สามารถดูข้อมูลข้าม Tenant ได้ | DEV, UX/UI | ⚪️ To Do |
| 5 | API Response ต้องไม่รั่วไหลข้อมูล Tenant อื่น | DEV | ⚪️ To Do |

---
