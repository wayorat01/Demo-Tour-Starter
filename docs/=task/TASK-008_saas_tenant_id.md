# TASK-008: SaaS Migration — System-wide Tenant ID Implementation

## 📌 ภาพรวม (Overview)
ปัจจุบัน Payload CMS ทำงานแบบ Single-Tenant (1 เว็บไซต์ / 1 ฐานข้อมูล) การจะก้าวเข้าสู่ B2B SaaS จำเป็นต้องปรับโครงสร้างฐานข้อมูลและระบบ Access Control ทั้งหมดให้รองรับการแยกข้อมูลของแต่ละ Agent (Multi-Tenant)

## 🎯 สิ่งที่ต้องดำเนินการ (Action Items)

### 1. Database Schema
- **เพิ่มฟิลด์ `tenantId` (หรือ `agentId`)** ในคอลเลกชันหลักทั้งหมด:
  - `Bookings`
  - `CompanyInfo` (หรือแยก Config ออกตาม Tenant)
  - `Media` (แยกสิทธิ์การเข้าถึงรูปภาพ)
- ควรพิจารณาใช้ Global Hook เพื่อเติม `tenantId` อัตโนมัติตอน Create

### 2. Access Control
- ปรับปรุงไฟล์ Access Control ทั้งหมดให้ตรวจสอบสิทธิ์ผ่าน Tenant:
  - ตัวอย่าง: ให้ Agent เห็นเฉพาะ Booking ที่ `tenantId === user.tenantId`
  - Super Admin สามารถดูได้ทุก Tenant

### 3. API Changes
- แก้ไข Frontend API (เช่น Booking Route) ให้แนบ `tenantId` มากับ Request หรืออ่านจาก Session

### 4. Payload Config
- ศึกษาเรื่อง **Tenancy ใน Payload CMS 3.x** ว่าใช้แนวทางใดดีที่สุด (เช่น Document-level tenancy ด้วยฟิลด์อ้างอิง)

## ⏱️ ความเร่งด่วน
**เก็บไว้ทำตอนขึ้น Phase 2 (SaaS Migration)** — ตอนนี้ข้ามไปก่อนเพื่อโฟกัสที่ฟีเจอร์หลักของ Agent Starter
