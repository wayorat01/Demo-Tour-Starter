import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * POST /api/sync-itinerary-summary
 *
 * ดึง itinerary_summary จาก API (mode=productdetails)
 * สำหรับทุก ProgramTour ที่ยังไม่มี itinerarySummary
 * แล้วอัปเดตเฉพาะ field itinerarySummary
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    // 1. ดึง API Setting
    const apiSetting = await payload.findGlobal({ slug: 'api-setting' })

    if (!apiSetting?.apiEndPoint || !apiSetting?.apiKey) {
      return NextResponse.json({ success: false, error: 'API Setting ไม่ครบ' }, { status: 500 })
    }

    // 2. ดึง ProgramTours ทั้งหมดที่มี productCode
    const PAGE_SIZE = 100
    let allPrograms: { id: string; productCode: string; productName: string }[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const result = await payload.find({
        collection: 'program-tours',
        where: {
          productCode: { not_equals: '' },
        },
        limit: PAGE_SIZE,
        page,
        depth: 0,
      })

      for (const doc of result.docs) {
        const d = doc as any
        if (d.productCode) {
          allPrograms.push({
            id: d.id,
            productCode: d.productCode,
            productName: d.productName || d.productCode,
          })
        }
      }

      hasMore = result.hasNextPage
      page++
    }

    console.log(`[sync-itinerary-summary] Found ${allPrograms.length} ProgramTours`)

    // 3. ดึง itinerary_summary จาก productdetails สำหรับแต่ละ product
    let updated = 0
    let skipped = 0
    let errors = 0
    const results: any[] = []

    for (const program of allPrograms) {
      try {
        const detailUrl = new URL(apiSetting.apiEndPoint as string)
        detailUrl.searchParams.set('apikey', apiSetting.apiKey as string)
        detailUrl.searchParams.set('mode', 'productdetails')
        detailUrl.searchParams.set('lang', 'th')
        detailUrl.searchParams.set('product_code', program.productCode)

        const detailRes = await fetch(detailUrl.toString())
        if (!detailRes.ok) {
          skipped++
          continue
        }

        const detailJson = await detailRes.json()
        if (detailJson.success !== 'True') {
          skipped++
          continue
        }

        const detail = Array.isArray(detailJson.data) ? detailJson.data[0] : detailJson.data
        const summary = detail?.itinerary_summary

        if (summary && typeof summary === 'string' && summary.trim()) {
          await payload.update({
            collection: 'program-tours',
            id: program.id,
            data: {
              itinerarySummary: summary.trim(),
            } as any,
          })
          updated++
          results.push({
            action: 'updated',
            productCode: program.productCode,
            productName: program.productName,
            summary: summary.trim().substring(0, 100),
          })
        } else {
          skipped++
        }
      } catch (err: any) {
        console.error(`[sync-itinerary-summary] Error for ${program.productCode}:`, err.message)
        errors++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sync Itinerary Summary สำเร็จ! อัปเดต ${updated} | ข้าม ${skipped} | ผิดพลาด ${errors} (จาก ${allPrograms.length} โปรแกรม)`,
      totalPrograms: allPrograms.length,
      summary: { updated, skipped, errors },
      results,
    })
  } catch (error: any) {
    console.error('[sync-itinerary-summary] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 },
    )
  }
}
