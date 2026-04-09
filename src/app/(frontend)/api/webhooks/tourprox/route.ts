import { NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

// TODO: ย้าย Secret นี้ไปใส่ในไฟล์ .env ในอนาคต
const TOURPROX_WEBHOOK_SECRET = process.env.TOURPROX_WEBHOOK_SECRET || 'wowtour_secret_841K8L9P2M'

export async function POST(req: Request) {
  try {
    // 1. ตรวจสอบรหัสผ่าน (Authorization) ป้องกันแฮกเกอร์
    const authHeader = req.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${TOURPROX_WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. รับข้อมูล JSON ที่เขาพ่นมาให้
    const body = await req.json()
    const { action, tour_id } = body

    if (!tour_id) {
      return NextResponse.json({ error: 'Missing tour_id in payload. Please provide tour_id.' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

    // 3. จัดการอัพเดทข้อมูลตามประเภท Action
    if (action === 'update' || action === 'create') {
      console.log(`[Webhook] ได้รับแจ้งเตือนการอัพเดททัวร์ ID: ${tour_id}`)

      // ==========================================
      // TODO: (เฟสถัดไป) เขียน API ยิงกลับไปดึงข้อมูลใหม่จาก Tourprox
      // แล้วใช้คำสั่ง payload.update() เพื่อเซฟลงฐานข้อมูล
      // ==========================================

      // 4. สั่งล้างแคชหน้าเว็บ (Revalidate & Clear Cache)
      // เมื่ออัพเดทข้อมูลเสร็จ หน้าเว็บจะได้เนื้อหาล่าสุดทันที
      revalidateTag('program-tours')
      revalidatePath('/search-tour')
      
      // ล้างแคชหน้ารายละเอียดทัวร์
      revalidatePath('/program-tours', 'layout')

      return NextResponse.json({ 
        success: true, 
        message: `อัพเดทและล้างแคชสำหรับทัวร์ ${tour_id} เรียบร้อยแล้ว` 
      }, { status: 200 })
    }

    if (action === 'delete') {
      console.log(`[Webhook] ได้รับแจ้งเตือนการลบทัวร์ ID: ${tour_id}`)
      
      // TODO: (เฟสถัดไป) อัพเดทสถานะทัวร์เป็นปิดใช้งานในฐานข้อมูล

      return NextResponse.json({ 
        success: true, 
        message: `จัดเก็บข้อมูลการลบทัวร์ ${tour_id} เรียบร้อยแล้ว` 
      }, { status: 200 })
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
  } catch (error) {
    console.error('[Webhook Error]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
