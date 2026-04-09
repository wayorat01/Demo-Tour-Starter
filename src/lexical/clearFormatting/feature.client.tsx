'use client'

import { createClientFeature } from '@payloadcms/richtext-lexical/client'
import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  type TextNode,
} from 'lexical'
import { ClearFormattingIcon } from './icon'

/**
 * ล้าง format ทั้งหมดของ TextNode:
 * - format (bold, italic, underline, strikethrough, code, subscript, superscript)
 * - style (inline CSS)
 * - TextState $ (color, background จาก TextStateFeature)
 * - mode (normal, token, segmented)
 *
 * วิธีการ: แทนที่ node เดิมด้วย TextNode ใหม่ที่มีแค่ text เปล่าๆ
 * ทำให้มั่นใจได้ว่า property ทุกอย่างถูกล้างหมด
 */
function $clearAllFormatting(node: TextNode): void {
  // สร้าง TextNode ใหม่ที่สะอาดหมดจด (แค่ text ล้วนๆ)
  const text = node.getTextContent()
  const newNode = $createTextNode(text)

  // แทนที่ node เดิมด้วย node ใหม่ที่ไม่มี format ใดๆ
  node.replace(newNode)

  // Select node ใหม่เพื่อให้ cursor อยู่ที่เดิม
  newNode.select()
}

const clearFormattingHandler = ({ editor }: { editor: any }) => {
  editor.update(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      const nodes = selection.getNodes()
      for (const node of nodes) {
        if ($isTextNode(node)) {
          $clearAllFormatting(node)
        }
      }
    }
  })
}

export const ClearFormattingFeatureClient = createClientFeature({
  toolbarFixed: {
    groups: [
      {
        type: 'buttons',
        items: [
          {
            ChildComponent: ClearFormattingIcon,
            key: 'clearFormatting',
            label: () => 'ล้าง Format',
            onSelect: clearFormattingHandler,
            order: 8,
          },
        ],
        key: 'clearFormatting',
        order: 50,
      },
    ],
  },
  toolbarInline: {
    groups: [
      {
        type: 'buttons',
        items: [
          {
            ChildComponent: ClearFormattingIcon,
            key: 'clearFormatting',
            label: () => 'ล้าง Format',
            onSelect: clearFormattingHandler,
            order: 8,
          },
        ],
        key: 'clearFormatting',
        order: 50,
      },
    ],
  },
})
