# ADR-001: ใช้ API Cache Layer แทน Tourprox API ตรง

## Status: Accepted

## Context

ระบบ Tourprox มี API เดิม (`tpxapicore.tourprox.com`) ที่เป็น C# .NET (Swagger 2.0)
แต่เว็บ wowtour-gig ไม่ได้ต่อ API นั้นตรง — ใช้ **cache layer** `cache.apiwow.softsq.com` แทน

## Decision

ใช้ `http://cache.apiwow.softsq.com/JsonSOA/getdata.ashx` เป็น data source หลัก พร้อม:
- API endpoint + key เก็บใน Payload Global `api-setting` (แก้ไขผ่าน Admin Panel)
- Next.js proxy route `/api/proxy-tour-products` สำหรับ client components
- Server-side fetch พร้อม `revalidate: 300` (cache 5 นาที)

## Rationale

1. **Performance** — cache layer ตอบเร็วกว่า API ตรง
2. **Decoupling** — ไม่ผูกกับ Tourprox infrastructure โดยตรง
3. **Flexibility** — สลับ API endpoint ได้จาก Admin Panel ไม่ต้อง deploy ใหม่
4. **CORS** — proxy route แก้ปัญหา CORS ในฝั่ง client

## Consequences

- ข้อมูลอาจ delay จาก Tourprox จริงตาม cache duration
- ต้อง monitor ว่า cache.apiwow ยัง alive อยู่
- API key ถูก expose ใน Admin Panel (ต้อง protect admin access)
