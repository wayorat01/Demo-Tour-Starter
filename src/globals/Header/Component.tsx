import { HeaderClient } from './Component.client'
import { resolveLocalization } from '@/utilities/resolveLocalization'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import React, { ReactElement } from 'react'

import type { CompanyInfo } from '@/payload-types'
import Navbar5 from './navbar/navbar5'
import { Navbar1 } from './navbar/wowtour_navbar1'
import { Navbar2 } from './navbar/wowtour_navbar2'
import { Navbar3WowTour } from './navbar/wowtour_navbar3'
import { PublicContextProps } from '@/utilities/publicContextProps'
import { Navbar4WowTour } from './navbar/wowtour_navbar4'
import { WowtourNavbar5 } from './navbar/wowtour_navbar5'
import { Navbar6WowTour } from './navbar/wowtour_navbar6'
import { Navbar7WowTour } from './navbar/wowtour_navbar7'
import { headers as getHeaders } from 'next/headers'

// Fetch current user without redirect
async function getCurrentUser() {
  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })

    return user || null
  } catch {
    return null
  }
}

// ============================================
// Cache ข้อมูล Header ทั้งก้อนเดียว
// รวม: header global + tours + flagIcons + companyInfo + citiesMap
// Revalidate อัตโนมัติเมื่อ admin แก้ไขข้อมูลใน Payload
// ============================================
import { unstable_cache } from 'next/cache'

const HEADER_CACHE_TAG = 'header_full_data'

// Helper: extract string ID from a value that may be a string, ObjectId, or Buffer
const toIdString = (v: unknown): string | null => {
  if (!v) return null
  if (typeof v === 'string' && v.length > 0) return v
  // MongoDB ObjectId — has .toString() that returns hex
  if (typeof v === 'object' && v !== null) {
    const obj = v as any
    // Populated document → not an ID, skip
    if (obj.title || obj.slug || obj.root) return null
    // ObjectId or Buffer-like
    if (typeof obj.toString === 'function') {
      const s = obj.toString()
      // ObjectId.toString() returns 24-char hex
      if (/^[a-f0-9]{24}$/i.test(s)) return s
    }
    if (typeof obj.toHexString === 'function') return obj.toHexString()
  }
  return null
}

async function fetchHeaderData(locale: string) {
  const payload = await getPayload({ config: configPromise })

  // 1. Fetch header global (depth: 1)
  const headerRaw = await payload.findGlobal({
    slug: 'header',
    depth: 1,
    locale: locale as any,
  })
  const header = resolveLocalization(
    JSON.parse(JSON.stringify(headerRaw)),
    locale,
  ) as typeof headerRaw

  const allItems = [...((header as any).richItems || []), ...((header as any).items || [])]

  // 2. Auto-populate tours based on selected categories
  const categoryIdsToFetch = new Set<string>()
  for (const item of allItems) {
    const blocks = item.blockType === 'submenu' ? item.blocks || [] : [item]
    for (const block of blocks) {
      if (block.blockType === 'tourCategoryMenu' && Array.isArray(block.category)) {
        const manualTours = block.tours || []
        if (manualTours.length === 0) {
          for (const cat of block.category) {
            const catId = typeof cat === 'string' ? cat : cat?.id
            if (catId) categoryIdsToFetch.add(catId)
          }
        }
      }
    }
  }

  const tourSelectFields = {
    id: true,
    title: true,
    slug: true,
    flagCode: true,
    flagIcon: true,
    tourCount: true,
    isActive: true,
    category: true,
  } as any

  if (categoryIdsToFetch.size > 0) {
    const catIdsArr = Array.from(categoryIdsToFetch)
    const [interAuto, inboundAuto] = await Promise.all([
      payload.find({
        collection: 'intertours',
        where: {
          category: { in: catIdsArr },
          isActive: { equals: true },
          parentCountry: { exists: false },
          tourCount: { greater_than: 0 },
        },
        limit: 100,
        depth: 1,
        select: tourSelectFields,
      }),
      payload.find({
        collection: 'inbound-tours',
        where: {
          category: { in: catIdsArr },
          isActive: { equals: true },
          parentCountry: { exists: false },
          tourCount: { greater_than: 0 },
        },
        limit: 100,
        depth: 1,
        select: tourSelectFields,
      }),
    ])

    const autoToursByCategory: Record<string, any[]> = {}
    const addTourToCat = (doc: any, relationTo: string) => {
      const catId = typeof doc.category === 'object' ? doc.category?.id : doc.category
      if (catId) {
        if (!autoToursByCategory[catId]) autoToursByCategory[catId] = []
        autoToursByCategory[catId].push({ relationTo, value: doc })
      }
    }
    interAuto.docs.forEach((doc) => addTourToCat(doc, 'intertours'))
    inboundAuto.docs.forEach((doc) => addTourToCat(doc, 'inbound-tours'))

    for (const item of allItems) {
      const blocks = item.blockType === 'submenu' ? item.blocks || [] : [item]
      for (const block of blocks) {
        if (block.blockType === 'tourCategoryMenu' && Array.isArray(block.category)) {
          const manualTours = block.tours || []
          if (manualTours.length === 0) {
            const autoTours: any[] = []
            const existingIds = new Set()
            for (const cat of block.category) {
              const catId = typeof cat === 'string' ? cat : cat?.id
              if (catId && autoToursByCategory[catId]) {
                for (const t of autoToursByCategory[catId]) {
                  if (!existingIds.has(t.value.id)) {
                    autoTours.push(t)
                    existingIds.add(t.value.id)
                  }
                }
              }
            }
            block.tours = autoTours
          }
        }
      }
    }
  }

  // 3. Hydrate unpopulated tour IDs
  const unpopulatedTourIds = new Set<string>()
  for (const item of allItems) {
    const blocks = item.blockType === 'submenu' ? item.blocks || [] : [item]
    for (const block of blocks) {
      if (block.blockType !== 'tourCategoryMenu') continue
      for (const tour of block.tours || []) {
        const v = tour?.value ?? tour
        const idStr = toIdString(v)
        if (idStr) {
          unpopulatedTourIds.add(idStr)
        }
      }
    }
  }

  if (unpopulatedTourIds.size > 0) {
    const tourIdsArr = Array.from(unpopulatedTourIds)
    const [interRes, inboundRes] = await Promise.all([
      payload.find({
        collection: 'intertours',
        where: { id: { in: tourIdsArr } },
        limit: tourIdsArr.length,
        depth: 1,
        locale: locale as any,
        select: tourSelectFields,
      }),
      payload.find({
        collection: 'inbound-tours',
        where: { id: { in: tourIdsArr } },
        limit: tourIdsArr.length,
        depth: 1,
        locale: locale as any,
        select: tourSelectFields,
      }),
    ])
    const interMap = new Map(
      interRes.docs.map((doc) => [doc.id, { relationTo: 'intertours', value: doc }]),
    )
    const inboundMap = new Map(
      inboundRes.docs.map((doc) => [doc.id, { relationTo: 'inbound-tours', value: doc }]),
    )

    for (const item of allItems) {
      const blocks = item.blockType === 'submenu' ? item.blocks || [] : [item]
      for (const block of blocks) {
        if (block.blockType !== 'tourCategoryMenu') continue
        for (let i = 0; i < (block.tours || []).length; i++) {
          let t = block.tours[i]
          const rawVal =
            typeof t === 'object' && t !== null && 'value' in t ? t.value : t
          const idStr = toIdString(rawVal)
          if (idStr) {
            const hydrated = interMap.get(idStr) || inboundMap.get(idStr)
            if (hydrated) {
              block.tours[i] = resolveLocalization(JSON.parse(JSON.stringify(hydrated)), locale)
            }
          }
        }
      }
    }
  }

  // 4. Hydrate flagIcon media
  const unpopulatedIds = new Set<string>()
  for (const item of allItems) {
    const blocks = item.blockType === 'submenu' ? item.blocks || [] : [item]
    for (const block of blocks) {
      if (block.blockType !== 'tourCategoryMenu') continue
      for (const tour of block.tours || []) {
        const v = tour?.value ?? tour
        if (typeof v === 'object' && v !== null) {
          const fi = v.flagIcon
          if (typeof fi === 'string' && fi.length > 0) {
            unpopulatedIds.add(fi)
          }
        }
      }
    }
  }

  if (unpopulatedIds.size > 0) {
    const mediaSelect = {
      id: true,
      url: true,
      filename: true,
      mimeType: true,
      width: true,
      height: true,
      alt: true,
    } as any
    const mediaResult = await payload.find({
      collection: 'media',
      where: { id: { in: Array.from(unpopulatedIds) } },
      limit: unpopulatedIds.size,
      depth: 0,
      locale: locale as any,
      select: mediaSelect,
    })
    const mediaMap = new Map(mediaResult.docs.map((doc) => [doc.id, doc]))

    for (const item of allItems) {
      const blocks = item.blockType === 'submenu' ? item.blocks || [] : [item]
      for (const block of blocks) {
        if (block.blockType !== 'tourCategoryMenu') continue
        for (const tour of block.tours || []) {
          const v = tour?.value ?? tour
          if (typeof v === 'object' && v !== null && typeof v.flagIcon === 'string') {
            const media = mediaMap.get(v.flagIcon)
            if (media) {
              v.flagIcon = resolveLocalization(JSON.parse(JSON.stringify(media)), locale)
            }
          }
        }
      }
    }
  }

  // 5. Fetch company info + hydrate logo
  const companyInfoRaw = await payload.findGlobal({
    slug: 'company-info',
    depth: 0,
    locale: locale as any,
  })
  let companyInfo = resolveLocalization(JSON.parse(JSON.stringify(companyInfoRaw)), locale)
  if (companyInfo?.companyLogo && typeof companyInfo.companyLogo === 'string') {
    try {
      const logoMedia = await payload.findByID({
        collection: 'media',
        id: companyInfo.companyLogo,
        depth: 0,
        select: {
          id: true,
          url: true,
          filename: true,
          mimeType: true,
          width: true,
          height: true,
          alt: true,
        } as any,
      })
      companyInfo = { ...companyInfo, companyLogo: logoMedia }
    } catch {
      // Logo not found
    }
  }

  // 6. Fetch cities map (for mega menu support in all navbar variants)
  let citiesMap: Record<string, any[]> = {}
  const { fetchCitiesMapDirect } = await import('@/utilities/getCachedCitiesMap')
  citiesMap = await fetchCitiesMapDirect(payload)

  return {
    header: JSON.parse(JSON.stringify(header)),
    companyInfo: JSON.parse(JSON.stringify(companyInfo)),
    citiesMap: JSON.parse(JSON.stringify(citiesMap)),
  }
}

const getCachedHeaderData = (locale: string) =>
  unstable_cache(() => fetchHeaderData(locale), ['header_full_data', locale], {
    tags: [HEADER_CACHE_TAG],
  })()

export async function Header({ publicContext }: { publicContext: PublicContextProps }) {
  // ดึงข้อมูล Header ทั้งหมดจาก Cache ก้อนเดียว (revalidate เมื่อ admin แก้ไข)
  const { header, companyInfo, citiesMap } = await getCachedHeaderData(publicContext.locale)

  // getCurrentUser ต้องอยู่นอก cache เพราะขึ้นกับ session ของแต่ละ request
  const currentUser = await getCurrentUser()

  const contextWithUser: PublicContextProps = {
    ...publicContext,
    currentUser,
  }

  // Data จาก cache ถูก sanitize (JSON.parse/stringify) แล้ว ใช้ได้โดยตรง
  const sanitizedHeader = header
  const sanitizedCompanyInfo = companyInfo
  const sanitizedCitiesMap = citiesMap

  let navbarComponent: ReactElement = (<></>) as unknown as ReactElement
  switch (header.designVersion as string) {
    case '1': {
      navbarComponent = (
        <Navbar1 header={sanitizedHeader} publicContext={contextWithUser} companyInfo={sanitizedCompanyInfo} citiesMap={sanitizedCitiesMap} />
      )
      break
    }
    case '2': {
      navbarComponent = (
        <Navbar2 header={sanitizedHeader} publicContext={contextWithUser} companyInfo={sanitizedCompanyInfo} citiesMap={sanitizedCitiesMap} />
      )
      break
    }
    case '3': {
      navbarComponent = (
        <Navbar3WowTour header={sanitizedHeader} publicContext={contextWithUser} companyInfo={sanitizedCompanyInfo} citiesMap={sanitizedCitiesMap} />
      )
      break
    }
    case '4': {
      navbarComponent = (
        <Navbar4WowTour
          header={sanitizedHeader}
          publicContext={contextWithUser}
          companyInfo={sanitizedCompanyInfo}
          citiesMap={sanitizedCitiesMap}
        />
      )
      break
    }
    case '5': {
      navbarComponent = <Navbar5 header={sanitizedHeader} publicContext={contextWithUser} citiesMap={sanitizedCitiesMap} />
      break
    }
    case '6': {
      navbarComponent = (
        <WowtourNavbar5
          header={sanitizedHeader}
          publicContext={contextWithUser}
          companyInfo={sanitizedCompanyInfo}
          citiesMap={sanitizedCitiesMap}
        />
      )
      break
    }
    case '7': {
      navbarComponent = (
        <Navbar6WowTour header={sanitizedHeader} publicContext={contextWithUser} companyInfo={sanitizedCompanyInfo} citiesMap={sanitizedCitiesMap} />
      )
      break
    }
    case '8': {
      navbarComponent = (
        <Navbar7WowTour header={sanitizedHeader} publicContext={contextWithUser} companyInfo={sanitizedCompanyInfo} citiesMap={sanitizedCitiesMap} />
      )
      break
    }
  }

  // Build CSS custom properties from admin color settings
  // Values can be: system tokens (e.g. 'primary'), gradient presets (e.g. 'gradient-blue'), or custom (e.g. 'custom:#FF5500')
  const GRADIENT_MAP: Record<string, { base: string; full: string }> = {
    'gradient-blue': {
      base: '#1976D2',
      full: 'linear-gradient(135deg, #1976D2 0%, #42A5F5 50%, #64B5F6 100%)',
    },
    'gradient-teal': {
      base: '#00897B',
      full: 'linear-gradient(135deg, #00897B 0%, #26A69A 50%, #4DB6AC 100%)',
    },
    'gradient-purple': {
      base: '#7B1FA2',
      full: 'linear-gradient(135deg, #7B1FA2 0%, #AB47BC 50%, #CE93D8 100%)',
    },
    'gradient-orange': {
      base: '#E65100',
      full: 'linear-gradient(135deg, #E65100 0%, #FB8C00 50%, #FFB74D 100%)',
    },
    'gradient-red': {
      base: '#C62828',
      full: 'linear-gradient(135deg, #C62828 0%, #EF5350 50%, #EF9A9A 100%)',
    },
    'gradient-dark': {
      base: '#1a1a2e',
      full: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    },
  }

  // Resolve a color value to CSS — handles custom hex, gradient presets, CSS keywords, and system tokens
  const resolveColor = (val: string): string | null => {
    if (!val) return null
    if (val.startsWith('custom:')) return val.slice(7)
    if (GRADIENT_MAP[val]) return GRADIENT_MAP[val].base
    // Direct CSS color keywords
    if (val === 'white') return '#ffffff'
    if (val === 'black') return '#000000'
    return `var(--${val})`
  }

  // Resolve a color value for CSS `color` property — gradients are NOT valid for `color`,
  // so extract the first hex color from any gradient string as a graceful fallback
  const resolveTextColor = (val: string): string | null => {
    if (!val) return null
    if (val.startsWith('custom:')) {
      const raw = val.slice(7)
      // Custom gradient → extract the first color as fallback (CSS color doesn't accept gradients)
      if (raw.includes('gradient')) {
        const colorMatch = raw.match(/#[0-9a-fA-F]{3,8}/)
        return colorMatch ? colorMatch[0] : null
      }
      return raw
    }
    if (GRADIENT_MAP[val]) return GRADIENT_MAP[val].base
    if (val === 'white') return '#ffffff'
    if (val === 'black') return '#000000'
    return `var(--${val})`
  }

  const colorSettings = (header as any).colorSettings || {}
  const cssVars: Record<string, string> = {}

  if (colorSettings.menuTextColor) {
    const c = resolveTextColor(colorSettings.menuTextColor)
    if (c) cssVars['--header-menu-text'] = c
  }

  if (colorSettings.menuActiveColor) {
    const c = resolveTextColor(colorSettings.menuActiveColor)
    if (c) cssVars['--header-accent'] = c
  }

  if (colorSettings.gradientColor) {
    const gVal = colorSettings.gradientColor
    if (gVal.startsWith('custom:')) {
      const c = gVal.slice(7)
      if (c.includes('gradient')) {
        // Already a full gradient — use directly
        cssVars['--header-gradient-full'] = c
        // Extract the first color for --header-gradient fallback
        const colorMatch = c.match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)/)
        if (colorMatch) cssVars['--header-gradient'] = colorMatch[0]
      } else {
        cssVars['--header-gradient'] = c
        cssVars['--header-gradient-full'] =
          `linear-gradient(135deg, ${c} 0%, color-mix(in srgb, ${c} 70%, white) 50%, color-mix(in srgb, ${c} 40%, white) 100%)`
      }
    } else if (GRADIENT_MAP[gVal]) {
      cssVars['--header-gradient'] = GRADIENT_MAP[gVal].base
      cssVars['--header-gradient-full'] = GRADIENT_MAP[gVal].full
    } else {
      const c = resolveColor(gVal)
      if (c) cssVars['--header-gradient'] = c
    }
  }

  if (colorSettings.topContainerTextColor) {
    const c = resolveTextColor(colorSettings.topContainerTextColor)
    if (c) cssVars['--header-top-text'] = c
  }

  if (colorSettings.headerBackground) {
    const val = colorSettings.headerBackground
    if (val.startsWith('custom:')) {
      cssVars['--header-bg'] = val.slice(7)
    } else if (GRADIENT_MAP[val]) {
      cssVars['--header-bg'] = GRADIENT_MAP[val].full
    } else {
      const c = resolveColor(val)
      if (c) cssVars['--header-bg'] = c
    }
  }

  if (colorSettings.navBarBackground) {
    const val = colorSettings.navBarBackground
    if (val.startsWith('custom:')) {
      cssVars['--header-nav-bg'] = val.slice(7)
    } else if (GRADIENT_MAP[val]) {
      cssVars['--header-nav-bg'] = GRADIENT_MAP[val].full
    } else {
      const c = resolveColor(val)
      if (c) cssVars['--header-nav-bg'] = c
    }
  }

  // General dropdown settings — applies to all non-Tour-Category dropdowns
  const generalDropdownSettings = (header as any).generalDropdownSettings || {}
  if (generalDropdownSettings.dropdownBgColor) {
    const val = generalDropdownSettings.dropdownBgColor
    if (val.startsWith('custom:')) {
      cssVars['--dropdown-bg'] = val.slice(7)
    } else if (GRADIENT_MAP[val]) {
      cssVars['--dropdown-bg'] = GRADIENT_MAP[val].full
    } else {
      const c = resolveColor(val)
      if (c) cssVars['--dropdown-bg'] = c
    }
  }
  if (generalDropdownSettings.dropdownTextColor) {
    const c = resolveColor(generalDropdownSettings.dropdownTextColor)
    if (c) cssVars['--dropdown-text'] = c
  }
  if (generalDropdownSettings.dropdownHoverColor) {
    const c = resolveColor(generalDropdownSettings.dropdownHoverColor)
    if (c) cssVars['--dropdown-hover'] = c
  }

  // Tour Category dropdown settings — only for dropdowns with Tour Category blocks
  const dropdownSettings = (header as any).dropdownSettings || {}
  if (dropdownSettings.dropdownBgColor) {
    const val = dropdownSettings.dropdownBgColor
    if (val.startsWith('custom:')) {
      cssVars['--tc-dropdown-bg'] = val.slice(7)
    } else if (GRADIENT_MAP[val]) {
      cssVars['--tc-dropdown-bg'] = GRADIENT_MAP[val].full
    } else {
      const c = resolveColor(val)
      if (c) cssVars['--tc-dropdown-bg'] = c
    }
  }
  if (dropdownSettings.dropdownTextColor) {
    const c = resolveColor(dropdownSettings.dropdownTextColor)
    if (c) cssVars['--tc-dropdown-text'] = c
  }
  if (dropdownSettings.dropdownHoverColor) {
    const c = resolveColor(dropdownSettings.dropdownHoverColor)
    if (c) cssVars['--tc-dropdown-hover'] = c
  }
  if (dropdownSettings.badgeTextColor) {
    const c = resolveColor(dropdownSettings.badgeTextColor)
    if (c) cssVars['--badge-text'] = c
  }
  if (dropdownSettings.badgeBgColor) {
    const c = resolveColor(dropdownSettings.badgeBgColor)
    if (c) cssVars['--badge-bg'] = c
  }

  return (
    <div
      style={
        Object.keys(cssVars).length > 0
          ? ({ ...cssVars, display: 'contents' } as React.CSSProperties)
          : { display: 'contents' }
      }
    >
      {navbarComponent}
      <HeaderClient />
    </div>
  )
}
