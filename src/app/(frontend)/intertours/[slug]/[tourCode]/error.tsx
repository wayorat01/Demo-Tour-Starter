'use client'
import React from 'react'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container flex min-h-[50vh] flex-col items-center justify-center gap-4 pt-32 pb-24 text-center">
      <h2 className="text-3xl font-bold">ไม่พบข้อมูลทัวร์</h2>
      <p className="text-muted-foreground mx-auto max-w-md">
        {error.message ||
          'โปรแกรมทัวร์ที่คุณกำลังค้นหาอาจถูกลบ เคลื่อนย้าย หรือไม่ได้เปิดให้บริการในขณะนี้ กรุณาตรวจสอบลิงก์อีกครั้งหรือกลับไปยังหน้าแรก'}
      </p>
      <button
        onClick={reset}
        className="bg-primary hover:bg-primary/90 mt-4 rounded px-6 py-2 text-white"
      >
        ลองใหม่
      </button>
    </div>
  )
}
