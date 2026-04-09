import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import type { WowtourTourTypeBlock as WowtourTourTypeBlockType } from '@/payload-types'
import type { PublicContextProps } from '@/utilities/publicContextProps'
import { WowtourTourCard1 } from './wowtour_tourCard1'
import { WowtourTourCard2 } from './wowtour_tourCard2'
import { WowtourTourCard3 } from './wowtour_tourCard3'
import { WowtourTourCard4 } from './wowtour_tourCard4'
import { WowtourTourCard5 } from './wowtour_tourCard5'
import { WowtourTourCard6 } from './wowtour_tourCard6'
import { mapProgramTourToTourItemCMS } from '@/utilities/fetchTourProducts'

type WowtourTourTypeBlockProps = WowtourTourTypeBlockType & {
  publicContext: PublicContextProps
}

const blockComponents: Record<string, React.FC<any>> = {
  WOWTOUR_TOUR_CARD_1: WowtourTourCard1,
  WOWTOUR_TOUR_CARD_2: WowtourTourCard2,
  WOWTOUR_TOUR_CARD_3: WowtourTourCard3,
  WOWTOUR_TOUR_CARD_4: WowtourTourCard4,
  WOWTOUR_TOUR_CARD_5: WowtourTourCard5,
  WOWTOUR_TOUR_CARD_6: WowtourTourCard6,
}

/**
 * Fetch tours from a Tour Group in the CMS (with cache).
 * Resolves the tour-groups relationship and populates the tours (programtour) documents.
 */
async function resolveTourGroupProductsRaw(
  tourGroupId: string,
): Promise<{ tours: any[]; title: string | null }> {
  try {
    const payload = await getPayload({ config: configPromise })

    const tourGroup = await payload.findByID({
      collection: 'tour-groups',
      id: tourGroupId,
      depth: 2,
    })

    if (!tourGroup) {
      return { tours: [], title: null }
    }

    if (!tourGroup.isActive) {
      return { tours: [], title: null }
    }

    const programTours = (tourGroup.tours || []).filter(
      (t: any) => typeof t === 'object' && t !== null,
    )

    const mappedTours = programTours.map(mapProgramTourToTourItemCMS)

    return {
      tours: JSON.parse(JSON.stringify(mappedTours)),
      title: tourGroup.label || null,
    }
  } catch (error: any) {
    if (error?.status === 404 || error?.name === 'NotFound') {
      console.warn(`[TourType] Tour Group not found (id: ${tourGroupId})`)
    } else {
      console.warn(`[TourType] Failed to fetch Tour Group: ${error?.message || error}`)
    }
    return { tours: [], title: null }
  }
}

const getCachedTourGroupProducts = (tourGroupId: string) =>
  unstable_cache(
    () => resolveTourGroupProductsRaw(tourGroupId),
    ['tour-group-products', tourGroupId],
    { tags: ['tour-groups', 'program-tours'] },
  )()

export const WowtourTourTypeBlock: React.FC<WowtourTourTypeBlockProps> = async (props) => {
  const { designVersion } = props
  const tourGroupRef = (props as any).tourGroup

  if (!designVersion || !(designVersion in blockComponents)) {
    return null
  }

  // Support both string ID and populated object
  const tourGroupId = typeof tourGroupRef === 'object' ? tourGroupRef?.id : tourGroupRef

  if (!tourGroupId) {
    console.warn('[TourType] tourGroup is required')
    return null
  }

  const { tours, title: groupTitle } = await getCachedTourGroupProducts(tourGroupId)

  const Component = blockComponents[designVersion]

  return Component ? <Component {...props} tours={tours} apiTitle={groupTitle} /> : null
}
