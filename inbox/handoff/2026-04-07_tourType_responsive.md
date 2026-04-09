# 📋 สรุปงาน — 07 เมษายน 2026

## ✅ สิ่งที่ทำเสร็จ

- **Responsive Alignment สำหรับ TourCard 4, 5, 6** (แนวนอน): 제한 column สูงสุดให้เป็น 2, และในกรณีที่มี 1 คอลัมน์ แถวจะหดกลับไปไม่เกิน 50% แล้วอยู่ตรงกลางอัตโนมัติ เพื่อไม่ให้การ์ดยืดออกจนน่าเกลียดในจอใหญ่
- **ขยายโลโก้สายการบิน**: ขยายขนาด `.tour*-airline-logo` ใน Component และ Media Queries เผื่อให้เห็นชัดขึ้น
- **จัดระเบียบปุ่ม Actions ใน TourCard 6**: เมื่อจอ ≤ 1400px ปุ่ม "ดูรายละเอียด" จะย้ายตัวเองลงมาอยู่ติดกับปุ่ม PDF ให้เรียงชิดซ้ายสวยงาม และแก้บั๊ก Tailwind Class `hidden` ชนกับ inline-flex โดยใช้ CSS `!important`
- **ซ่อนปุ่มซ้ำใน TourCard 6 (Mobile)**: ซ่อนปุ่ม Action ในกรอบ PDF สำหรับจอ ≤ 639px เพื่อให้เหลือแค่ปุ่มข้างๆ ราคา ตามรูปแบบที่ดีที่สุดบนมือถือ
- **แก้ตารางราคาทะลุกรอบ (Table Overflow)**: ปลด White-space ในคอลัมน์และกำหนด `min-width: 760px` บนตาราง `<div className="tour6-table-wrap">` เพื่อการันตีว่าจะตัดขึ้นบรรทัดใหม่แทนที่จะซ่อนตัวอักษรแล้วโชว์ scrollbar สมบูรณ์แบบ
- **อัปเดต Changelogs**: ลงบันทึกงานไว้ใน `docs/changelog/2026-04.md`
- **Rebase & Resolve Conflict ไปบ้างส่วน**: ทำการ Rebase `origin/main` และแก้ conflict ของ `docs/changelog/2026-04.md` ก่อนจะติด conflict ช่วงกลาง

## 🔄 กำลังทำอยู่ (ยังไม่เสร็จ)

- **Git Rebase กะเทย (Conflict)**: ตอนนี้ค้างอยู่ในโหมด Rebase กับ Main (`6be7dc631... feat(navbar)`) 
  - มี Conflict ที่ `src/globals/Header/Component.tsx`
  - มี Conflict ที่ `src/globals/Header/navbar/blocks/TourCategoryMenu.tsx`
  - มี Conflict ที่ `tsconfig.tsbuildinfo`

## 📋 งานต่อไป

- รอผู้ใช้งาน Resolve Conflicts ให้เรียบร้อย แล้วรัน `git rebase --continue`
- สั่ง Push branch `tour/mangpor` และสร้าง Pull Request

## ⚠️ ข้อควรระวัง

- `tsconfig.tsbuildinfo` ติด conflict ทิ้งได้เลย (ลบทิ้งแล้ว build ใหม่ก็หาย) หรือเอาแค่เวอชั่นอันใดอันหนึ่ง
- ไฟล์ `Component.tsx` ด้าน Header เปลี่ยนแปลงค่อนข้างมากจากงานที่แยกฝั่งกันระหว่าง `perf: cache ข้อมูล Header ทั้งก้อน` และงานย่อยอื่นๆ ระวังเรื่องการลบ Imports/Logics ทิ้ง
