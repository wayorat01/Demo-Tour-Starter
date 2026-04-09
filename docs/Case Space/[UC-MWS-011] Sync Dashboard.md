# UC-MWS-011: Sync Dashboard

**Status:** ⚪️ To Do
**Developer:** [ ]
**UX/UI:** [ ]

**As a** Administrator, Admin(Agent)

**I want to** มี Dashboard ดูสถานะ Sync ของทุก Source ในที่เดียว

**So that** สามารถ Monitor, Manual Sync และตรวจสอบ Log ได้สะดวก

**Platform:** Platform Backoffice

---

**Workflow:**

```mermaid
flowchart TD
    Admin([👤 Admin]) -->|1. เข้า Sync Dashboard| Dashboard[/📊 Sync Dashboard/]
    Dashboard --> Status[📋 Source Status — Last Sync, Success/Failed]
    Dashboard --> Manual[🔘 Manual Sync — เลือก Source]
    Dashboard --> Test[🔌 Test Connection]
    Dashboard --> Logs[📝 Sync Logs Viewer]

    Manual -->|กด Sync| Engine[⚙️ Sync Engine]
    Test -->|ทดสอบ| Result{✅ Connected / ❌ Failed}
    Logs -->|Filter by source/status/date| LogDB[(📁 sync-logs)]

    classDef user fill:#e1f5fe,stroke:#039be5,stroke-width:2px;
    classDef system fill:#fff3e0,stroke:#fb8c00,stroke-width:2px;
    classDef decision fill:#fce4ec,stroke:#e53935,stroke-width:2px;
    classDef screen fill:#e8f5e9,stroke:#43a047,stroke-width:2px;

    class Admin user;
    class Engine system;
    class Result decision;
    class Dashboard,Status,Manual,Test,Logs screen;
    class LogDB system;
```

**Field Spec:**

| Field Name | Field Type | Detail | Validation |
|:---|:---|:---|:---|
| sourceList | ui component | แสดง Source ทุกตัว พร้อม status badge | — |
| syncButton | button | กด Manual Sync ต่อ Source | — |
| testButton | button | ทดสอบ Connection ต่อ Source | — |
| logsTable | table | ตาราง Sync Logs — filter/sort ได้ | — |
| productCount | number | จำนวน Products ต่อ Source | Auto-calculated |

**Checklist:**

| # | Task | Assign | Status |
|:--|:-----|:-------|:-------|
| 1 | Dashboard ต้องแสดง Status ของทุก Source (Last Sync, สำเร็จ/ล้มเหลว, จำนวน Products) | DEV | ⚪️ To Do |
| 2 | ปุ่ม Manual Sync ต้องเลือก Source ที่ต้องการ Sync ได้ | DEV, UX/UI | ⚪️ To Do |
| 3 | ปุ่ม Test Connection ต้องทดสอบ API และแจ้งผลทันที | DEV, UX/UI | ⚪️ To Do |
| 4 | Sync Logs Viewer ต้อง Filter ตาม Source, Status, วันที่ได้ | DEV | ⚪️ To Do |
| 5 | ใช้ Payload CMS Custom Admin Component — ไม่ต้อง build หน้าแยก | UX/UI | ⚪️ To Do |

---
