# UC-SYS-006: Cookie Consent (PDPA)

**Status:** ⚪️ To Do
**Developer:** [ ]
**UX/UI:** [ ]

**As a** End-User

**I want to** เห็นระบบแจ้งเตือนและได้ให้ความยินยอมก่อนมีการเก็บ Cookie

**So that** สิทธิ์ความเป็นส่วนตัวของฉันได้รับการคุ้มครองตาม PDPA

**Platform:** Front End

---

**Workflow:**

```mermaid
flowchart TD
    User([👤 End-User]) -->|1. เข้าเว็บไซต์ครั้งแรก| Check{🍪 เคยให้ Consent แล้ว?}
    Check -->|ไม่เคย| Banner[/📢 แสดง Cookie Consent Banner/]
    Check -->|เคยแล้ว| Skip[🌐 แสดงเว็บปกติ]
    Banner -->|2. กด "ยอมรับทั้งหมด"| AcceptAll[✅ เก็บ Cookie ทุกประเภท]
    Banner -->|2. กด "ตั้งค่า"| Settings[/⚙️ หน้าตั้งค่า Cookie/]
    Settings -->|3. เลือกประเภท| SavePref[💾 บันทึกค่า Preference]
    AcceptAll --> Store[📁 บันทึก Consent ลง localStorage]
    SavePref --> Store

    classDef user fill:#e1f5fe,stroke:#039be5,stroke-width:2px;
    classDef system fill:#fff3e0,stroke:#fb8c00,stroke-width:2px;
    classDef decision fill:#fce4ec,stroke:#e53935,stroke-width:2px;
    classDef screen fill:#e8f5e9,stroke:#43a047,stroke-width:2px;

    class User user;
    class Store system;
    class Check decision;
    class Banner,Settings,AcceptAll,SavePref,Skip screen;
```

**Field Spec:**

| Field Name | Field Type | Detail | Validation |
|:---|:---|:---|:---|
| Cookie Banner | UI component | แสดง Banner แจ้งเตือนที่ด้านล่างหน้าจอ | แสดงเฉพาะครั้งแรก |
| ปุ่มยอมรับทั้งหมด | button | ยอมรับ Cookie ทุกประเภท | — |
| ปุ่มตั้งค่า | button | เปิดหน้าเลือกประเภท Cookie | — |
| Necessary Cookies | toggle | Cookie ที่จำเป็น (ปิดไม่ได้) | Always On |
| Analytics Cookies | toggle | Cookie สำหรับวิเคราะห์การใช้งาน | Default Off |
| Marketing Cookies | toggle | Cookie สำหรับโฆษณา | Default Off |
| ลิงก์ Privacy Notice | link | ลิงก์ไปหน้า `/privacy-notice` | — |

**Checklist:**

| # | Task | Assign | Status |
|:--|:-----|:-------|:-------|
| 1 | เมื่อ End-User เข้าเว็บครั้งแรก ต้องแสดง Cookie Consent Banner | DEV | ⚪️ To Do |
| 2 | หาก End-User เคยให้ Consent แล้ว ต้องไม่แสดง Banner ซ้ำ | DEV | ⚪️ To Do |
| 3 | End-User สามารถเลือกยอมรับทั้งหมดหรือตั้งค่าเฉพาะประเภทได้ | DEV, UX/UI | ⚪️ To Do |
| 4 | Necessary Cookies ต้องไม่สามารถปิดได้ | DEV, UX/UI | ⚪️ To Do |
| 5 | มีลิงก์ไปยังหน้า Privacy Notice | UX/UI | ⚪️ To Do |
| 6 | Consent ถูกบันทึกลง localStorage/Cookie | DEV | ⚪️ To Do |

---
