import WowtourContact1 from './wowtour_contact_1'
import WowtourContact2 from './wowtour_contact2'
import WowtourContact3 from './wowtour_contact3'
import WowtourContact4 from './wowtour_contact4'
import WowtourContact5 from './wowtour_contact5'
import WowtourContact6 from './wowtour_contact6'
import WowtourContact7 from './wowtour_contact7'
import WowtourContact8 from './wowtour_contact8'
import { getCachedGlobal } from '@/utilities/getGlobals'
import type { CompanyInfo } from '@/payload-types'
import type { ContactDesignVersion } from './config'

const contactComponents: Record<ContactDesignVersion, React.FC<any>> = {
  WOWTOUR_CONTACT1: WowtourContact1,
  WOWTOUR_CONTACT2: WowtourContact2,
  WOWTOUR_CONTACT3: WowtourContact3,
  WOWTOUR_CONTACT4: WowtourContact4,
  WOWTOUR_CONTACT5: WowtourContact5,
  WOWTOUR_CONTACT6: WowtourContact6,
  WOWTOUR_CONTACT7: WowtourContact7,
  WOWTOUR_CONTACT8: WowtourContact8,
}

export const ContactBlock: React.FC<any> = async (props) => {
  const { publicContext, designVersion } = props || {}
  if (props.blockType !== 'contact') return null

  const locale = publicContext?.locale || 'th'
  const companyInfo: CompanyInfo = await getCachedGlobal('company-info', locale, 1)()

  const ComponentToRender =
    contactComponents[designVersion as ContactDesignVersion] || WowtourContact2

  return <ComponentToRender {...props} companyInfo={companyInfo} />
}

export default ContactBlock
