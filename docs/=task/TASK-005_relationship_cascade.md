# TASK-005: กำหนดนโยบาย Cascade Delete สำหรับ Relationships

- **ความสำคัญ:** ปานกลาง (Medium)
- **ผู้รับผิดชอบ:** ทีม WOW (ทำเอง)
- **สถานะ:** Done ✅
- **สร้างเมื่อ:** 2026-03-26

## การตัดสินใจ (Decision)
ทีมตัดสินใจเลือก **ตัวเลือก A: ป้องกันการลบ (Prevent Delete) 🌟** โดยใช้ Custom Hook (`beforeDelete`) ใน Payload CMS เนื่องจาก MongoDB Adapter ของ Payload V3 ไม่รองรับ Foreign Keys Native. เมื่อแอดมินพยายามลบข้อมูลที่ถูกอ้างอิงอยู่ ระบบจะเด้ง Error ว่ากำลังถูกใช้งานในคอลเลกชันไหนบ้าง และไม่อนุญาตให้ลบจนกว่าจะเคลียร์ข้อมูลที่อ้างอิงหมด

---

## ตารางการอัปเดต (Changelog)

| ไฟล์ที่แก้ไข | ตำแหน่ง/สิ่งที่ทำ | รายละเอียดการประยุกต์ใช้ Rule: Option A |
|:---|:---|:---|
| `src/collections/hooks/preventDelete.ts` | **สร้างไฟล์ใหม่** | สร้าง Global Hook `preventDeleteIfInUse` เพื่อนำไปใช้กับ Collections ต่างๆ |
| `src/collections/TourCategories.ts` | เพิ่ม `beforeDelete` | ป้องกันการลบ Category ถ้าระบุอยู่ใน `intertours` และ `inbound-tours` |
| `src/collections/Tags.ts` | เพิ่ม `beforeDelete` | ป้องกันการลบ Tag ถ้าระบุอยู่ใน Field ย่อย `tourPrograms.tags` ของทัวร์ต่างๆ |
| `src/collections/InterTours.ts` | เพิ่ม `beforeDelete` | ป้องกันการลบประเทศ ถ้ารหัสถูกอ้างอิงเป็น `parentCountry` ของทัวร์อื่น |
| `src/collections/InboundTours.ts` | เพิ่ม `beforeDelete` | ป้องกันการลบจังหวัด ถ้ารหัสถูกอ้างอิงเป็น `parentCountry` ของทัวร์อื่น |

---

## ทำไมต้องทำ

Collections ที่มี relationship fields (InterTours → TourCategories, InterTours → Tags ฯลฯ) ยังไม่มีการป้องกันการลบ ถ้ามีคนลบ TourCategory จาก Admin Panel — InterTours ทุกตัวที่อ้างอิงอยู่จะมี relationship เสีย (ID ชี้ไปหาข้อมูลที่ไม่มีอยู่แล้ว)

MongoDB ไม่บังคับ foreign keys แต่ Payload CMS ทำได้ — ถ้าตั้งค่าไว้

## Relationships ที่ได้รับผลกระทบ ปัจจุบันแก้ไขแล้วดังนี้

| Collection | Field | อ้างอิงไป | นโยบายที่ตั้งค่าไว้ | ความเสี่ยงก่อนแก้ |
|------------|-------|-----------|-------------------|-----------|
| InterTours | `category` | TourCategories | Option A (`preventDelete`) | ทัวร์ถูกทิ้ง |
| InterTours | `parentCountry` | InterTours (self) | Option A (`preventDelete`) | ลำดับชั้นเสีย |
| InterTours | `tourPrograms[].tags[]` | Tags | Option A (`preventDelete`) | tag links เสีย |
| InboundTours | `category` | TourCategories | Option A (`preventDelete`) | ทัวร์ถูกทิ้ง |

## เสร็จเมื่อ
- [x] บันทึกการตัดสินใจต่อ relationship (แต่ละ field เลือกต่างกันได้)
- [x] Antigravity implement นโยบายที่เลือก (ผ่าน custom hooks เนื่องจากใช้ MongoDB) 
