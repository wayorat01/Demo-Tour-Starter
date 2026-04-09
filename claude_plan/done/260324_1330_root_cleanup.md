# Plan: Root-Level Cleanup & Code Quality

- **ID:** 260324_1330
- **Status:** Pending
- **Priority:** Medium
- **Complexity:** Routine
- **Touches:** Root directory files (untrack/move/delete), `eslint.config.mjs`, `src/blocks/Login/Login3.tsx`
- **Conflicts with:** None
- **Parallel-safe:** Yes

## Context

The project root contains 25+ orphan files: scratch query scripts, test artifacts, debug dumps, empty files, and build outputs. Many are already covered by `.gitignore` rules but were committed before the rules existed. This plan also absorbs the `.env` untracking from the old Plan 1300.

## Steps

1. [ ] **Untrack all files that `.gitignore` already covers**:

   ```bash
   git rm --cached .env package-lock.json japan_test.jpg ts_errors.log tsconfig.tsbuildinfo test-import.csv test-import2.csv collections.json loadcountry.json about-us-page.html
   ```

   Human handles password rotation separately (TASK-001).

2. [ ] **Move useful scripts to `scripts/`**:

   ```bash
   mv query-mongo.ts query-mongo-lexical.ts query-payload.ts scripts/
   mv add-header-menu.ts update-api-menu.ts update-mongo.ts log-menu.ts log-menu-details.ts scripts/
   mv get-api-config.ts test-combined.ts test-search.ts scripts/
   mv check_header.js scripts/
   ```

   Delete the redundant duplicates: `query-mongo2.ts`, `query-mongo3.ts`, `query-mongo4.ts`.

3. [ ] **Delete empty/abandoned files**:

   ```bash
   rm header_raw.json patched-pages.json conflicts.txt
   ```

4. [ ] **Remove production `console.log`** from `src/blocks/Login/Login3.tsx` (line ~60):

   ```
   console.log('Login successful', result)  ← remove
   ```

5. [ ] **Add `no-console` ESLint rule** to `eslint.config.mjs`:

   ```js
   'no-console': ['warn', { allow: ['warn', 'error'] }]
   ```

6. [ ] **Verify clean root**:
   ```bash
   git ls-files .env  # should be empty
   ls *.ts *.js *.json *.csv *.jpg *.html *.txt *.log 2>/dev/null
   ```
   Expected: only config files remain.

## Verification

| Step | Command                                                    | Expected              |
| ---- | ---------------------------------------------------------- | --------------------- |
| 1    | `git ls-files .env package-lock.json japan_test.jpg`       | Empty                 |
| 2    | `ls scripts/query-mongo.ts`                                | File exists           |
| 3    | `ls header_raw.json patched-pages.json conflicts.txt 2>&1` | "No such file"        |
| 6    | `ls *.ts *.html *.txt 2>/dev/null`                         | Only config .ts files |

## Execution Notes

- **Status:** Completed
- **Executed by:** Antigravity AI
- **Timestamp:** 2026-03-24T13:34:15+07:00
- **What was done:** Untracked gitignored files, moved utility scripts to `scripts/`, deleted abandoned/empty files, removed `console.log` from `Login3.tsx`, and added `no-console` rule to `eslint.config.mjs`.
- **Deviations from plan:** None
- **Issues encountered:** None

### Verification Results

| Step | Command                                                    | Expected              | Actual                         | Status |
| ---- | ---------------------------------------------------------- | --------------------- | ------------------------------ | ------ |
| 1    | `git ls-files .env package-lock.json japan_test.jpg`       | Empty                 | verified empty                 | Pass   |
| 2    | `ls scripts/query-mongo.ts`                                | File exists           | verified exists                | Pass   |
| 3    | `ls header_raw.json patched-pages.json conflicts.txt 2>&1` | "No such file"        | No such file                   | Pass   |
| 6    | `ls *.ts *.html *.txt 2>/dev/null`                         | Only config .ts files | Only top-level config ts files | Pass   |
