# UC-MWS-015: Multi-Source Booking

**Status:** ⚪️ To Do
**Developer:** [ ]
**UX/UI:** [ ]

**As a** End-User, Admin(Agent)

**I want to** จองทัวร์ได้ไม่ว่าข้อมูลจะมาจาก Source ไหน

**So that** ระบบ Booking ทำงานได้กับทุก Wholesale Source

**Platform:** Front End, Platform Backoffice, Email

---

**Workflow:**

```mermaid
flowchart TD
    User([👤 End-User]) -->|1. กดจองทัวร์| Booking[📝 Booking Form]
    Booking -->|2. ส่งฟอร์ม| API[⚙️ Booking API Route]
    API -->|3. ตรวจ sourceSlug ของ Product| Router{🔌 Source Router}
    Router -->|tourprox| ExtAPI[🌐 TourProx Booking API]
    Router -->|อื่นๆ / internal| Internal[💾 Internal Booking — Save ลง Payload]
    ExtAPI --> Save[💾 Save Booking Record]
    Internal --> Save
    Save -->|4. ส่ง Email ยืนยัน| Email[📧 Confirmation Email]

    classDef user fill:#e1f5fe,stroke:#039be5,stroke-width:2px;
    classDef system fill:#fff3e0,stroke:#fb8c00,stroke-width:2px;
    classDef decision fill:#fce4ec,stroke:#e53935,stroke-width:2px;
    classDef screen fill:#e8f5e9,stroke:#43a047,stroke-width:2px;

    class User user;
    class API,ExtAPI,Internal,Save system;
    class Router decision;
    class Booking,Email screen;
```

**Field Spec:**

| Field Name | Field Type | Detail | Validation |
|:---|:---|:---|:---|
| sourceSlug | text | Source ที่ Product นี้มาจาก | Auto-detected from Product |
| bookingTarget | select | external-api, internal | Auto-determined |
| externalBookingId | text | Booking ID จาก External API (ถ้ามี) | Optional |
| internalPnrCode | text | PNR Code ภายในระบบ | Auto-generated |

**Checklist:**

| # | Task | Assign | Status |
|:--|:-----|:-------|:-------|
| 1 | Booking Route ต้องตรวจ sourceSlug ของ Product ก่อนส่งข้อมูลจอง | DEV | ⚪️ To Do |
| 2 | Source ที่มี External Booking API → ส่งข้อมูลไป API ต้นทาง | DEV | ⚪️ To Do |
| 3 | Source ที่ไม่มี External API → บันทึกเป็น Internal Booking | DEV | ⚪️ To Do |
| 4 | Booking Record ต้องมี sourceSlug เพื่อ trace ย้อนกลับ | DEV | ⚪️ To Do |
| 5 | Phase 1: ทำงานเป็น Internal Booking เหมือนเดิม — Phase 4 จึงเพิ่ม External Booking | DEV | ⚪️ To Do |

---
