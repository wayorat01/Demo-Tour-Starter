import Feature1 from '@/blocks/Feature/feature1'
import Feature25 from '@/blocks/Feature/feature25'
import Feature50 from '@/blocks/Feature/feature50'
import Feature53 from '@/blocks/Feature/feature53'
import Feature57 from '@/blocks/Feature/feature57'
import Feature70 from '@/blocks/Feature/feature70'
import Feature72 from '@/blocks/Feature/feature72'
import Feature91 from '@/blocks/Feature/feature91'
import Feature97 from '@/blocks/Feature/feature97'
import Feature99 from '@/blocks/Feature/feature99'
import Feature102 from '@/blocks/Feature/feature102'
import Feature103 from '@/blocks/Feature/feature103'
import Feature105 from '@/blocks/Feature/feature105'
import Feature114 from '@/blocks/Feature/feature114'
import Feature117 from '@/blocks/Feature/feature117'
import Feature126 from '@/blocks/Feature/feature126'
import Feature159 from '@/blocks/Feature/feature159'
import Feature250 from '@/blocks/Feature/feature250'

import { Page } from '@/payload-types'
import { FeatureDesignVersion } from './config'

// Extract just the value property from FeatureDesignVersion for use as keys
type FeatureDesignVersionValue = FeatureDesignVersion['value']

// Enforce required features but allow additional ones
type Feature<T extends string = string> = Required<
  Record<FeatureDesignVersionValue, React.FC<any>>
> &
  Record<T, React.FC<any>>

const features: Feature = {
  FEATURE1: Feature1,
  FEATURE25: Feature25,
  FEATURE50: Feature50,
  FEATURE53: Feature53,
  FEATURE57: Feature57,
  FEATURE70: Feature70,
  FEATURE72: Feature72,
  FEATURE91: Feature91,
  FEATURE97: Feature97,
  FEATURE99: Feature99,
  FEATURE102: Feature102,
  FEATURE103: Feature103,
  FEATURE105: Feature105,
  FEATURE114: Feature114,
  FEATURE117: Feature117,
  FEATURE126: Feature126,
  FEATURE159: Feature159,
  FEATURE250: Feature250,
}

export const FeatureBlock: React.FC<Page['layout'][0]> = (props) => {
  if (props.blockType !== 'feature') return null

  const { designVersion } = props || {}

  if (!designVersion) return null

  const FeatureToRender = features[designVersion]

  if (!FeatureToRender) return null

  return <FeatureToRender {...props} />
}
