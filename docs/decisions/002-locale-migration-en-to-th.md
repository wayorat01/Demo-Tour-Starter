# ADR-002: เปลี่ยน Default Locale จาก English เป็น Thai

## Status: Accepted

## Context

เว็บ WOW Tour เป็นเว็บไซต์สำหรับลูกค้าชาวไทยเป็นหลัก แต่ระบบ Payload CMS ถูกตั้งค่าให้ `defaultLocale: 'en'` ตั้งแต่เริ่มต้น ทำให้:
- Admin ต้องสลับ locale เป็น Thai ทุกครั้งก่อนแก้ข้อมูล
- ข้อมูลหลักถูกเก็บภายใต้ key `en` ใน MongoDB ทั้งหมด (title.en, meta.title.en, hero.heroHeading.en)
- Frontend แสดงผลเป็นภาษาอังกฤษถ้าไม่ระบุ locale

## Decision

เปลี่ยน `defaultLocale` จาก `'en'` เป็น `'th'` ใน `src/localization.config.ts` โดยยังคง support `en` เป็น secondary locale

### การเปลี่ยนแปลงหลัก:
1. **`src/localization.config.ts`** — `defaultLocale: 'th'`
2. **Admin UI** — ซ่อน locale selector ด้วย CSS injection (`AgentStarterCSS.tsx`)
3. **Preview URLs** — เปลี่ยน hardcoded `locale: 'en'` เป็น `localization.defaultLocale` ใน Header, Footer, ThemeConfig globals
4. **Migration scripts** — สร้างสคริปต์ copy ข้อมูลจาก `en` → `th` ใน MongoDB

## Rationale

- **UX สำหรับ Admin** — ไม่ต้องสลับ locale ทุกครั้ง
- **ข้อมูลถูกต้อง** — ข้อมูลใหม่จะถูกเก็บภายใต้ key `th` โดยอัตโนมัติ
- **ไม่ทำลายข้อมูลเก่า** — ข้อมูล `en` ยังคงอยู่ใน MongoDB, fields ที่มีค่าเฉพาะ `en` ต้อง copy มา `th`

## Consequences

### ข้อดี
- Admin ทำงานง่ายขึ้น
- ไม่มี locale prefix ใน URL (th เป็น default)

### ข้อเสีย / ข้อควรระวัง
- **ข้อมูลเก่าต้อง migrate** — localized fields ที่มีค่าเฉพาะ `en` ต้อง copy มา `th` ผ่าน MongoDB script
- **Preview URL hardcoded** — ต้องแก้ทุกที่ที่ hardcode `locale: 'en'` (Pages, Posts collection ยังเหลือ)
- **Payload อ่าน breadcrumbs จาก localized array ไม่ได้** — breadcrumbs ที่ inject ผ่าน MongoDB โดยตรง (ไม่ผ่าน Payload hooks) จะได้ `null` ต้อง re-save ผ่าน Admin UI
- **SeedDB** — ข้อมูล seed ใหม่ต้องเก็บภายใต้ `th` locale

### Migration Scripts ที่สร้าง
| Script | คำอธิบาย |
|--------|----------|
| `scripts/force-globals-th.js` | Copy globals data (header, footer, theme-config) จาก en → th |
| `scripts/fix-breadcrumbs-th.js` | สร้าง breadcrumbs format `{ en: [...], th: [...] }` ให้ทุก page |
| `scripts/fix-pages-locale.js` | Copy localized fields (title, heroHeading, meta, etc.) จาก en → th |
