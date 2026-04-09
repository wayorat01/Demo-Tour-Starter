import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { unstable_cache } from 'next/cache'
import { TourDetailClient } from './TourDetailClient'
import { mapCmsProgramToDetail } from '@/utilities/mapCmsProgramToDetail'
import { TourJsonLd } from '@/components/SEO/JsonLd'

type Args = {
  params: Promise<{ slug: string; tourCode: string }>
}

/**
 * Fetch program tour from CMS by productCode.
 */
const fetchCmsProgram = unstable_cache(
  async (tourCode: string) => {
    try {
      const payload = await getPayload({ config: configPromise })
      const result = await payload.find({
        collection: 'program-tours',
        where: {
          productCode: { equals: tourCode },
        },
        limit: 1,
        depth: 0,
      })

      const doc = result.docs[0]
      if (!doc) return null

      const mapped = mapCmsProgramToDetail(doc as any)
      const rawFestivals: string[] = Array.isArray((doc as any).festivals)
        ? (doc as any).festivals
        : []
      const meta = (doc as any).meta as
        | {
            title?: string
            description?: string
            image?: string
          }
        | undefined
      return { mapped, rawFestivals, meta }
    } catch (error) {
      console.error('[TourDetail] Failed to fetch CMS program:', error)
      return null
    }
  },
  ['cms_program'],
  { revalidate: 3600, tags: ['program-tours'] }
)

/**
 * Lookup festival slugs → Thai display names from the festivals collection.
 */
const lookupFestivalNames = unstable_cache(
  async (slugs: string[]): Promise<string[]> => {
    if (slugs.length === 0) return []
    try {
      const payload = await getPayload({ config: configPromise })
      const result = await payload.find({
        collection: 'festivals',
        where: {
          slugHoliday: { in: slugs },
        },
        limit: slugs.length,
        depth: 0,
      })
      return result.docs.map((doc: any) => doc.nameHoliday || doc.title || doc.slugHoliday)
    } catch (error) {
      console.error('[TourDetail] Failed to lookup festival names:', error)
      return slugs // fallback to slugs
    }
  },
  ['festival_names'],
  { revalidate: 86400, tags: ['festivals'] }
)

/**
 * Fetch related tours from the same country, excluding current tour.
 * Returns a random selection of up to `count` tours.
 */
const fetchRelatedTours = unstable_cache(
  async (countrySlug: string, excludeTourCode: string, count = 4) => {
    try {
      const payload = await getPayload({ config: configPromise })
      const result = await payload.find({
        collection: 'program-tours',
        where: {
          and: [
            { countrySlug: { equals: countrySlug } },
            { productCode: { not_equals: excludeTourCode } },
            { soldout: { not_equals: 'true' } },
          ],
        },
        limit: 20, // fetch more to randomize
        depth: 0,
      })

      // Shuffle and pick `count` items
      const shuffled = result.docs.sort(() => Math.random() - 0.5)
      const selected = shuffled.slice(0, count)

      return selected.map((doc: any) => ({
        id: String(doc.productId ?? doc.id),
        tourTitle: doc.productName ?? '',
        tourCode: doc.productCode ?? '',
        coverImageUrl: doc.urlPicMultisize?.tourdetail || doc.urlPic || '',
        countryName: doc.countryName ?? '',
        countrySlug: doc.countrySlug ?? '',
        stayDay: doc.stayDay ?? 0,
        stayNight: doc.stayNight ?? 0,
        airlineLogoUrl: doc.urlAirlinePic ?? '',
        startPrice: doc.priceProduct ?? 0,
        highlight: doc.highlight ?? '',
      }))
    } catch (error) {
      console.error('[TourDetail] Failed to fetch related tours:', error)
      return []
    }
  },
  ['related_tours'],
  { revalidate: 3600, tags: ['program-tours'] }
)

const fetchCompanyInfo = unstable_cache(
  async () => {
    try {
      const payload = await getPayload({ config: configPromise })
      return await payload.findGlobal({ slug: 'company-info' })
    } catch {
      return null
    }
  },
  ['global_company_info'],
  { revalidate: 3600, tags: ['company-info'] }
)

const fetchPageConfig = unstable_cache(
  async () => {
    try {
      const payload = await getPayload({ config: configPromise })
      return await payload.findGlobal({ slug: 'page-config' })
    } catch {
      return null
    }
  },
  ['global_page_config'],
  { revalidate: 3600, tags: ['page-config'] }
)

export const revalidate = 3600

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug: rawSlug, tourCode: rawTourCode } = await params
  const slug = decodeURIComponent(rawSlug)
  const tourCode = decodeURIComponent(rawTourCode)

  const cmsResult = await fetchCmsProgram(tourCode)
  if (!cmsResult) return { title: 'ทัวร์' }

  const program = cmsResult.mapped
  const meta = cmsResult.meta

  // Prioritize SEO tab values, fallback to generated
  const title = meta?.title || `ทัวร์${program.countryName} | ${program.tourTitle}`
  const description =
    meta?.description ||
    program.tourDescription ||
    `ดูรายละเอียดโปรแกรมทัวร์ ${program.countryName}`
  const ogImage = meta?.image || program.coverImageUrl
  const pageUrl = `${process.env.NEXT_PUBLIC_SERVER_URL || 'https://localhost:3000'}/intertours/${slug}/${tourCode}`

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: 'website',
      title,
      description,
      url: pageUrl,
      siteName: 'WOW Tour',
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

export default async function TourDetailPage({ params }: Args) {
  const { slug: rawSlug, tourCode: rawTourCode } = await params
  const slug = decodeURIComponent(rawSlug)
  const tourCode = decodeURIComponent(rawTourCode)

  const cmsResult = await fetchCmsProgram(tourCode)
  if (!cmsResult) {
    notFound()
  }

  const { mapped: program, rawFestivals } = cmsResult

  // Fetch related tours + company info + page config + festival names in parallel
  const payload = await getPayload({ config: configPromise })
  const [relatedTours, companyInfoDoc, pageConfigDoc, festivalNames] = await Promise.all([
    fetchRelatedTours(program.countrySlug ?? slug, tourCode, 4),
    fetchCompanyInfo(),
    fetchPageConfig(),
    lookupFestivalNames(rawFestivals),
  ])

  const companyInfo = companyInfoDoc
    ? {
        companyName: (companyInfoDoc as any).companyName ?? '',
        hotline: (companyInfoDoc as any).hotline ?? '',
        callCenter: (companyInfoDoc as any).callCenter ?? '',
        lineLink: (companyInfoDoc as any).lineLink ?? '',
        lineOA: (companyInfoDoc as any).lineOA ?? '',
      }
    : undefined

  // ดึงค่าการตั้งค่าจาก Global (ถ้าไม่มีใน DB ให้ default เป็น true)
  const tourDetailSettings = (pageConfigDoc as any)?.tourDetailSettings
  const showBookingButton = tourDetailSettings?.showBookingButton ?? true
  const showRelatedTours = tourDetailSettings?.showRelatedTours ?? true
  const showTags = tourDetailSettings?.showTags ?? true
  const showItinerary = tourDetailSettings?.showItinerary ?? true

  return (
    <div className="bg-background min-h-screen">
      <TourJsonLd
        name={program.tourTitle}
        description={program.tourDescription || undefined}
        imageUrl={program.coverImageUrl || undefined}
        price={program.startPrice}
        url={`${process.env.NEXT_PUBLIC_SERVER_URL || 'https://localhost:3000'}/intertours/${slug}/${tourCode}`}
        duration={program.stayDay && program.stayNight ? `${program.stayDay} วัน ${program.stayNight} คืน` : undefined}
        airlineName={program.airlineName || undefined}
      />
      <TourDetailClient
        apiProgram={program}
        countrySlug={slug}
        relatedTours={relatedTours}
        companyInfo={companyInfo}
        festivalNames={festivalNames}
        showBookingButton={showBookingButton}
        showRelatedTours={showRelatedTours}
        showTags={showTags}
        showItinerary={showItinerary}
      />
    </div>
  )
}
