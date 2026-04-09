# UC-BKG-003: Booking Status Management

**Status:** ✅ Done
**Developer:** [ ]
**UX/UI:** [ ]

**As a** Admin(Agent)

**I want to** ดูรายการจองและเปลี่ยน Status การจองได้ในหลังบ้าน

**So that** จัดการคำสั่งจองได้อย่างมีระเบียบ

**Platform:** Platform Backoffice

---

**Workflow:**

```mermaid
flowchart TD
    Agent([👤 Agent Admin]) -->|1. เข้าหน้า Bookings| List[/📋 Booking List/]
    List -->|2. คลิกดูรายละเอียด| Detail[/📄 Booking Detail/]
    Detail -->|3. เปลี่ยน Status| Status{📝 เลือก Status ใหม่}
    Status -->|รอยืนยัน| Pending[⏳ Pending]
    Status -->|ยืนยันแล้ว| Confirmed[✅ Confirmed]
    Status -->|ยกเลิก| Cancelled[❌ Cancelled]
    Pending & Confirmed & Cancelled -->|4. บันทึก| Save[💾 อัปเดต Status]
    Save -->|5. ส่ง Email แจ้ง| Notify[📧 Notification Email]

    classDef user fill:#e1f5fe,stroke:#039be5,stroke-width:2px;
    classDef decision fill:#fce4ec,stroke:#e53935,stroke-width:2px;
    classDef screen fill:#e8f5e9,stroke:#43a047,stroke-width:2px;
    classDef system fill:#fff3e0,stroke:#fb8c00,stroke-width:2px;

    class Agent user;
    class Status decision;
    class List,Detail,Pending,Confirmed,Cancelled screen;
    class Save,Notify system;
```

**Field Spec:**

| Field Name | Field Type | Detail | Validation |
|:---|:---|:---|:---|
| bookingId | auto-generated | รหัสจอง (ไม่ใช่ PNR) | Unique |
| status | select | Pending, Confirmed, Cancelled | Required |
| statusHistory | array | บันทึกการเปลี่ยน Status + Timestamp + User | Auto-append |
| adminNotes | textarea | บันทึกภายใน (End-User ไม่เห็น) | Optional |
| Filter by status | UI | กรองรายการจองตาม Status | — |
| Filter by date | UI | กรองตามช่วงวันที่จอง | — |
| Search | UI | ค้นหาด้วยชื่อ, เบอร์, อีเมลผู้จอง | Like search |

**Checklist:**

| # | Task | Assign | Status |
|:--|:-----|:-------|:-------|
| 1 | Agent สามารถดูรายการจองทั้งหมดของ Tenant ตนเองได้ | DEV, UX/UI | ✅ Done |
| 2 | Agent สามารถเปลี่ยน Status (Pending → Confirmed → Cancelled) ได้ | DEV, UX/UI | ✅ Done |
| 3 | ทุกการเปลี่ยน Status ต้องถูกบันทึกใน History พร้อม Timestamp | DEV | ✅ Done |
| 4 | สามารถ Filter รายการจองตาม Status, วันที่, ค้นหาชื่อ/เบอร์ ได้ | DEV, UX/UI | ✅ Done |
| 5 | การออก Invoice/Receipt → Agent จัดการต่อที่ Tourprox (ไม่ทำในระบบนี้) | DEV | ✅ Done |
| 6 | Agent ต้องไม่เห็นรายการจองของ Tenant อื่น | DEV | ✅ Done |

---
