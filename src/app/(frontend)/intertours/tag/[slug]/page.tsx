import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React, { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { Media as MediaType } from '@/payload-types'
import TagSearchResults from './TagSearchResults'

type Args = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ cat?: string }>
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })

  const tagResult = await payload.find({
    collection: 'tags',
    where: { slug: { equals: decodeURIComponent(slug) } },
    limit: 1,
    depth: 0,
  })

  const tag = tagResult.docs[0]
  if (!tag) return { title: 'ทัวร์ตาม Tag' }

  return {
    title: `${tag.name}`,
    description: `ดูโปรแกรมทัวร์ทั้งหมดที่เกี่ยวกับ "${tag.name}"`,
  }
}

export default async function TagListingPage({ params, searchParams }: Args) {
  const { slug } = await params
  const { cat: catSlug } = await searchParams
  const payload = await getPayload({ config: configPromise })

  // 1. Find the tag
  const decodedSlug = decodeURIComponent(slug)
  const tagResult = await payload.find({
    collection: 'tags',
    where: { slug: { equals: decodedSlug } },
    limit: 1,
    depth: 0,
  })
  const tag = tagResult.docs[0]
  if (!tag) notFound()

  // 2. Resolve the category (from ?cat= param or fallback from first InterTour with this tag)
  let categoryTitle = ''
  let categoryId = ''
  let heroBannerUrl: string | null = null

  if (catSlug) {
    const catResult = await payload.find({
      collection: 'tour-categories',
      where: { slug: { equals: catSlug } },
      limit: 1,
      depth: 1,
    })
    const category = catResult.docs[0]
    if (category) {
      categoryTitle = category.title
      categoryId = category.id
      const banner = category.heroBanner as MediaType | undefined
      heroBannerUrl = banner?.url || null
    }
  }

  // 3. If no category from URL, find from first InterTour
  if (!categoryId) {
    const allInterTours = await payload.find({
      collection: 'intertours',
      limit: 20,
      depth: 2,
    })
    for (const doc of allInterTours.docs) {
      const interTour = doc as any
      for (const program of interTour.tourPrograms || []) {
        const tags = (program.tags || [])
          .map((t: any) => (typeof t === 'object' ? t.id : t))
          .filter(Boolean)
        if (tags.includes(tag.id) && interTour.category) {
          const cat = typeof interTour.category === 'object' ? interTour.category : null
          if (cat) {
            categoryTitle = cat.title || ''
            categoryId = cat.id || ''
            const banner = cat.heroBanner as MediaType | undefined
            heroBannerUrl = banner?.url || null
          }
          break
        }
      }
      if (categoryId) break
    }
  }

  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <TagSearchResults
        tagName={tag.name}
        tagId={tag.id}
        categoryTitle={categoryTitle}
        categoryId={categoryId}
        heroBannerUrl={heroBannerUrl}
      />
    </Suspense>
  )
}
