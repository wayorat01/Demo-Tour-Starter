import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { MetadataRoute } from 'next'

export const revalidate = 86400 // 24 hours

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config: configPromise })

  const [pagesRes, postsRes, intertoursRes, inboundRes, programsRes, landingRes] =
    await Promise.all([
      payload.find({ collection: 'pages', limit: 500, depth: 0, select: { slug: true, updatedAt: true } }),
      payload.find({ collection: 'posts', limit: 500, depth: 0, where: { _status: { equals: 'published' } }, select: { slug: true, updatedAt: true } }),
      payload.find({ collection: 'intertours', limit: 500, depth: 0, where: { isActive: { equals: true } }, select: { slug: true, updatedAt: true } }),
      payload.find({ collection: 'inbound-tours', limit: 500, depth: 0, select: { slug: true, updatedAt: true } }),
      payload.find({ collection: 'program-tours', limit: 5000, depth: 0, select: { productCode: true, countrySlug: true, updatedAt: true } }),
      payload.find({ collection: 'custom-landing-pages', limit: 200, depth: 0, select: { slug: true, updatedAt: true } }).catch(() => ({ docs: [] })),
    ])

  const staticUrls: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/search-tour`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  ]

  const pageUrls: MetadataRoute.Sitemap = pagesRes.docs
    .filter((p: any) => p.slug && p.slug !== 'home')
    .map((p: any) => ({
      url: `${BASE_URL}/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

  const postUrls: MetadataRoute.Sitemap = postsRes.docs
    .filter((p: any) => p.slug)
    .map((p: any) => ({
      url: `${BASE_URL}/blog/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

  const interTourUrls: MetadataRoute.Sitemap = intertoursRes.docs
    .filter((t: any) => t.slug)
    .map((t: any) => ({
      url: `${BASE_URL}/intertours/${t.slug}`,
      lastModified: t.updatedAt ? new Date(t.updatedAt) : new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }))

  const inboundUrls: MetadataRoute.Sitemap = inboundRes.docs
    .filter((t: any) => t.slug)
    .map((t: any) => ({
      url: `${BASE_URL}/inbound-tours/${t.slug}`,
      lastModified: t.updatedAt ? new Date(t.updatedAt) : new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }))

  const programUrls: MetadataRoute.Sitemap = programsRes.docs
    .filter((p: any) => p.productCode && p.countrySlug)
    .map((p: any) => ({
      url: `${BASE_URL}/intertours/${p.countrySlug}/${p.productCode}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    }))

  const landingUrls: MetadataRoute.Sitemap = (landingRes as any).docs
    .filter((p: any) => p.slug)
    .map((p: any) => ({
      url: `${BASE_URL}/custom-landingpage/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

  return [
    ...staticUrls,
    ...pageUrls,
    ...postUrls,
    ...interTourUrls,
    ...inboundUrls,
    ...programUrls,
    ...landingUrls,
  ]
}
