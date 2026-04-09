import { BannerSlideDesignVersion } from './config'
import WowtourHeroBanner1 from './wowtour_heroBanner1'
import WowtourHeroBanner2 from './wowtour_heroBanner2'
import WowtourHeroBanner3 from './wowtour_heroBanner3'
import WowtourHeroBanner4 from './wowtour_heroBanner4'
import WowtourBannerSlide1 from './wowtour_bannerslide1'
import WowtourBannerSlide2 from './wowtour_bannerSlide2'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getCachedSearchOptions } from '@/utilities/getSearchOptions'

type BannerSlideVersionValue = BannerSlideDesignVersion['value']

type BannerSlide<T extends string = string> = Required<
  Record<BannerSlideVersionValue, React.FC<any>>
> &
  Record<T, React.FC<any>>

const bannerSlide: BannerSlide = {
  wowtour_heroBanner1: WowtourHeroBanner1,
  wowtour_heroBanner2: WowtourHeroBanner2,
  wowtour_heroBanner3: WowtourHeroBanner3,
  wowtour_heroBanner4: WowtourHeroBanner4,
  wowtour_bannerslide1: WowtourBannerSlide1,
  wowtour_bannerSlide2: WowtourBannerSlide2,
}

export const BannerSlideBlock: React.FC<any> = async (props) => {
  const { designVersion, publicContext } = props || {}
  if (props.blockType !== 'bannerSlide') return null
  if (!designVersion) return null

  const BannerSlideToRender = bannerSlide[designVersion as BannerSlideVersionValue]

  if (!BannerSlideToRender) return null

  // SSR fetch: ดึง pageConfig + searchOptions ส่งให้ client component เลย ไม่ต้อง fetch ซ้ำ
  const pageConfig = await getCachedGlobal('page-config', publicContext?.locale || 'th', 2)()
  const searchOptions = await getCachedSearchOptions()

  return (
    <BannerSlideToRender
      {...props}
      preloadedGlobalSettings={pageConfig}
      preloadedSearchOptions={searchOptions}
    />
  )
}

export default BannerSlideBlock
