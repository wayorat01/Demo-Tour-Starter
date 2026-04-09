import React, { Suspense } from 'react'
import { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import SearchResults from './SearchResults'
import { resolveLocalization } from '@/utilities/resolveLocalization'
import { searchProgramToursServer, getSearchOptionsServer } from '@/utilities/searchHelpers.server'
export const metadata: Metadata = {
  title: 'ค้นหาโปรแกรมทัวร์',
  description: 'ค้นหาโปรแกรมทัวร์ต่างประเทศ — เลือกประเทศ วันเดินทาง ช่วงราคา',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SERVER_URL || 'https://localhost:3000'}/search-tour`,
  },
  openGraph: {
    title: 'ค้นหาโปรแกรมทัวร์',
    description: 'ค้นหาโปรแกรมทัวร์ต่างประเทศ — เลือกประเทศ วันเดินทาง ช่วงราคา',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ค้นหาโปรแกรมทัวร์',
    description: 'ค้นหาโปรแกรมทัวร์ต่างประเทศ — เลือกประเทศ วันเดินทาง ช่วงราคา',
  },
}

type Args = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SearchPage({ searchParams }: Args) {
  // Fetch shared settings from Global
  const payload = await getPayload({ config: configPromise })

  const sp = await searchParams
  const spObj = new URLSearchParams()
  for (const [k, v] of Object.entries(sp)) {
    if (v) spObj.set(k, String(v))
  }

  // ⚡ Parallel: pageConfig + searchResults + searchOptions
  const [pageConfig, ssrSearchData, ssrOptionsData] = await Promise.all([
    payload.findGlobal({ slug: 'page-config', depth: 2 }),
    searchProgramToursServer(
      (() => {
        const s = new URLSearchParams(spObj)
        if (!s.has('pagesize')) s.set('pagesize', '12')
        return s
      })(),
    ),
    getSearchOptionsServer(),
  ])

  const sanitizedPageConfig = resolveLocalization(JSON.parse(JSON.stringify(pageConfig)), 'th')
  const settings = sanitizedPageConfig?.searchPageSettings || {}
  const ss = sanitizedPageConfig?.searchSectionSettings || {}

  return (
    <Suspense
      fallback={<div className="flex min-h-[60vh] items-center justify-center">กำลังโหลด...</div>}
    >
      <SearchResults
        settings={settings}
        ssrSearchData={ssrSearchData as any}
        ssrOptionsData={ssrOptionsData as any}
        ssrSearchConfig={ss}
      />
    </Suspense>
  )
}
