# Plan: Fix 27 TypeScript Errors (Post-Sprint 2 Regressions)

- **ID:** 260326_1600
- **Status:** Pending
- **Priority:** High
- **Complexity:** Standard
- **Touches:** `.next/` (cache), `src/globals/Header/navbar/navbar.config.ts`, `src/globals/Header/navbar/navbar5.tsx`, `src/globals/Header/navbar/wowtour_navbar1-7.tsx`
- **Conflicts with:** None
- **Parallel-safe:** Yes

## Context

After Sprint 2, `pnpm tsc` fails with 27 errors. The Sprint 2 work removed `as any` casts from navbar files but didn't add proper type narrowing — the code now accesses `icon`, `hidden`, `label` on a union type that includes `tourCategoryMenu` (which lacks those fields). Additionally, renaming `/sitemap/` to `/site-map/` left stale `.next/types` references.

Three distinct root causes, all fixable without schema changes — the generated `payload-types.ts` already has the correct types.

## Steps

1. [x] **Clear stale `.next` cache** to fix 2 sitemap path errors:

   ```bash
   rm -rf .next
   ```

   This removes the stale `.next/types/app/(frontend)/sitemap/` reference. Next build will regenerate it for `/site-map/`.
   **Fixes:** 2 errors

2. [x] **Fix `filterOptions` return type** in `src/globals/Header/navbar/navbar.config.ts:142`:
       The callback returns `{ category: { equals: string }; or?: undefined }` — the `or?: undefined` conflicts with Payload's `Where` index signature (`[key: string]: Where[] | WhereField`).
       **Fix:** Remove the implicit `or?: undefined` by restructuring the return. Replace lines 156-163 with:

   ```ts
   if (categoryIds.length === 1) {
     return { category: { equals: categoryIds[0] } } as Where
   }
   return {
     or: categoryIds.map((id) => ({ category: { equals: id } })),
   } as Where
   ```

   Import `Where` from `payload` at the top of the file if not already imported.
   **Fixes:** 1 error

3. [x] **Add type narrowing to navbar item access** in all 8 navbar files:
       The items array is a discriminated union: `{ blockType: 'link' | 'sub' | 'submenu' | 'tourCategoryMenu' | 'cardGrid' }`. Only `sub` and `submenu` have `icon`, `hidden`, `label`. Only `link` has `hidden`.

   **Pattern to apply** — replace direct property access with narrowed checks:

   For `.hidden` access (used in `.filter()`):

   ```ts
   // BEFORE (fails — tourCategoryMenu has no 'hidden')
   .filter((item) => !item.hidden)

   // AFTER
   .filter((item) => !('hidden' in item && item.hidden))
   ```

   For `.icon` access:

   ```ts
   // BEFORE (fails)
   {item.icon && <Icon icon={item.icon} />}

   // AFTER
   {'icon' in item && item.icon && <Icon icon={item.icon} />}
   ```

   For `.label` access:

   ```ts
   // BEFORE (fails)
   <span>{item.label}</span>

   // AFTER — only inside blockType === 'sub' branches, so cast is safe
   <span>{(item as { label?: string }).label}</span>
   ```

   **Files to update (24 errors across 8 files):**
   - `navbar5.tsx` — lines 73 (icon x2), 176 (label), 181 (icon x2)
   - `wowtour_navbar1.tsx` — lines 190 (hidden), 205 (icon x2)
   - `wowtour_navbar2.tsx` — lines 117 (hidden), 132 (icon x2)
   - `wowtour_navbar3.tsx` — lines 225 (hidden), 240 (icon x2)
   - `wowtour_navbar4.tsx` — lines 128 (hidden), 143 (icon x2)
   - `wowtour_navbar6.tsx` — lines 165 (hidden), 180 (icon x2)
   - `wowtour_navbar7.tsx` — lines 192 (hidden), 207 (icon x2)

   **Fixes:** 24 errors

4. [x] **Verify TypeScript passes**:

   ```bash
   pnpm tsc 2>&1 | tail -5
   ```

   Target: 0 errors.

5. [x] **Verify build passes** (no `ignoreBuildErrors` bypass):

   ```bash
   pnpm build
   ```

   Target: exit 0.

6. [x] **Commit and archive**:
   ```bash
   git add -A && git commit -m "fix: resolve 27 TypeScript errors (navbar type narrowing + cache cleanup)"
   ```
   Move this plan to `claude_plan/done/`.

## Verification

| Step | Command                                                | Expected       |
| ---- | ------------------------------------------------------ | -------------- |
| 1    | `ls .next/types/app/\(frontend\)/sitemap/ 2>&1`        | "No such file" |
| 3    | `pnpm tsc 2>&1 \| grep "icon\|hidden\|label" \| wc -l` | 0              |
| 4    | `pnpm tsc`                                             | 0 errors       |
| 5    | `pnpm build`                                           | exit 0         |

## Execution Notes

- **Status:** Done
- **Executed by:** Antigravity (AI Assistant)
- **Timestamp:** 2026-03-27T01:36:00+07:00
- **What was done:**
  - ทำการเคลียร์ `.next/` แคชทิ้งทั้งหมดเพื่อรีเซ็ต sitemap ที่ค้างอยู่
  - ปรับแก้ `filterOptions` ใน `navbar.config.ts` ให้รีเทิร์นรูปแบบ `Where` ถูกต้อง
  - เปลี่ยนและเพิ่ม type narrowing (เช่นเช็ค `hidden in item`, `item as { label }`) ให้กับ Navbar ทั้ง 8 ไฟล์ เสร็จสมบูรณ์
  - คอมไพล์รัน `pnpm tsc` ผ่านโดยไม่เจอ Error สักจุด
- **Deviations from plan:** ไม่มี (ทำตาม Plan แบบ 100%)
- **Issues encountered:** ไม่มีปัญหาครับ ราบรื่นดี

### Verification Results

| Step | Command                                                | Expected       | Actual         | Status |
| ---- | ------------------------------------------------------ | -------------- | -------------- | ------ |
| 1    | `ls .next/types/app/\(frontend\)/sitemap/ 2>&1`        | "No such file" | "No such file" | Pass   |
| 3    | `pnpm tsc 2>&1 \| grep "icon\|hidden\|label" \| wc -l` | 0              | 0              | Pass   |
| 4    | `pnpm tsc`                                             | 0 errors       | 0 errors       | Pass   |
| 5    | `pnpm build`                                           | exit 0         | exit 0         | Pass   |
