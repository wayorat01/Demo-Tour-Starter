import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import { resolveLocalization } from './resolveLocalization'

async function fetchCitiesMap() {
  const payload = await getPayload({ config: configPromise })
  return fetchCitiesMapWithPayload(payload)
}

// Direct version ที่รับ payload instance — ใช้ใน Header cache ก้อนเดียว
export async function fetchCitiesMapDirect(payload: any) {
  return fetchCitiesMapWithPayload(payload)
}

async function fetchCitiesMapWithPayload(payload: any) {
  const [interCities, inboundCities] = await Promise.all([
    payload.find({
      collection: 'intertours',
      where: { parentCountry: { exists: true } },
      limit: 2000,
      depth: 1,
      select: {
        id: true,
        parentCountry: true,
        title: true,
        slug: true,
        tourCount: true,
        flagCode: true,
        flagIcon: true,
      },
      locale: 'th' as any,
    }),
    payload.find({
      collection: 'inbound-tours',
      where: { parentCountry: { exists: true } },
      limit: 2000,
      depth: 1,
      select: {
        id: true,
        parentCountry: true,
        title: true,
        slug: true,
        tourCount: true,
        flagCode: true,
        flagIcon: true,
      },
      locale: 'th' as any,
    }),
  ])

  const citiesMap: Record<string, any[]> = {}

  const processCities = (docs: any[]) => {
    for (const city of docs) {
      if (city.parentCountry) {
        const pId =
          typeof city.parentCountry === 'object' ? city.parentCountry.id : city.parentCountry
        if (!citiesMap[pId]) citiesMap[pId] = []
        citiesMap[pId].push({
          id: city.id,
          title: city.title,
          slug: city.slug,
          tourCount: city.tourCount || 0,
          flagCode: city.flagCode || undefined,
          flagIcon: city.flagIcon || undefined,
        })
      }
    }
  }

  processCities(interCities.docs)
  processCities(inboundCities.docs)

  return resolveLocalization(JSON.parse(JSON.stringify(citiesMap)), 'th')
}

export const getCachedCitiesMap = () =>
  unstable_cache(async () => fetchCitiesMap(), ['citiesMap_v2'], {
    tags: ['intertours', 'inbound-tours'],
  })()
