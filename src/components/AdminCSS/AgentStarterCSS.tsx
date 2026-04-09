'use client'
import React, { useEffect } from 'react'
import { useAuth } from '@payloadcms/ui'
import { hasPermission } from '@/access/isAgentStarter'

/**
 * Admin CSS Injection Component
 * ซ่อนปุ่ม UI สำหรับ Role ที่ไม่มีสิทธิ์จัดการดีไซน์ (canManageDesign = false):
 * - ปุ่มลาก Block (Drag handle)
 * - ปุ่มเพิ่ม Block (+)
 * - ปุ่มลบ Block
 * - ปุ่มสร้าง Page ใหม่
 */
const AgentStarterCSS: React.FC = () => {
  const { user } = useAuth()

  // ซ่อน Locale selector สำหรับทุก user (มีแค่ th ตัวเดียว ไม่จำเป็นต้องแสดง)
  useEffect(() => {
    const globalStyle = document.createElement('style')
    globalStyle.id = 'hide-locale-selector'
    globalStyle.textContent = `
      /* Hide locale selector everywhere since we enforce a single Thai language but need 'en' config for system stability */
    .base-payload .localizer,
    .base-payload [class*="localizer"],
    .base-payload [class*="locale-selector"],
    div[class*="document-controls"] button[class*="popup-button"] {
      display: none !important;
    }
    `
    document.head.appendChild(globalStyle)
    return () => {
      document.getElementById('hide-locale-selector')?.remove()
    }
  }, [])

  useEffect(() => {
    if (!user) return

    // หากไม่มีสิทธิ์จัดการดีไซน์ → ถึงจะซ่อน UI (อดีตคือ Agent Starter)
    const canManageDesign = hasPermission('canManageDesign', user as any)
    if (canManageDesign) return

    const style = document.createElement('style')
    style.id = 'agent-starter-restrictions'
    style.textContent = `
      /* ซ่อนปุ่มเพิ่ม Block (Add Block button) ใน layout blocks field */
      .blocks-field .blocks-field__drawer-toggler,
      .blocks-field__add-button,
      .blocks-field .blocks-field__addRow {
        display: none !important;
      }

      /* ซ่อน Drag Handle (ปุ่มลาก Block ขึ้นลง) */
      .blocks-field .collapsible__drag {
        display: none !important;
      }

      /* ซ่อนปุ่มลบ Block (Remove button) */
      .blocks-field .array-actions__action--remove,
      .blocks-field .blocks-field__removeButton,
      .blocks-field .collapsible__actions button[aria-label="Remove"] {
        display: none !important;
      }

      /* ซ่อนปุ่มสร้าง Page/Document ใหม่ ในหน้า list view ของ Pages */
      .collection-list--pages .list-controls__buttons .create-new-button,
      .collection-list--pages .collection-list__header .pill--has-action {
        display: none !important;
      }

      /* ซ่อนปุ่ม Duplicate ใน Document view */
      .blocks-field .collapsible__actions button[aria-label="Duplicate"],
      .blocks-field .array-actions__action--duplicate {
        display: none !important;
      }

      /* ซ่อนปุ่ม Move Up/Down */
      .blocks-field .array-actions__action--moveUp,
      .blocks-field .array-actions__action--moveDown {
        display: none !important;
      }
    `

    document.head.appendChild(style)

    return () => {
      const existingStyle = document.getElementById('agent-starter-restrictions')
      if (existingStyle) {
        existingStyle.remove()
      }
    }
  }, [user])

  return null
}

export default AgentStarterCSS
