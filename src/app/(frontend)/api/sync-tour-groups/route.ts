import { NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

// Sync TourGroups จาก API loadtourbytype
export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })
    const apiSetting = await payload.findGlobal({ slug: 'api-setting' })

    if (!apiSetting?.apiEndPoint || !apiSetting?.apiKey) {
      return NextResponse.json({ success: false, error: 'API Setting ไม่ครบ' }, { status: 500 })
    }

    let tourGroupsSynced = 0
    const MAX_EMPTY = 5
    let groupNumber = 1
    let emptyCount = 0
    const results: string[] = []

    while (emptyCount < MAX_EMPTY) {
      const groupKey = `group${groupNumber}`
      try {
        const url = new URL(apiSetting.apiEndPoint)
        url.searchParams.set('apikey', apiSetting.apiKey)
        url.searchParams.set('mode', 'loadtourbytype')
        url.searchParams.set('type', groupKey)
        url.searchParams.set('lang', 'th')

        const res = await fetch(url.toString())
        if (!res.ok) {
          emptyCount++
          groupNumber++
          continue
        }

        const json = await res.json()
        const products = Object.values(json.data || {}) as any[]
        const groupTitle = (json.title || '').trim() // ← ดึง title จาก API

        if (products.length === 0) {
          results.push(`${groupKey} → 0 products (skip)`)
          emptyCount++
          groupNumber++
          continue
        }

        emptyCount = 0

        const productCodes = [...new Set(products.map((p: any) => p.product_code).filter(Boolean))]
        const tourIds: string[] = []

        for (const code of productCodes) {
          const found = await payload.find({
            collection: 'program-tours',
            where: { productCode: { equals: code } },
            limit: 1,
            depth: 0,
          })
          if (found.docs.length > 0) tourIds.push(found.docs[0].id)
        }

        // Upsert
        const existing = await payload.find({
          collection: 'tour-groups',
          where: { groupKey: { equals: groupKey } },
          limit: 1,
        })

        if (existing.docs.length > 0) {
          await payload.update({
            collection: 'tour-groups',
            id: existing.docs[0].id,
            data: {
              tours: tourIds,
              tourCount: tourIds.length,
              label: groupTitle || existing.docs[0].label, // ← ใช้ title จาก API
            } as any,
          })
        } else {
          await payload.create({
            collection: 'tour-groups',
            data: {
              groupKey,
              label: groupTitle || groupKey, // ← ใช้ title จาก API
              tours: tourIds,
              tourCount: tourIds.length,
              sortOrder: groupNumber,
              isActive: true,
            } as any,
          })
        }

        results.push(
          `${groupKey} → "${groupTitle}" → ${productCodes.length} products → ${tourIds.length} matched ✅`,
        )
        tourGroupsSynced++
      } catch (e: any) {
        results.push(`${groupKey} → error: ${e.message}`)
        emptyCount++
      }
      groupNumber++
    }

    return NextResponse.json({ success: true, tourGroupsSynced, results })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
