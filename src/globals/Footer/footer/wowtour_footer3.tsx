import { Media } from '@/components/Media'
import { Footer, CompanyInfo } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { PublicContextProps } from '@/utilities/publicContextProps'

import { FooterAdminLink } from '../FooterAdminLink'
import { PoweredByWow } from '../PoweredByWow'

/**
 * wowtour_footer3 — "Full-Width Stacked Bands"
 * Primary background with white text throughout.
 */
const WowtourFooter3: React.FC<{
  footer: Footer
  publicContext: PublicContextProps
  companyInfo: CompanyInfo
  isLoggedIn: boolean
}> = ({ footer, publicContext, companyInfo, isLoggedIn }) => {
  const logo = companyInfo?.footerLogo || companyInfo?.companyLogo

  return (
    <section>
      <footer className="bg-primary text-primary-foreground">
        {/* Band 1: Brand */}
        <div className="pt-12 pb-6">
          <div className="container flex flex-col items-center gap-4 text-center">
            {logo && (
              <Media
                resource={logo}
                alt="logo"
                className="h-12 overflow-hidden"
                imgClassName="!max-h-full !w-auto object-contain"
              />
            )}
            {companyInfo?.companyName && (
              <h3 className="text-2xl font-bold tracking-tight">{companyInfo?.companyName}</h3>
            )}
            {footer.subline && <p className="max-w-lg text-base opacity-80">{footer.subline}</p>}
          </div>
        </div>

        {/* Band 2: Navigation */}
        {footer.navItems && footer.navItems.length > 0 && (
          <div className="py-4">
            <div className="container">
              <div
                className="grid gap-8 rounded-xl border border-white/50 p-8 text-white"
                style={{
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                }}
              >
                {footer.navItems.map((section, sectionIdx) => (
                  <div key={section.id || sectionIdx} className="text-center sm:text-left">
                    <h4 className="mb-3 text-base font-semibold tracking-wider uppercase">
                      {section.title}
                    </h4>
                    <ul className="space-y-2 text-base text-white/70">
                      {section.subNavItems &&
                        section.subNavItems.map((link, linkIdx) => (
                          <li
                            key={link.id || linkIdx}
                            className="transition-colors duration-200 hover:text-white"
                          >
                            <CMSLink publicContext={publicContext} {...link.link} />
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Band 3: Address + Copyright + Powered by WOW */}
        <div className="py-6">
          <div className="container">
            {/* Address */}
            {(companyInfo?.address || companyInfo?.tatLicense) && (
              <div className="mb-4 text-center">
                {companyInfo?.address && (
                  <p className="text-sm whitespace-pre-line opacity-70">{companyInfo?.address}</p>
                )}
                {companyInfo?.tatLicense && (
                  <p className="mt-1 text-sm opacity-60">
                    ใบอนุญาตนำเที่ยวเลขที่ : {companyInfo?.tatLicense}
                  </p>
                )}
              </div>
            )}

            {/* Copyright + Legal */}
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap">
                {(footer as any).showTrustBadges !== false && companyInfo?.trustBadges && (
                  <Media
                    resource={companyInfo.trustBadges}
                    alt="Trust Badges"
                    className="h-8 shrink-0 overflow-hidden"
                    imgClassName="!max-h-full !w-auto object-contain"
                  />
                )}
                <p className="text-sm opacity-80">
                  © {new Date().getFullYear()} {companyInfo?.companyName || 'Company Name'}. All
                  rights reserved.
                </p>
                <span className="text-sm opacity-30">•</span>
                <FooterAdminLink
                  isLoggedIn={isLoggedIn}
                  className="inline-flex items-center gap-1 text-xs text-white/50 transition-colors duration-200 hover:text-white"
                />
              </div>
              {footer.legalLinks && footer.legalLinks.length > 0 && (
                <ul className="flex flex-wrap gap-4">
                  {footer.legalLinks.map((item, index) => (
                    <li
                      key={index}
                      className="text-sm opacity-80 transition-opacity duration-200 hover:opacity-100"
                    >
                      <CMSLink publicContext={publicContext} {...item.link} />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Powered by WOW */}
            <div className="[&_img]:brightness-0 [&_img]:invert [&_span]:text-white/70">
              <PoweredByWow />
            </div>
          </div>
        </div>
      </footer>
    </section>
  )
}

export default WowtourFooter3
