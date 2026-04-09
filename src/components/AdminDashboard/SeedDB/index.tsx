'use client'
import './index.scss'
import { useState, useEffect } from 'react'
import { Collapsible } from '@payloadcms/ui'
import { GenerateSeedButton, ApplySeedButton } from './index.client'
import { getSeedFileInfo } from './actions'
import { useAuth } from '@payloadcms/ui'
import { checkRole } from '@/utilities/checkRole'

const SeedDB: React.FC = () => {
  const { user } = useAuth()
  const [seedInfo, setSeedInfo] = useState<{
    exists: boolean
    size?: number
    modified?: Date
    seedFile?: string
    commitHash?: string
    source?: string
  } | null>(null)

  useEffect(() => {
    getSeedFileInfo().then((info) => {
      setSeedInfo(info)
    })
  }, [])

  // Only show SeedDB to users with the 'admin' role
  if (!user || !checkRole(['admin'], user as any)) {
    return null
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="seed-db">
      <h2>
        🌱 SeedDB <span className="badge">Team Sync</span>
      </h2>
      <p className="description">จัดการ Seed Data สำหรับทีม - ทุกคนจะมีข้อมูลเริ่มต้นเหมือนกัน</p>
      {seedInfo?.seedFile && (
        <p className="description" style={{ fontSize: '0.85em', opacity: 0.8 }}>
          📄 Seed File: <code>{seedInfo.seedFile}</code>
        </p>
      )}

      {/* Seed File Status */}
      {seedInfo && (
        <div className="seed-info">
          <div className="info-row">
            <span className="label">📁 Seed File (S3 Bucket):</span>
            <span className={`value ${seedInfo.exists ? 'status-ok' : 'status-missing'}`}>
              {seedInfo.exists ? '✅ พร้อมใช้งาน' : '⚠️ ยังไม่มี seed file บน S3'}
            </span>
          </div>
          {seedInfo.exists && seedInfo.size && (
            <div className="info-row">
              <span className="label">📦 Size:</span>
              <span className="value">{formatSize(seedInfo.size)}</span>
            </div>
          )}
          {seedInfo.exists && seedInfo.modified && (
            <div className="info-row">
              <span className="label">🕐 Updated:</span>
              <span className="value">{formatDate(seedInfo.modified)}</span>
            </div>
          )}
          {seedInfo.exists && seedInfo.commitHash && (
            <div className="info-row">
              <span className="label">🔗 Commit:</span>
              <span className="value">
                <code>{seedInfo.commitHash}</code>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Two-column action cards */}
      <div className="seed-action-cards">
        {/* Generate Card */}
        <div className="seed-card">
          <div className="seed-card-header">
            <h3>📤 Export Seed</h3>
            <small>สร้าง seed file จากข้อมูลปัจจุบัน → อัปโหลดขึ้น S3</small>
          </div>
          <div className="seed-card-body">
            <p>
              Export ข้อมูลทั้งหมดใน DB (pages, media, forms, ฯลฯ) เป็นไฟล์{' '}
              <code>seed-data.tar.gz</code> เพื่อแชร์ให้ทีม
            </p>
            <GenerateSeedButton />
          </div>
        </div>

        {/* Apply Card */}
        <div className="seed-card seed-card--wide">
          <div className="seed-card-header">
            <h3>📥 Import Seed</h3>
            <small>ดาวน์โหลด seed file จาก S3 → นำเข้าข้อมูล</small>
          </div>
          <div className="seed-card-body">
            <ApplySeedButton />
          </div>
        </div>
      </div>

      <Collapsible header="📖 คู่มือการใช้งาน SeedDB" initCollapsed={true}>
        <div className="guide-section">
          <div className="guide-note">
            💡 <strong>หมายเหตุ:</strong> ตั้งแต่เวอร์ชันนี้ Apply Seed จะ{' '}
            <strong>ไม่ลบข้อมูลที่มีอยู่</strong> โดย default อีกต่อไป — ข้อมูลที่คุณทำอยู่จะไม่หาย!
          </div>

          {/* ==================== โหมด Apply ==================== */}
          <div className="guide-subsection">
            <h4>📋 โหมด Apply — เลือกวิธีจัดการข้อมูล</h4>
            <p className="guide-desc">
              เมื่อกดปุ่ม Apply Seed คุณสามารถเลือกโหมดได้ว่าจะจัดการข้อมูลอย่างไร:
            </p>
            <ul className="steps">
              <li>
                <span className="step-number">⏱️</span>
                <span className="step-content">
                  <strong>Merge: Keep Newer (แนะนำ)</strong>
                  <br />
                  เปรียบเทียบ <code>วันที่แก้ไข</code> ของแต่ละหน้า →{' '}
                  <strong>เก็บตัวที่ใหม่กว่าเสมอ</strong>
                  <br />
                  <small>
                    เช่น หน้า &quot;ติดต่อเรา&quot; ใน local แก้เมื่อวาน แต่ seed แก้วันนี้ → ใช้
                    seed / ถ้า local แก้วันนี้ → เก็บ local
                  </small>
                </span>
              </li>
              <li>
                <span className="step-number">➕</span>
                <span className="step-content">
                  <strong>Merge: Keep Local</strong>
                  <br />
                  เพิ่มเฉพาะข้อมูลใหม่จาก seed, <strong>ไม่แตะข้อมูลเดิมเลย</strong>
                  <br />
                  <small>
                    เช่น มีหน้า &quot;ติดต่อเรา&quot; อยู่แล้ว → ข้ามไป / มีหน้า
                    &quot;โปรแกรมทัวร์ใหม่&quot; ใน seed แต่ local ไม่มี → เพิ่มให้
                  </small>
                </span>
              </li>
              <li>
                <span className="step-number">🔀</span>
                <span className="step-content">
                  <strong>Merge: Prefer Seed</strong>
                  <br />
                  ทับข้อมูลเดิมด้วย seed ทุกตัว + เพิ่มข้อมูลใหม่ แต่{' '}
                  <strong>ไม่ลบข้อมูลที่มีแค่ใน local</strong>
                  <br />
                  <small>
                    เช่น หน้า &quot;ทดสอบ&quot; มีแค่ใน local → ยังอยู่ / หน้า &quot;ติดต่อเรา&quot;
                    มีทั้งสองฝั่ง → เอาของ seed
                  </small>
                </span>
              </li>
              <li>
                <span className="step-number">🔄</span>
                <span className="step-content">
                  <strong>Replace All ⚠️</strong>
                  <br />
                  ลบข้อมูลทั้งหมดแล้วใส่ seed ใหม่ — <strong>ข้อมูล local ทั้งหมดจะหาย!</strong>
                  <br />
                  <small>ใช้เฉพาะตอน setup ครั้งแรก หรือต้องการ reset ข้อมูลทั้งหมด</small>
                </span>
              </li>
            </ul>
          </div>

          {/* ==================== เลือก Collection ==================== */}
          <div className="guide-subsection">
            <h4>📦 เลือก Collections — import เฉพาะที่ต้องการ</h4>
            <p className="guide-desc">
              ก่อนกด Apply จะมี checkbox ให้เลือกว่าจะ import collection ไหนบ้าง:
            </p>
            <ul className="steps">
              <li>
                <span className="step-number">✅</span>
                <span className="step-content">
                  <strong>เลือกทั้งหมด (default)</strong> — import ทุก collection ที่มีใน seed
                </span>
              </li>
              <li>
                <span className="step-number">☑️</span>
                <span className="step-content">
                  <strong>เลือกบางตัว</strong> — เช่น ติ๊กแค่ <code>pages</code> กับ{' '}
                  <code>media</code> ← collection ที่ไม่ได้เลือกจะไม่ถูกแตะเลย
                </span>
              </li>
            </ul>
          </div>

          {/* ==================== Globals Protection ==================== */}
          <div className="guide-subsection">
            <h4>🛡️ Globals Protection — ปกป้องการตั้งค่าที่ customize ไว้</h4>
            <p className="guide-desc">
              Globals เช่น Header, Footer, Theme Config แต่ละคนมักจะ customize ต่างกัน จึง{' '}
              <strong>default ไม่ import</strong> เพื่อป้องกันโดนทับ:
            </p>
            <ul className="steps">
              <li>
                <span className="step-number">🛡️</span>
                <span className="step-content">
                  <strong>ติ๊ก ✓ = ปกป้อง (ไม่ import)</strong> — ข้อมูล local ของ global
                  นั้นจะไม่ถูกแตะ
                </span>
              </li>
              <li>
                <span className="step-number">⬜</span>
                <span className="step-content">
                  <strong>ไม่ติ๊ก = import จาก seed</strong> — ถ้าอยาก sync global บางตัวจาก seed
                  ให้เอาติ๊กออก
                </span>
              </li>
            </ul>
            <p className="guide-desc">
              Default ปกป้อง: <code>Header</code>, <code>Footer</code>, <code>Theme Config</code>,{' '}
              <code>Company Info</code>, <code>Page Config</code>
            </p>
          </div>

          {/* ==================== Workflow ==================== */}
          <div className="guide-subsection">
            <h4>🆕 Developer ใหม่เข้าโปรเจค</h4>
            <ul className="steps">
              <li>
                <span className="step-number">1</span>
                <span className="step-content">
                  Clone repo และรัน <code>pnpm install</code>
                </span>
              </li>
              <li>
                <span className="step-number">2</span>
                <span className="step-content">
                  Copy <code>.env.example</code> → <code>.env</code> และตั้งค่า MongoDB
                </span>
              </li>
              <li>
                <span className="step-number">3</span>
                <span className="step-content">
                  กดปุ่ม <strong>📥 Apply Seed</strong> เลือกโหมด <strong>Replace All</strong>{' '}
                  (ครั้งแรกไม่มีข้อมูลอยู่แล้ว)
                </span>
              </li>
              <li>
                <span className="step-number">4</span>
                <span className="step-content">✅ พร้อมทำงาน! มีข้อมูลเหมือนทีม</span>
              </li>
            </ul>
          </div>

          <div className="guide-subsection">
            <h4>🔄 ดึง Seed จากทีม (ใช้เป็นประจำ)</h4>
            <ul className="steps">
              <li>
                <span className="step-number">1</span>
                <span className="step-content">
                  กดปุ่ม <strong>📥 Apply Seed</strong> ด้วยโหมด <strong>Merge: Keep Newer</strong>{' '}
                  (ดึงข้อมูลจาก S3 อัตโนมัติ)
                </span>
              </li>
              <li>
                <span className="step-number">2</span>
                <span className="step-content">
                  ✅ ได้ข้อมูลใหม่จากทีม + ข้อมูลที่ทำอยู่ยังอยู่ครบ!
                </span>
              </li>
            </ul>
          </div>

          <div className="guide-subsection">
            <h4>📤 Seed Owner อัปเดต Seed ให้ทีม</h4>
            <ul className="steps">
              <li>
                <span className="step-number">1</span>
                <span className="step-content">แก้ไขข้อมูลบน Payload Admin ตามต้องการ</span>
              </li>
              <li>
                <span className="step-number">2</span>
                <span className="step-content">
                  กดปุ่ม <strong>🌱 Generate Seed</strong> รอจน toast สีเขียว (ระบบจะอัปโหลดขึ้น S3
                  ให้)
                </span>
              </li>
            </ul>
          </div>

          <div className="warning-box">
            <div className="warning-title">⚠️ ข้อควรระวัง</div>
            <ul>
              <li>
                <strong>Seed Owner ควรมีคนเดียว</strong> — หลีกเลี่ยง generate seed ทับกัน
              </li>
              <li>
                <strong>คนอื่นไม่ต้อง generate seed</strong> — แค่กด Apply Seed ระบบจะดึงจาก S3
                ให้เอง
              </li>
              <li>
                <strong>ใช้ Merge: Keep Newer เป็นหลัก</strong> — ปลอดภัยที่สุดสำหรับทีม
              </li>
              <li>
                <strong>Replace All ใช้เฉพาะ setup ครั้งแรก</strong> — จะลบข้อมูลทั้งหมด!
              </li>
            </ul>
          </div>
        </div>
      </Collapsible>
    </div>
  )
}

export default SeedDB
