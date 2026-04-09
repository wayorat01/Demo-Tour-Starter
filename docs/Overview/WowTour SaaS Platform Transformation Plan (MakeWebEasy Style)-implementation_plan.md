# WowTour SaaS Platform Transformation Plan (MakeWebEasy Style)

การเปลี่ยนจากเว็บแอปพลิเคชันรูปแบบ Single-tenant (เว็บเดียว) ไปเป็นแพลตฟอร์ม SaaS (Software as a Service) แบบเดียวกับ MakeWebEasy หรือ Shopify ถือเป็นการยกระดับสถาปัตยกรรมครั้งใหญ่ โดยมีโจทย์สำคัญคือ: **"ดูแลรหัสน้อยที่สุด แต่เปิดเว็บให้ลูกค้าได้เร็วที่สุด และขยายสเกลได้ไม่จำกัด"**

แผนการนี้จะแบ่งออกเป็น 4 แกนหลักเพื่อให้ทีม Business และ Tech มองเห็นภาพเดียวกันครับ

---

## 1. สถาปัตยกรรมระบบ (Platform Architecture)

เพื่อให้ฝ่ายขาย (Sales) เปิดเว็บได้รวดเร็วแบบกดยืนยันปุ๊บเว็บขึ้นปั๊บ เราจะไม่มานั่งเช่า Server แยกหรือ Copy โค้ดให้ลูกค้าทีละคน แต่จะใช้สถาปัตยกรรม **"Single Codebase, Multi-Tenant Database" (ระบบเดียวรองรับหลายร้านค้า)**

### กระบวนการทำงาน (The Vercel Platforms Approach)
- **1 Database คุมทั้งหมด:** ใช้ MongoDB Cluster เดียว แต่ในทุกๆ Collection ของ Payload (เช่น Pages, Tours, Users) จะต้องเพิ่มฟิลด์ `tenant_id` หรือ `site_id` เพื่อแยกว่าข้อมูลนี้เป็นของเว็บไหน
- **Next.js Middleware:** เมื่อลูกค้าเข้าเว็บ `www.customer-tour.com` ระบบ Next.js Middleware จะอ่านชื่อโดเมน -> วิ่งไปถาม DB ว่าโดเมนนี้คือ `site_id` อะไร -> แล้วทำการ Rewrite URL ไปสุ่มเนื้อหาเฉพาะของเว็บนั้นขึ้นมาแสดง (เช่น Rewrite ไปที่ `/[site_id]/home`)
- **Payload Access Control:** ลูกค้า (Admin ของเว็บตัวเอง) จะล็อกอินเข้า Payload (`/admin`) เดียวกันบนโดเมนของเขา แต่ Access Control จะบังคับให้เขาเห็น/แก้ไขได้เฉพาะข้อมูลที่มี `tenant_id` ตรงกับบริษัทเขาเท่านั้น

✅ **ข้อดี:** ดูแลโค้ดแค่ชุดเดียว อัปเดตฟีเจอร์ใหม่ครั้งเดียวลูกค้า 1,000 เว็บได้ใช้พร้อมกันหมด (เหมือน MakeWebEasy)  
❌ **ข้อควรระวัง:** ต้องเขียน Access Control ของ Payload ให้รัดกุม 100% ป้องกันลูกค้าร้านนึงแอบไปลบข้อมูลร้านอื่น

---

## 2. การจัดการ Git Repository (Git Strategy)

คุณไม่จำเป็นต้องมี Repo แยกสำหรับลูกค้าแต่ละรายครับ ให้ใช้รูปแบบ **Root/Core Repository**

| Name | Responsibilities |
| --- | --- |
| `wowtour-core` (Main Repo) | เก็บ Core Engine ทั้งหมด (Next.js App + Payload CMS Config) ที่เราใช้อยู่ปัจจุบัน |

**ถาม: ถ้าลูกค้าบางคนอยากได้ฟีเจอร์พิเศษที่ไม่เหมือนใคร (Customization) ทำอย่างไร?**
**ตอบ:** เราใช้ระบบ **Theme/Blocks (Design Versions)** ที่คุณทำไว้อยู่แล้ว ให้งอกเพิ่มไปเรื่อยๆ ใน Core Repo. หรือหากลูกค้าจ่ายค่า Custom สูงมาก เราจะใช้ฟีเจอร์ Multi-Zone ของ Next.js อนุญาตให้มี Repo เสียบปลั๊กแยกเฉพาะบริษัทนั้นๆ ได้ (แต่ส่วนใหญ่ แนะนำให้ยัดเป็น Block ให้ลูกค้าเปิด/ปิดผ่าน Payload ดีกว่าครับ จะได้ไม่ต้องแยก Repo)

---

## 3. ระบบสร้างเว็บไซต์อัตโนมัติ (Automated Provisioning Workflow)

ฝ่ายขายไม่จำเป็นต้องมีความรู้เรื่อง Code เลยครับ นี่คือ Workflow การขาย:

1. **Super Admin Dashboard:**
   เราจะสร้าง Collection ใหม่ใน Payload ชื่อ `Tenants` หรือ `Sites` ซึ่งมีเฉพาะแอดมินฝั่งเราเท่านั้นที่เข้าได้
2. **กระบวนการเปิดเว็บโดย Sales:**
   - Sales ปิดการขายได้ -> เข้าสู่หน้า Super Admin
   - กด "สร้าง Site ใหม่" -> กรอกชื่อแพ็กเกจ, ชื่อร้าน (เช่น `Siam Tour`), และ Subdomain ที่ต้องการ (`siamtour.wowtour.com`)
   - กด **Save**
3. **Payload Hooks ทำงานเบื้องหลัง (Magic Starts):**
   - ทันทีที่ Save System Hook ใน Payload จะทำงาน
   - มันจะสร้าง `tenant_id` ใหม่
   - ทำการ Seed ข้อมูลพื้นฐาน (เช่น หมวดหมู่มาตรฐาน, หน้า Home พื้นฐาน, หน้า Contact Us) ลงใน Database โดยยัด `tenant_id` นี้แปะลงไป
   - สร้าง User Admin ให้ลูกค้าอัตโนมัติ พร้อมส่งอีเมลแจ้งรหัสผ่าน
   - *(Optional)* ยิง API ไปที่ Vercel / Cloudflare เพื่อจด Subdomain ให้ผูกกับ Server ของเรา
4. **เสร็จสิ้นภายใน 5 วินาที:** Sales สามารถแคปหน้าจอส่งลิงก์หลังบ้าน `siamtour.wowtour.com/admin` ให้ลูกค้าเริ่มใส่ทัวร์ได้เลย

---

## 4. สิ่งที่ต้องแก้ไขใน Codebase ปัจจุบัน (Action Plan)

หากตัดสินใจจะไปทางนี้ (SaaS) เราจะต้องเริ่มปรับเปลี่ยนโครงสร้าง Payload ดังนี้:

> [!WARNING]
> นี่คือ Breaking Changes ที่ต้องทำอย่างระมัดระวัง

1. **ติดตั้ง Tenant Plugin:** นำ `@payloadcms/plugin-multi-tenant` มาใช้ หรือสร้าง Base Field `tenant_id` แล้วใช้ Hook ยัดใส่ลงทุก Collections (Tours, Pages, Media, Globals) แบบอัตโนมัติ
2. **แยก Globals เป็น Collection:** 
   สังเกตว่า `Header`, `Footer`, `CompanyInfo` ตอนนี้เป็น `Globals` (ซึ่งมีได้แค่ 1 แถวใน DB). ในระบบ Multi-tenant เราต้องย้ายพวกนี้ไปเป็น `Collections` ทั่วไป (เช่น `SiteConfig`) แล้วให้ดึงข้อมูลอิงตาม 1 Site ต่อ 1 Config แทน
3. **สร้าง Next.js Middleware:** สร้างระบบตรวจจับ Host/Domain เพื่อ Rewrite Next.js Route อัตโนมัติ (ศึกษาวิธีการได้จาก *Vercel Platforms Starter Kit*)
4. **ทำ S3 Bucket Partitioning:** รูปภาพ (Media) ต้องมีการแยก Folder หรือแยกแท็กว่าเป็นภาพของ `tenant` ไหน จะได้ไม่ปนกันเวลาลูกค้า Browse หารูป

---

## 5. แผนการทดสอบระบบ (Testing Strategy)

ระบบ Multi-Tenant มีความเสี่ยงสูงเรื่อง **Data Leak** (ข้อมูลรั่วข้ามร้าน) จึงต้องมีแผนทดสอบที่ครอบคลุมทั้ง 5 ระดับ:

### 5.1 Unit Tests — Access Control & Tenant Isolation

ทดสอบว่า Access Control ของทุก Collection กรองข้อมูลตาม `tenant_id` ได้ถูกต้อง

```typescript
// __tests__/access/tenantAccess.test.ts
import { tenantAccess } from '@/access/tenantAccess'

describe('Tenant Access Control', () => {
  it('Super Admin สามารถเข้าถึงข้อมูลทุก Tenant ได้', () => {
    const req = { user: { role: 'super-admin' } }
    expect(tenantAccess({ req })).toBe(true)
  })

  it('Agent Admin เห็นเฉพาะข้อมูลของ Tenant ตัวเอง', () => {
    const req = { user: { role: 'agent-admin', tenant: { id: 'tenant_a' } } }
    const result = tenantAccess({ req })
    expect(result).toEqual({ tenant: { equals: 'tenant_a' } })
  })

  it('User ที่ไม่มี tenant ไม่สามารถเข้าถึงข้อมูลได้', () => {
    const req = { user: { role: 'agent-admin', tenant: null } }
    expect(tenantAccess({ req })).toBe(false)
  })

  it('User ที่ไม่ได้ login ไม่สามารถเข้าถึงข้อมูลได้', () => {
    const req = { user: null }
    expect(tenantAccess({ req })).toBe(false)
  })
})
```

**Collections ที่ต้อง Test (ทุก collection):**
- `InterTours`, `InboundTours`, `ProgramTours` — ทัวร์แยกตาม Tenant
- `Bookings` — การจองแยกตาม Tenant (สำคัญมาก!)
- `Pages`, `Posts` — เนื้อหาหน้าเว็บแยกตาม Tenant
- `Media` — รูปภาพแยกตาม Tenant (ป้องกันดูรูปข้าม Agent)
- `Headers`, `Footers`, `ThemeConfigs` — ค่า Config แยกตาม Tenant

---

### 5.2 Integration Tests — Payload API + Tenant Middleware

ทดสอบว่า Payload Local API ทำงานร่วมกับ Tenant filtering ได้ถูกต้องเมื่อเรียกจริง

```typescript
// __tests__/integration/tenantDataIsolation.test.ts
describe('Tenant Data Isolation (Integration)', () => {
  let tenantA_id: string
  let tenantB_id: string

  beforeAll(async () => {
    // สร้าง 2 Tenants สำหรับทดสอบ
    const tenantA = await payload.create({ collection: 'tenants', data: { name: 'Agent A', slug: 'agent-a', package: 'starter' } })
    const tenantB = await payload.create({ collection: 'tenants', data: { name: 'Agent B', slug: 'agent-b', package: 'core' } })
    tenantA_id = tenantA.id
    tenantB_id = tenantB.id

    // สร้างทัวร์ให้แต่ละ Tenant
    await payload.create({ collection: 'intertours', data: { title: 'ทัวร์ญี่ปุ่น A', tenant: tenantA_id } })
    await payload.create({ collection: 'intertours', data: { title: 'ทัวร์เกาหลี B', tenant: tenantB_id } })
  })

  it('Agent A ค้นหาทัวร์ → เห็นเฉพาะทัวร์ของตัวเอง', async () => {
    const result = await payload.find({
      collection: 'intertours',
      overrideAccess: false,
      user: { role: 'agent-admin', tenant: { id: tenantA_id } },
    })
    expect(result.docs).toHaveLength(1)
    expect(result.docs[0].title).toBe('ทัวร์ญี่ปุ่น A')
  })

  it('Agent A ไม่สามารถแก้ไขทัวร์ของ Agent B ได้', async () => {
    const tourB = await payload.find({
      collection: 'intertours',
      where: { tenant: { equals: tenantB_id } },
      overrideAccess: true,
    })

    await expect(
      payload.update({
        collection: 'intertours',
        id: tourB.docs[0].id,
        data: { title: 'HACKED!' },
        overrideAccess: false,
        user: { role: 'agent-admin', tenant: { id: tenantA_id } },
      })
    ).rejects.toThrow()
  })

  it('Agent A ไม่สามารถลบ Booking ของ Agent B ได้', async () => {
    const bookingB = await payload.create({
      collection: 'bookings',
      data: { customerName: 'ลูกค้า B', tenant: tenantB_id },
      overrideAccess: true,
    })

    await expect(
      payload.delete({
        collection: 'bookings',
        id: bookingB.id,
        overrideAccess: false,
        user: { role: 'agent-admin', tenant: { id: tenantA_id } },
      })
    ).rejects.toThrow()
  })
})
```

---

### 5.3 E2E Tests — Subdomain Routing & แพ็กเกจ

ทดสอบ Flow ทั้งหมดผ่าน Browser จริง ใช้ Playwright:

```typescript
// e2e/multi-tenant.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Multi-Tenant Subdomain Routing', () => {
  test('agent-a.wowtour.com แสดงเนื้อหาของ Agent A', async ({ page }) => {
    await page.goto('http://agent-a.localhost:3000')
    await expect(page.locator('header')).toContainText('Agent A Travel')
    // ไม่ควรเห็นข้อมูลของ Agent B
    await expect(page.locator('body')).not.toContainText('Agent B')
  })

  test('agent-b.wowtour.com แสดงเนื้อหาของ Agent B', async ({ page }) => {
    await page.goto('http://agent-b.localhost:3000')
    await expect(page.locator('header')).toContainText('Agent B Travel')
  })

  test('subdomain ที่ไม่มีอยู่จริง → แสดงหน้า 404', async ({ page }) => {
    const response = await page.goto('http://not-exist.localhost:3000')
    expect(response?.status()).toBe(404)
  })
})

test.describe('Package Feature Gating', () => {
  test('Starter Budget → ไม่มีปุ่ม Booking (ติดต่อผ่าน LINE เท่านั้น)', async ({ page }) => {
    await page.goto('http://starter-budget-agent.localhost:3000/tours/japan')
    await expect(page.locator('[data-testid="booking-button"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="line-contact"]')).toBeVisible()
  })

  test('Core ปกติ → มีระบบ Booking เต็มรูปแบบ', async ({ page }) => {
    await page.goto('http://core-agent.localhost:3000/tours/japan')
    await expect(page.locator('[data-testid="booking-button"]')).toBeVisible()
  })

  test('Plus → กล่องค้นหามี field ทัวร์เทศกาล', async ({ page }) => {
    await page.goto('http://plus-agent.localhost:3000/search')
    await expect(page.locator('[data-testid="festival-filter"]')).toBeVisible()
  })

  test('Starter Budget → Dynamic Page ที่ไม่มีสินค้า จะซ่อนเมนูอัตโนมัติ', async ({ page }) => {
    await page.goto('http://starter-budget-agent.localhost:3000')
    // ถ้าไม่มีสินค้าประเภท "เรือสำราญ" เมนูต้องไม่แสดง
    await expect(page.locator('[data-testid="cruise-menu"]')).not.toBeVisible()
  })
})
```

---

### 5.4 Security Tests — Data Isolation & PDPA

ทดสอบความปลอดภัยเฉพาะทาง ป้องกัน Data Leak ข้าม Tenant:

```typescript
// __tests__/security/dataIsolation.test.ts
describe('Security: Cross-Tenant Data Leak Prevention', () => {
  it('REST API: Agent A ไม่สามารถดึงข้อมูล Booking ของ Agent B ผ่าน API ได้', async () => {
    const res = await fetch('/api/bookings', {
      headers: {
        Authorization: `Bearer ${agentA_token}`,
      },
    })
    const data = await res.json()
    // ต้องไม่มี booking ของ Agent B อยู่ในผลลัพธ์
    data.docs.forEach((doc: any) => {
      expect(doc.tenant).toBe(tenantA_id)
    })
  })

  it('REST API: Agent A ไม่สามารถ access ข้อมูลโดยเดา ID ของ Agent B ได้', async () => {
    const res = await fetch(`/api/bookings/${bookingB_id}`, {
      headers: {
        Authorization: `Bearer ${agentA_token}`,
      },
    })
    expect(res.status).toBe(404) // หรือ 403
  })

  it('GraphQL: depth query ไม่สามารถ leak ข้อมูลข้าม Tenant ได้', async () => {
    const query = `{
      InterTours {
        docs {
          title
          tenant { name slug }
        }
      }
    }`
    const res = await graphqlRequest(query, agentA_token)
    res.data.InterTours.docs.forEach((doc: any) => {
      expect(doc.tenant.id).toBe(tenantA_id)
    })
  })
})

describe('Security: PDPA Data Encryption', () => {
  it('ข้อมูลส่วนบุคคลใน Booking ถูกเข้ารหัสใน Database', async () => {
    // ดึงข้อมูลตรงจาก MongoDB (bypass Payload)
    const rawDoc = await db.collection('bookings').findOne({ _id: bookingId })
    // ข้อมูลใน DB ต้องเป็น encrypted string ไม่ใช่ plain text
    expect(rawDoc.customerName).not.toBe('สมชาย ใจดี')
    expect(rawDoc.customerPhone).not.toBe('0891234567')
    expect(rawDoc.customerEmail).not.toBe('somchai@email.com')
  })

  it('Payload API ถอดรหัสข้อมูลให้ Admin ที่มีสิทธิ์อ่านได้ปกติ', async () => {
    const booking = await payload.findByID({
      collection: 'bookings',
      id: bookingId,
      overrideAccess: false,
      user: authorizedAdmin,
    })
    expect(booking.customerName).toBe('สมชาย ใจดี')
  })
})
```

---

### 5.5 Performance Tests — ภายใต้ Multi-Tenant Load

ทดสอบว่าระบบรองรับโหลดได้ตาม TOR (1,000+ ทัวร์, หลาย Agent พร้อมกัน):

| Test Case | เกณฑ์ผ่าน | เครื่องมือ |
|-----------|----------|-----------|
| Sync ข้อมูลทัวร์ 1,000+ รายการผ่าน Background Job | ระบบไม่ล่ม, ไม่กระทบ Frontend (No Downtime) | BullMQ + Custom Script |
| Google PageSpeed Insights ทุกหน้าหลัก | ≥ 70% ทั้ง Mobile & Desktop | Lighthouse CI |
| 50 Tenants เข้าใช้งานพร้อมกัน | Response Time < 2 วินาทีต่อหน้า | k6 / Artillery |
| Tenant Query ไม่ช้าลงเมื่อข้อมูลเยอะ | Query Time < 100ms (มี Index) | MongoDB Profiler |
| Cache Revalidation หลังอัปเดตทัวร์ | ข้อมูลใหม่แสดงภายใน 30 วินาที | Manual + Automated |

```bash
# ตัวอย่าง k6 Load Test Script
k6 run --vus 50 --duration 60s scripts/load-test-multi-tenant.js
```

```javascript
// scripts/load-test-multi-tenant.js (k6)
import http from 'k6/http'
import { check, sleep } from 'k6'

const TENANTS = ['agent-a', 'agent-b', 'agent-c', /* ... */]

export default function () {
  const tenant = TENANTS[Math.floor(Math.random() * TENANTS.length)]
  const res = http.get(`http://${tenant}.wowtour.com/tours`)
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
    'ไม่มี data leak': (r) => !r.body.includes('other-tenant-data'),
  })
  sleep(1)
}
```

---

### 5.6 สรุป Test Matrix

| ระดับ Test | เป้าหมาย | จำนวน Test (โดยประมาณ) | ความถี่ |
|-----------|----------|----------------------|--------|
| **Unit** | Access Control ทุก Collection | ~20-30 tests | ทุก PR (CI) |
| **Integration** | Payload API + Tenant filtering | ~15-20 tests | ทุก PR (CI) |
| **E2E** | Subdomain routing + Feature gating | ~10-15 tests | ก่อน Release (Staging) |
| **Security** | Data Isolation + PDPA Encryption | ~10-15 tests | ทุก PR + รายสัปดาห์ |
| **Performance** | Load + PageSpeed + Query Time | ~5-8 tests | รายสัปดาห์ + ก่อน Release |

> [!IMPORTANT]
> **เครื่องมือที่แนะนำ:**
> - **Unit/Integration:** Vitest (เร็ว, รองรับ TypeScript ดี)
> - **E2E:** Playwright (รองรับ Multi-domain testing)
> - **Security:** Custom scripts + OWASP ZAP (สำหรับ Pen Testing)
> - **Performance:** k6 (Load Testing) + Lighthouse CI (PageSpeed)

---

### 5.7 ข้อดี-ข้อเสียของการทำ Testing

#### ✅ ข้อดี

| # | ข้อดี | คำอธิบาย |
|---|------|---------|
| 1 | **ป้องกัน Data Leak ข้าม Agent** | นี่คือเรื่องร้ายแรงที่สุดในระบบ Multi-Tenant — ถ้า Agent A เห็นข้อมูล Booking ของ Agent B จะทำให้สูญเสียความน่าเชื่อถือทันที Test ช่วยจับปัญหานี้ก่อนขึ้น Production |
| 2 | **กล้า Refactor / เพิ่ม Feature ใหม่** | เมื่อมี Test ครอบคลุม เวลาแก้โค้ดหรือเพิ่มฟีเจอร์ใหม่ → รัน Test แล้วรู้ทันทีว่า Access Control ยังทำงานถูกต้อง ไม่ต้องมานั่งทดสอบมือทุก Tenant |
| 3 | **ลดเวลา QA ลงมหาศาล** | ไม่ต้องมีคนมานั่ง Login สลับ Agent ทีละรายเพื่อตรวจว่าข้อมูลแยกถูก — Automated Test ทำให้ภายใน 2-3 นาที |
| 4 | **CI/CD มั่นใจได้** | ทุก PR ที่ merge → รัน Test อัตโนมัติ → ถ้าผ่านทุกตัว deploy ได้เลยไม่ต้องกังวล เหมาะกับ SaaS ที่อัปเดตบ่อย |
| 5 | **สร้างความเชื่อมั่นให้ลูกค้า (Agent)** | สามารถแสดงให้ลูกค้าเห็นว่าระบบมี Security Test อยู่ → เป็นจุดขายของแพลตฟอร์ม |
| 6 | **ตรวจจับปัญหา Performance ก่อน Production** | รู้ล่วงหน้าว่า Query ช้าตอนมี 1,000 ทัวร์ หรือ PageSpeed ต่ำกว่า 70% → แก้ก่อนลูกค้าโดนกระทบ |
| 7 | **รองรับ PDPA Compliance** | มีหลักฐาน (Test Report) แสดงว่าข้อมูลส่วนบุคคลถูกเข้ารหัสจริง → ลดความเสี่ยงทางกฎหมาย |

#### ❌ ข้อเสีย

| # | ข้อเสีย | ผลกระทบ | วิธีรับมือ |
|---|---------|---------|----------|
| 1 | **ใช้เวลาเขียน Test เยอะ** | ต้องใช้เวลาเพิ่ม ~20-30% ของเวลาพัฒนา Feature | เขียน Test เฉพาะส่วนสำคัญก่อน (Access Control + Data Leak) แล้วค่อยเพิ่มที่เหลือทีหลัง |
| 2 | **ต้อง Maintain Test ด้วย** | เมื่อเปลี่ยน Schema หรือ Logic → ต้องแก้ Test ตาม | ออกแบบ Test ให้ยืดหยุ่น ใช้ fixture และ factory pattern |
| 3 | **ต้องมี Test Database แยก** | Integration Test ต้องการ MongoDB ของตัวเองเพื่อไม่ให้กระทบ Dev DB | ใช้ `mongodb-memory-server` สำหรับรัน Test แบบ In-Memory |
| 4 | **E2E Test ช้า** | Playwright ต้อง Boot Browser จริง → ใช้เวลา 3-5 นาทีต่อ Suite | รัน E2E เฉพาะก่อน Release ไม่ต้องรันทุก PR |
| 5 | **Learning Curve** | ทีมต้องเรียนรู้เครื่องมือใหม่ (Vitest, Playwright, k6) | ลงทุนเวลา 1-2 วันเรียนรู้ แล้วจะคืนทุนในระยะยาว |
| 6 | **อาจให้ False Confidence** | Test ผ่านหมด ≠ ปลอดภัย 100% (ถ้า Test ไม่ครอบคลุม) | ทำ Code Coverage ขั้นต่ำ 80% สำหรับ Access Control และทำ Manual Pen Test เพิ่ม |

#### 🎯 สรุปคำแนะนำ

> [!TIP]
> **ควรทำ Testing หรือไม่? → ต้องทำ (แต่เลือกลำดับให้ดี)**
>
> สำหรับระบบ Multi-Tenant SaaS การไม่มี Test เลยมีความเสี่ยงสูงมาก เพราะบั๊กตัวเดียวอาจทำให้ข้อมูลของ Agent หลายร้อยรายรั่วไหลข้ามกัน
>
> **ลำดับความสำคัญที่แนะนำ:**
> 1. 🔴 **ต้องทำก่อน:** Unit Test สำหรับ Access Control (ป้องกัน Data Leak)
> 2. 🟠 **ควรทำ:** Integration Test สำหรับ Tenant Data Isolation
> 3. 🟡 **ทำเมื่อพร้อม:** Security Test (PDPA + Cross-Tenant)
> 4. 🟢 **Nice to have:** E2E Test + Performance Test

---

## User Review Required

นี่คือแนวทางที่คุ้มค่าที่สุดในระยะยาวสำหรับโมเดล Business B2B แตกต่างเอเจนซี่ครับ แผนนี้ตอบโจทย์คุณหรือไม่ครับ? หรือต้องการให้โฟกัสขยายวิธีที่ **"แยกระบบให้ลูกค้าแบบขาดขาด 1 ลูกค้า 1 Server (IaC)"** แทนแบบ Single Codebase ไหมครับ (วิธีนั้นจะกินทรัพยากรและค่า Server มหาศาลกว่า แต่ยืดหยุ่นในแง่ Custom Code ให้ลูกค้าทีละจ้าวสูงกว่าครับ)?
