import React from 'react'
import type { WowtourPopularCountryBlock as WowtourPopularCountryBlockType } from '@/payload-types'
import type { PublicContextProps } from '@/utilities/publicContextProps'
import { WowtourPopularCountry1 } from './wowtour_popularCountry1'
import { WowtourPopularCountry2 } from './wowtour_popularCountry2'
import { WowtourPopularCountry3 } from './wowtour_popularCountry3'
import { WowtourPopularCountry4 } from './wowtour_popularCountry4'

type WowtourPopularCountryBlockProps = WowtourPopularCountryBlockType & {
  publicContext: PublicContextProps
}

const blockComponents: Record<string, React.FC<WowtourPopularCountryBlockProps>> = {
  WOWTOUR_POPULAR_COUNTRY_1: WowtourPopularCountry1,
  WOWTOUR_POPULAR_COUNTRY_2: WowtourPopularCountry2,
  WOWTOUR_POPULAR_COUNTRY_3: WowtourPopularCountry3,
  WOWTOUR_POPULAR_COUNTRY_4: WowtourPopularCountry4,
}

export const WowtourPopularCountryBlock: React.FC<WowtourPopularCountryBlockProps> = (props) => {
  const { designVersion } = props

  if (!designVersion || !(designVersion in blockComponents)) {
    return null
  }

  const Component = blockComponents[designVersion]
  return Component ? <Component {...props} /> : null
}
