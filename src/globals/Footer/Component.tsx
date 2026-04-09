import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'
import { cookies } from 'next/headers'

import type { Footer, CompanyInfo, PageConfig } from '@/payload-types'

import WowtourFooter2 from './footer/wowtour_footer2'
import WowtourFooter3 from './footer/wowtour_footer3'
import WowtourFooter4 from './footer/wowtour_footer4'
import WowtourFooter5 from './footer/wowtour_footer5'
import WowtourFooter1 from './footer/wowtour_footer1'
import { PublicContextProps } from '@/utilities/publicContextProps'

export async function Footer({ publicContext }: { publicContext: PublicContextProps }) {
  // Fetch all footer data in parallel
  const [footerRaw, companyInfoRaw, pageConfigRaw] = await Promise.all([
    getCachedGlobal('footer', publicContext.locale, 2)() as Promise<Footer>,
    getCachedGlobal('company-info', publicContext.locale, 1)() as Promise<CompanyInfo>,
    getCachedGlobal('page-config', publicContext.locale, 1)() as Promise<PageConfig>,
  ])

  const footer = footerRaw
  const companyInfo = companyInfoRaw
  const pageConfig = pageConfigRaw

  // Check auth status server-side (payload-token is HttpOnly)
  const cookieStore = await cookies()
  const isLoggedIn = !!cookieStore.get('payload-token')?.value

  const footerType = footer.designVersion

  const commonProps = { footer, publicContext, companyInfo, pageConfig, isLoggedIn }

  let FooterContent: React.ReactNode = null

  switch (footerType) {
    case 'wowtour_footer2':
      FooterContent = <WowtourFooter2 {...commonProps} />
      break
    case 'wowtour_footer3':
      FooterContent = <WowtourFooter3 {...commonProps} />
      break
    case 'wowtour_footer4':
      FooterContent = <WowtourFooter4 {...commonProps} />
      break
    case 'wowtour_footer5':
      FooterContent = <WowtourFooter5 {...commonProps} />
      break
    case 'wowtour_footer1':
      FooterContent = <WowtourFooter1 {...commonProps} />
      break
    default:
      FooterContent = <WowtourFooter2 {...commonProps} />
  }

  return <>{FooterContent}</>
}
