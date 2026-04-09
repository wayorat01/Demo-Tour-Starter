---
description: Auto-detect code changes and update project documentation accordingly. Use after completing features, fixing bugs, or making architectural changes.
---

# Documentation Update Workflow

When triggered by `/update-docs`, follow these steps:

> **ภาษา:** เขียน docs ทั้งหมดเป็น**ภาษาไทย** เพราะทีมอ่านไทยเป็นหลัก ยกเว้นชื่อไฟล์, ชื่อ function, และ technical terms ที่ควรคงเป็นภาษาอังกฤษ

## Step 1: Detect Changes

Run `git diff --name-only HEAD~1` (or `git diff --staged --name-only` if changes are staged).
List all changed files.

## Step 2: Classify & Route

Based on changed files, determine which docs need updating:

| Changed files match                                                             | Action                             | Target doc                          |
| ------------------------------------------------------------------------------- | ---------------------------------- | ----------------------------------- |
| `src/collections/*.ts` or `src/globals/*/config.ts`                             | Update collection/global reference | `docs/architecture/collections.md`  |
| `src/utilities/fetch*.ts` or `src/app/**/api/**` or `src/globals/ApiSetting/**` | Update API integration docs        | `docs/architecture/external-api.md` |
| `src/blocks/` (new block type added)                                            | Document new block                 | `docs/guides/content-management.md` |
| `src/app/(frontend)/` (new page route)                                          | Document new route                 | `docs/guides/` (relevant guide)     |
| `src/heros/` (new hero variant)                                                 | Document new hero                  | `docs/guides/content-management.md` |
| Major architectural decision                                                    | Create new ADR                     | `docs/decisions/NNN-title.md`       |
| Any meaningful change                                                           | Add changelog entry                | `docs/changelog/YYYY-MM.md`         |

If none of the above match, inform the user that no doc updates are needed.

## Step 3: Read & Understand

For each file that needs updating:

1. Read the changed source files to understand WHAT changed and WHY
2. Read the current doc file to understand what's already documented
3. Determine if the doc needs: **new section**, **update existing section**, or **changelog entry only**

## Step 4: Update Docs

### For architecture/ and guides/ docs:

- Add or update the relevant section
- Keep the existing format and style
- Include file paths and code references

### For changelog/ entries:

Use this format:

```markdown
### YYYY-MM-DD — [type] Short title

- What changed
- Why it was changed
- Files affected: `path/to/file.ts`
```

Where `[type]` is one of: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`

### For decisions/ (ADR):

Use this format:

```markdown
# ADR-NNN: Title

## Status: Proposed | Accepted | Deprecated | Superseded

## Context

What is the issue?

## Decision

What did we decide?

## Rationale

Why this approach?

## Consequences

What are the tradeoffs?
```

## Step 5: Confirm

Show the user:

1. Which docs were updated (list file paths)
2. A brief summary of what was added/changed
3. Ask if they want to commit the doc changes together with code changes

## Reference: docs/ Structure

```
docs/
├── README.md              ← Index + update rules
├── architecture/          ← System overview (changes rarely)
│   ├── overview.md
│   ├── external-api.md
│   └── collections.md
├── guides/                ← How-to for developers
│   ├── content-management.md
│   ├── tour-management.md
│   ├── user-auth.md
│   ├── theme-config.md
│   ├── media-management.md
│   └── search-seo.md
├── decisions/             ← Architecture Decision Records
│   └── NNN-title.md
└── changelog/             ← Monthly change logs
    └── YYYY-MM.md
```
