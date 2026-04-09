import React from 'react'
import { VisaListDesignVersion } from './config'
import WowtourVisaCard1 from '@/blocks/VisaList/wowtour_visaCard1'
import WowtourVisaCard2 from '@/blocks/VisaList/wowtour_visaCard2'
import WowtourVisaCard3 from '@/blocks/VisaList/wowtour_visaCard3'

type VisaListDesignVersionValue = VisaListDesignVersion['value']

type VisaListStyles = Record<VisaListDesignVersionValue, React.FC<any>>

const visaListStyles: VisaListStyles = {
  wowtour_visaCard1: WowtourVisaCard1,
  wowtour_visaCard2: WowtourVisaCard2,
  wowtour_visaCard3: WowtourVisaCard3,
}

export const WowtourVisaListBlock: React.FC<any> = (props) => {
  const { designVersion } = props || {}

  if (!designVersion) {
    // Fallback to Card1 if no designVersion set
    return <WowtourVisaCard1 {...props} />
  }

  const CardToRender = visaListStyles[designVersion as VisaListDesignVersionValue]

  if (!CardToRender) {
    return <WowtourVisaCard1 {...props} />
  }

  return <CardToRender {...props} />
}

export default WowtourVisaListBlock
