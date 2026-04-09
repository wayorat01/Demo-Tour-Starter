# TASK-002: Decide /tour/ vs /intertour/ Route Strategy

- **Priority:** High
- **Assigned to:** Team WOW (human)
- **Related plan:** claude_plan/done/260324_1310_route_consolidation.md
- **Status:** Completed
- **Created:** 2026-03-24
- **Completed:** 2026-03-24

## Resolution

Option A was chosen (confirmed by existing redirects in `next.config.ts`). Antigravity deleted `src/app/(frontend)/tour/` and verified the build passes. All `/tour/` URLs redirect to `/intertour/` via permanent 301 redirects.

## Done When
- [x] Decision recorded (A, B, or C) — Option A
- [x] Antigravity executed Plan 260324_1310
