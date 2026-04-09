# ADR-003: Cache ข้อมูล Header ทั้งก้อนด้วย unstable_cache

## Status: Accepted

## Context

ทุกๆ page request ระบบจะยิง DB queries 7-10 ตัวแบบ sequential เพื่อประกอบ Header:
1. `findGlobal('header')` — โครงสร้างเมนู
2. `find('intertours')` — ทัวร์ต่างประเทศ (auto-populate)
3. `find('inbound-tours')` — ทัวร์ในประเทศ (auto-populate)
4. `find('intertours')` — hydrate tour IDs ที่ยังไม่ populate
5. `find('inbound-tours')` — hydrate tour IDs ที่ยังไม่ populate
6. `find('media')` — hydrate flagIcon รูปธง
7. `findGlobal('company-info')` — ข้อมูลบริษัท
8. `findByID('media')` — hydrate โลโก้
9. `find('intertours')` + `find('inbound-tours')` — cities map (navbar 4/6 เท่านั้น)

ผลลัพธ์: หน้าโหลดช้า 1.5-2.5 วินาที ต่อ request (dev mode)

## Decision

รวมทุก query ไว้ในฟังก์ชัน `fetchHeaderData()` ตัวเดียว แล้วครอบด้วย `unstable_cache`:

```typescript
const getCachedHeaderData = (locale: string) =>
  unstable_cache(
    () => fetchHeaderData(locale),
    ['header_full_data', locale],
    { tags: ['header_full_data'] },
  )()
```

### Cache Tags & Revalidation

| เหตุการณ์ (Payload Hook) | Hook ที่ทำ revalidate | Cache Tag ที่ clear |
|---|---|---|
| Admin แก้ Header | `revalidateHeader.ts` | `header_full_data` |
| Admin แก้/ลบ Tour | `revalidateInterTours.ts` | `header_full_data` |
| Admin แก้ Company Info | `revalidateCompanyInfo.ts` | `header_full_data` |

### Block-Level Caching

นอกจาก Header แล้ว ยัง cache Blocks ที่ยิง DB ทุก render:

| Block | Cache Tag | Revalidate เมื่อ |
|---|---|---|
| `TourType` | `tour-groups`, `program-tours` | Admin แก้ tour group หรือ program tour |
| `Festival` | `festivals` | Admin แก้ festivals |
| `BlogCard` | `posts` | Admin แก้/เพิ่ม blog post |

### Parallel Fetching

เปลี่ยน Layout + Footer จาก sequential → `Promise.all`:

```typescript
// ก่อน (sequential ~150ms)
const footer = await getCachedGlobal('footer')
const companyInfo = await getCachedGlobal('company-info')
const pageConfig = await getCachedGlobal('page-config')

// หลัง (parallel ~50ms)
const [footer, companyInfo, pageConfig] = await Promise.all([...])
```

## Rationale

1. **Performance** — Request แรก (cache miss) ช้าเท่าเดิม แต่ request ที่ 2+ จาก ~2s → ~100ms
2. **Correctness** — ข้อมูลจะอัปเดตทันทีเมื่อ admin แก้ไข เพราะ Payload hooks จะ `revalidateTag()` อัตโนมัติ
3. **Simplicity** — ไม่ต้องตั้ง `revalidate` time-based → ใช้ on-demand revalidation ผ่าน tags เท่านั้น
4. **Memory** — ข้อมูลทั้งก้อนถูก `JSON.parse(JSON.stringify())` ครั้งเดียวก่อนเก็บ cache → ไม่มี BSON/ObjectId leak

## Consequences

- **getCurrentUser()** ต้องอยู่นอก cache เสมอ เพราะขึ้นกับ session cookie ของแต่ละ request
- `unstable_cache` เป็น Next.js experimental API — อาจเปลี่ยน behavior ใน major version ถัดไป
- Cache invalidation เชื่อมโยงหลาย hooks → ต้อง maintain ให้ครบทุกจุด
- ใน Dev mode (`pnpm run dev`) cache จะไม่ทำงานเต็มที่ → ต้อง test ด้วย `pnpm build && pnpm start`

## ไฟล์ที่เกี่ยวข้อง

- `src/globals/Header/Component.tsx` — `fetchHeaderData()` + `getCachedHeaderData()`
- `src/blocks/TourType/Component.tsx` — `getCachedTourGroupProducts()`
- `src/blocks/Festival/Component.tsx` — `getCachedFestivals()`
- `src/blocks/BlogCard/Component.tsx` — `getCachedBlogPosts()`
- `src/app/(frontend)/layout.tsx` — `Promise.all` parallel fetch
- `src/globals/Footer/Component.tsx` — `Promise.all` parallel fetch
- `src/utilities/getCachedCitiesMap.ts` — `fetchCitiesMapDirect()`
- `src/globals/Header/hooks/revalidateHeader.ts`
- `src/collections/hooks/revalidateInterTours.ts`
- `src/globals/CompanyInfo/hooks/revalidateCompanyInfo.ts`
