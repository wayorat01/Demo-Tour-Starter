# UC-MWS-001: API Source Management

**Status:** ⚪️ To Do
**Developer:** [ ]
**UX/UI:** [ ]

**As a** Administrator, Admin(Agent)

**I want to** จัดการ Wholesale API Sources หลายแหล่งได้ในหน้า Admin

**So that** ระบบสามารถดึงข้อมูลทัวร์จากหลาย Wholesale พร้อมกันได้

**Platform:** Platform Backoffice

---

**Workflow:**

```mermaid
flowchart TD
    Admin([👤 Admin]) -->|1. เข้าหน้า API Sources| List[/📋 API Sources List/]
    List -->|2. กด Add New| Form[/📝 Source Config Form/]
    Form -->|3. กรอก Name, URL, Key, Auth Type| Save[💾 บันทึก]
    Save -->|4. ทดสอบ Connection| Test{✅ Connection Test}
    Test -->|สำเร็จ| Active[🟢 Active — พร้อม Sync]
    Test -->|ล้มเหลว| Error[🔴 แจ้ง Error + ให้แก้ไข]
    Active -->|5. ตั้ง Sync Interval & Priority| Done[✨ Source พร้อมใช้งาน]

    classDef user fill:#e1f5fe,stroke:#039be5,stroke-width:2px;
    classDef system fill:#fff3e0,stroke:#fb8c00,stroke-width:2px;
    classDef decision fill:#fce4ec,stroke:#e53935,stroke-width:2px;
    classDef screen fill:#e8f5e9,stroke:#43a047,stroke-width:2px;

    class Admin user;
    class Save,Done system;
    class Test decision;
    class List,Form,Active,Error screen;
```

**Field Spec:**

| Field Name | Field Type | Detail | Validation |
|:---|:---|:---|:---|
| name | text | ชื่อ Source เช่น "TourProx", "TravelPack" | Required |
| slug | text | Identifier (unique) เช่น "tourprox" | Required, Unique |
| apiType | select | ประเภท: rest-api, graphql, scraper, csv-import | Required |
| baseUrl | text | Base URL ของ API | Required, Valid URL |
| apiKey | text (encrypted) | API Key สำหรับ Authentication | Required |
| authType | select | api-key, bearer, basic, oauth2, none | Required |
| authConfig | json | Config เพิ่มเติมสำหรับ Auth (headers, token URL) | Optional |
| adapterName | text | ชื่อ Adapter class ที่ใช้ Map ข้อมูล | Required |
| syncInterval | select | ทุก 1 ชม., 6 ชม., 12 ชม., 24 ชม. | Default: ทุก 6 ชม. |
| isActive | checkbox | เปิด/ปิด Source | Default: true |
| lastSyncAt | datetime | วันเวลา Sync ล่าสุด | Auto-updated |
| syncStatus | select | idle, running, success, failed | System-managed |
| lastError | textarea | Error message ล่าสุด | Auto-updated |
| priority | number | ลำดับความสำคัญ (ถ้าข้อมูลซ้ำ ใช้จาก priority สูง) | Default: 0 |

**Checklist:**

| # | Task | Assign | Status |
|:--|:-----|:-------|:-------|
| 1 | Admin สามารถเพิ่ม/แก้ไข/ลบ API Source ได้ (CRUD) | DEV, UX/UI | ⚪️ To Do |
| 2 | ปุ่ม Test Connection ต้องทดสอบการเชื่อมต่อและแจ้งผลทันที | DEV, UX/UI | ⚪️ To Do |
| 3 | API Key ต้องถูกเข้ารหัส (Encryption) ก่อน Save ลงฐานข้อมูล | DEV | ⚪️ To Do |
| 4 | slug ต้อง Unique — ห้ามซ้ำกัน | DEV | ⚪️ To Do |
| 5 | ข้อมูลเดิมจาก Global `api-setting` ต้องถูก Migrate เป็น Record แรกอัตโนมัติ | DEV | ⚪️ To Do |

---
