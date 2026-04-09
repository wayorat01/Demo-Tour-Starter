# UC-MWS-009: Image Downloader

**Status:** ⚪️ To Do
**Developer:** [ ]
**UX/UI:** [ ]

**As a** Administrator

**I want to** ดาวน์โหลดรูปภาพจากเว็บต้นทางมาเก็บในระบบของเรา

**So that** รูปภาพโหลดเร็วผ่าน CDN ของเรา ไม่พึ่งพา Server ภายนอก

**Platform:** Platform Backoffice

---

**Workflow:**

```mermaid
flowchart TD
    Sync[⚙️ Sync Engine] -->|1. พบ Image URL ภายนอก| Check{🔍 มีอยู่ใน S3 แล้ว?}
    Check -->|มีแล้ว (hash match)| Skip[⏭️ ข้าม — ใช้ URL เดิม]
    Check -->|ยังไม่มี| Download[⬇️ ดาวน์โหลดรูป]
    Download -->|2. Validate format + size| Upload[☁️ Upload ไป S3/Media]
    Upload -->|3. อัปเดต URL ใน program-tours| Update[💾 อัปเดต urlPic → CDN URL]

    classDef system fill:#fff3e0,stroke:#fb8c00,stroke-width:2px;
    classDef decision fill:#fce4ec,stroke:#e53935,stroke-width:2px;
    classDef data fill:#f3e5f5,stroke:#8e24aa,stroke-width:2px;

    class Sync,Download,Upload,Update system;
    class Check decision;
    class Skip data;
```

**Field Spec:**

| Field Name | Field Type | Detail | Validation |
|:---|:---|:---|:---|
| sourceImageUrl | text | URL รูปภาพจากเว็บต้นทาง | Valid URL |
| localImageUrl | text | URL หลัง Upload ไป CDN | Auto-generated |
| imageHash | text | Hash ของรูปภาพ (สำหรับ deduplicate) | Auto-generated |
| maxFileSize | number | ขนาดไฟล์สูงสุด (bytes) | 5MB |
| allowedFormats | array | format ที่รองรับ: jpg, png, webp | — |

**Checklist:**

| # | Task | Assign | Status |
|:--|:-----|:-------|:-------|
| 1 | รูปภาพจากเว็บต้นทางต้องถูกดาวน์โหลดและ Upload ไป S3 (Wasabi) | DEV | ⚪️ To Do |
| 2 | URL ใน program-tours ต้องถูกอัปเดตให้ชี้ไปที่ CDN ของเรา | DEV | ⚪️ To Do |
| 3 | รองรับ format: JPG, PNG, WebP — ขนาดสูงสุด 5MB | DEV | ⚪️ To Do |
| 4 | ข้าม Duplicate โดยใช้ Hash Check | DEV | ⚪️ To Do |
| 5 | ถ้า Download ล้มเหลว ให้คง URL เดิมไว้ — ไม่ทำให้ Sync ล้มเหลว | DEV | ⚪️ To Do |

---
