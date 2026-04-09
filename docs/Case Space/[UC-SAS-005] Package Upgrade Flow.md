# UC-SAS-005: 🟡P2 Package Upgrade Flow

**Status:** 📋 Draft (ยังไม่อนุมัติ — รอประชุมวางแผนแพ็กเกจ)
**Developer:** [ ]
**UX/UI:** [ ]

**As a** Admin(Agent)

**I want to** อัพเกรดแพ็กเกจของเว็บไซต์เพื่อปลดล็อค Template ใหม่ เพิ่มโควต้าหน้าเว็บ และเปิดฟีเจอร์ขั้นสูง

**So that** เว็บไซต์รองรับฟีเจอร์มากขึ้นตามความต้องการทางธุรกิจ

**Platform:** Front End (Agent Dashboard), Platform Backoffice

---

**Workflow:**

```mermaid
flowchart TD
    Agent(["👤 Agent"]) -->|1. เข้าหน้า "แพ็กเกจของฉัน"| Dashboard[/"📊 My Package Dashboard"/]
    Dashboard --> Current["แสดงแพ็กเกจปัจจุบัน:\n- ชื่อแพ็กเกจ\n- วันหมดอายุ\n- Usage Progress Bars"]
    Current -->|2. กด 'อัพเกรด'| Compare[/"⚖️ หน้าเปรียบเทียบแพ็กเกจ\n(Pricing Table)"/]
    Compare -->|3. เลือกแพ็กเกจใหม่| Confirm{{"✅ ยืนยัน\nอัพเกรด?"}}
    Confirm -->|ยืนยัน| Payment["💳 ชำระเงิน\n(UC-SAS-008)"]
    Confirm -->|ยกเลิก| Dashboard
    Payment -->|สำเร็จ| Upgrade["⚡ Upgrade Hook:\n1. อัปเดต Package\n2. ขยายโควต้า\n3. เปิดฟีเจอร์ใหม่\n4. ปลดล็อค Templates"]
    Upgrade --> Success["🎉 แจ้งผล 'อัพเกรดสำเร็จ!'\n+ ส่ง Email ยืนยัน"]

    classDef user fill:#e1f5fe,stroke:#039be5,stroke-width:2px;
    classDef system fill:#fff3e0,stroke:#fb8c00,stroke-width:2px;
    classDef decision fill:#fce4ec,stroke:#e53935,stroke-width:2px;
    classDef screen fill:#e8f5e9,stroke:#43a047,stroke-width:2px;

    class Agent user;
    class Upgrade system;
    class Confirm decision;
    class Dashboard,Current,Compare,Payment,Success screen;
```

**Field Spec:**

| Field Name | Field Type | Detail | Validation |
|:---|:---|:---|:---|
| currentPackage | display | แสดงแพ็กเกจปัจจุบันพร้อมรายละเอียดสิทธิ์ | — |
| usageProgress | UI Component | แถบแสดง Usage (เช่น Info Pages: 3/5, Featured Tours: 1/3) | — |
| pricingTable | UI Component | ตารางเปรียบเทียบแพ็กเกจ (Feature × Package Matrix) | — |
| upgradeTarget | select | แพ็กเกจที่ต้องการอัพเกรดไป | ต้องสูงกว่าปัจจุบัน |
| prorationAmount | number | คำนวณส่วนต่างราคา (Prorate ตามวันที่เหลือ) | Auto-calculated |

**Checklist:**

| # | Task | Assign | Status |
|:--|:-----|:-------|:------|
| 1 | หน้า "แพ็กเกจของฉัน" แสดง Usage Progress Bars สำหรับทุกโควต้า | DEV, UX/UI | ⚪️ To Do |
| 2 | Pricing Table แสดง Feature Comparison แบบ Highlight สิทธิ์ที่เพิ่มขึ้น | UX/UI | ⚪️ To Do |
| 3 | การอัพเกรดมีผลทันที — ฟีเจอร์ใหม่ปลดล็อคทันทีหลังชำระเงิน | DEV | ⚪️ To Do |
| 4 | ไม่สามารถ Downgrade ได้ (ต้องติดต่อ Admin) | DEV | ⚪️ To Do |
| 5 | ส่ง Email ยืนยันการอัพเกรดพร้อมรายละเอียดสิทธิ์ใหม่ | DEV | ⚪️ To Do |

---
