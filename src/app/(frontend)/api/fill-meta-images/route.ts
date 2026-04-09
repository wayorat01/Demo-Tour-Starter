import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextResponse } from 'next/server'

/**
 * GET /api/fill-meta-images
 * Bulk-fill meta.image from thumbnail (intertours) or featuredImage (inbound-tours)
 * for records that don't have meta.image set yet.
 */
export async function GET() {
  const payload = await getPayload({ config: configPromise })
  const results = {
    intertours: { updated: 0, skipped: 0 },
    'inbound-tours': { updated: 0, skipped: 0 },
  }

  // === Intertours ===
  const interDocs = await payload.find({
    collection: 'intertours',
    limit: 500,
    depth: 0,
  })

  for (const doc of interDocs.docs) {
    const thumbId =
      typeof (doc as any).thumbnail === 'object'
        ? (doc as any).thumbnail?.id
        : (doc as any).thumbnail

    const metaImage = (doc as any).meta?.image
    const metaImageId = typeof metaImage === 'object' ? metaImage?.id : metaImage

    if (thumbId && !metaImageId) {
      await payload.update({
        collection: 'intertours',
        id: doc.id,
        data: {
          meta: {
            ...((doc as any).meta || {}),
            image: thumbId,
          },
        } as any,
      })
      results.intertours.updated++
    } else {
      results.intertours.skipped++
    }
  }

  // === Inbound Tours ===
  const inboundDocs = await payload.find({
    collection: 'inbound-tours',
    limit: 500,
    depth: 0,
  })

  for (const doc of inboundDocs.docs) {
    const featId =
      typeof (doc as any).featuredImage === 'object'
        ? (doc as any).featuredImage?.id
        : (doc as any).featuredImage

    const metaImage = (doc as any).meta?.image
    const metaImageId = typeof metaImage === 'object' ? metaImage?.id : metaImage

    if (featId && !metaImageId) {
      await payload.update({
        collection: 'inbound-tours',
        id: doc.id,
        data: {
          meta: {
            ...((doc as any).meta || {}),
            image: featId,
          },
        } as any,
      })
      results['inbound-tours'].updated++
    } else {
      results['inbound-tours'].skipped++
    }
  }

  return NextResponse.json({
    success: true,
    message: 'Meta images filled from thumbnails/featuredImages',
    results,
  })
}
