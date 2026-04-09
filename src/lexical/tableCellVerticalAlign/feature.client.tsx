'use client'

import { createClientFeature } from '@payloadcms/richtext-lexical/client'
import { $getSelection, $isRangeSelection, type LexicalNode } from 'lexical'
import { AlignTopIcon, AlignMiddleIcon, AlignBottomIcon } from './icons'

// Helper to find the closest table cell node (td/th) from a lexical node
function $findTableCellNode(node: LexicalNode): LexicalNode | null {
  let current: LexicalNode | null = node
  while (current) {
    if (current.getType() === 'tablecell') {
      return current
    }
    current = current.getParent()
  }
  return null
}

// Get vertical-align value from a table cell node's style
function getVerticalAlign(cellNode: LexicalNode): string {
  const style = (cellNode as any).getStyle?.() || ''
  const match = style.match(/vertical-align:\s*([^;]+)/)
  return match ? match[1].trim() : 'top'
}

// Replace or add vertical-align in a CSS style string
function replaceVerticalAlign(style: string, value: string): string {
  const cleaned = style.replace(/vertical-align:\s*[^;]+;?/g, '').trim()
  const separator = cleaned && !cleaned.endsWith(';') ? '; ' : cleaned ? ' ' : ''
  return `${cleaned}${separator}vertical-align: ${value};`
}

export const TableCellVerticalAlignFeatureClient = createClientFeature({
  toolbarFixed: {
    groups: [
      {
        type: 'buttons',
        items: [
          {
            ChildComponent: AlignTopIcon,
            key: 'tableCellAlignTop',
            label: () => 'จัดชิดบน',
            onSelect: ({ editor }) => {
              editor.update(() => {
                const selection = $getSelection()
                if ($isRangeSelection(selection)) {
                  const cellNode = $findTableCellNode(selection.anchor.getNode())
                  if (cellNode && (cellNode as any).setStyle) {
                    const existingStyle = (cellNode as any).getStyle() || ''
                    ;(cellNode as any).setStyle(replaceVerticalAlign(existingStyle, 'top'))
                  }
                }
              })
            },
            isActive: ({ selection }) => {
              if (!$isRangeSelection(selection)) return false
              const cellNode = $findTableCellNode(selection.anchor.getNode())
              if (!cellNode) return false
              return getVerticalAlign(cellNode) === 'top'
            },
            order: 1,
          },
          {
            ChildComponent: AlignMiddleIcon,
            key: 'tableCellAlignMiddle',
            label: () => 'จัดกึ่งกลาง',
            onSelect: ({ editor }) => {
              editor.update(() => {
                const selection = $getSelection()
                if ($isRangeSelection(selection)) {
                  const cellNode = $findTableCellNode(selection.anchor.getNode())
                  if (cellNode && (cellNode as any).setStyle) {
                    const existingStyle = (cellNode as any).getStyle() || ''
                    ;(cellNode as any).setStyle(replaceVerticalAlign(existingStyle, 'middle'))
                  }
                }
              })
            },
            isActive: ({ selection }) => {
              if (!$isRangeSelection(selection)) return false
              const cellNode = $findTableCellNode(selection.anchor.getNode())
              if (!cellNode) return false
              return getVerticalAlign(cellNode) === 'middle'
            },
            order: 2,
          },
          {
            ChildComponent: AlignBottomIcon,
            key: 'tableCellAlignBottom',
            label: () => 'จัดชิดล่าง',
            onSelect: ({ editor }) => {
              editor.update(() => {
                const selection = $getSelection()
                if ($isRangeSelection(selection)) {
                  const cellNode = $findTableCellNode(selection.anchor.getNode())
                  if (cellNode && (cellNode as any).setStyle) {
                    const existingStyle = (cellNode as any).getStyle() || ''
                    ;(cellNode as any).setStyle(replaceVerticalAlign(existingStyle, 'bottom'))
                  }
                }
              })
            },
            isActive: ({ selection }) => {
              if (!$isRangeSelection(selection)) return false
              const cellNode = $findTableCellNode(selection.anchor.getNode())
              if (!cellNode) return false
              return getVerticalAlign(cellNode) === 'bottom'
            },
            order: 3,
          },
        ],
        key: 'tableCellVerticalAlign',
        order: 45,
      },
    ],
  },
})
