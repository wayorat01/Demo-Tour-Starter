# TASK-001: Rotate Exposed Secrets

- **Priority:** Critical
- **Assigned to:** Team WOW (human)
- **Related plan:** claude_plan/done/260324_1330_root_cleanup.md
- **Status:** Done ✅
- **Created:** 2026-03-24
- **Updated:** 2026-03-25

## Why

ไฟล์ `.env` เคยถูก commit เข้า Git พร้อมข้อมูลจริง (credentials)
แม้จะ untrack ไปแล้ว (Plan 1330) แต่ secrets ยังคงอยู่ใน Git history
ใครก็ตามที่เข้าถึง Repo สามารถดึง credentials ออกมาได้

---

## สถานะปัจจุบัน

| รายการ | สถานะ |
|:---|:---|
| สร้างไฟล์ `.env` ใหม่จาก `.env.example` | ✅ เสร็จ |
| เจเนอเรต Secret Keys ใหม่ทั้งหมด | ✅ เสร็จ |
| แก้ไข Bug ที่เกิดระหว่างกู้ระบบ | ✅ เสร็จ |
| ยกเลิก Elastic Email API Token เก่า | ✅ สร้าง Key ใหม่แล้ว |
| เพิ่ม Pre-commit Hook ป้องกัน `.env` หลุด | ✅ เสร็จ |
| อัปเดต Production (Coolify) | ✅ เสร็จ |
| ตัดสินใจเรื่องล้าง Git History | ✅ ล้างแล้ว (git filter-repo) แต่ push main ไม่ได้เพราะ time out ไฟล์ทั้งหมดใหญ่เกินไป |

---

## ค่า Secret ใหม่ที่เจเนอเรตแล้ว

> ⚠️ **ห้าม commit ไฟล์นี้เข้า Git** — ใช้สำหรับอ้างอิงภายในเท่านั้น

| ตัวแปร | ค่าใหม่ |
|:---|:---|
| `PAYLOAD_SECRET` | `a6fb03c4473a9611278d469f216f94281af9dc365401b87a6456de529fd1d756` |
| `NEXT_PRIVATE_DRAFT_SECRET` | `ec44f1d2d2ffb0410885166c66f98f38` |
| `REVALIDATION_KEY` | `875c073c0e18d429c9a33db29c68451b` |
| `NEXT_PRIVATE_REVALIDATION_KEY` | `875c073c0e18d429c9a33db29c68451b` |
| `CRON_SECRET` | `20e0d5f93f0d9c245342639217e16ca2` |
| `SMTP_PASS` | ✅ อัปเดตแล้ว |
| `SMTP_USER` | `tour-softsq@softsq.com` (เปลี่ยนจาก tourprox) |
| `SMTP_PORT` | `2525` (เปลี่ยนจาก 587) |

---

## ขั้นตอนสำหรับทีม (Manual Steps)

### ขั้นที่ 1 — ยกเลิก Elastic Email Token เก่า 🚨
1. เข้า [Elastic Email Dashboard](https://elasticemail.com)
2. Login ด้วย `tourprox@gmail.com`
3. ไปที่ Settings → API Keys
4. **Revoke** token เก่า: `ccaf41ad-93a1-4e9e-872e-642d232da453`
5. สร้าง Token ใหม่ → นำมาใส่ใน `SMTP_PASS`

### ขั้นที่ 2 — อัปเดตไฟล์ `.env` ในเครื่อง
นำค่าจากตารางด้านบนไปแทนค่าเก่าในไฟล์ `.env`

### ขั้นที่ 3 — อัปเดต Production (Coolify)
1. เข้า Coolify Dashboard
2. อัปเดต Environment Variables ทุกตัวตามตาราง
3. **Restart** แอปพลิเคชัน
4. ทดสอบ: เปิดหน้าเว็บได้ปกติ + ระบบส่งอีเมลจองทัวร์ยังทำงาน

### ขั้นที่ 4 — ตัดสินใจเรื่องล้างประวัติ Git

| ทางเลือก | ข้อดี | ข้อเสีย |
|:---|:---|:---|
| ลบด้วย BFG / git filter-repo | ลบ credentials จากทุก commit | ต้อง force push, ทีมต้อง re-clone |
| ไม่ลบ (แค่ rotate keys) | ไม่กระทบทีม | ค่าเก่ายังอยู่ใน history (แต่ใช้ไม่ได้แล้ว) |

> 💡 **แนะนำ:** ถ้า Repo เป็น Private และ rotate keys ครบแล้ว อาจไม่ต้องลบ history ก็ได้

---

## การป้องกันในอนาคต

| ชั้นป้องกัน | สถานะ | รายละเอียด |
|:---|:---|:---|
| `.gitignore` | ✅ มีแล้ว | ไม่ให้ Git track ไฟล์ `.env` |
| `.env` untracked | ✅ เรียบร้อย | ไฟล์ `.env` ไม่อยู่ใน Git แล้ว |
| Pre-commit Hook | ✅ เพิ่มแล้ว | บล็อกทันทีถ้ามีใคร commit `.env` (`.husky/pre-commit`) |
| GitHub Secret Scanning | 💡 แนะนำ | เปิดฟีเจอร์บน GitHub เพื่อแจ้งเตือนอัตโนมัติ |

---

## Done When
- [x] สร้าง Elastic Email Key ใหม่แล้ว
- [x] อัปเดต `.env` ในเครื่องด้วย secrets ชุดใหม่ (ครบทุกตัว)
- [x] เพิ่ม Pre-commit Hook ป้องกัน
- [x] อัปเดต Production (Coolify) ด้วย secrets ชุดใหม่
- [x] ทดสอบระบบส่งอีเมลจองทัวร์ (ส่งสำเร็จ 25 มี.ค. 2026)
- [x] ล้าง Git history แล้ว (git filter-repo)

