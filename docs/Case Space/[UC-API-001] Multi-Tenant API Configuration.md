# UC-API-001: Multi-Tenant API Configuration

**Status:** ⚪️ To Do
**Developer:** [ ]
**UX/UI:** [ ]

**As a** Admin(Agent)

**I want to** ตั้งค่า API End Point และ API Key ในหลังบ้านได้ด้วยตนเอง

**So that** ระบบดึงข้อมูลทัวร์จาก PM ของ Agent มาแสดงบนเว็บไซต์อัตโนมัติ

**Platform:** Platform Backoffice

---

**Workflow:**

```mermaid
flowchart TD
    Agent([👤 Agent Admin]) -->|1. เข้าหน้า API Settings| Form[/📝 API Configuration Form/]
    Form -->|2. กรอก End Point + API Key| Save[💾 บันทึก]
    Save -->|3. ทดสอบการเชื่อมต่อ| Test{✅ Connection Test}
    Test -->|สำเร็จ| Active[🟢 Active - พร้อม Sync]
    Test -->|ล้มเหลว| Error[🔴 แจ้ง Error + ให้แก้ไข]
    Active -->|4. Trigger Sync| Job[⚙️ Background Sync Job]

    classDef user fill:#e1f5fe,stroke:#039be5,stroke-width:2px;
    classDef system fill:#fff3e0,stroke:#fb8c00,stroke-width:2px;
    classDef decision fill:#fce4ec,stroke:#e53935,stroke-width:2px;
    classDef screen fill:#e8f5e9,stroke:#43a047,stroke-width:2px;

    class Agent user;
    class Save,Job system;
    class Test decision;
    class Form,Active,Error screen;
```

**Field Spec:**

| Field Name | Field Type | Detail | Validation |
|:---|:---|:---|:---|
| apiEndPoint | url | URL ของ API ปลายทาง | Required, Valid URL |
| apiKey | encrypted text | API Key สำหรับ Authentication — เก็บแบบเข้ารหัส | Required |
| syncInterval | select | ทุก 1 ชม., ทุก 6 ชม., ทุก 12 ชม., ทุก 24 ชม. | Default: ทุก 6 ชม. |
| lastSyncAt | datetime | วันเวลาที่ Sync ล่าสุดสำเร็จ | Auto-updated |
| syncStatus | select | Idle, Running, Success, Failed | System-managed |
| connectionTest | button | ปุ่มทดสอบการเชื่อมต่อ API | — |

**Checklist:**

| # | Task | Assign | Status |
|:--|:-----|:-------|:-------|
| 1 | Agent สามารถกรอก API End Point และ API Key ได้ด้วยตนเอง | DEV, UX/UI | ⚪️ To Do |
| 2 | ปุ่ม Test Connection ต้องทดสอบการเชื่อมต่อและแจ้งผลทันที | DEV, UX/UI | ⚪️ To Do |
| 3 | API Key ต้องถูกเข้ารหัสก่อน Save ลงฐานข้อมูล | DEV | ⚪️ To Do |
| 4 | หลังบันทึกสำเร็จ ระบบต้อง Trigger Background Sync Job อัตโนมัติ | DEV | ⚪️ To Do |
| 5 | แสดงสถานะ Sync ล่าสุด (สำเร็จ/ล้มเหลว) พร้อม Timestamp | DEV | ⚪️ To Do |

---
