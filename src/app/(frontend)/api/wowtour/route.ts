import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * 🌐 Unified Proxy Route สำหรับ WowTour External API
 *
 * Route เดียวรองรับทุก mode — ส่ง query params มาได้เลย
 * ระบบจะดึง API End Point + API Key จาก Admin Panel (/admin/globals/api-setting)
 *
 * ตัวอย่างการเรียกใช้:
 *   /api/wowtour?mode=LoadCountry
 *   /api/wowtour?mode=searchresultsproduct&country_slug=japan&pagesize=10&pagenumber=1
 *   /api/wowtour?mode=productdetails&product_code=EUITALY01&lang=th
 *   /api/wowtour?mode=LoadHomePromotion&lang=th
 *   /api/wowtour?mode=loadtourbytype&type=summer&lang=th
 *   /api/wowtour?mode=sortproduct&lang=th
 *
 * Query params:
 *   - mode (required): API mode เช่น LoadCountry, searchresultsproduct, productdetails ฯลฯ
 *   - ที่เหลือ: ส่งต่อไป external API ตรงๆ (เช่น lang, pagesize, country_slug, product_code)
 *   - _preset (optional): ชื่อ endpoint preset จาก Admin เช่น "Search Result", "LoadCountry"
 *                          ถ้าส่งมา จะ merge params จาก preset ก่อน แล้วค่าจาก client จะ override
 *   - _nocache (optional): ส่ง _nocache=1 เพื่อข้าม cache ดึงข้อมูลสดจาก API ทันที
 *
 * Response:
 *   - ส่ง JSON กลับตรงจาก external API
 *   - ถ้า mode=productdetails จะ wrap เป็น array [data] ให้อัตโนมัติ
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl

    // ─── 1. ตรวจสอบว่ามี mode มาหรือไม่ ───
    const mode = searchParams.get('mode')
    if (!mode) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: mode' },
        { status: 400 },
      )
    }

    // ─── 2. ดึงค่า API Setting จาก Admin Panel ───
    const payload = await getPayload({ config: configPromise })
    const apiSetting = await payload.findGlobal({ slug: 'api-setting' })

    const apiEndPoint = apiSetting.apiEndPoint
    const apiKey = apiSetting.apiKey

    if (!apiEndPoint || !apiKey) {
      return NextResponse.json(
        { success: false, error: 'API settings not configured. Go to /admin/globals/api-setting' },
        { status: 500 },
      )
    }

    // ─── 3. สร้าง query params ───
    const query = new URLSearchParams()
    query.append('apiKey', apiKey)

    // 3a. ถ้ามี _preset → ดึง params จาก Admin Endpoint preset ก่อน
    const presetName = searchParams.get('_preset')
    if (presetName) {
      const endpoints = (apiSetting as any).endpoints as any[] | undefined
      const preset = endpoints?.find((ep: any) => ep.endpointName === presetName)
      if (preset?.queryParams) {
        for (const p of preset.queryParams) {
          if (p.key && p.value != null && p.value !== '') {
            query.append(p.key, p.value)
          }
        }
      }
    }

    // 3b. เพิ่ม params จาก client (override preset ถ้าซ้ำ)
    searchParams.forEach((value, key) => {
      if (key === '_preset' || key === '_nocache') return // ข้าม params ภายใน
      if (value === '0' || value === '') return // ข้ามค่าว่าง

      // ถ้า key ซ้ำกับ preset → ลบของ preset แล้วใช้ของ client แทน
      if (query.has(key)) {
        query.delete(key)
      }
      query.append(key, value)
    })

    // ─── 4. ยิง External API ───
    // ตรวจสอบ apiEndPoint ว่าลงท้ายด้วย ? หรือไม่
    const separator = apiEndPoint.includes('?') ? '&' : '?'
    const finalUrl = `${apiEndPoint}${separator}${query.toString()}`

    // 🔍 DEBUG: ดู URL ที่ยิงออกไป
    console.log(`[wowtour-api] mode=${mode} → ${finalUrl}`)

    // ─── Stale-While-Revalidate (SWR) ───
    // cache 5 นาที → ส่ง cache ให้ user ทันที (เร็ว!)
    // พอครบ 5 นาที → ดึงข้อมูลใหม่จาก API เบื้องหลังอัตโนมัติ
    // ผู้ใช้ไม่ต้องรอ + ข้อมูลอัพเดตเองภายใน 5 นาที
    const response = await fetch(finalUrl, {
      next: { revalidate: 300 }, // 5 นาที
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'no body')
      console.error(`[wowtour-api] External API returned ${response.status} for mode=${mode}`)
      console.error(`[wowtour-api] Response body: ${errorText}`)
      return NextResponse.json(
        { success: false, error: `External API returned ${response.status}` },
        { status: response.status },
      )
    }

    // ─── 5. จัดการ Response ───
    const body = await response.json()

    // mode ที่คืนค่าเป็น object เดี่ยว → wrap เป็น array
    const singleModes = ['productdetails']
    if (singleModes.includes(mode) && body.data && !Array.isArray(body.data)) {
      body.data = [body.data]
    }

    return NextResponse.json(body)
  } catch (error) {
    console.error('[wowtour-api] Error:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
