---
description: สรุปงานตอนจบวัน + สร้าง handoff note ส่งต่อให้ session/เครื่องถัดไป Trigger ด้วย "สรุปงาน", "handoff", "จบงานวันนี้", หรือ /handoff
---

# Handoff — สรุปงานจบวัน

เมื่อ trigger ให้ทำตามขั้นตอนนี้:

## Step 1: วิเคราะห์สิ่งที่ทำวันนี้

รวบรวมข้อมูลจาก 3 แหล่ง:

```bash
# commits วันนี้
git log --since="00:00" --oneline --all

# ไฟล์ที่เปลี่ยน
git diff --name-only HEAD~5

# งานที่ยังไม่ได้ commit
git status --short
```

## Step 2: สร้าง Handoff Note

สร้างไฟล์ที่ `ψ/inbox/handoff/YYYY-MM-DD_topic.md` โดยใช้ format:

```markdown
# 📋 สรุปงาน — DD เดือน YYYY

## ✅ สิ่งที่ทำเสร็จ

- [รายการสิ่งที่ทำ + ไฟล์ที่แก้]

## 🔄 กำลังทำอยู่ (ยังไม่เสร็จ)

- [งานที่ค้าง + สถานะ]

## 📋 งานต่อไป

- [สิ่งที่ต้องทำต่อ + ลำดับ]

## ⚠️ ข้อควรระวัง

- [ปัญหาที่พบ, สิ่งที่ต้องระวัง]
```

## Step 3: ถามว่าจะ commit + push

ถาม: "ต้องการ commit แล้ว push ขึ้น branch ด้วยมั้ยครับ?"

- **ถ้าใช่** → `git add ψ/` → commit → push (ไม่เปิด PR)
- **ถ้าไม่** → จบ
