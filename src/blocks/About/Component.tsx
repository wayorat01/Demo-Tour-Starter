import { AboutDesignVersion } from './config'
import About1 from '@/blocks/About/about1'
import About2 from '@/blocks/About/about2'
import About3 from '@/blocks/About/about3'
import About4 from '@/blocks/About/about4'
import About5 from '@/blocks/About/about5'
import WowtourAboutUs1 from '@/blocks/About/wowtour_aboutus_1'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { CompanyInfo } from '@/payload-types'

// Enforce required features but allow additional ones
type About<T extends string = string> = Required<Record<AboutDesignVersion, React.FC<any>>> &
  Record<T, React.FC<any>>

const about: About = {
  ABOUT1: About1,
  ABOUT2: About2,
  ABOUT3: About3,
  ABOUT4: About4,
  ABOUT5: About5,
  ABOUT_WOWTOUR_1: WowtourAboutUs1,
}

// Design versions that need company-info data
const needsCompanyInfo: string[] = ['ABOUT_WOWTOUR_1']

export const AboutBlock: React.FC<any> = async (props) => {
  if (props.blockType !== 'about') return null

  const { designVersion } = props || {}

  if (!designVersion) return null

  const AboutToRender = about[designVersion as AboutDesignVersion]

  if (!AboutToRender) return null

  // Fetch company-info for design versions that need it
  let companyInfo: CompanyInfo | null = null
  if (needsCompanyInfo.includes(designVersion)) {
    try {
      const payload = await getPayload({ config: configPromise })
      const companyInfoRaw = await payload.findGlobal({ slug: 'company-info', depth: 1 })
      companyInfo = JSON.parse(JSON.stringify(companyInfoRaw))
    } catch (e) {
      console.error('[AboutBlock] Failed to fetch company-info:', e)
    }
  }

  return <AboutToRender {...props} companyInfo={companyInfo} />
}

export default AboutBlock
