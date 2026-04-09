'use client'
import './index.scss'
import { useState } from 'react'
import { Collapsible } from '@payloadcms/ui'
import { ExportButton, ImportButton, IncludeMediaToggle, MergeDataToggle } from './index.client'

const LocalExportImport: React.FC = () => {
  const [includeMedia, setIncludeMedia] = useState(false)
  const [mergeData, setMergeData] = useState(false)

  return (
    <div className="local-export-import">
      <h2>
        Export / Import Database <span className="badge">Local</span>
      </h2>
      <p className="description">
        ส่งออกและนำเข้าข้อมูลระหว่างคอมพิวเตอร์หลายเครื่องโดยไม่ต้องใช้ cloud service
      </p>

      <Collapsible initCollapsed={false}>
        <div className="export-section">
          <h3>📤 Export</h3>
          <div className="controls">
            <ExportButton includeMedia={includeMedia} />
            <IncludeMediaToggle checked={includeMedia} onChange={setIncludeMedia} />
          </div>
        </div>

        <div className="import-section">
          <h3>📥 Import</h3>
          <div className="controls">
            <ImportButton mergeData={mergeData} />
            <MergeDataToggle checked={mergeData} onChange={setMergeData} />
          </div>
          <div className="warning">
            ⚠️ การ Import จะลบข้อมูลเก่าทั้งหมดแล้วแทนที่ด้วยข้อมูลใหม่ (ยกเว้นเลือก Merge)
          </div>
        </div>
      </Collapsible>
    </div>
  )
}

export default LocalExportImport
