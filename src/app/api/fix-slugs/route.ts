import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'
import { formatSlug } from '@/fields/slug/formatSlug'

import { requireAdmin } from '@/utilities/apiAuthGuard'

export async function POST(request: Request) {
  const authError = await requireAdmin(request)
  if (authError) return authError
  try {
    const payload = await getPayload({ config: configPromise })

    // Find all posts
    const result = await payload.find({
      collection: 'posts',
      limit: 100,
      depth: 0,
    })

    const updates: Array<{
      id: string
      title: string
      oldSlug: string | null | undefined
      newSlug: string
    }> = []
    for (const post of result.docs) {
      if (!post.slug || post.slug !== formatSlug(post.title)) {
        const newSlug = formatSlug(post.title)
        await payload.update({
          collection: 'posts',
          id: post.id,
          data: { slug: newSlug } as any,
        })
        updates.push({ id: post.id, title: post.title, oldSlug: post.slug, newSlug })
      }
    }

    return NextResponse.json({ success: true, updates })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message })
  }
}
