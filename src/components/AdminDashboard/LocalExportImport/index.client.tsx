'use client'
import { useState, useRef } from 'react'
import { Button } from '@payloadcms/ui'
import { exportDatabase, importDatabase } from './actions'

export const ExportButton: React.FC<{ includeMedia: boolean }> = ({ includeMedia }) => {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const result = await exportDatabase(includeMedia)

      // Create download link
      let blob: Blob
      if (result.contentType === 'application/gzip') {
        // Convert base64 to blob for tar.gz
        const byteCharacters = atob(result.data)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        blob = new Blob([byteArray], { type: result.contentType })
      } else {
        blob = new Blob([result.data], { type: result.contentType })
      }

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = result.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please check the console for details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleExport} disabled={loading}>
      {loading ? 'Exporting...' : includeMedia ? 'Export with Media' : 'Export Database'}
    </Button>
  )
}

export const ImportButton: React.FC<{ mergeData: boolean }> = ({ mergeData }) => {
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const isJson = file.name.endsWith('.json')
      const isTarGz = file.name.endsWith('.tar.gz') || file.name.endsWith('.gz')

      if (!isJson && !isTarGz) {
        alert('Please upload a .json or .tar.gz file')
        return
      }

      let fileContent: string

      if (isTarGz) {
        // Read as base64 for binary file
        const arrayBuffer = await file.arrayBuffer()
        const bytes = new Uint8Array(arrayBuffer)
        let binary = ''
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i])
        }
        fileContent = btoa(binary)
      } else {
        // Read as text for JSON
        fileContent = await file.text()
      }

      const result = await importDatabase(fileContent, isTarGz ? 'tar.gz' : 'json', mergeData)
      if (result?.success) {
        alert('Import สำเร็จแล้ว! กำลังรีเฟรชหน้า...')
        window.location.reload()
      }
    } catch (error) {
      console.error('Import failed:', error)
      alert('Import failed. Please check the console for details.')
    } finally {
      setLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="import-button-wrapper">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.tar.gz,.gz"
        onChange={handleImport}
        style={{ display: 'none' }}
        id="import-file-input"
      />
      <Button onClick={() => fileInputRef.current?.click()} disabled={loading}>
        {loading ? 'Importing...' : mergeData ? 'Import (Merge)' : 'Import Database'}
      </Button>
    </div>
  )
}

export const IncludeMediaToggle: React.FC<{
  checked: boolean
  onChange: (checked: boolean) => void
}> = ({ checked, onChange }) => {
  return (
    <label className="include-media-toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>Include Media Files</span>
    </label>
  )
}

export const MergeDataToggle: React.FC<{
  checked: boolean
  onChange: (checked: boolean) => void
}> = ({ checked, onChange }) => {
  return (
    <label className="merge-data-toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>Merge with existing data (don&apos;t delete)</span>
    </label>
  )
}
