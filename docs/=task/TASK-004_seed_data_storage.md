# TASK-004: ย้ายข้อมูล Seed ออกจาก Git

- **ความสำคัญ:** สูง (High)
- **ผู้รับผิดชอบ:** ทีม WOW (ทำเอง)
- **สถานะ:** เสร็จสิ้น (Done)
- **สร้างเมื่อ:** 2026-03-26

## ทำไมต้องทำ

โฟลเดอร์ `public/seed/` มีไฟล์ `.tar.gz` ขนาดรวม 231MB ที่ถูก track ใน git ทุกครั้งที่ clone, fetch หรือรัน CI จะต้องดาวน์โหลดข้อมูลนี้ทั้งหมด ยิ่งเพิ่ม seed variant ก็ยิ่งโตขึ้น — git ไม่ได้ออกแบบมาเก็บไฟล์ binary ขนาดใหญ่

## สถานะปัจจุบัน

| ไฟล์ | ขนาด |
|------|------|
| `public/seed/seed-data.tar.gz` | 64 MB |
| `public/seed/seed-data-tour-au.tar.gz` | 40 MB |
| `public/seed/seed-data-tour-gig.tar.gz` | 44 MB |
| `public/seed/seed-data-tour-mangpor.tar.gz` | 41 MB |
| `public/seed/seed-data-tour-tee.tar.gz` | 42 MB |
| **รวม** | **231 MB** |

## ตัวเลือก

### ตัวเลือก A: Vercel Blob (แนะนำ)
ใช้ `@payloadcms/storage-vercel-blob` ที่มีอยู่แล้วสำหรับ media — อัพโหลดไฟล์ seed ขึ้นไปด้วย
- อัพเดต `scripts/seed.ts` ให้ดาวน์โหลดจาก Blob URL แทนไฟล์ local
- เพิ่ม `public/seed/*.tar.gz` ใน `.gitignore`
- **ข้อดี:** ใช้ infrastructure เดียวกับ media, ไม่ต้องเพิ่มบริการใหม่
- **ข้อเสีย:** ดาวน์โหลดช้าเล็กน้อยตอน apply seed

### ตัวเลือก B: Git LFS
Track `*.tar.gz` ผ่าน Git LFS ไฟล์ยังอยู่ "ใน git" แต่เก็บบน LFS server
- `git lfs track "public/seed/*.tar.gz"`
- **ข้อดี:** โปร่งใสสำหรับ dev (ใช้คำสั่ง git เหมือนเดิม)
- **ข้อเสีย:** GitHub LFS มีข้อจำกัด bandwidth ใน free tier

### ตัวเลือก C: External Storage (S3/GCS)
อัพโหลดไปที่ bucket แล้วอ้างอิง URL ใน seed config
- **ข้อดี:** ถูกที่สุดเมื่อ scale ขึ้น
- **ข้อเสีย:** ต้องจัดการบริการเพิ่ม

## หลังตัดสินใจ

เมื่อย้ายไฟล์ seed แล้ว:
1. เพิ่ม `public/seed/` ใน `.gitignore` (รันคำสั่ง `git rm -r --cached public/seed` ไปแล้ว)
2. ปัจจุบัน Git Repository หยุดการขยายตัวเพิ่มจาก seed ไฟล์ใหม่ๆ แล้ว เนื่องจากมันดึงจาก S3 แทน

### นโยบายการจัดการ Git History บวม (~2GB)
**ตัดสินใจ:** 🟢 อนุญาตให้ปล่อยทิ้งไว้ก่อน ยังไม่ต้องทำทันที

**เหตุผล:**
- การใช้เครื่องมือล้างประวัติ (เช่น `git filter-repo` หรือ BFG) จะทำให้ Commit History ทั้งหมดมี Hash เปลี่ยนไป
- หากทำตอนนี้ จะส่งผลให้ทุกคนในทีมต้องลบและ Clone โปรเจกต์ใหม่ (รวมถึงมีโอกาสเกิด Merge Conflict หากมีงานค้าง)
- แนะนำให้จัดทำในวัน "Cleanup Day" ที่ทุกคนพร้อม และไม่มีโค้ดค้างใน Branch อื่นๆ

## เสร็จเมื่อ
- [x] บันทึกการตัดสินใจ (ตัวเลือก C - External Storage S3)
- [x] ย้ายไฟล์ seed ไปที่ storage ที่เลือก
- [x] อัพเดต `scripts/seed.ts` ให้ดึงจากที่ใหม่
- [x] เพิ่ม `public/seed/` ใน `.gitignore` และ untrack
