# UC-MGT-002: Display Toggle (Show/Hide Tour)

**Status:** ⚪️ To Do
**Developer:** [ ]
**UX/UI:** [ ]

**As a** Admin(Agent)

**I want to** เปิด/ปิดการแสดงผลของทัวร์แต่ละรายการบนหน้าเว็บ

**So that** ซ่อนทัวร์ที่หมดอายุหรือยังไม่พร้อมขายได้ทันที

**Platform:** Platform Backoffice

---

**Workflow:**

```mermaid
flowchart TD
    Agent([👤 Agent Admin]) -->|1. เข้ารายการทัวร์| List[/📋 Tour List/]
    List -->|2. Toggle สวิตช์| Toggle{🔀 เปิด/ปิด?}
    Toggle -->|เปิด| Show[👁️ แสดงบน Frontend]
    Toggle -->|ปิด| Hide[🚫 ซ่อนจาก Frontend]
    Show & Hide -->|3. AfterChange Hook| Revalidate[♻️ Revalidate Cache]

    classDef user fill:#e1f5fe,stroke:#039be5,stroke-width:2px;
    classDef decision fill:#fce4ec,stroke:#e53935,stroke-width:2px;
    classDef screen fill:#e8f5e9,stroke:#43a047,stroke-width:2px;
    classDef system fill:#fff3e0,stroke:#fb8c00,stroke-width:2px;

    class Agent user;
    class Toggle decision;
    class List,Show,Hide screen;
    class Revalidate system;
```

**Field Spec:**

| Field Name | Field Type | Detail | Validation |
|:---|:---|:---|:---|
| isVisible | boolean toggle | เปิด = แสดงบน Frontend, ปิด = ซ่อน | Default: true |
| AfterChange Hook | hook | เมื่อเปลี่ยน isVisible → revalidatePath หน้า Listing + Detail | Auto-trigger |

**Checklist:**

| # | Task | Assign | Status |
|:--|:-----|:-------|:-------|
| 1 | Agent สามารถ Toggle เปิด/ปิดการแสดงผลทัวร์ได้ทันทีจากหน้ารายการ | DEV, UX/UI | ⚪️ To Do |
| 2 | เมื่อปิด ทัวร์ต้องหายจากหน้าเว็บ Frontend ภายใน 60 วินาที | UX/UI | ⚪️ To Do |
| 3 | เมื่อเปิดกลับ ทัวร์ต้องแสดงกลับมา | DEV | ⚪️ To Do |
| 4 | ระบบต้องสั่ง Revalidate Cache หน้าที่เกี่ยวข้องอัตโนมัติ | DEV, UX/UI | ⚪️ To Do |
| 5 | การ Toggle ต้องไม่ลบข้อมูลทัวร์ออกจาก Database | DEV | ⚪️ To Do |

---
