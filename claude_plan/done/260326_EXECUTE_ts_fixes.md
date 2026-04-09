# Executor Handoff: Fix 27 TypeScript Errors

**Created:** 2026-03-26
**Planner:** Giggy (Claude)
**Plans:** 1
**Branch:** `tour/pruet`

---

## Single Plan: 260326_1600 — Fix 27 TS Errors (~20 min)

**File:** `claude_plan/260326_1600_fix_ts_errors.md`

Three independent fixes, do them in order:

### Fix 1: Clear `.next` cache (2 errors)

```bash
rm -rf .next
```

The old `/sitemap/page.tsx` was renamed to `/site-map/page.tsx` but `.next/types` still references the old path.

### Fix 2: `navbar.config.ts` filterOptions (1 error)

Line 157 and 161-163 return objects that TypeScript infers with `or?: undefined`, which conflicts with Payload's `Where` index signature.

Add `as Where` to both return statements (import `Where` from `payload`):

```ts
// Line 157
return { category: { equals: categoryIds[0] } } as Where

// Lines 161-163
return {
  or: categoryIds.map((id) => ({ category: { equals: id } })),
} as Where
```

### Fix 3: Navbar type narrowing (24 errors across 8 files)

The `as any` casts were removed in Sprint 2 but no type narrowing was added. The nav items union includes `tourCategoryMenu` which lacks `icon`, `hidden`, `label`.

**For `.hidden` in filter callbacks** — 6 files (wowtour_navbar1-4, 6-7):

```ts
// BEFORE
.filter((item) => !item.hidden)
// AFTER
.filter((item) => !('hidden' in item && item.hidden))
```

**For `.icon` access** — 8 files:

```ts
// BEFORE
{item.icon && <Icon icon={item.icon} />}
// AFTER
{'icon' in item && item.icon && <Icon icon={item.icon} />}
```

**For `.label` access** — navbar5.tsx line 176 only:
Already inside a `blockType === 'sub'` branch, so the existing `(item as { label?: string }).label` cast is acceptable.

### Post-fix

```bash
pnpm tsc        # must be 0 errors
pnpm build      # must exit 0
```

Commit: `fix: resolve 27 TypeScript errors (navbar type narrowing + cache cleanup)`

---

## Gotchas

1. **Do NOT re-add `as any`** — the goal is proper narrowing, not casting away the problem.
2. **Do NOT re-add `ignoreBuildErrors`** — if build fails, fix the actual error.
3. **`rm -rf .next`** means the next `pnpm build` will be a full rebuild (slower, ~2-3 min).
4. **Import `Where`** — `import type { Where } from 'payload'` at top of `navbar.config.ts`.

---

## Post-Execution Checklist

- [x] `pnpm tsc` passes (0 errors)
- [x] `pnpm build` passes (exit 0)
- [x] `grep "as any" src/globals/Header/navbar/wowtour_*.tsx | wc -l` is 0
- [x] `grep "ignoreBuildErrors" next.config.ts` returns nothing
- [x] Plan archived to `claude_plan/done/`
- [x] Code committed and pushed

## Execution Notes

- Date: 2026-03-26
- Status: Completed
- Deviations: Encountered TS error on accordion value prop in navbar5.tsx due to missing `label` type cast. Added fallback empty string and inline type cast for `AccordionItem value` to satisfy Next.js types. Copied `.env.example` to `.env` to fix missing `PAYLOAD_SECRET` during build.
- Verification: `pnpm tsc` passed with 0 errors. `pnpm build` exited 0.
