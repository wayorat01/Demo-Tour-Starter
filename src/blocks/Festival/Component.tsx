import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import type { PublicContextProps } from '@/utilities/publicContextProps'
import { resolveLocalization } from '@/utilities/resolveLocalization'
import type { FestivalTourDesignVersion } from './config'
import { WowtourFestivalTour1 } from './wowtour_festivalTour1'
import { WowtourFestivalTour2 } from './wowtour_festivalTour2'

type FestivalTourDesigns = Record<FestivalTourDesignVersion, React.FC<any>>

const festivalTourDesigns: FestivalTourDesigns = {
  WOWTOUR_FESTIVAL_TOUR_1: WowtourFestivalTour1,
  WOWTOUR_FESTIVAL_TOUR_2: WowtourFestivalTour2,
}

const getCachedFestivals = unstable_cache(
  async () => {
    const payload = await getPayload({ config: configPromise })
    const festivalsResult = await payload.find({
      collection: 'festivals',
      limit: 100,
      sort: 'title',
      depth: 1,
    })
    return JSON.parse(JSON.stringify(festivalsResult.docs))
  },
  ['festivals_list'],
  { tags: ['festivals'] },
)

export const WowtourFestivalTourBlock: React.FC<any> = async (props) => {
  if (props.blockType !== 'wowtourFestivalTour') return null

  const { designVersion } = props || {}
  if (!designVersion) return null

  const ComponentToRender = festivalTourDesigns[designVersion as FestivalTourDesignVersion]
  if (!ComponentToRender) return null

  const festivals = await getCachedFestivals()
  const sanitizedFestivals = resolveLocalization(festivals, props.publicContext?.locale || 'th')

  return <ComponentToRender {...props} festivals={sanitizedFestivals} />
}

export default WowtourFestivalTourBlock
