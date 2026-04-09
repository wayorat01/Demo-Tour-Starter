import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BookingClient } from './BookingClient'
import { mapCmsProgramToDetail } from '@/utilities/mapCmsProgramToDetail'

export const dynamic = 'force-dynamic'

type Args = {
  params: Promise<{ slug: string; tourCode: string }>
}

/**
 * Fetch program tour from CMS by productCode.
 */
async function fetchCmsProgram(tourCode: string) {
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'program-tours',
      where: {
        productCode: { equals: tourCode },
      },
      limit: 1,
      depth: 0,
    })

    const doc = result.docs[0]
    if (!doc) return null

    return mapCmsProgramToDetail(doc as any)
  } catch (error) {
    console.error('[Booking] Failed to fetch CMS program:', error)
    return null
  }
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { tourCode: rawTourCode } = await params
  const tourCode = decodeURIComponent(rawTourCode)

  const program = await fetchCmsProgram(tourCode)
  if (!program) return { title: 'จองทัวร์' }

  return {
    title: `จองทัวร์ - ${program.tourTitle}`,
    description: `จองทัวร์ ${program.tourTitle}`,
  }
}

export default async function BookingPage({ params }: Args) {
  const { slug: rawSlug, tourCode: rawTourCode } = await params
  const slug = decodeURIComponent(rawSlug)
  const tourCode = decodeURIComponent(rawTourCode)

  const payload = await getPayload({ config: configPromise })
  
  const programRaw = await fetchCmsProgram(tourCode)
  if (!programRaw) notFound()

  // Deep-serialize to strip any non-serializable Payload references
  const program = JSON.parse(JSON.stringify(programRaw))

  // Fetch Company Info for fallback UI
  const companyInfoRaw = await payload.findGlobal({
    slug: 'company-info',
    depth: 1,
  })

  // Serialize to plain object to avoid Payload internal class references
  // leaking into the RSC payload (causes "Cannot read properties of undefined (reading 'call')" error)
  const companyInfo = companyInfoRaw
    ? JSON.parse(JSON.stringify({
        qrCode: companyInfoRaw.qrCode,
        lineOA: (companyInfoRaw as any).lineOA,
        lineLink: (companyInfoRaw as any).lineLink,
        callCenter: (companyInfoRaw as any).callCenter,
      }))
    : undefined

  return (
    <div className="bg-background min-h-screen">
      <BookingClient apiProgram={program} countrySlug={slug} companyInfo={companyInfo} />
    </div>
  )
}
