# UC-MWS-007: Schema Validation

**Status:** ⚪️ To Do
**Developer:** [ ]
**UX/UI:** [ ]

**As a** Administrator

**I want to** ให้ข้อมูลถูกตรวจสอบความถูกต้องก่อน Save ลงฐานข้อมูล

**So that** ไม่มีข้อมูลขยะหรือข้อมูลไม่ครบเข้ามาในระบบ

**Platform:** Platform Backoffice

---

**Workflow:**

```mermaid
flowchart TD
    Normalized[📋 Normalized Data] --> Validator{✅ Zod Schema Validation}
    Validator -->|ผ่าน| Upsert[💾 Upsert program-tours]
    Validator -->|ไม่ผ่าน| Log[📝 Log Warning + Skip]

    Log --> Report[📊 Sync Report — skipped count]

    classDef system fill:#fff3e0,stroke:#fb8c00,stroke-width:2px;
    classDef decision fill:#fce4ec,stroke:#e53935,stroke-width:2px;
    classDef data fill:#f3e5f5,stroke:#8e24aa,stroke-width:2px;

    class Normalized data;
    class Validator decision;
    class Upsert,Log system;
    class Report data;
```

**Field Spec:**

| Field Name | Field Type | Detail | Validation |
|:---|:---|:---|:---|
| productCode | text | รหัสทัวร์ | Required, Non-empty string |
| productName | text | ชื่อโปรแกรมทัวร์ | Required, Non-empty string |
| countrySlug | text | slug ประเทศ | Required, Non-empty string |
| priceProduct | number | ราคาเริ่มต้น | Optional, Min 0 |
| stayDay | number | จำนวนวัน | Optional, Min 0 |
| sourceSlug | text | slug ของ Source | Required for synced data |

**Checklist:**

| # | Task | Assign | Status |
|:--|:-----|:-------|:-------|
| 1 | ข้อมูลที่ Validate ไม่ผ่านต้อง Skip record นั้น — ไม่หยุด Sync ทั้ง Batch | DEV | ⚪️ To Do |
| 2 | ใช้ Zod Schema สำหรับ Type Validation | DEV | ⚪️ To Do |
| 3 | Required fields: productCode, productName, countrySlug ต้องไม่เป็นค่าว่าง | UX/UI | ⚪️ To Do |
| 4 | Number fields: ต้อง ≥ 0 | DEV | ⚪️ To Do |
| 5 | ทุก Validation Error ต้องบันทึกลง sync-logs.errors พร้อม field name + reason | DEV | ⚪️ To Do |

---
