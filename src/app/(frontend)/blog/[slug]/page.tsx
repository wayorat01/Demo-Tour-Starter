import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BlogDetailClient } from './page.client'
import { Post, Media as MediaType } from '@/payload-types'
import RichText from '@/components/RichText'
import { ArticleJsonLd } from '@/components/SEO/JsonLd'

type Args = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })

  // Try finding by slug first, then fall back to ID
  let result = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })

  let post = result.docs[0]

  // Fallback: try by ID if no result by slug
  if (!post) {
    try {
      post = await payload.findByID({ collection: 'posts', id: slug, depth: 1 })
    } catch {
      // ID not found
    }
  }

  if (!post) return { title: 'บทความ' }

  const coverImage = post.coverImage as MediaType | null
  const coverUrl = coverImage?.url || undefined

  return {
    title: post.title,
    description: (post as any).excerpt || `อ่านบทความ ${post.title}`,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SERVER_URL || 'https://localhost:3000'}/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: (post as any).excerpt || undefined,
      images: coverUrl ? [{ url: coverUrl }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: (post as any).excerpt || undefined,
      images: coverUrl ? [coverUrl] : undefined,
    },
  }
}

export default async function BlogDetailPage({ params }: Args) {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  const payload = await getPayload({ config: configPromise })

  // Try finding by slug first, then fall back to ID
  let result = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  })

  let post = result.docs[0] as Post | undefined

  // Fallback: try by ID if no result by slug
  if (!post) {
    try {
      post = (await payload.findByID({ collection: 'posts', id: slug, depth: 2 })) as Post
    } catch {
      // ID not found
    }
  }

  if (!post) {
    notFound()
  }

  // Fetch related posts
  let relatedPosts: Post[] = []
  const postTags = (post as any).tags as any[] | undefined

  if (postTags && postTags.length > 0) {
    // Get tag IDs
    const tagIds = postTags.map((t: any) => (typeof t === 'object' ? t.id : t)).filter(Boolean)

    if (tagIds.length > 0) {
      try {
        const related = await payload.find({
          collection: 'posts',
          limit: 4,
          depth: 1,
          sort: '-publishedAt',
          where: {
            and: [
              { id: { not_equals: post.id } },
              { _status: { equals: 'published' } },
              { tags: { in: tagIds } },
            ],
          },
        })
        relatedPosts = related.docs as Post[]
      } catch (e) {
        console.error('Error fetching related posts:', e)
      }
    }
  }

  // Fallback: if not enough related posts, fetch latest
  if (relatedPosts.length < 4) {
    try {
      const existingIds = [post.id, ...relatedPosts.map((p) => p.id)]
      const latest = await payload.find({
        collection: 'posts',
        limit: 4 - relatedPosts.length,
        depth: 1,
        sort: '-publishedAt',
        where: {
          and: [{ id: { not_in: existingIds } }, { _status: { equals: 'published' } }],
        },
      })
      relatedPosts = [...relatedPosts, ...(latest.docs as Post[])]
    } catch (e) {
      console.error('Error fetching latest posts:', e)
    }
  }

  const showTags = true

  const contentElement = post.content ? (
    <RichText
      publicContext={{ locale: 'th', cleanSlugs: [], isNotFound: false }}
      content={post.content as Record<string, any>}
      withWrapper={true}
      enableGutter={false}
      enableProse={true}
    />
  ) : null

  return (
    <div className="min-h-screen">
      <ArticleJsonLd
        headline={post.title}
        imageUrl={(post.coverImage as MediaType | null)?.url || undefined}
        datePublished={(post as any).publishedAt || (post as any).createdAt || undefined}
        dateModified={post.updatedAt || undefined}
        url={`${process.env.NEXT_PUBLIC_SERVER_URL || 'https://localhost:3000'}/blog/${post.slug}`}
      />
      <BlogDetailClient
        post={post}
        relatedPosts={relatedPosts}
        contentElement={contentElement}
        showTags={showTags}
      />
    </div>
  )
}
