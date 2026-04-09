---
description: Review frontend UI/UX quality using ui-ux-pro-max skill. Use after someone pushes frontend changes, before merging PRs, or for periodic quality checks.
---

# UI/UX Review Workflow

When triggered by `/review-ui`, follow these steps:

## Step 1: Detect Frontend Changes

Run `git diff --name-only HEAD~1` (or `git diff --name-only origin/main` for PR review).

Filter only frontend files matching these patterns:

- `src/blocks/**` — Content blocks
- `src/heros/**` — Hero components
- `src/app/(frontend)/**` — Frontend pages
- `src/components/**` — Shared UI components

If no frontend files changed, inform the user: "ไม่มีไฟล์ frontend ที่เปลี่ยนแปลงครับ"

## Step 2: Read the UI/UX Skill

Read the SKILL.md file at `.agents/skills/ui-ux-pro-max/SKILL.md` to load the full checklist and rules.

## Step 3: Read Changed Files

Read each changed frontend file to understand the UI code.

## Step 4: Run Quality Checks

Review each changed file against the **Pre-Delivery Checklist** from the skill (Priority 1-10):

### CRITICAL Checks (Must Pass)

1. **Accessibility** — Contrast 4.5:1, alt text, keyboard nav, aria-labels
2. **Touch & Interaction** — Min size 44×44px, 8px+ spacing, loading feedback

### HIGH Checks

3. **Performance** — WebP/AVIF, lazy loading, CLS < 0.1
4. **Style Selection** — Consistent style, SVG icons (no emoji), palette match
5. **Layout & Responsive** — Mobile-first, viewport meta, no horizontal scroll

### MEDIUM Checks

6. **Typography & Color** — Base 16px, line-height 1.5, semantic color tokens
7. **Animation** — Duration 150-300ms, motion conveys meaning
8. **Forms & Feedback** — Visible labels, error near field, progressive disclosure

### HIGH Checks

9. **Navigation Patterns** — Predictable back, bottom nav ≤5, deep linking

## Step 5: Generate Report

Output a markdown report:

```
## 🎨 UI/UX Review Report

### Files Reviewed
- `src/blocks/Feature/design-42.tsx` — Feature block
- `src/components/TourCard.tsx` — Tour card component

### Results

| # | Check | Status | Details |
|---|-------|--------|---------|
| 1 | Accessibility | ✅ Pass | Contrast OK, alt text present |
| 2 | Touch targets | ⚠️ Warning | Button at line 45 is 36px, should be 44px |
| 3 | Performance | ✅ Pass | Images use lazy loading |
| 4 | Style consistency | ❌ Fail | Emoji used as icon at line 23 |
| ... | ... | ... | ... |

### Summary
- ✅ Pass: 7
- ⚠️ Warning: 2
- ❌ Fail: 1

### Recommended Fixes
1. Replace emoji ⭐ with Lucide `<Star />` icon at `TourCard.tsx:23`
2. Increase button size to 44px at `design-42.tsx:45`
```

## Step 6: Offer Auto-Fix

If there are fixable issues (e.g., emoji → SVG, missing alt text), ask the user:
"พบ [N] จุดที่แก้ได้อัตโนมัติ ต้องการให้แก้เลยไหมครับ?"

If yes, apply fixes and show the diff.

## Step 7: Optional Deep Scan

If the user wants a deeper analysis, run the skill's search tool:

```bash
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "accessibility touch interaction" --domain ux
```

This provides detailed recommendations beyond the checklist.
