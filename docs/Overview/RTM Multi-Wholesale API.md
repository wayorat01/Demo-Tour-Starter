# RTM Multi-Wholesale API (Requirements Traceability Matrix)

**ชื่อโครงการ:** Multi-Wholesale API Integration  
**เอกสารฉบับนี้สร้างจาก Brief Mapping-Multi-Wholesale API** เพื่อระบุ Use Case, Feature, Actor และ Functional Requirement ทุกข้อ  
**อ้างอิงแผนงาน:** [Multi-Wholesale API Integration Plan](./Multi-Wholesale%20API%20Integration%20Plan.md)

---

## Module 1: Multi-Source Infrastructure (Phase 1)

| UC ID | หัวข้อ BM | Feature | Actor | Functional Requirement | Note |
|---|---|---|---|---|---|
| UC-MWS-001 | MW-01: สร้าง Collection api-sources | API Source Management | Administrator, Admin(Agent) | ระบบต้องมี Collection `api-sources` สำหรับเก็บข้อมูล Wholesale API หลายแหล่ง ประกอบด้วย: ชื่อ Source, Slug (unique), Base URL, API Key (encrypted), Auth Type (api-key/bearer/basic/oauth2/none), Sync Interval (1/6/12/24 ชม.), Active Status และ Priority โดยแทนที่ Global `api-setting` เดิมที่รองรับแค่ 1 แหล่ง | ข้อมูลเดิมจาก Global `api-setting` ต้องถูก migrate เป็น Record แรกใน `api-sources` อัตโนมัติ |
| UC-MWS-002 | MW-02: เพิ่ม Source Tracking ใน program-tours | Source Tracking Fields | Administrator | Collection `program-tours` ต้องมี Fields ใหม่ 4 ตัว: `sourceId` (relationship → api-sources), `sourceSlug` (text, indexed), `sourceProductCode` (text, indexed) และ `compositeKey` (text, unique, indexed — format: `{sourceSlug}::{sourceProductCode}`) เพื่อระบุแหล่งที่มาของข้อมูลและป้องกัน Product Code ชนกันข้าม Source | ต้องมี Migration Script สำหรับ Backfill ข้อมูลเดิม: sourceSlug='tourprox', compositeKey='tourprox::'+productCode |
| UC-MWS-003 | MW-03: สร้าง Collection sync-logs | Sync History Logging | Administrator | ระบบต้องมี Collection `sync-logs` สำหรับบันทึกประวัติ Sync ทุกครั้ง ประกอบด้วย: source (relationship → api-sources), startedAt, completedAt, status (running/success/partial/failed), totalFetched, created, updated, skipped, errors (JSON), duration (ms) | Retention policy: ลบ log เก่ากว่า 30 วันอัตโนมัติ เพื่อควบคุมขนาด Storage |

---

## Module 2: Adapter Pattern & Sync Engine (Phase 1)

| UC ID | หัวข้อ BM | Feature | Actor | Functional Requirement | Note |
|---|---|---|---|---|---|
| UC-MWS-004 | MW-04: พัฒนา Adapter Pattern | BaseAdapter Interface & TourProx Adapter | Administrator | ระบบต้องมี Adapter Pattern (`src/lib/sync/adapters/`) โดยสร้าง BaseAdapter Interface ที่กำหนด methods: `fetchProducts()`, `fetchProductDetail()`, `fetchItinerary()`, `normalize()` และย้าย logic ทั้งหมดจาก `/api/sync-program-tours` มาเป็น TourProx Adapter ตัวแรก โดยไม่กระทบ Sync Route เดิม | ใช้ AsyncGenerator สำหรับ `fetchProducts()` เพื่อรองรับ Pagination แบบ Streaming |
| UC-MWS-005 | MW-05: พัฒนา Sync Engine | Sync Orchestrator | Administrator | ระบบต้องมี Sync Engine (Orchestrator) ที่ทำงานตามลำดับ: (1) โหลด Active Sources จาก `api-sources` (2) วน Loop ทีละ Source (3) เรียก Adapter ตาม apiType (4) Fetch Products ทุกหน้า (5) Normalize ข้อมูล (6) Validate Required Fields (7) Upsert ลง `program-tours` (8) บันทึกผลลง `sync-logs` (9) Trigger Cache Invalidation | ต้องเป็น Background Process ไม่กระทบ Frontend Performance — รองรับ > 5,000 tours |
| UC-MWS-006 | MW-06: พัฒนา Data Normalizer | Unified Data Schema Normalizer | Administrator | ระบบต้องมี Normalizer ที่แปลง Raw Data จาก Adapter แต่ละตัว (ซึ่งมี JSON format ต่างกัน) ให้เป็น Unified Schema เดียวกัน (productCode, productName, country, price, airline, periods, itinerary ฯลฯ) ก่อน Save ลง `program-tours` | Normalizer ทำงานเป็น Pure Function — แต่ละ Adapter รับผิดชอบ Map field ของตัวเอง |
| UC-MWS-007 | MW-07: พัฒนา Data Validator | Schema Validation (Zod) | Administrator | ระบบต้องมี Validator ที่ตรวจสอบ Required Fields (tourCode, title, country) และ Data Type ด้วย Zod Schema ก่อน Upsert — หาก Validate ไม่ผ่านต้อง Skip record นั้นและบันทึก Warning ลง sync-logs โดยไม่หยุดการ Sync ทั้ง Batch | ต้องตรวจสอบ: tourCode (non-empty string), title (non-empty), price (number ≥ 0) |

---

## Module 3: Web Scraper Module (Phase 2)

| UC ID | หัวข้อ BM | Feature | Actor | Functional Requirement | Note |
|---|---|---|---|---|---|
| UC-MWS-008 | MW-08: พัฒนา Web Scraper Adapter | Web Scraper (CSS Selector Config) | Administrator | ระบบต้องมี Web Scraper Adapter สำหรับดึงข้อมูลจากเว็บ Wholesale ที่ไม่มี API โดยรองรับ: (1) CSS Selector Config (JSON) สำหรับกำหนด element ที่ต้องดึง (2) Pagination (URL pattern / Load More) (3) Rate Limiter (จำกัด ≤ 1 req/sec) (4) Proxy Rotation สำหรับ scraping ปริมาณมาก (5) Detail Page Scraping สำหรับ itinerary | ใช้ `cheerio` เป็น default — ใช้ `puppeteer` เฉพาะกรณี JavaScript render เท่านั้น |
| UC-MWS-009 | MW-09: พัฒนา Image Downloader | Image Download & S3 Upload | Administrator | ระบบต้องสามารถดาวน์โหลดรูปภาพจากเว็บต้นทาง แล้ว Upload ไปเก็บที่ S3 (Wasabi) / Media Collection ของ Payload CMS จากนั้นอัปเดต URL ใน `program-tours` ให้ชี้มาที่ CDN ของเราแทน URL ภายนอก | รองรับ format: JPG, PNG, WebP — ขนาดสูงสุด 5MB ต่อรูป — ข้าม duplicate (hash check) |

---

## Module 4: Sync Scheduling & Automation (Phase 3)

| UC ID | หัวข้อ BM | Feature | Actor | Functional Requirement | Note |
|---|---|---|---|---|---|
| UC-MWS-010 | MW-10: พัฒนา Cron Scheduler | Automatic Sync Scheduling | Administrator | ระบบต้องมี Cron Scheduler ที่ Trigger Sync อัตโนมัติตามค่า `syncInterval` ที่ตั้งไว้ในแต่ละ Source (ทุก 1/6/12/24 ชม.) รองรับทั้ง Vercel Cron (vercel.json) และ Self-Hosted Cron (node-cron) พร้อมป้องกัน Concurrent Sync ซ้ำของ Source เดียวกัน | Cron Route: POST `/api/cron/sync` — ต้องมี CRON_SECRET สำหรับ Authentication |
| UC-MWS-011 | MW-11: พัฒนา Sync Dashboard | Admin Sync Dashboard UI | Administrator, Admin(Agent) | ระบบต้องมี Dashboard ใน Admin Panel ที่แสดง: (1) Status ของทุก Source (Last Sync, Success/Failed) (2) ปุ่ม Manual Sync เลือก Source ได้ (3) ปุ่ม Test Connection ทดสอบ API (4) Sync Logs Viewer filter ตาม source/status/date (5) สรุปจำนวน Products ต่อ Source | ใช้ Payload CMS Custom Admin Component — ไม่ต้อง build หน้าแยก |

---

## Module 5: Advanced Features (Phase 4)

| UC ID | หัวข้อ BM | Feature | Actor | Functional Requirement | Note |
|---|---|---|---|---|---|
| UC-MWS-012 | MW-12: พัฒนา Generic REST Adapter | Config-Driven REST Adapter | Administrator | ระบบต้องมี Generic REST Adapter ที่ Admin สามารถกำหนด Field Mapping ผ่าน JSON Config (เช่น map `api_field_name` → `productCode`) ใน `api-sources` ได้เลย โดยไม่ต้องเขียนโค้ด Adapter ใหม่สำหรับแต่ละ Wholesale | JSON Config ต้องรองรับ: response path, field mapping, pagination config, auth config |
| UC-MWS-013 | MW-13: พัฒนา Conflict Resolution | Cross-Source Duplicate Detection & Resolution | Administrator, Admin(Agent) | ระบบต้องตรวจจับ Products ที่มีชื่อ/ข้อมูลซ้ำกันข้าม Source (เช่น ทัวร์เดียวกันจาก 2 Wholesale) โดยแสดงใน Admin UI ให้ Admin เลือกว่าจะใช้ข้อมูลจากแหล่งไหน หรือใช้ตามค่า Priority ที่ตั้งไว้อัตโนมัติ | ตรวจจับด้วย: productName similarity + country + date range matching |
| UC-MWS-014 | MW-14: พัฒนา CSV Import Adapter | CSV/Excel File Import | Administrator, Admin(Agent) | ระบบต้องรองรับ Wholesale ที่ส่งข้อมูลเป็นไฟล์ CSV/Excel โดย Admin สามารถอัปโหลดไฟล์ในหน้า Admin Panel แล้ว Map คอลัมน์เข้า Fields ของ `program-tours` ได้ ข้อมูลต้องผ่าน Validation เหมือน API Sync | รองรับ format: .csv, .xlsx — ขนาดไฟล์สูงสุด 10MB |

---

## Module 6: Integration & Frontend (Phase 4)

| UC ID | หัวข้อ BM | Feature | Actor | Functional Requirement | Note |
|---|---|---|---|---|---|
| UC-MWS-015 | MW-15: แก้ไข Booking Route | Multi-Source Booking | End-User, Admin(Agent) | Booking Route ต้องรองรับการจองข้าม Source — เมื่อ End-User จองทัวร์ ระบบต้องตรวจสอบ `sourceSlug` ของ Product นั้น แล้วส่งข้อมูลจองไปยัง API ต้นทางที่ถูกต้อง (ถ้า Source นั้นรองรับ Booking API) หรือบันทึกเป็น Internal Booking | Phase 1: Booking ทำงานเหมือนเดิม (Internal only) — Phase 4 จึงเพิ่ม External Booking |
| UC-MWS-016 | MW-16: แก้ไข Proxy Route | Multi-Source API Proxy | End-User | Proxy Route `/api/wowtour` ต้องรองรับ Multi-Source โดยรับ parameter `source` เพื่อเลือกยิง API ไปยัง Source ที่ต้องการ — ถ้าไม่ระบุ source จะใช้ Source default (priority สูงสุด) | Backward compatible: URL เดิมที่ไม่มี `source` param ยังใช้ได้ปกติ |
| UC-MWS-017 | MW-17: อัปเดต Frontend Search | Filter by Wholesale Source | End-User | Frontend Search Results ต้องเพิ่ม Filter ให้ End-User สามารถกรองข้อมูลตามแหล่ง Wholesale ได้ (เช่น "ดูเฉพาะทัวร์จาก TourProx" หรือ "ดูทั้งหมด") โดยใช้ `sourceSlug` ใน query | แสดงเป็น Chip/Tag บนการ์ดทัวร์ว่ามาจาก Source ไหน |

---

## Module 7: Migration & Backward Compatibility (ตลอดทุก Phase)

| UC ID | หัวข้อ BM | Feature | Actor | Functional Requirement | Note |
|---|---|---|---|---|---|
| UC-MWS-018 | MW-18: Backward Compatibility | Migration Safety & Legacy Support | Administrator | ระบบต้องคง Global `api-setting` และ Sync Routes เดิม (`/api/sync-program-tours`, `/api/sync-itinerary`) ให้ทำงานได้ปกติระหว่าง Migration — Routes เดิมภายในจะเรียก Sync Engine ด้วย Source='tourprox' อัตโนมัติ Frontend ไม่ต้องแก้ไขใดๆ ในช่วง Transition | หลัง Migration ลงตัว (Phase 3++) จึงค่อย Deprecate Global `api-setting` |

---

## สรุปภาพรวม

| Module | จำนวน UC | MW ที่เกี่ยวข้อง | Phase |
|---|---|---|---|
| Multi-Source Infrastructure | 3 | MW-01, MW-02, MW-03 | Phase 1 |
| Adapter Pattern & Sync Engine | 4 | MW-04, MW-05, MW-06, MW-07 | Phase 1 |
| Web Scraper Module | 2 | MW-08, MW-09 | Phase 2 |
| Sync Scheduling & Automation | 2 | MW-10, MW-11 | Phase 3 |
| Advanced Features | 3 | MW-12, MW-13, MW-14 | Phase 4 |
| Integration & Frontend | 3 | MW-15, MW-16, MW-17 | Phase 4 |
| Migration & Backward Compatibility | 1 | MW-18 | ตลอดทุก Phase |
| **รวมทั้งหมด** | **18 UC** | **MW-01 ~ MW-18** | **Phase 1 ~ 4** |

---

## Traceability Matrix: Brief ID → UC ID → Case Space

| Brief ID | UC ID | Case Space ID | Phase | Priority |
|---|---|---|---|---|
| MW-01 | UC-MWS-001 | CS-MWS-001 | Phase 1 | 🔴 สูง |
| MW-02 | UC-MWS-002 | CS-MWS-002 | Phase 1 | 🔴 สูง |
| MW-03 | UC-MWS-003 | CS-MWS-003 | Phase 1 | 🔴 สูง |
| MW-04 | UC-MWS-004 | CS-MWS-004 | Phase 1 | 🔴 สูง |
| MW-05 | UC-MWS-005 | CS-MWS-005 | Phase 1 | 🔴 สูง |
| MW-06 | UC-MWS-006 | CS-MWS-006 | Phase 1 | 🔴 สูง |
| MW-07 | UC-MWS-007 | CS-MWS-007 | Phase 1 | 🔴 สูง |
| MW-08 | UC-MWS-008 | CS-MWS-008 | Phase 2 | 🟡 กลาง |
| MW-09 | UC-MWS-009 | CS-MWS-009 | Phase 2 | 🟡 กลาง |
| MW-10 | UC-MWS-010 | CS-MWS-010 | Phase 3 | 🟡 กลาง |
| MW-11 | UC-MWS-011 | CS-MWS-011 | Phase 3 | 🟡 กลาง |
| MW-12 | UC-MWS-012 | CS-MWS-012 | Phase 4 | 🟢 ต่ำ |
| MW-13 | UC-MWS-013 | CS-MWS-013 | Phase 4 | 🟢 ต่ำ |
| MW-14 | UC-MWS-014 | CS-MWS-014 | Phase 4 | 🟢 ต่ำ |
| MW-15 | UC-MWS-015 | CS-MWS-015 | Phase 4 | 🟢 ต่ำ |
| MW-16 | UC-MWS-016 | CS-MWS-016 | Phase 4 | 🟢 ต่ำ |
| MW-17 | UC-MWS-017 | CS-MWS-017 | Phase 4 | 🟢 ต่ำ |
| MW-18 | UC-MWS-018 | CS-MWS-018 | ตลอดทุก Phase | 🔴 สูง |
