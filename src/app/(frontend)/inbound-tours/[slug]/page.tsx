import React, { Suspense } from 'react'
import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import type { Media as MediaType } from '@/payload-types'
import { resolveLocalization } from '@/utilities/resolveLocalization'
import CountrySearchResults from './CountrySearchResults'
import { searchProgramToursServer, getSearchOptionsServer } from '@/utilities/searchHelpers.server'
import { ItemListJsonLd } from '@/components/SEO/JsonLd'
import { unstable_cache } from 'next/cache'

const getCachedCountryTags = unstable_cache(
  async (slug: string) => {
    const payload = await getPayload({ config: configPromise })
    const programToursResult = await payload.find({
      collection: 'program-tours',
      where: { countrySlug: { equals: slug } },
      depth: 0,
      limit: 1000,
      select: { productTags: true },
    })

    const tagSet = new Set<string>()
    for (const doc of programToursResult.docs) {
      const pTags = doc.productTags as string[] | undefined
      if (Array.isArray(pTags)) {
        for (const t of pTags) {
          if (typeof t === 'string' && t && !t.startsWith('เดือน')) {
            tagSet.add(t.trim())
          }
        }
      }
    }
    return Array.from(tagSet).map((name, i) => ({
      id: `tag-${i}`,
      name,
      slug: encodeURIComponent(name),
    }))
  },
  ['country_tags'],
  { revalidate: 3600, tags: ['program-tours'] },
)

type Args = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'inbound-tours',
    locale: 'th',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })

  const tour = result.docs[0]
  if (!tour) {
    return { title: 'ไม่พบทัวร์' }
  }

  // Use SEO fields from Admin (fallback to auto-generated)
  const meta = (tour as any).meta || {}
  const metaImage = meta.image as MediaType | null
  const heroBanner = tour.heroBanner as MediaType | null

  return {
    title: meta.title ? { absolute: meta.title } : `${tour.title} — โปรแกรมทัวร์ทั้งหมด`,
    description:
      meta.description ||
      `ค้นหาโปรแกรม${tour.title} — เลือกช่วงเวลาเดินทาง ราคาเริ่มต้น ดูรายละเอียดทัวร์`,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SERVER_URL || 'https://localhost:3000'}/inbound-tours/${slug}`,
    },
    openGraph: {
      title: meta.title || `${tour.title} — โปรแกรมทัวร์ทั้งหมด`,
      description: meta.description || `ค้นหาโปรแกรม${tour.title}`,
      images: metaImage?.url
        ? [{ url: metaImage.url }]
        : heroBanner?.url
          ? [{ url: heroBanner.url }]
          : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title || `${tour.title} — โปรแกรมทัวร์ทั้งหมด`,
      description: meta.description || `ค้นหาโปรแกรม${tour.title}`,
      images: metaImage?.url ? [metaImage.url] : heroBanner?.url ? [heroBanner.url] : undefined,
    },
  }
}

export default async function CountryPage({ params, searchParams }: Args) {
  const { slug } = await params
  const sp = await searchParams
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'inbound-tours',
    locale: 'th',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  })

  const tour = result.docs[0]

  if (!tour) notFound()

  const flagIcon = tour.flagIcon as MediaType | undefined
  const heroBanner = tour.heroBanner as MediaType | undefined

  // SSR Data Fetching
  const spObj = new URLSearchParams()
  spObj.set('countrySlug', tour.slug)
  for (const [k, v] of Object.entries(sp)) {
    if (v) spObj.set(k, String(v))
  }

  // ⚡ Parallel: pageConfig + tags + searchResults + searchOptions
  const [pageConfig, allTags, ssrSearchData, ssrOptionsData] = await Promise.all([
    payload.findGlobal({ slug: 'page-config' }),
    getCachedCountryTags(slug),
    searchProgramToursServer(
      (() => {
        const s = new URLSearchParams(spObj)
        return s
      })(),
    ),
    getSearchOptionsServer(),
  ])

  const showTags = true

  // Read search page settings from Global (sanitized!)
  const sanitizedPageConfig = resolveLocalization(JSON.parse(JSON.stringify(pageConfig)), 'th')
  const searchPageSettings = sanitizedPageConfig?.searchPageSettings || {}
  const ssrSearchConfig = sanitizedPageConfig?.searchSectionSettings || {}

  // Apply pagesize from settings
  if (searchPageSettings?.listingCardSettings?.resultsPerPage) {
    spObj.set('pagesize', String(searchPageSettings.listingCardSettings.resultsPerPage))
  }

  return (
    <>
      <ItemListJsonLd
        name={`ทัวร์${tour.title}`}
        description={
          (tour as any).meta?.description || `ดูโปรแกรมทัวร์${tour.title}ทั้งหมด`
        }
        itemCount={ssrSearchData?.data?.length || 0}
        items={ssrSearchData?.data?.map((t: any, i: number) => ({
          position: i + 1,
          url: `${process.env.NEXT_PUBLIC_SERVER_URL || 'https://localhost:3000'}/inbound-tours/${slug}/${t.tourCode}`,
          name: t.tourTitle,
        })) || []}
      />
      <Suspense
        fallback={<div className="flex min-h-[60vh] items-center justify-center">กำลังโหลด...</div>}
      >
      <CountrySearchResults
        countryTitle={tour.title as string}
        countrySlug={tour.slug as string}
        flagCode={tour.flagCode as string | null}
        flagIconUrl={flagIcon?.url || null}
        heroBannerUrl={heroBanner?.url || null}
        allTags={showTags ? allTags : []}
        settings={searchPageSettings}
        description={
          (tour as any).description
            ? resolveLocalization(JSON.parse(JSON.stringify((tour as any).description)), 'th')
            : null
        }
        ssrSearchData={ssrSearchData as any}
        ssrOptionsData={ssrOptionsData as any}
        ssrSearchConfig={ssrSearchConfig as any}
      />
    </Suspense>
    </>
  )
}
