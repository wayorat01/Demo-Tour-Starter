import React, { Suspense } from 'react'
import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import type { Media as MediaType } from '@/payload-types'
import { resolveLocalization } from '@/utilities/resolveLocalization'
import LandingSearchResults from './LandingSearchResults'

type Args = {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
    const { slug } = await params
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
        collection: 'custom-landing-pages',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 1,
    })

    const page = result.docs[0]
    if (!page) {
        return { title: 'ไม่พบหน้า' }
    }

    const meta = (page as any).meta || {}
    const metaImage = meta.image as MediaType | null

    return {
        title: meta.title || page.title,
        description: meta.description || `โปรแกรมทัวร์ — ${page.title}`,
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_SERVER_URL || 'https://localhost:3000'}/custom-landingpage/${slug}`,
        },
        openGraph: {
            title: meta.title || page.title,
            description: meta.description || `โปรแกรมทัวร์ — ${page.title}`,
            images: metaImage?.url ? [{ url: metaImage.url }] : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title: meta.title || page.title,
            description: meta.description || `โปรแกรมทัวร์ — ${page.title}`,
            images: metaImage?.url ? [metaImage.url] : undefined,
        },
    }
}

export default async function CustomLandingPage({ params }: Args) {
    const { slug } = await params
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
        collection: 'custom-landing-pages',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 2,
    })

    const page = result.docs[0]
    if (!page) notFound()

    const heroBanner = (page as any).heroBanner as MediaType | undefined

    // Read search page settings from Global (Sanitized)
    const pageConfig = await payload.findGlobal({ slug: 'page-config' })
    const sanitizedPageConfig = resolveLocalization(JSON.parse(JSON.stringify(pageConfig)), 'th')
    const searchPageSettings = sanitizedPageConfig?.searchPageSettings || {}

    // ============================================
    // Resolve custom tags → simple { label, link } objects
    // ============================================
    const presetMap: Record<string, { suffix: string; sort: string }> = {
        price: { suffix: 'ราคาถูก', sort: 'price' },
        periodlowtohight: { suffix: 'ใกล้เดินทาง', sort: 'periodlowtohight' },
    }

    const rawTags = ((page as any).customTags || []) as any[]
    const resolvedTags: { label: string; link: string; newTab: boolean }[] = []

    for (const tag of rawTags) {
        if (tag.tagType === 'manual' && tag.label) {
            resolvedTags.push({
                label: tag.label,
                link: tag.link || '',
                newTab: tag.newTab || false,
            })
        } else if (tag.tagType === 'preset' && tag.preset) {
            const preset = presetMap[tag.preset]
            if (preset) {
                resolvedTags.push({
                    label: `${page.title} ${preset.suffix}`,
                    link: `?sort=${preset.sort}`,
                    newTab: false,
                })
            }
        } else if (tag.tagType === 'landingPage' && tag.landingPageRef) {
            const ref = tag.landingPageRef
            if (typeof ref === 'object' && ref !== null) {
                resolvedTags.push({
                    label: ref.title || 'Landing Page',
                    link: `/custom-landingpage/${ref.slug || ''}`,
                    newTab: false,
                })
            } else {
                try {
                    const refDoc = await payload.findByID({
                        collection: 'custom-landing-pages',
                        id: String(ref),
                        depth: 0,
                    })
                    if (refDoc) {
                        resolvedTags.push({
                            label: refDoc.title || 'Landing Page',
                            link: `/custom-landingpage/${refDoc.slug || ''}`,
                            newTab: false,
                        })
                    }
                } catch { /* skip broken refs */ }
            }
        }
    }

    return (
        <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center">กำลังโหลด...</div>}>
            <LandingSearchResults
                pageTitle={page.title}
                pageSlug={page.slug}
                heroBannerUrl={heroBanner?.url || null}
                settings={searchPageSettings}
                description={(page as any).description || null}
                customTags={resolvedTags}
                tagDisplayMode={(page as any).tagDisplayMode || 'all'}
            />
        </Suspense>
    )
}
