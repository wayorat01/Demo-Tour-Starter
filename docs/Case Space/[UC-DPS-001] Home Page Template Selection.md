# UC-DPS-001: Home Page Template Selection

**Status:** ⚪️ To Do
**Developer:** [ ]
**UX/UI:** [ ]

**As a** Admin(Agent)

**I want to** เลือกและจัดการ Template หน้า Home ตามสิทธิ์แพ็กเกจ

**So that** หน้า Home แสดงผลสวยงามและตรงกับแบรนด์ของบริษัท

**Platform:** Front End, Platform Backoffice

---

**Workflow:**

```mermaid
flowchart TD
    Agent([👤 Agent Admin]) -->|1. เข้าหน้า Pages| CMS[⚙️ Payload CMS]
    CMS -->|2. ตรวจสิทธิ์แพ็กเกจ| Check{📦 Package Type?}
    Check -->|Budget| Fixed[/🖼️ Template สำเร็จรูป 1 แบบ/]
    Check -->|ปกติ/Plus| BlockEditor[/🧩 Block Editor (ลาก-วาง)/]
    BlockEditor -->|3. เพิ่ม/ลบ/จัดเรียง Block| Preview[👁️ Preview]
    Fixed -->|แก้ได้เฉพาะเนื้อหา| Preview
    Preview -->|4. บันทึก| Publish[🌐 Publish หน้า Home]

    classDef user fill:#e1f5fe,stroke:#039be5,stroke-width:2px;
    classDef system fill:#fff3e0,stroke:#fb8c00,stroke-width:2px;
    classDef decision fill:#fce4ec,stroke:#e53935,stroke-width:2px;
    classDef screen fill:#e8f5e9,stroke:#43a047,stroke-width:2px;

    class Agent user;
    class CMS system;
    class Check decision;
    class Fixed,BlockEditor,Preview,Publish screen;
```

**Field Spec:**

| Field Name | Field Type | Detail | Validation |
|:---|:---|:---|:---|
| Hero Banner | block | BannerSlide block — เลือก Design Version ได้ | Required |
| Search Box | block | SearchTour block — แสดงตามแพ็กเกจ | Conditional |
| Content Blocks | blocks array | Popular Tours, Blog, Testimonial, Festival, etc. | Available เฉพาะ ปกติ/Plus |
| Template Lock | boolean | true = Budget (ล็อก), false = ปกติ/Plus (อิสระ) | System-controlled |

**Checklist:**

| # | Task | Assign | Status |
|:--|:-----|:-------|:-------|
| 1 | แพ็กเกจ Budget ต้องใช้ Template สำเร็จรูป 1 แบบ ไม่สามารถเพิ่ม/ลบ Block ได้ | DEV, UX/UI | ⚪️ To Do |
| 2 | แพ็กเกจ ปกติ/Plus ต้องใช้ Block Editor ลาก-วาง Block ได้อิสระ | DEV | ⚪️ To Do |
| 3 | Agent สามารถ Preview หน้า Home ก่อน Publish ได้ | DEV, UX/UI | ⚪️ To Do |
| 4 | หน้า Home ต้องแสดงผล Responsive ทั้ง Desktop, Tablet, Mobile | UX/UI | ⚪️ To Do |
| 5 | Block ที่ถูกเพิ่มต้องแสดงผลตาม Design Version ที่เลือก | UX/UI | ⚪️ To Do |

---
