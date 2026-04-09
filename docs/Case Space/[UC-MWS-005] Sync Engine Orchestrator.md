# UC-MWS-005: Sync Engine Orchestrator

**Status:** ⚪️ To Do
**Developer:** [ ]
**UX/UI:** [ ]

**As a** Administrator

**I want to** ให้ระบบมี Sync Engine กลางที่จัดการ Sync ทุก Source อัตโนมัติ

**So that** ข้อมูลจากทุก Wholesale ถูกดึง Normalize Validate และ Save เข้าระบบอย่างเป็นระบบ

**Platform:** Platform Backoffice

---

**Workflow:**

```mermaid
flowchart TD
    Start([🟢 Start Sync]) --> Load["1. โหลด Active Sources"]
    Load --> Loop{"2. วน Loop ทีละ Source"}
    Loop --> Adapter["3. เรียก Adapter ตาม apiType"]
    Adapter --> Fetch["4. Fetch Products (pagination)"]
    Fetch --> Normalize["5. Normalize ข้อมูล"]
    Normalize --> Validate{"6. Validate Required Fields?"}
    Validate -->|ผ่าน| Upsert["7. Upsert program-tours"]
    Validate -->|ไม่ผ่าน| Skip["8. Skip + Log Warning"]
    Upsert --> Next{"ยังมี Source อีก?"}
    Skip --> Next
    Next -->|มี| Loop
    Next -->|หมด| Report["9. บันทึก sync-logs"]
    Report --> Cache["10. Invalidate Frontend Cache"]
    Cache --> Done([🔵 Done])

    classDef system fill:#fff3e0,stroke:#fb8c00,stroke-width:2px;
    classDef decision fill:#fce4ec,stroke:#e53935,stroke-width:2px;
    classDef screen fill:#e8f5e9,stroke:#43a047,stroke-width:2px;

    class Start,Done screen;
    class Load,Adapter,Fetch,Normalize,Upsert,Skip,Report,Cache system;
    class Loop,Validate,Next decision;
```

**Field Spec:**

| Field Name | Field Type | Detail | Validation |
|:---|:---|:---|:---|
| sources | array | รายการ Active Sources ที่ต้อง Sync | Auto-loaded |
| batchSize | number | จำนวน record ต่อ batch (50-100) | Default: 50 |
| concurrency | number | จำนวน Source ที่ Sync พร้อมกัน | Default: 1 |
| maxRetries | number | จำนวนครั้ง Retry เมื่อ API fail | Default: 3 |
| timeout | number | Timeout ต่อ API call (ms) | Default: 30000 |

**Checklist:**

| # | Task | Assign | Status |
|:--|:-----|:-------|:-------|
| 1 | Sync Engine ต้อง Sync ข้อมูล > 5,000 tours จากหลาย Source ได้โดยไม่ล่ม | DEV | ⚪️ To Do |
| 2 | ต้องเป็น Background Process ไม่กระทบ Frontend Performance | DEV | ⚪️ To Do |
| 3 | มี Error Handling + Retry Mechanism (สูงสุด 3 ครั้ง) | DEV | ⚪️ To Do |
| 4 | หลัง Sync สำเร็จต้อง Trigger Cache Invalidation | DEV | ⚪️ To Do |
| 5 | บันทึกผลสรุป (created/updated/skipped/errors) ลง sync-logs ทุกครั้ง | DEV | ⚪️ To Do |

---
