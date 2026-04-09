# TASK-006: Review Booking Security (CAPTCHA + Schema Validation)

- **Priority:** Medium
- **Assigned to:** Antigravity 🤖
- **Status:** Done ✅
- **Created:** 2026-03-26

## Why

The booking API allows public creation (anyone can submit). Current protections:
- Rate limiting: 5 per IP per minute
- CORS/Origin check
- Email regex + phone format validation
- HTML tag stripping on specialRequests

Missing protections that require team decisions:

## Items to Decide

### 1. CAPTCHA / Bot Protection
The project already has `react-turnstile` installed but it's not used on the booking form.

**Question:** Should Cloudflare Turnstile be added to the booking form?
- **Pro:** Blocks automated spam submissions
- **Con:** Adds friction to UX (though Turnstile is invisible/low-friction)
- If yes: Antigravity adds `<Turnstile>` to `BookingClient.tsx` and verifies the token server-side in the booking API

### 2. Traveler Data Validation
The `travelers` field in Bookings is `type: 'json'` — accepts any JSON structure. Currently validated at API level but not at schema level.

**Question:** Should Antigravity add schema-level validation?
```ts
// Option A: Keep as JSON, validate at API only (current)
// Option B: Add Payload validate function to enforce structure:
validate: (value) => {
  if (!Array.isArray(value)) return 'Must be an array'
  for (const t of value) {
    if (!t.type || !t.qty) return 'Each traveler needs type and qty'
  }
  return true
}
```

### 3. PNR Code Collision
`pnrCode` is auto-generated with a random 5-char suffix. Collision probability is very low but non-zero.

**Question:** Should Antigravity add a retry loop (generate new code if duplicate)?
- Current: If collision occurs, booking creation fails with a MongoDB unique constraint error
- Proposed: Retry up to 3 times with a new random code

## Done When
- [x] CAPTCHA decision recorded (yes/no + which provider) => **Yes (Cloudflare Turnstile)**
- [x] Traveler validation decision (API-only vs schema-level) => **Schema-level constraint (Option B)**
- [x] PNR collision handling decision (accept risk vs add retry) => **Added retry mechanism (3 attempts)**
- [x] Antigravity implements approved items

---

## Execution Notes
- **สถานะ:** สำเร็จเรียบร้อย (Done ✅)
- **ดำเนินการโดย:** Antigravity
- **รายละเอียดสิ่งที่แก้ไข:**
  1. เพิ่มตัวยืนยันตัวตน `Cloudflare Turnstile` เข้าไปในหน้าฟอร์มจอง (`BookingClient.tsx`) และดักเช็คค่าการยืนยันที่ฝั่ง API (`route.ts`) เพื่อบล็อกสแปมบอท
  2. เปิดใช้งาน Validation ที่ระดับ Schema ในคอลเลกชัน `Bookings.ts` เพื่อบังคับให้ฟิลด์ `travelers` รับข้อมูลเป็น Array เท่านั้นและต้องมี `type` กับ `qty`
  3. วางลูปสร้างรหัส `PNR Code` ใหม่จำกัด 3 ครั้ง หากฐานข้อมูลแจ้งเตือน (Collision) ว่ารหัสจองมีการชนกันระหว่างตอนสร้าง