# UC-SYS-007: Data Encryption

**Status:** ⚪️ To Do
**Developer:** [ ]
**UX/UI:** [ ]

**As a** Administrator

**I want to** ให้ข้อมูลส่วนบุคคลของ End-User ถูกเข้ารหัสในฐานข้อมูล

**So that** ข้อมูลมีความปลอดภัยตาม PDPA และจำกัดสิทธิ์การเข้าถึง

**Platform:** Platform Backoffice

---

**Workflow:**

```mermaid
flowchart TD
    User([👤 End-User]) -->|1. กรอกข้อมูลจอง| Form[/📝 Booking Form/]
    Form -->|2. ส่งข้อมูล| API[⚙️ Payload API]
    API -->|3. BeforeChange Hook| Encrypt[🔐 Encrypt PII Fields]
    Encrypt -->|4. บันทึกข้อมูลที่เข้ารหัส| DB[(📁 MongoDB)]
    
    Admin([👨‍💼 Agent Admin]) -->|5. ดูรายการจอง| Read[⚙️ AfterRead Hook]
    Read -->|6. Decrypt สำหรับ Authorized| Decrypt[🔓 Decrypt PII Fields]
    Decrypt -->|7. แสดงข้อมูล| Dashboard[/📊 Booking Dashboard/]

    classDef user fill:#e1f5fe,stroke:#039be5,stroke-width:2px;
    classDef system fill:#fff3e0,stroke:#fb8c00,stroke-width:2px;
    classDef data fill:#f3e5f5,stroke:#8e24aa,stroke-width:2px;
    classDef screen fill:#e8f5e9,stroke:#43a047,stroke-width:2px;

    class User,Admin user;
    class API,Encrypt,Read,Decrypt system;
    class DB data;
    class Form,Dashboard screen;
```

**Field Spec:**

| Field Name | Field Type | Detail | Validation |
|:---|:---|:---|:---|
| customerName | encrypted text | ชื่อ-นามสกุลผู้จอง — เข้ารหัส AES-256 | Required |
| customerPhone | encrypted text | เบอร์โทรศัพท์ — เข้ารหัส AES-256 | Required |
| customerEmail | encrypted email | อีเมล — เข้ารหัส AES-256 | Required, Valid Email |
| encryptionKey | env variable | Encryption Key เก็บใน Environment Variable | ห้าม Hardcode |

**Checklist:**

| # | Task | Assign | Status |
|:--|:-----|:-------|:-------|
| 1 | ข้อมูล PII (ชื่อ, เบอร์โทร, อีเมล) ต้องถูกเข้ารหัสก่อน Save ลง MongoDB | DEV | ⚪️ To Do |
| 2 | ข้อมูลใน Database ต้องไม่สามารถอ่านได้โดยตรง (ต้องเป็น Ciphertext) | DEV, UX/UI | ⚪️ To Do |
| 3 | เฉพาะ User ที่มีสิทธิ์ (Agent Admin ที่เป็นเจ้าของ Tenant) เท่านั้นที่เห็นข้อมูลจริง | DEV | ⚪️ To Do |
| 4 | Encryption Key ต้องเก็บใน Environment Variable ไม่ Hardcode ในโค้ด | DEV | ⚪️ To Do |
| 5 | Super Admin สามารถเข้าถึงข้อมูลที่ Decrypt แล้วได้ | DEV, UX/UI | ⚪️ To Do |

---
