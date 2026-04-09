import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/download?url=...&filename=...
 *
 * Proxy สำหรับดาวน์โหลดไฟล์จาก external URL (cross-origin)
 * พร้อมตั้งชื่อไฟล์และ Content-Disposition ให้ถูกต้อง
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const fileUrl = searchParams.get('url')
    const filename = searchParams.get('filename') || 'download'

    if (!fileUrl) {
      return new NextResponse('Missing url parameter', { status: 400 })
    }

    // Validate URL is from trusted domains only
    const allowedDomains = [
      'cdn.weon.website',
      'cdns3.weon.website',
      'pdf.weon.website',
      'cdns3.tourprox.com',
    ]
    let parsedUrl: URL
    try {
      parsedUrl = new URL(fileUrl)
    } catch {
      return new NextResponse('Invalid URL', { status: 400 })
    }

    const isDomainAllowed = allowedDomains.some((d) => parsedUrl.hostname === d)
    if (!isDomainAllowed) {
      return new NextResponse('Domain not allowed', { status: 403 })
    }

    // Fetch the file from external server
    const res = await fetch(fileUrl, { cache: 'no-store' })

    if (!res.ok) {
      return new NextResponse(`Failed to fetch file: ${res.status}`, { status: 502 })
    }

    const buffer = await res.arrayBuffer()
    const contentType = res.headers.get('content-type') || 'application/octet-stream'

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.byteLength.toString(),
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error: any) {
    console.error('[download proxy] Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
