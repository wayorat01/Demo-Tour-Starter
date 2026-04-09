import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/download/[filename]?url=...
 *
 * Proxy สำหรับดาวน์โหลดไฟล์จาก external URL
 * ชื่อไฟล์อยู่ใน URL path เพื่อให้ browser ตั้งชื่อไฟล์ถูกต้องเสมอ
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await params
    const { searchParams } = new URL(req.url)
    const fileUrl = searchParams.get('url')

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

    // Determine content type from filename extension if server returned generic type
    const ext = filename.split('.').pop()?.toLowerCase()
    const mimeMap: Record<string, string> = {
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      doc: 'application/msword',
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
    }
    const finalContentType = mimeMap[ext || ''] || contentType

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': finalContentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Content-Length': buffer.byteLength.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    })
  } catch (error: any) {
    console.error('[download proxy] Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
