# 📚 WOW Tour (PayBlocks) — Documentation

> เอกสารโปรเจค wowtour-gig จัดเรียงตามหมวดหมู่เพื่อให้ค้นหาง่าย ทั้งสำหรับ dev และ AI

## 📖 สารบัญ

### 🏗️ Architecture — ภาพรวมระบบ (เปลี่ยนไม่บ่อย)
- [overview.md](./architecture/overview.md) — Tech stack, C4 diagrams, project structure
- [external-api.md](./architecture/external-api.md) — Tourprox/apiwow API integration
- [collections.md](./architecture/collections.md) — Payload CMS collections & globals

### 📖 Guides — How-to สำหรับ dev
- [content-management.md](./guides/content-management.md) — ระบบจัดการเนื้อหา
- [tour-management.md](./guides/tour-management.md) — ระบบจัดการทัวร์
- [user-auth.md](./guides/user-auth.md) — ระบบผู้ใช้และสิทธิ์
- [theme-config.md](./guides/theme-config.md) — ระบบ Theme & Layout
- [media-management.md](./guides/media-management.md) — ระบบจัดการ Media
- [search-seo.md](./guides/search-seo.md) — ระบบค้นหาและ SEO

### 📋 Decisions — Architecture Decision Records
- [001-api-cache-layer.md](./decisions/001-api-cache-layer.md) — ใช้ cache.apiwow แทน Tourprox API ตรง

### 📝 Changelog — บันทึกการเปลี่ยนแปลง
- [2026-03.md](./changelog/2026-03.md) — มีนาคม 2026

---

## 📌 กฎการอัปเดตเอกสาร

> ใช้คำสั่ง `/update-docs` กับ Antigravity AI เพื่อให้ตรวจสอบและอัปเดตเอกสารอัตโนมัติ

| เหตุการณ์ | อัปเดตที่ไหน |
|----------|-------------|
| เปลี่ยน collection/global | `architecture/collections.md` |
| เปลี่ยน external API | `architecture/external-api.md` |
| เพิ่ม feature ใหม่ | `guides/` + `changelog/` |
| ตัดสินใจ architecture | `decisions/NNN-title.md` |
| Fix bug / breaking change | `changelog/YYYY-MM.md` |
