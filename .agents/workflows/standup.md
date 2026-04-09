---
description: เริ่มวันใหม่ ดูสรุปงานทีมทุกคน เหมือน daily standup meeting Trigger ด้วย "เริ่มงาน", "daily", "standup", "recap", หรือ /standup
---

# Daily Standup — สรุปงานตอนเริ่มวัน

เมื่อ trigger ให้ทำตามขั้นตอนนี้:

## Step 1: ดึงข้อมูลล่าสุดจากทุกคน

```bash
git fetch --all
```

## Step 2: รวบรวมกิจกรรมของทีม

### 2a. Commits ล่าสุดจากทุก branch (24 ชม.)

```bash
git log --all --since="24 hours ago" --oneline --format="%h %an — %s" | head -30
```

### 2b. อ่าน Handoff Notes ล่าสุด

อ่านไฟล์ทั้งหมดใน `ψ/inbox/handoff/` ที่มีวันที่ล่าสุด (เมื่อวานหรือวันนี้)

### 2c. เช็ค PR ที่เปิดอยู่

```bash
gh pr list --state open 2>/dev/null || echo "gh CLI not available"
```

## Step 3: แสดงผลแบบ Daily Standup

แสดงสรุปในรูปแบบนี้:

```
☀️ Daily Standup — วันที่ DD เดือน YYYY

👤 [ชื่อ 1] (tour/[branch])
   ✅ เมื่อวาน: [สรุปจาก commits + handoff]
   📋 วันนี้: [งานที่ค้างจาก handoff]
   ⚠️ ติดปัญหา: [ถ้ามี]

👤 [ชื่อ 2] (tour/[branch])
   ✅ เมื่อวาน: [สรุปจาก commits]
   📋 วันนี้: [ถ้ามีข้อมูล]

📬 PR ที่รอ review:
   - #12 feat(tour): add booking — by [ชื่อ]

🔔 สิ่งที่ทีมควรรู้:
   - [ข้อควรระวังจาก handoff notes]
```

## Step 4: ถามว่ามีอะไรเพิ่ม

ถาม: "มีงานที่อยากเพิ่มหรืออัปเดตอะไรมั้ยครับ? หรือจะเริ่มทำงานเลย?"
