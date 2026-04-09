# UC-SAS-004: 🟡P2 Self-Service Registration

**Status:** 📋 Draft (ยังไม่อนุมัติ — รอประชุมวางแผนแพ็กเกจ)
**Developer:** [ ]
**UX/UI:** [ ]

**As a** ว่าที่ลูกค้า (Prospective Agent)

**I want to** สมัครสมาชิกด้วยตัวเอง กรอกข้อมูลบริษัท เลือก Subdomain และเลือกแพ็กเกจเพื่อเริ่มต้นสร้างเว็บขายทัวร์

**So that** ได้เว็บไซต์พร้อมใช้งานโดยไม่ต้องรอฝ่ายขาย

**Platform:** Front End (Public Website)

---

**Workflow:**

```mermaid
flowchart TD
    User(["👤 ว่าที่ลูกค้า"]) -->|1. เข้าหน้าสมัคร| Form[/"📝 ฟอร์มสมัครสมาชิก"/]
    Form -->|2. กรอกข้อมูล| Fields["ข้อมูลที่กรอก:\n- ชื่อบริษัท\n- ชื่อ-สกุล\n- เบอร์โทร\n- Email\n- Subdomain ที่ต้องการ"]
    Fields -->|3. ตรวจ Subdomain| SubCheck{{"🔍 Subdomain\nว่างไหม?"}}
    SubCheck -->|"ว่าง ✅"| Package["📦 เลือกแพ็กเกจ\n(Free / Starter / Core / Plus)"]
    SubCheck -->|"ซ้ำ ❌"| Error["⚠️ แจ้ง 'ชื่อนี้ถูกใช้แล้ว'\n→ แนะนำชื่ออื่น"]
    Error --> Fields
    Package -->|4. เลือก Template| Template["🎨 Template Gallery\n(UC-SAS-001)"]
    Template -->|5. ยืนยัน| Confirm["✅ สรุปข้อมูล\n→ กด 'สร้างเว็บไซต์'"]
    Confirm -->|6. Provisioning| Hook["⚙️ UC-SYS-005\nTenant Provisioning"]
    Hook --> Done["🌐 เว็บพร้อมใช้!\nส่ง Email ยืนยัน"]

    classDef user fill:#e1f5fe,stroke:#039be5,stroke-width:2px;
    classDef system fill:#fff3e0,stroke:#fb8c00,stroke-width:2px;
    classDef decision fill:#fce4ec,stroke:#e53935,stroke-width:2px;
    classDef screen fill:#e8f5e9,stroke:#43a047,stroke-width:2px;

    class User user;
    class Hook system;
    class SubCheck decision;
    class Form,Fields,Package,Template,Confirm,Error,Done screen;
```

**Field Spec:**

| Field Name | Field Type | Detail | Validation |
|:---|:---|:---|:---|
| companyName | text | ชื่อบริษัท (ภาษาไทย/อังกฤษ) | Required |
| fullName | text | ชื่อ-สกุลผู้ติดต่อ | Required |
| phone | tel | เบอร์โทรศัพท์ | Required, Valid phone |
| email | email | อีเมลสำหรับสร้าง Admin Account | Required, Valid email, Unique |
| subdomain | text | Subdomain ที่ต้องการ เช่น `siamtour` → `siamtour.wowtour.com` | Required, Unique, a-z0-9 only |
| package | select | free, starter, core, plus | Required, Default: free |
| templatePreset | relationship | เชื่อมไป Template Preset ที่เลือก | Required |
| agreedToTerms | checkbox | ยอมรับเงื่อนไข PDPA และข้อกำหนดการใช้งาน | Required: true |

**Checklist:**

| # | Task | Assign | Status |
|:--|:-----|:-------|:------|
| 1 | ฟอร์มสมัครสมาชิก Responsive บน Desktop/Mobile | DEV, UX/UI | ⚪️ To Do |
| 2 | Subdomain ต้องตรวจสอบ real-time (debounced API call) ว่าว่างไหม | DEV | ⚪️ To Do |
| 3 | หลังสมัครสำเร็จ ส่ง Welcome Email พร้อม Login Link | DEV | ⚪️ To Do |
| 4 | มี Cloudflare Turnstile ป้องกัน Bot | DEV | ⚪️ To Do |
| 5 | Flow ทั้งหมดเสร็จภายใน 2 นาที (UX Goal) | UX/UI | ⚪️ To Do |

---
