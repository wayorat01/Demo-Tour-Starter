---
description: Git workflow automation with PR summary. Trigger with "อัพเดตงาน", "update work", "push code", "ส่งงาน", or /git-push
---

# Git Push Workflow (Secretary Mode)

When triggered, autonomously execute this Git workflow via terminal step-by-step:

## Step 1: Branch Check

Run `git branch --show-current`.

- **Case A (Already on `tour/[name]`):** Proceed immediately to Step 2 WITHOUT asking for confirmation.
- **Case B (On `main` or other non-personal branch):** STOP and ask:
  "⚠️ ตอนนี้คุณอยู่ที่ branch [current_branch] รบกวนพิมพ์ชื่อย่อของคุณครับ (เช่น aou, gig) เพื่อนำงานที่ทำอยู่สลับไปที่ branch `tour/[ชื่อคุณ]`"
  → **WAIT for user reply.**
  - After reply, run `git branch --list`. If `tour/[name]` EXISTS, run `git checkout tour/[name]`. If DOES NOT exist, run `git checkout -b tour/[name]`.

## Step 2: Pre-Commit Quality Check & Auto-Commit

// turbo

1. Run `pnpm run lint` and `pnpm run build` to ensure there are no TypeScript errors, ESLint warnings/errors, or leftover `console.log` statements.
2. If the checks fail, STOP and fix the issues BEFORE continuing. DO NOT bypass this check unless instructed by the user.
3. Run `git add .`
4. Analyze changes with `git diff --staged`
5. Generate a commit message following the **Commit Message Template** below
6. Run `git commit -m "[message]"`

### Commit Message Template

**ALWAYS** use this full format — every commit must have What and Why:

```
type(scope): short description (max 72 chars)

What:
- Specific change 1
- Specific change 2

Why: Motivation or context

Co-authored-by: Gemini 2.5 Pro <noreply@google.com>
```

**Example:**

```
fix(nav): correct mobile menu z-index overlap

What:
- Set navbar z-index to 50 (was 10)
- Add backdrop blur to mobile menu overlay

Why: Menu was hidden behind hero banner on iPhone Safari.

Co-authored-by: Gemini 2.5 Pro <noreply@google.com>
```

> **Rule:** Never use single-line commits (e.g. `git commit -m "fix stuff"`). Always include the body with What/Why.

### Commit Types

| Type       | When to use           | Example                                    |
| ---------- | --------------------- | ------------------------------------------ |
| `feat`     | New feature           | `feat(tour): add booking calendar`         |
| `fix`      | Bug fix               | `fix(nav): correct mobile menu z-index`    |
| `docs`     | Documentation only    | `docs: update deployment guide`            |
| `refactor` | Code restructure      | `refactor(blocks): simplify hero variants` |
| `test`     | Adding/updating tests | `test(seo): add meta tag validation`       |
| `chore`    | Maintenance/config    | `chore(deps): update payload to 3.x`       |
| `style`    | Formatting, no logic  | `style: fix prettier warnings`             |
| `perf`     | Performance           | `perf(images): optimize lazy loading`      |

### Scope Examples (this project)

Common scopes: `tour`, `nav`, `hero`, `footer`, `blocks`, `seed`, `seo`, `deps`, `ci`

> **Rule:** Always include `Co-authored-by: Gemini 2.5 Pro <noreply@google.com>` when AI generates or assists with the commit.

## Step 3: Rebase & Sync

Use **rebase** (not merge/pull) to keep a clean, linear history:

```bash
git fetch origin
git rebase origin/main
```

- **If rebase succeeds:** Proceed to Step 4.
- **If conflict occurs:** STOP immediately and notify the user:
  "⚠️ มี conflict ระหว่าง rebase ครับ กรุณา resolve แล้วรัน `git rebase --continue` หรือ `git rebase --abort` เพื่อยกเลิก"

> **Why rebase?** Creates a clean, linear commit history. No unnecessary merge commits cluttering the log.

## Step 4: Generate PR Summary (Secretary Mode)

- Analyze the unpushed commits or use `git diff origin/main` to understand ALL changes the user made.
- Print a beautifully formatted PR Description to the terminal (DO NOT write to any files). Format:

📋 **ก๊อปปี้ข้อความด้านล่างนี้ไปแปะตอนเปิด PR บน GitHub ได้เลยครับ:**

🏷️ **PR Title (English):** `type(scope): short description` (follow Conventional Commits)

📝 **รายละเอียดการอัปเดต:** [Bullet points of new features, fixes, or Payload changes in Thai]

📁 **ไฟล์หลักที่แก้ไข:** [Short list of key files modified]

## Step 5: Push & Create PR Link

- Run `git push -u origin tour/[user_name]`.
- If push is rejected (remote has new commits), run:
  ```bash
  git fetch origin
  git rebase origin/tour/[user_name]
  git push -u origin tour/[user_name]
  ```
- **NEVER use `git push --force`.** Use `git push --force-with-lease` only as a last resort after rebase.
- Generate PR URL: `https://github.com/kanokorngig-gig/wowtour-gig/compare/main...tour/[user_name]?expand=1`
- Reply in Thai:
  "🚀 ดันโค้ดขึ้น branch `tour/[user_name]` เรียบร้อยครับ!
  👉 คลิกที่ลิงก์นี้เพื่อเปิด Pull Request: [PR_LINK]
  (อย่าลืมก๊อปปี้สรุปงานด้านบนไปแปะตอนเปิด PR ด้วยนะครับ!)"

## Step 6: Update Docs (Optional)

After pushing, ask the user: "ต้องการอัปเดต docs ด้วยไหมครับ?" If yes, run the `/update-docs` workflow.

---

## Critical Rules

| Rule                                | Reason                                           |
| ----------------------------------- | ------------------------------------------------ |
| **NEVER commit to `main` directly** | Prevents accidental production changes           |
| **NEVER merge PRs yourself**        | Only humans approve and merge                    |
| **NEVER use `git push --force`**    | Use `--force-with-lease` instead                 |
| **ALWAYS use rebase over merge**    | Keeps commit history clean and linear            |
| **ALWAYS use Conventional Commits** | Consistent, parseable commit messages            |
| **ALWAYS include Co-authored-by**   | AI contribution audit trail                      |
| **REQUIRE clean QA before commit**  | Must pass `lint` & `build` to avoid CI breakages |

## Quick Recovery

| Situation                     | Command                                       |
| ----------------------------- | --------------------------------------------- |
| Uncommitted changes on main   | `git stash` → create branch → `git stash pop` |
| Undo last commit (keep files) | `git reset --soft HEAD~1`                     |
| Abort failed rebase           | `git rebase --abort`                          |
| Find lost commits             | `git reflog`                                  |
