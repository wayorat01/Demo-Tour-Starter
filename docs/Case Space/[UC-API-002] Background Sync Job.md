# UC-API-002: Background Sync Job

**Status:** ⚪️ To Do
**Developer:** [ ]
**UX/UI:** [ ]

**As a** Administrator

**I want to** ให้ระบบ Sync ข้อมูลทัวร์จาก API ในเบื้องหลังอัตโนมัติ

**So that** ข้อมูลทัวร์บนเว็บอัปเดตตลอด โดยไม่กระทบ Performance ของเว็บไซต์

**Platform:** Platform Backoffice

---

**Workflow:**

```mermaid
flowchart TD
    Timer[⏰ Scheduled Trigger] -->|1. ตาม Interval ที่ตั้ง| Queue[📋 Sync Queue]
    Queue -->|2. ดึง Tenant Config| Config[(📁 API Configs)]
    Config -->|3. ยิง API ทีละ Batch| API[🌐 External Tour API]
    API -->|4. รับข้อมูลกลับ| Validate{✅ Validate Data}
    Validate -->|ผ่าน| Upsert[💾 Upsert to MongoDB]
    Validate -->|ไม่ผ่าน| Log[📝 Log Error + Skip]
    Upsert -->|5. Revalidate Cache| Revalidate[♻️ Invalidate Frontend Cache]
    Log -->|Retry| Retry[🔄 Retry (max 3 ครั้ง)]

    classDef system fill:#fff3e0,stroke:#fb8c00,stroke-width:2px;
    classDef data fill:#f3e5f5,stroke:#8e24aa,stroke-width:2px;
    classDef decision fill:#fce4ec,stroke:#e53935,stroke-width:2px;
    classDef screen fill:#e8f5e9,stroke:#43a047,stroke-width:2px;

    class Timer,Queue,API,Upsert,Revalidate,Retry system;
    class Config data;
    class Validate decision;
    class Log screen;
```

**Field Spec:**

| Field Name | Field Type | Detail | Validation |
|:---|:---|:---|:---|
| batchSize | number | จำนวน Record ต่อ Batch (แนะนำ 50-100) | — |
| maxRetries | number | จำนวนครั้ง Retry สูงสุดเมื่อ Fail | Default: 3 |
| timeout | number | Timeout ต่อ API Call (ms) | Default: 30000 |
| concurrency | number | จำนวน Tenant ที่ Sync พร้อมกัน | Default: 3 |
| errorLog | collection | บันทึก Error ของแต่ละ Sync Run | Auto-generated |
| syncReport | collection | สรุปผลแต่ละ Run (จำนวน success/fail/skip) | Auto-generated |

**Checklist:**

| # | Task | Assign | Status |
|:--|:-----|:-------|:-------|
| 1 | ระบบต้อง Sync ข้อมูลทัวร์ > 1,000 รายการได้โดยไม่ล่ม (No Downtime) | DEV | ⚪️ To Do |
| 2 | Sync Job ต้องเป็น Background Process ไม่กระทบ Frontend Performance | DEV | ⚪️ To Do |
| 3 | มี Error Handling + Retry Mechanism (สูงสุด 3 ครั้ง) | DEV | ⚪️ To Do |
| 4 | มี Sync Report แสดงจำนวน Success/Fail/Skip ของแต่ละ Run | DEV | ⚪️ To Do |
| 5 | หลัง Sync สำเร็จ ต้อง Trigger Cache Invalidation ให้หน้า Frontend อัปเดต | DEV, UX/UI | ⚪️ To Do |

---
