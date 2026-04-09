import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import sharp from 'sharp'

const FAVICON_SIZE = 32

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })
    const pageConfig = await payload.findGlobal({ slug: 'page-config', depth: 1 })

    const faviconMedia = pageConfig?.siteIdentity?.favicon as
      | { url?: string; mimeType?: string }
      | undefined
    const faviconUrl = faviconMedia?.url

    if (!faviconUrl) {
      return new NextResponse(null, { status: 404 })
    }

    // Build absolute URL for fetching
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
    const absoluteUrl = faviconUrl.startsWith('http') ? faviconUrl : `${baseUrl}${faviconUrl}`

    const response = await fetch(absoluteUrl)
    if (!response.ok) {
      return new NextResponse(null, { status: 404 })
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer())

    // Resize to a proper square favicon with aspect ratio preserved (contain mode)
    // Uses a transparent background so non-square images get padded, not stretched
    const resizedBuffer = await sharp(imageBuffer)
      .resize(FAVICON_SIZE, FAVICON_SIZE, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer()

    return new NextResponse(resizedBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
    })
  } catch (error) {
    console.error('Favicon generation error:', error)
    return new NextResponse(null, { status: 500 })
  }
}
