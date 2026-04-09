# UC-MWS-018: Migration Safety

**Status:** ⚪️ To Do
**Developer:** [ ]
**UX/UI:** [ ]

**As a** Administrator

**I want to** ให้ระบบเดิมทำงานได้ปกติระหว่าง Migration ไปใช้ Multi-Source

**So that** ไม่มี Downtime หรือ Breaking Changes ระหว่างการเปลี่ยนผ่าน

**Platform:** Platform Backoffice

---

**Workflow:**

```mermaid
flowchart TD
    Old([🔧 ระบบเดิม]) --> Legacy[Global: api-setting]
    Legacy --> OldRoute[/api/sync-program-tours]
    OldRoute -->|ภายในเรียก| Engine[⚙️ Sync Engine — Source: tourprox]

    New([🆕 ระบบใหม่]) --> Sources[(📁 api-sources)]
    Sources --> Engine
    Engine --> PT[(💾 program-tours)]

    classDef system fill:#fff3e0,stroke:#fb8c00,stroke-width:2px;
    classDef data fill:#f3e5f5,stroke:#8e24aa,stroke-width:2px;
    classDef screen fill:#e8f5e9,stroke:#43a047,stroke-width:2px;

    class Old,New screen;
    class Legacy,OldRoute system;
    class Engine system;
    class Sources,PT data;
```

**Field Spec:**

| Field Name | Field Type | Detail | Validation |
|:---|:---|:---|:---|
| legacyApiSetting | global | Global api-setting เดิม — คงไว้ชั่วคราว | Read-only after migration |
| legacySyncRoute | api route | /api/sync-program-tours — เรียก Engine ภายใน | Backward compatible |
| deprecationDate | date | วันที่จะ Deprecate Global api-setting | After Phase 3 |

**Checklist:**

| # | Task | Assign | Status |
|:--|:-----|:-------|:-------|
| 1 | Global `api-setting` ต้องยังทำงานได้ปกติระหว่าง Transition | DEV | ⚪️ To Do |
| 2 | Sync Routes เดิม (`/api/sync-program-tours`, `/api/sync-itinerary`) ต้องไม่พัง | DEV | ⚪️ To Do |
| 3 | Frontend ต้องไม่ได้รับผลกระทบใดๆ — ข้อมูลยังอยู่ใน `program-tours` เหมือนเดิม | DEV | ⚪️ To Do |
| 4 | Fields ใหม่ใน `program-tours` ต้องเป็น Optional ไม่กระทบ Record เดิม | DEV | ⚪️ To Do |
| 5 | หลัง Migration ลงตัว (Phase 3++) จึงค่อย Deprecate Global `api-setting` | DEV | ⚪️ To Do |

---
