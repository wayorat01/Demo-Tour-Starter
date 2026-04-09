import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import type { Metadata } from 'next'
import { ThankYouClient } from './ThankYouClient'

type Args = {
  params: Promise<{ slug: string; tourCode: string }>
  searchParams: Promise<{ pnr?: string }>
}

export const metadata: Metadata = {
  title: 'จองสำเร็จ!',
  description: 'การจองทัวร์ของคุณสำเร็จแล้ว',
}

export default async function ThankYouPage({ params, searchParams }: Args) {
  const { slug, tourCode } = await params
  const { pnr } = await searchParams

  if (!pnr) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>ไม่พบข้อมูลการจอง</p>
      </div>
    )
  }

  const payload = await getPayload({ config: configPromise })

  // Fetch booking from DB
  const result = await payload.find({
    collection: 'bookings',
    where: { pnrCode: { equals: pnr } },
    limit: 1,
  })

  const booking = result.docs[0]

  if (!booking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>ไม่พบข้อมูลการจอง PNR: {pnr}</p>
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen">
      <ThankYouClient booking={booking} slug={slug} tourCode={tourCode} />
    </div>
  )
}
