# UC-DPS-004: Visa Page Management

**Status:** ⚪️ To Do
**Developer:** [ ]
**UX/UI:** [ ]

**As a** Admin(Agent)

**I want to** จัดการหน้าวีซ่า ใส่ราคา และอัปโหลดไฟล์ให้ลูกค้าดาวน์โหลดได้

**So that** End-User สามารถดูข้อมูลวีซ่าและดาวน์โหลดเอกสารที่จำเป็นได้

**Platform:** Front End, Platform Backoffice

---

**Workflow:**

```mermaid
flowchart TD
    Agent([👤 Agent Admin]) -->|1. เข้าหน้า Visa Management| Check{📦 แพ็กเกจ Plus?}
    Check -->|ใช่| Editor[/📝 Visa Page Editor/]
    Check -->|ไม่ใช่| Block[❌ "ฟีเจอร์นี้สำหรับ Plus เท่านั้น"]
    Editor -->|2. เพิ่มข้อมูลวีซ่า| Form[📋 กรอกประเทศ, ราคา, เอกสาร]
    Form -->|3. อัปโหลดไฟล์| Upload[📁 Upload to Media Collection]
    Upload -->|4. Publish| Live[🌐 หน้าวีซ่าแสดงบนเว็บ]
    
    User([👤 End-User]) -->|5. เข้าหน้าวีซ่า| VisaPage[/📄 Visa Page/]
    VisaPage -->|6. กดดาวน์โหลด| Download[⬇️ ดาวน์โหลดไฟล์]

    classDef user fill:#e1f5fe,stroke:#039be5,stroke-width:2px;
    classDef system fill:#fff3e0,stroke:#fb8c00,stroke-width:2px;
    classDef decision fill:#fce4ec,stroke:#e53935,stroke-width:2px;
    classDef screen fill:#e8f5e9,stroke:#43a047,stroke-width:2px;

    class Agent,User user;
    class Upload system;
    class Check decision;
    class Editor,Form,Live,VisaPage,Download,Block screen;
```

**Field Spec:**

| Field Name | Field Type | Detail | Validation |
|:---|:---|:---|:---|
| country | text | ชื่อประเทศ เช่น ญี่ปุ่น, จีน | Required |
| visaType | text | ประเภทวีซ่า เช่น ท่องเที่ยว, ธุรกิจ | Required |
| price | number | ราคาค่าบริการ (บาท) | Min 0 |
| processingTime | text | ระยะเวลาดำเนินการ เช่น 5-7 วันทำการ | — |
| requiredDocuments | richtext | รายการเอกสารที่ต้องเตรียม | — |
| downloadableFiles | upload (array) | ไฟล์ PDF/DOC ให้ End-User ดาวน์โหลด | Max 10MB per file |
| status | select | Draft, Published | Default: Draft |

**Checklist:**

| # | Task | Assign | Status |
|:--|:-----|:-------|:-------|
| 1 | ฟีเจอร์นี้แสดงเฉพาะแพ็กเกจ Plus เท่านั้น | DEV | ⚪️ To Do |
| 2 | Agent สามารถเพิ่ม/แก้ไข/ลบข้อมูลวีซ่าได้ | DEV, UX/UI | ⚪️ To Do |
| 3 | Agent สามารถอัปโหลดไฟล์เอกสารให้ End-User ดาวน์โหลดได้ | DEV, UX/UI | ⚪️ To Do |
| 4 | End-User สามารถดาวน์โหลดไฟล์ได้สำเร็จ | DEV, UX/UI | ⚪️ To Do |
| 5 | หน้าวีซ่าแสดงผล Responsive | UX/UI | ⚪️ To Do |

---
