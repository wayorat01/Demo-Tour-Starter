# 📋 สรุปงาน — 02 เมษายน 2026

## ✅ สิ่งที่ทำเสร็จ

- **ถอดระบบภาษาอังกฤษ (EN) และตั้งค่าให้ระบบทำงานบนภาษาไทย (TH) ล้วน**: อัปเดต `localization.config.ts`, `getSearchOptions.ts`, โครงสร้างของ `SearchResults` รวมถึงการปรับแต่ง Component เพื่อลบ `title_en` ออก
- **แก้ไขบั๊ก Next.js Hydration & Server Serialization (Object with toJSON)**: เพิ่มการเรียกใช้ `JSON.parse(JSON.stringify(data))` ให้กับ Payload query ภายใน Layout, API, Global Pages และ UI Blocks ส่วนหน้าจอทั้งหมด เพื่อเคลียร์ BSON Buffer และล้าง Error ก่อนส่ง Prop ไปยังฝั่ง Client
  - ไฟล์ที่โดนแก้: `Testimonial/Component.tsx`, `About/Component.tsx`, `BlogCard/Component.tsx`, `BlogListing/Component.tsx`, `Blog/Component.tsx`, `GalleryListing/Component.tsx`, `TourType/Component.tsx`, `Festival/Component.tsx`
- อัปเดตไฟล์แจ้งรายละเอียดการแก้ไขใน `docs/changelog/2026-04.md` แล้วผ่าน Workflow `[/update-docs]`

## 🔄 กำลังทำอยู่ (ยังไม่เสร็จ)

- งาน SEO (ตาม `implementation_plan.md` ที่คุยตกค้างเอาไว้) ซึ่งต้องลงมือเขียน Dynamic Sitemaps, Robots.txt, และ JSON-LD

## 📋 งานต่อไป

- ลงมือแก้ไขและอัปเดตระบบ SEO เชิงลึก
- จัดการลบ/เปลี่ยนชื่อฟิลด์ภาษาอังกฤษให้เกลี้ยงจาก Database Schema ของโค้ดเบส Payload ให้หมดไปเพื่อไม่ให้มี Legacy ตกค้าง

## ⚠️ ข้อควรระวัง

- **เวลา Compile ด้วย Next.js**: หากรันด้วย `pnpm dev` จะลบ Cache ทุกรอบและทำให้ Payload Admin ถูกแพ็กรวม ทำให้ Build นาน แนะนำให้รันเป็น `pnpm dev:turbo` แทนหากเกิดอาการอืดหรือค้างครับ
