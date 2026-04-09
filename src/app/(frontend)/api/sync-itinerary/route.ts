import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * POST /api/sync-itinerary
 *
 * ดึง itinerary (mode=itinerarybasic) จาก API สำหรับทุก ProgramTour ที่มีอยู่ใน CMS
 * แล้วอัปเดต field `itinerary` ของแต่ละ ProgramTour
 *
 * - ใช้ product_code ในการดึง itinerary จาก API
 * - ทับข้อมูล itinerary เดิมทั้งหมด
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    // 1. ดึง API Setting จาก global
    const apiSetting = await payload.findGlobal({ slug: 'api-setting' })

    if (!apiSetting?.apiEndPoint || !apiSetting?.apiKey) {
      return NextResponse.json(
        { success: false, error: 'API Setting ไม่ครบ (ตรวจสอบ API Endpoint และ API Key)' },
        { status: 500 },
      )
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
          productCode: { exists: true },
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

    console.log(`[sync-itinerary] Found ${allPrograms.length} ProgramTours to sync itinerary`)

    if (allPrograms.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'ไม่พบ ProgramTours ที่ต้อง sync itinerary',
        summary: { updated: 0, skipped: 0, errors: 0 },
      })
    }

    // 3. ดึง itinerary จาก API สำหรับแต่ละ ProgramTour (batch parallel)
    const results: any[] = []
    const errors: any[] = []
    let updated = 0
    let skipped = 0

    const BATCH_SIZE = 5

    const syncOne = async (program: { id: string; productCode: string; productName: string }) => {
      try {
        const itineraryUrl = new URL(apiSetting.apiEndPoint as string)
        itineraryUrl.searchParams.set('apikey', apiSetting.apiKey as string)
        itineraryUrl.searchParams.set('mode', 'itinerarybasic')
        itineraryUrl.searchParams.set('lang', 'th')
        itineraryUrl.searchParams.set('product_code', program.productCode)

        const itRes = await fetch(itineraryUrl.toString())

        if (!itRes.ok) {
          skipped++
          results.push({
            action: 'skipped',
            productCode: program.productCode,
            productName: program.productName,
            reason: `API status ${itRes.status}`,
          })
          return
        }

        const itJson = await itRes.json()

        if (itJson.success !== 'True' || !Array.isArray(itJson.data)) {
          skipped++
          results.push({
            action: 'skipped',
            productCode: program.productCode,
            productName: program.productName,
            reason: 'API ไม่ส่ง itinerary data',
          })
          return
        }

        const itineraryData = itJson.data.map((item: any) => ({
          dayTitle: (item.type || '').trim(),
          dayContent: (item.content || '').trim(),
        }))

        // ดึง itinerary_summary + Word/PDF จาก productdetails
        let itinerarySummary = ''
        let urlPdf = ''
        let urlWord = ''
        let urlBanner = ''

        try {
          const detailUrl = new URL(apiSetting.apiEndPoint as string)
          detailUrl.searchParams.set('apikey', apiSetting.apiKey as string)
          detailUrl.searchParams.set('mode', 'productdetails')
          detailUrl.searchParams.set('lang', 'th')
          detailUrl.searchParams.set('product_code', program.productCode)

          const detailRes = await fetch(detailUrl.toString(), { cache: 'no-store' })
          if (detailRes.ok) {
            const detailJson = await detailRes.json()
            const detail = Array.isArray(detailJson.data) ? detailJson.data[0] : detailJson.data
            if (detail) {
              if (detail.itinerary_summary && typeof detail.itinerary_summary === 'string') {
                itinerarySummary = detail.itinerary_summary.trim()
              }
              // ดึงลิงก์ไฟล์ (ลำดับความสำคัญ: brochure > pdf)
              urlPdf = detail.url_brochure || detail.url_pdf || ''
              urlWord = detail.url_word || ''
              urlBanner = detail.url_banner || ''
            }
          }
        } catch (e) {
          // ดึง productdetails ไม่ได้ → ข้ามข้อมูลเสริม
        }

        // อัปเดตข้อมูลลง ProgramTour
        await payload.update({
          collection: 'program-tours',
          id: program.id,
          data: {
            itinerary: itineraryData,
            itinerarySummary: itinerarySummary || undefined,
            urlPdf: urlPdf || undefined,
            urlWord: urlWord || undefined,
            urlBanner: urlBanner || undefined,
          } as any,
        })

        updated++
        results.push({
          action: 'updated',
          productCode: program.productCode,
          productName: program.productName,
          days: itineraryData.length,
          hasSummary: !!itinerarySummary,
        })
      } catch (err: any) {
        console.error(`[sync-itinerary] Error for ${program.productCode}:`, err.message)
        errors.push({
          productCode: program.productCode,
          productName: program.productName,
          error: err.message,
        })
      }
    }

    // Process in batches of BATCH_SIZE
    for (let i = 0; i < allPrograms.length; i += BATCH_SIZE) {
      const batch = allPrograms.slice(i, i + BATCH_SIZE)
      await Promise.all(batch.map(syncOne))
      console.log(
        `[sync-itinerary] Progress: ${Math.min(i + BATCH_SIZE, allPrograms.length)}/${allPrograms.length}`,
      )
    }

    return NextResponse.json({
      success: true,
      message: `Sync Itinerary สำเร็จ! อัปเดต ${updated} | ข้าม ${skipped} | ผิดพลาด ${errors.length} (จาก ${allPrograms.length} โปรแกรม)`,
      totalPrograms: allPrograms.length,
      summary: { updated, skipped, errors: errors.length },
      results,
      errors,
    })
  } catch (error: any) {
    console.error('[sync-itinerary] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 },
    )
  }
}
