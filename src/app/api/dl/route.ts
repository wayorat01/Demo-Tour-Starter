import { NextRequest } from 'next/server'

/**
 * GET /api/dl?url=...&fn=COOL250868.docx
 *
 * Download proxy — ใช้ Response constructor ตรงๆ ไม่ผ่าน NextResponse
 * เพื่อหลีกเลี่ยงการดัดแปลง headers โดย Next.js
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  const fn = req.nextUrl.searchParams.get('fn') || 'download'

  if (!url) {
    return new Response('Missing url', { status: 400 })
  }

  // Validate domain
  const allowed = [
    'cdn.weon.website',
    'cdns3.weon.website',
    'pdf.weon.website',
    'cdns3.tourprox.com',
  ]
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return new Response('Invalid URL', { status: 400 })
  }
  if (!allowed.some((d) => parsed.hostname === d)) {
    return new Response('Forbidden', { status: 403 })
  }

  const upstream = await fetch(url, { cache: 'no-store' })
  if (!upstream.ok) {
    return new Response('Upstream error', { status: 502 })
  }

  const body = await upstream.arrayBuffer()

  // ใช้ Response constructor ดิบๆ ไม่ผ่าน NextResponse
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${fn}"`,
      'Content-Length': String(body.byteLength),
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

export const dynamic = 'force-dynamic'
