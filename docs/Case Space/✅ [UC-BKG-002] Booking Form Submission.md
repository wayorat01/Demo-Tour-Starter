# UC-BKG-002: Booking Form Submission

**Status:** ✅ Done
**Developer:** [ ]
**UX/UI:** [ ]

**As a** End-User

**I want to** กรอกข้อมูลและส่งฟอร์มจองทัวร์ออนไลน์ได้

**So that** จองทัวร์ได้สะดวกตลอด 24 ชม. โดยไม่ต้องโทรหาบริษัท

**Platform:** Front End

---

**Workflow:**

```mermaid
flowchart TD
    User([👤 End-User]) -->|1. เลือกวันเดินทาง + ราคา| Detail[/📄 Tour Detail Page/]
    Detail -->|2. กด "จองเลย"| Form[/📝 Booking Form/]
    Form -->|3. กรอกข้อมูลผู้เดินทาง| Fill[📋 ชื่อ, เบอร์, อีเมล, จำนวนคน]
    Fill -->|4. ตรวจ Validation| Valid{✅ ข้อมูลครบ?}
    Valid -->|ครบ| Submit[💾 ส่งฟอร์ม]
    Valid -->|ไม่ครบ| Error[❌ แจ้ง Field ที่ขาด]
    Submit -->|5. บันทึก Booking| DB[(📁 Bookings Collection)]
    DB -->|6. ส่ง Email| Email[📧 Confirmation Email]
    Email -->|7. แสดงหน้า| ThankYou[/🎉 Thank You Page/]

    classDef user fill:#e1f5fe,stroke:#039be5,stroke-width:2px;
    classDef decision fill:#fce4ec,stroke:#e53935,stroke-width:2px;
    classDef screen fill:#e8f5e9,stroke:#43a047,stroke-width:2px;
    classDef system fill:#fff3e0,stroke:#fb8c00,stroke-width:2px;
    classDef data fill:#f3e5f5,stroke:#8e24aa,stroke-width:2px;

    class User user;
    class Valid decision;
    class Detail,Form,Fill,Error,ThankYou screen;
    class Submit,Email system;
    class DB data;
```

**Field Spec:**

| Field Name | Field Type | Required | Detail | Validation |
|:---|:---|:---|:---|:---|
| tourProgram | relationship | Y | ทัวร์ที่จอง (auto-filled จากหน้า Detail) | — |
| departureDate | date | Y | วันเดินทางที่เลือก | ต้องเป็นวันที่มี Period |
| selectedPrice | number | Y | ราคาที่เลือก (ต่อคน) | — |
| numberOfAdults | number | Y | จำนวนผู้ใหญ่ | Min 1 |
| numberOfChildren | number | N | จำนวนเด็ก | Min 0 |
| customerName | text | Y | ชื่อ-นามสกุลผู้จอง | — |
| customerPhone | tel | Y | เบอร์โทรศัพท์ | Valid Thai phone |
| customerEmail | email | Y | อีเมล | Valid Email |
| specialRequests | textarea | N | ข้อความเพิ่มเติม/ความต้องการพิเศษ | Max 500 chars |
| status | select | — | Pending (default) | System-managed |

**Checklist:**

| # | Task | Assign | Status |
|:--|:-----|:-------|:-------|
| 1 | ฟีเจอร์นี้ใช้ได้เฉพาะแพ็กเกจ ปกติ/Plus เท่านั้น | DEV | ✅ Done |
| 2 | End-User สามารถกรอกข้อมูลและส่งฟอร์มจองได้สำเร็จ | DEV, UX/UI | ✅ Done |
| 3 | ข้อมูลที่กรอกต้องผ่าน Validation ก่อนส่ง (ชื่อ, เบอร์โทร, อีเมล บังคับ) | DEV | ✅ Done |
| 4 | หลังจองสำเร็จ ต้องแสดง Thank You Page พร้อมรายละเอียดการจอง | DEV | ✅ Done |
| 5 | ข้อมูลส่วนบุคคลต้องถูกเข้ารหัสก่อน Save (ดู UC-SYS-007) | DEV | ✅ Done |
| 6 | ไม่ใช้ PNR Code | DEV | ✅ Done |

---
