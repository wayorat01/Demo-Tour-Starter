import { WowtourPromotionCard1 } from './wowtour_promotionCard1'
import { allWowtourPromotionCardDesignVersions } from './config'
import { Page } from '@/payload-types'

type PromotionCardDesignVersionValue =
  (typeof allWowtourPromotionCardDesignVersions)[number]['value']

type PromotionCards = Record<PromotionCardDesignVersionValue, React.FC<any>>

const promotionCards: PromotionCards = {
  WOWTOUR_PROMOTION_CARD_1: WowtourPromotionCard1,
}

export const WowtourPromotionCardBlock: React.FC<Page['layout'][0]> = (props) => {
  if (props.blockType !== 'wowtourPromotionCard') return null

  const { designVersion } = props || {}

  if (!designVersion) return null

  const CardToRender = promotionCards[designVersion as PromotionCardDesignVersionValue]

  if (!CardToRender) return null

  return <CardToRender {...props} />
}
