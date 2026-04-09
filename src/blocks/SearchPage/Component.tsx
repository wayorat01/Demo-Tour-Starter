import React from 'react'
import type { WowtourSearchTourBlock as WowtourSearchTourBlockType } from '@/payload-types'
import type { PublicContextProps } from '@/utilities/publicContextProps'
import { WowtourSearchTour1 } from './wowtour_searchTour1'

type WowtourSearchPageBlockProps = WowtourSearchTourBlockType & {
  publicContext: PublicContextProps
}

const blockComponents: Record<string, React.FC<any>> = {
  WOWTOUR_SEARCH_TOUR_1: WowtourSearchTour1,
}

export const WowtourSearchPageBlock: React.FC<WowtourSearchPageBlockProps> = (props) => {
  const { designVersion } = props

  if (!designVersion || !(designVersion in blockComponents)) {
    return null
  }

  const Component = blockComponents[designVersion]
  return Component ? <Component {...props} /> : null
}
