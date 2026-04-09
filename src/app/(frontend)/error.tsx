'use client'
import React from 'react'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">เกิดข้อผิดพลาด</h1>
      <p className="text-muted-foreground">{error.message || 'กรุณาลองใหม่อีกครั้ง'}</p>
      <button onClick={reset} className="bg-primary rounded px-4 py-2 text-white">
        ลองใหม่
      </button>
    </div>
  )
}
