# TASK-003: Post-Deployment Verification (Human Only)

- **Priority:** Medium
- **Assigned to:** Team WOW (human)
- **Related plans:** All completed plans
- **Status:** In Progress (ทดสอบบน localhost แล้วบางส่วน, รอเช็ค Production)
- **Created:** 2026-03-24
- **Updated:** 2026-03-26

## Why

After all agent plans and secret rotation are complete, human verification is needed for things agents cannot test: live production behavior, email delivery, external service integrations, and real user flows.

Automated testing (Lighthouse, Playwright) has been moved to Plan 260325_1510 for Antigravity to handle.

## What to Verify (Human Only)

### After TASK-001 (Secret Rotation)
- [ ] Production site loads after secret rotation
- [x] Booking email sends successfully with new SMTP credentials (ทดสอบบน localhost สำเร็จ 25 มี.ค.)
- [x] Admin panel (`/admin`) login works with new PAYLOAD_SECRET

### API Hardening (Plan 1340)
- [ ] Admin APIs work correctly when logged into Payload admin panel
- [ ] Booking form submission works from the live site (rate limiting doesn't block legitimate use)

### Route Consolidation (Plan 1310 — completed)
- [ ] Tour detail pages load correctly at `/intertour/` URLs
- [x] Old `/tour/` URLs redirect properly (ทดสอบบน localhost: 308 redirect ✅)
- [ ] Google Search Console: submit updated sitemap
- [ ] Check Google Analytics for 404 spikes after deployment

### SEO (Plan 1440)
- [x] `/sitemap.xml` returns valid XML with tour pages (ทดสอบบน localhost ✅)
- [x] `/robots.txt` returns valid content (ทดสอบบน localhost ✅)

## Done When
- [ ] All checkboxes above confirmed on Production
- [ ] Any issues found are logged as new tasks

