# URS (User Requirement Specification)

**ชื่อโครงการ:** B2C Tour Booking SaaS Platform  
**เอกสารฉบับนี้สร้างจาก Brief Mapping** เพื่อระบุ Use Case, Feature, Actor และ Functional Requirement ทุกข้อ

---

## Module 1: System Admin

| UC ID | หัวข้อ BM | Feature | Actor | Functional Requirement | Note |
|---|---|---|---|---|---|
| UC-SYS-001 | BM-01: ตั้งค่า GitHub, CI/CD, Deploy แบบ SaaS | CI/CD DevOps Pipeline | Administrator | ระบบต้องทำการ Build & Deploy โค้ด Antigravity + Payload CMS ไปยัง Server อัตโนมัติเมื่อมีการ Merge โค้ดบน GitHub ผ่าน GitHub Actions โดยต้องไม่ก่อให้เกิด Downtime | ใช้ GitHub Actions + Branching Strategy (main/staging/feature/*) |
| UC-SYS-002 | BM-01: ตั้งค่า GitHub, CI/CD, Deploy แบบ SaaS | Automated Testing Gate | Administrator | ระบบต้องรัน Automated Test (Lint, Type Check, Unit Test) ก่อนอนุญาตให้ Merge เข้า Branch หลัก หากไม่ผ่านต้อง Block การ Merge | ป้องกันโค้ดบกพร่องหลุดเข้า Production |
| UC-SYS-003 | BM-02: Multi-Tenant & Package Management | Multi-Tenant Architecture | Administrator | ระบบต้องรองรับ Multi-Tenant โดยใช้ Tenant ID แยกข้อมูลบน Single Codebase ข้อมูลของ Agent แต่ละรายต้องแยกจากกันโดยเด็ดขาด (Data Isolation) | ใช้ @payloadcms/plugin-multi-tenant หรือ Custom Tenant Field |
| UC-SYS-004 | BM-02: Multi-Tenant & Package Management | Package & Quota Management | Administrator | สร้างและกำหนดแพ็กเกจ (Starter Budget, Starter, Core Budget, Core, Plus) โดยจำกัดโควต้า Info Page (3, 5, 8, 15 หน้า) และทัวร์ดันขาย (1, 3, 5 รายการ) | โควต้าเพจไม่นับรวมหน้า Home และ About Us |
| UC-SYS-005 | BM-02: Multi-Tenant & Package Management | Tenant Provisioning | Administrator | สามารถสร้าง Tenant ใหม่ (Subdomain + Admin User + Seed Data) ให้ Agent พร้อมใช้งานได้ภายใน 2 วันทำการ | ระบบต้อง Seed ข้อมูลพื้นฐาน (หน้า Home, About Us) อัตโนมัติ |
| UC-SYS-006 | BM-10: ความปลอดภัย PDPA, Cookie, Encryption, Log | Cookie Consent (PDPA) | End-User | มีระบบแจ้งเตือนและเก็บความยินยอมการใช้คุกกี้ (Cookie Consent) แสดงบน Frontend ทุกหน้า ก่อนเริ่มเก็บข้อมูลใดๆ | รองรับ PDPA มาตรฐาน |
| UC-SYS-007 | BM-10: ความปลอดภัย PDPA, Cookie, Encryption, Log | Data Encryption | Administrator | ข้อมูลส่วนบุคคลของ End-User (ชื่อ, เบอร์โทร, อีเมล) จากระบบ Booking ต้องถูกเข้ารหัส (Encryption) ใน DB และจำกัดสิทธิ์การเข้าถึง | เข้ารหัสระดับ Field-level ใน MongoDB |
| UC-SYS-008 | BM-10: ความปลอดภัย PDPA, Cookie, Encryption, Log | Internal Activity Log | Administrator | ระบบต้องเก็บ Internal Log ทุก Action ของ Admin (Login, Create, Update, Delete) พร้อม Timestamp และ User ID | ใช้ Payload CMS Audit Log หรือ Custom Hook |

---

## Module 2: Design and Page Structure

| UC ID | หัวข้อ BM | Feature | Actor | Functional Requirement | Note |
|---|---|---|---|---|---|
| UC-DPS-001 | BM-03: ออกแบบ UI Template หน้า Home & Info Page | Home Page Template Selection | Admin(Agent) | ระบบบังคับใช้ Template 1 แบบสำหรับแพ็กเกจ Budget และเปิดให้ประกอบหน้าด้วย Design Block ได้สำหรับแพ็กเกจ ปกติ/Plus | Block Design ทำงานผ่าน Payload CMS Blocks |
| UC-DPS-002 | BM-03: ออกแบบ UI Template หน้า Home & Info Page | Info Page Management | Admin(Agent) | สามารถสร้างและจัดการ Info Page ได้ตามโควต้าที่กำหนดในแพ็กเกจ โดยใช้ Block Editor | จำนวนหน้าถูกควบคุมโดย Package Quota |
| UC-DPS-003 | BM-09: Dynamic Page (Auto-hide Menu) & Visa Page | Dynamic Pages & Auto-hide Menu | End-User | แสดง Listing Page (บัตรเข้าชม, เรือสำราญ, รถเช่า) และหน้าทัวร์โปรโมชั่น/Hot Deal, ตั๋วเครื่องบิน (iFrame) ตามสิทธิ์แพ็กเกจ หาก API ไม่มีสินค้าในหมวดนั้น → Auto-hide เมนูทันที | ตรวจสอบข้อมูลจาก API ตอน Build/ISR |
| UC-DPS-004 | BM-09: Dynamic Page (Auto-hide Menu) & Visa Page | Visa Page Management | Admin(Agent) | (เฉพาะ Plus) จัดการหน้าวีซ่า ใส่ราคา และอัปโหลดไฟล์ให้ End-User ดาวน์โหลดได้ | ไฟล์เก็บใน Media Collection ของ Payload CMS |

---

## Module 3: Performance

| UC ID | หัวข้อ BM | Feature | Actor | Functional Requirement | Note |
|---|---|---|---|---|---|
| UC-PRF-001 | BM-04: Frontend Performance (Next.js, Image, Cache) | Core Web Vitals Optimization | End-User | หน้าเว็บต้องโหลดเร็ว ผล PageSpeed Insights ≥ 70% ทั้ง Mobile และ Desktop | ใช้ ISR, Image Optimization, Code Splitting |
| UC-PRF-002 | BM-04: Frontend Performance (Next.js, Image, Cache) | Cache Invalidation | End-User | ระบบต้องมี Invalidate Cache อัตโนมัติเมื่อข้อมูลถูกอัปเดตใน CMS ผู้ใช้ต้องไม่เห็นข้อมูลเก่า (Stale Data) | ใช้ Payload CMS AfterChange Hook + revalidatePath |

---

## Module 4: Sync Data API

| UC ID | หัวข้อ BM | Feature | Actor | Functional Requirement | Note |
|---|---|---|---|---|---|
| UC-API-001 | BM-05: API Sync ดึงข้อมูลทัวร์จาก PM | Multi-Tenant API Configuration | Admin(Agent) | สามารถตั้งค่า API End Point และ API Key ในหลังบ้านได้ด้วยตนเอง ระบบจะ Sync Data ทัวร์เข้ามาเก็บในระบบอัตโนมัติ | เป็น Background Job ไม่ทำให้ Server หลักหน่วง |
| UC-API-002 | BM-05: API Sync ดึงข้อมูลทัวร์จาก PM | Background Sync Job | Administrator | ระบบต้อง Sync ข้อมูลทัวร์ผ่าน API > 1,000 รายการโดยใช้ Background Job ระบบต้องไม่ล่ม (No Downtime) | ต้องมี Error Handling + Retry Mechanism |
| UC-API-003 | BM-05: API Sync ดึงข้อมูลทัวร์จาก PM | Sync Data Mapping & Validation | Administrator | ข้อมูลที่ Sync เข้ามาต้องถูก Map เข้า Collection ที่ถูกต้อง (InterTours, ProgramTours, InboundTours) พร้อมตรวจสอบ Validation ก่อน Save | ตรวจสอบ field บังคับ เช่น tourCode, title, country |

---

## Module 5: API Data Mapping

| UC ID | หัวข้อ BM | Feature | Actor | Functional Requirement | Note |
|---|---|---|---|---|---|
| UC-FRT-001 | BM-06: กล่องค้นหาทัวร์แบบ Dynamic | Dynamic Search Box: Starter / Starter Budget | End-User | แสดงฟิลด์: ประเทศ, คำค้นหา (รหัสทัวร์/โปรแกรม/คีย์เวิร์ด), เดือน, วันที่ไป-กลับ, Wholesale | ฟิลด์แสดง/ซ่อนตามการตั้งค่า Global Config |
| UC-FRT-002 | BM-06: กล่องค้นหาทัวร์แบบ Dynamic | Dynamic Search Box: Core / Core Budget | End-User | แสดงฟิลด์ทั้งหมดของ Starter + เพิ่มฟิลด์: สายการบิน, ช่วงราคา (Price Range Slider) | ดึง min/max ราคาจากข้อมูลจริงในระบบ |
| UC-FRT-003 | BM-06: กล่องค้นหาทัวร์แบบ Dynamic | Dynamic Search Box: Plus | End-User | แสดงฟิลด์ทั้งหมดของ Core + เพิ่มฟิลด์: เมือง, ทัวร์เทศกาล | ดึงตัวเลือกจากข้อมูลจริงในระบบ |

---

## Module 6: Website Management

| UC ID | หัวข้อ BM | Feature | Actor | Functional Requirement | Note |
|---|---|---|---|---|---|
| UC-MGT-001 | BM-07: จัดการสินค้า Manual, เปิด/ปิด, ทัวร์ดันขาย | Manual Product Creation | Admin(Agent) | (เฉพาะ ปกติ/Plus) สร้างสินค้าทัวร์แบบ Manual ได้เอง พร้อมระบุรายละเอียด ราคา และรูปภาพ | ข้อมูล Manual Product แยกจากข้อมูลที่ Sync จาก API |
| UC-MGT-002 | BM-07: จัดการสินค้า Manual, เปิด/ปิด, ทัวร์ดันขาย | Display Toggle (Show/Hide Tour) | Admin(Agent) | สามารถเปิด/ปิดการแสดงผลของทัวร์แต่ละรายการบนหน้าเว็บได้ เมื่อเปลี่ยนสถานะต้องสั่งล้าง Cache ทันที | ใช้ AfterChange Hook สั่ง revalidatePath |
| UC-MGT-003 | BM-07: จัดการสินค้า Manual, เปิด/ปิด, ทัวร์ดันขาย | Featured Tour (ทัวร์ดันขาย) | Admin(Agent) | สามารถเลือกทัวร์เพื่อแสดงเป็น "ทัวร์ดันขาย" บน Home Page ได้ตามโควต้าที่กำหนดในแพ็กเกจ (1, 3, 5 รายการ) | ตรวจสอบโควต้าก่อน Save |

---

## Module 7: Booking

| UC ID | หัวข้อ BM | Feature | Actor | Functional Requirement | Note |
|---|---|---|---|---|---|
| UC-BKG-001 | BM-08: ระบบการจอง, Status, Lead Contact | Lead Generation (Budget Packages) | End-User | (สำหรับ Starter Budget, Core Budget) ปุ่ม Action ในหน้าทัวร์จะเป็นการลิงก์ไปติดต่อผ่าน LINE หรือโทรศัพท์ ไม่มีตะกร้าจอง | ต้องมีช่องให้ Admin ใส่เบอร์/ลิงก์ LINE ใน CMS |
| UC-BKG-002 | BM-08: ระบบการจอง, Status, Lead Contact | Booking Form Submission | End-User | (สำหรับ ปกติ/Plus) End-User สามารถกดจอง กรอกข้อมูลผู้เดินทาง พร้อมเลือกราคาที่ต้องการ และส่งฟอร์มจองได้ | ไม่ใช้ PNR Code |
| UC-BKG-003 | BM-08: ระบบการจอง, Status, Lead Contact | Booking Status Management | Admin(Agent) | สามารถเข้าดูรายการจองและเปลี่ยน Status การจองในระบบหลังบ้านได้ (เช่น รอยืนยัน, ยืนยันแล้ว, ยกเลิก) | การออก Invoice/Receipt → จัดการต่อที่ Tourprox |
| UC-BKG-004 | BM-08: ระบบการจอง, Status, Lead Contact | Booking Confirmation Email | End-User, Admin(Agent) | เมื่อ End-User จองสำเร็จ ระบบต้องส่ง Email แจ้งยืนยันไปยัง End-User และส่ง Email แจ้ง Admin(Agent) พร้อมรายละเอียดการจอง | ใช้ Payload CMS Email Adapter |

---

## Module 8: SaaS Platform (Template & Subscription) — 📋 Draft

> [!WARNING]
> **สถานะ: Draft (ยังไม่อนุมัติ)** — UC ทั้งหมดในโมดูลนี้เป็นแผนที่รอประชุมวางแผนแพ็กเกจ ยังไม่มีการแก้ไขโค้ดใดๆ ไม่กระทบระบบที่ใช้งานอยู่

**ลำดับความสำคัญ:** 🔴P0 = ต้องทำก่อน (Foundation) · 🟠P1 = สำคัญ (Core Feature) · 🟡P2 = รอได้ (Nice to Have) · 🟢P3 = ทำทีหลัง (Future)

| Priority | UC ID | Feature | Actor | Functional Requirement | Note |
|---|---|---|---|---|---|
| 🔴P0 | UC-SAS-006 | Globals-to-Collection Migration | Administrator | ย้าย 7 Globals เป็น Collection `site-configs` (1 Record/Tenant) | ⚠️ Breaking Change — ทุก Component ที่ดึง Global ต้องแก้ |
| 🟠P1 | UC-SAS-002 | Template Preset & Bundling | Administrator | สร้าง Template Preset (ชุด Blocks + Design Versions + Theme) | ใช้ Design Version System ที่มีอยู่แล้ว |
| 🟠P1 | UC-SAS-001 | Template Gallery & Preview | Admin(Agent), End-User | Gallery เลือก Template + Preview + Lock Overlay ตามแพ็กเกจ | แบบ MakeWebEasy |
| 🟠P1 | UC-SAS-003 | Template Lock/Unlock by Package | Admin(Agent) | 🔒 ล็อค Template ที่แพ็กเกจไม่ถึง + Popup "อัพเกรด" | Freemium Teaser Strategy |
| 🟡P2 | UC-SAS-004 | Self-Service Registration | End-User (ว่าที่ลูกค้า) | สมัครเอง + เลือก Subdomain + เลือก Template → สร้างเว็บ | Turnstile + Real-Time Check |
| 🟡P2 | UC-SAS-005 | Package Upgrade Flow | Admin(Agent) | หน้า "แพ็กเกจของฉัน" + Pricing Table + อัพเกรดทันที | Prorate ราคาตามวันที่เหลือ |
| 🟡P2 | UC-SAS-007 | Domain/Subdomain Management | Admin(Agent) | Subdomain `.wowtour.com` + Custom Domain + Auto SSL | Next.js Middleware + DNS Verify |
| 🟢P3 | UC-SAS-008 | Billing & Payment Gateway | Admin(Agent) | ชำระเงินออนไลน์ + Invoice + Auto-Reminder | PromptPay, Credit Card |

---

## สรุปภาพรวม

| Module | จำนวน UC | BM ที่เกี่ยวข้อง | สถานะ |
|---|---|---|---|
| System Admin | 8 | BM-01, BM-02, BM-10 | ⚪️ To Do |
| Design and Page Structure | 4 | BM-03, BM-09 | ⚪️ To Do |
| Performance | 2 | BM-04 | ⚪️ To Do |
| Sync Data API | 3 | BM-05 | ⚪️ To Do |
| API Data Mapping | 3 | BM-06 | ⚪️ To Do |
| Website Management | 3 | BM-07 | ⚪️ To Do |
| Booking | 4 | BM-08 | ✅ Done (บางส่วน) |
| SaaS Platform (Template & Subscription) | 8 | BM-11~BM-14 | 📋 **Draft** |
| **รวมทั้งหมด** | **36 UC** | **BM-01 ~ BM-14** | |

