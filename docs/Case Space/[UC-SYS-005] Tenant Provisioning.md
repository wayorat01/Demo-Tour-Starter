# UC-SYS-005: Tenant Provisioning

**Status:** ⚪️ To Do
**Developer:** [ ]
**UX/UI:** [ ]

**As a** Administrator

**I want to** สร้าง Tenant ใหม่ (Subdomain + Admin User + Seed Data) ให้ Agent

**So that** Agent พร้อมใช้งานเว็บไซต์ได้ภายใน 2 วันทำการ

**Platform:** Platform Backoffice

---

**Workflow:**

```mermaid
flowchart TD
    Admin([👨‍💼 Administrator]) -->|1. กด "สร้าง Site ใหม่"| Form[/📝 ฟอร์มสร้าง Tenant/]
    Form -->|2. กรอกข้อมูล Agent| Save[💾 บันทึก Tenant]
    Save -->|3. AfterChange Hook| Hook[⚙️ Provisioning Hook]
    Hook -->|4.1 สร้าง tenant_id| DB[(📁 MongoDB)]
    Hook -->|4.2 Seed ข้อมูลพื้นฐาน| Seed[📄 Home, About Us, Default Config]
    Hook -->|4.3 สร้าง Admin User| User[👤 Agent Admin Account]
    Hook -->|4.4 ตั้งค่า Subdomain| DNS[🌐 Subdomain Setup]
    User -->|5. ส่ง Email พร้อม Login| Email[📧 Welcome Email]

    classDef user fill:#e1f5fe,stroke:#039be5,stroke-width:2px;
    classDef system fill:#fff3e0,stroke:#fb8c00,stroke-width:2px;
    classDef data fill:#f3e5f5,stroke:#8e24aa,stroke-width:2px;
    classDef screen fill:#e8f5e9,stroke:#43a047,stroke-width:2px;

    class Admin user;
    class Save,Hook,DNS system;
    class DB data;
    class Form,Seed,User,Email screen;
```

**Field Spec:**

| Field Name | Field Type | Detail | Validation |
|:---|:---|:---|:---|
| companyName | text | ชื่อบริษัท Agent | Required |
| subdomain | text | Subdomain ที่ต้องการ เช่น `siamtour` → `siamtour.wowtour.com` | Required, Unique, a-z0-9 เท่านั้น |
| package | relationship | เชื่อมไปที่ Collection `packages` | Required |
| adminEmail | email | อีเมลสำหรับสร้าง Admin User ให้ Agent | Required, Valid Email |
| adminName | text | ชื่อ Admin User | Required |
| status | select | Active, Suspended, Cancelled | Default: Active |

**Checklist:**

| # | Task | Assign | Status |
|:--|:-----|:-------|:-------|
| 1 | Administrator สามารถสร้าง Tenant ใหม่ พร้อม Subdomain สำเร็จ | DEV | ⚪️ To Do |
| 2 | ระบบต้อง Seed ข้อมูลพื้นฐาน (Home Page, About Us, Default Header/Footer) อัตโนมัติ | DEV | ⚪️ To Do |
| 3 | ระบบสร้าง Admin User ให้ Agent พร้อมส่ง Welcome Email ที่มี Login Link | DEV | ⚪️ To Do |
| 4 | Agent สามารถเข้า `[subdomain].wowtour.com/admin` และ Login ได้ทันที | DEV, UX/UI | ⚪️ To Do |
| 5 | กระบวนการทั้งหมดต้องเสร็จสิ้นภายใน 2 วันทำการ | DEV | ⚪️ To Do |

---
