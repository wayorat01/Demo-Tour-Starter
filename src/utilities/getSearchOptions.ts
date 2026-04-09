import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

export async function fetchSearchOptions() {
  const payload = await getPayload({ config: configPromise })

  // ⚡ Phase 1: All independent DB queries in parallel
  const [
    intertoursResult,
    inboundToursResult,
    allProgramsResult,
    airlinesResult,
    cityQueryResult,
    inboundCityQueryResult,
    festivalsResult,
  ] = await Promise.all([
    payload.find({
      collection: 'intertours',
      limit: 0,
      depth: 1,
      where: { isActive: { equals: true } },
      context: { skipCount: true },
      locale: 'th',
    }),
    payload.find({
      collection: 'inbound-tours',
      limit: 0,
      depth: 1,
      where: { isActive: { equals: true } },
      context: { skipCount: true },
      locale: 'th',
    }),
    payload.find({
      collection: 'program-tours',
      limit: 0,
      depth: 0,
    }),
    payload.find({
      collection: 'airlines',
      where: { isActive: { equals: true } },
      sort: '-countProduct',
      limit: 0,
      depth: 0,
    }),
    payload.find({
      collection: 'intertours',
      where: { parentCountry: { exists: true }, isActive: { equals: true } },
      depth: 1,
      limit: 0,
      locale: 'th',
    }),
    payload.find({
      collection: 'inbound-tours',
      where: { parentCountry: { exists: true }, isActive: { equals: true } },
      depth: 1,
      limit: 0,
      locale: 'th',
    }),
    payload.find({
      collection: 'festivals',
      sort: '-countProduct',
      limit: 0,
      depth: 0,
    }),
  ])

  // Helper: resolve localized objects {th: '...', en: '...'} to plain strings
  const resolveStr = (val: unknown): string => {
    if (typeof val === 'string') return val
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      const obj = val as Record<string, unknown>
      return String(obj.th || '')
    }
    return val ? String(val) : ''
  }

  // ⚡ Phase 2: Process intertours and inbound tours
  const countryMap = new Map<
    string,
    { title: string; title_en: string; slug: string; count: number }
  >()
  const inboundCountryMap = new Map<
    string,
    { title: string; title_en: string; slug: string; count: number }
  >()
  const categoryMap = new Map<string, { label: string; count: number }>()

  // Process Intertours
  for (const tour of intertoursResult.docs) {
    const title = resolveStr((tour as any).title)
    const title_en = resolveStr((tour as any).title_en)
    const slug = (tour as any).slug
    const category = (tour as any).category
    const parentCountry = (tour as any).parentCountry

    if (category && typeof category === 'object' && category.id) {
      const catId = category.id
      const catLabel = category.title || category.name || catId
      if (categoryMap.has(catId)) {
        categoryMap.get(catId)!.count += (tour as any).tourCount || 0
      } else {
        categoryMap.set(catId, { label: resolveStr(catLabel), count: (tour as any).tourCount || 0 })
      }
    }

    if (!parentCountry && !countryMap.has(title)) {
      countryMap.set(title, {
        title,
        title_en,
        slug: slug || '',
        count: (tour as any).tourCount || 0,
      })
    }
  }

  // Process Inbound Tours
  for (const tour of inboundToursResult.docs) {
    const title = resolveStr((tour as any).title)
    const title_en = resolveStr((tour as any).title_en)
    const slug = (tour as any).slug
    const parentCountry = (tour as any).parentCountry

    if (!parentCountry && !inboundCountryMap.has(title)) {
      inboundCountryMap.set(title, {
        title,
        title_en,
        slug: slug || '',
        count: (tour as any).tourCount || 0,
      })
    }
  }

  // ⚡ Phase 3: Aggregate from ProgramTours (already fetched)
  const durationMap = new Map<number, number>()
  const hotelStarMap = new Map<string, number>()
  const monthMap = new Map<number, number>()
  const supplierSet = new Set<string>()
  const supplierByCountry = new Map<string, Set<string>>()  // countrySlug → supplier names
  const activeCountrySlugs = new Set<string>()
  let priceMin = Infinity
  let priceMax = 0

  for (const doc of allProgramsResult.docs) {
    const p = doc as any
    if (p.stayDay && p.stayDay > 0)
      durationMap.set(p.stayDay, (durationMap.get(p.stayDay) || 0) + 1)
    if (p.hotelStar) hotelStarMap.set(p.hotelStar, (hotelStarMap.get(p.hotelStar) || 0) + 1)
    for (const period of p.periods || []) {
      if (period.periodStartValue) {
        const monthIdx = new Date(period.periodStartValue).getMonth()
        monthMap.set(monthIdx, (monthMap.get(monthIdx) || 0) + 1)
      }
    }
    if (p.supplierName) {
      supplierSet.add(p.supplierName)
      if (p.countrySlug) {
        if (!supplierByCountry.has(p.countrySlug)) supplierByCountry.set(p.countrySlug, new Set())
        supplierByCountry.get(p.countrySlug)!.add(p.supplierName)
      }
    }
    if (p.countrySlug) {
      activeCountrySlugs.add(p.countrySlug)
    }
    const price = p.priceProduct || 0
    if (price > 0 && price < priceMin) priceMin = price
    if (price > priceMax) priceMax = price
  }
  if (priceMin === Infinity) priceMin = 0
  if (priceMax === 0) priceMax = 600000

  // ⚡ Phase 4: Format results
  const countries = Array.from(countryMap.values())
    .filter((c) => activeCountrySlugs.has(c.slug))
    .sort((a, b) => a.title.localeCompare(b.title, 'th'))
    
  const inboundCountries = Array.from(inboundCountryMap.values())
    .filter((c) => activeCountrySlugs.has(c.slug))
    .sort((a, b) => a.title.localeCompare(b.title, 'th'))

  const airlines = airlinesResult.docs.map((a: any) => ({
    label: resolveStr(a.airlineName),
    value: a.airlineCode || '',
    code: a.airlineCode || '',
    icon: a.urlAirlinePicIcon || '',
    count: a.countProduct || 0,
  }))

  const durations = Array.from(durationMap.entries())
    .map(([days, count]) => ({ label: `${days} วัน`, value: days, count }))
    .sort((a, b) => Number(a.value) - Number(b.value))

  const hotelStars = Array.from(hotelStarMap.entries())
    .map(([star, count]) => ({ label: `${star} ดาว`, value: star, count }))
    .sort((a, b) => Number(b.value) - Number(a.value))

  // City helper to reuse code for both collections
  const buildCityList = (cityArray: any[], cMap: Map<string, any>) => {
    return cityArray
      .filter((c: any) => c.parentCountry && typeof c.parentCountry === 'object')
      .filter((c: any) => cMap.has(resolveStr(c.parentCountry?.title) || ''))
      .map((c: any) => ({
        label: resolveStr(c.title),
        value: c.slug || '',
        title_en: resolveStr((c as any).title_en),
        parentCountry: resolveStr(c.parentCountry?.title),
        parentSlug: c.parentCountry?.slug || '',
        count: c.tourCount || 0,
      }))
      .sort((a: any, b: any) => a.label.localeCompare(b.label, 'th'))
      .filter((c: any, i: number, arr: any[]) => i === 0 || c.label !== arr[i - 1].label)
  }

  const cityList = buildCityList(cityQueryResult.docs, countryMap)
  const inboundCityList = buildCityList(inboundCityQueryResult.docs, inboundCountryMap)

  const MONTHS_TH = [
    'มกราคม',
    'กุมภาพันธ์',
    'มีนาคม',
    'เมษายน',
    'พฤษภาคม',
    'มิถุนายน',
    'กรกฎาคม',
    'สิงหาคม',
    'กันยายน',
    'ตุลาคม',
    'พฤศจิกายน',
    'ธันวาคม',
  ]
  const months = MONTHS_TH.map((label, idx) => ({
    label,
    value: label,
    monthIndex: idx,
    count: monthMap.get(idx) || 0,
  }))

  const festivals = festivalsResult.docs.map((f: any) => ({
    label: resolveStr(f.nameHoliday),
    value: f.slugHoliday || '',
    count: f.countProduct || 0,
    startDate: f.startDate || null,
  }))

  const categories = Array.from(categoryMap.entries())
    .map(([id, data]) => ({ label: data.label, value: id, count: data.count }))
    .sort((a, b) => b.count - a.count)

  const wholesaleList = Array.from(supplierSet)
    .sort()
    .map((s) => ({ label: s, value: s }))

  const result = {
    // Intertours
    countries: countries.map((c) => c.title),
    countryList: countries.map((c) => ({ title: c.title, title_en: c.title_en, slug: c.slug })),
    cities: cityList.map((c: any) => c.label),
    cityList,
    // Inbound Tours
    inboundCountries: inboundCountries.map((c) => c.title),
    inboundCountryList: inboundCountries.map((c) => ({ title: c.title, title_en: c.title_en, slug: c.slug })),
    inboundCities: inboundCityList.map((c: any) => c.label),
    inboundCityList,
    // Shared
    airlines: airlines.map((a) => a.label),
    festivals: festivals.map((f) => f.label),
    festivalList: festivals,
    wholesaleList,
    filterOptions: {
      countries,
      inboundCountries,
      airlines,
      durations,
      hotelStars,
      cities: cityList,
      inboundCities: inboundCityList,
      months,
      festivals,
      categories,
      priceRange: { min: priceMin, max: priceMax },
      wholesale: wholesaleList,
      wholesaleByCountry: Object.fromEntries(
        Array.from(supplierByCountry.entries()).map(([slug, set]) => [
          slug,
          Array.from(set).sort().map((s) => ({ label: s, value: s })),
        ]),
      ),
    },
  }

  // Strip non-serializable BSON objects (ObjectId, Buffer, localized field wrappers)
  // that cause "Objects with toJSON methods are not supported" in Server→Client props
  return JSON.parse(JSON.stringify(result))
}

export const getCachedSearchOptions = unstable_cache(
  async () => fetchSearchOptions(),
  ['search-options'],
  { tags: ['search-options'], revalidate: 300 },
)
