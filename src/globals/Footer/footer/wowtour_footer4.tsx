import { Media } from '@/components/Media'
import { Footer, CompanyInfo } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { PublicContextProps } from '@/utilities/publicContextProps'
import { SocialIcon } from '@/components/SocialIcon'

import { FooterAdminLink } from '../FooterAdminLink'
import { PoweredByWow } from '../PoweredByWow'

/**
 * wowtour_footer4 — "Glassmorphism Cards"
 * Frosted-glass cards on a primary background.
 * Each section lives in its own card for visual separation.
 */
const WowtourFooter4: React.FC<{
  footer: Footer
  publicContext: PublicContextProps
  companyInfo: CompanyInfo
  isLoggedIn: boolean
}> = ({ footer, publicContext, companyInfo, isLoggedIn }) => {
  const logo = companyInfo?.footerLogo || companyInfo?.companyLogo
  const hasNav = footer.navItems && footer.navItems.length > 0

  return (
    <section>
      <footer className="bg-primary text-primary-foreground py-10 lg:py-16">
        <div className="container">
          {/* Glass Cards Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Card 1: Brand */}
            <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
              {/* Logo + Company Name — Vertical */}
              <div className="flex flex-col gap-4">
                {logo && (
                  <Media
                    resource={logo}
                    alt="logo"
                    className="h-10 shrink-0 overflow-hidden"
                    imgClassName="!max-h-full !w-auto object-contain"
                  />
                )}
                {companyInfo?.companyName && (
                  <h3 className="text-lg font-bold tracking-tight">{companyInfo?.companyName}</h3>
                )}
              </div>

              {footer.subline && (
                <p className="mt-3 text-base leading-relaxed opacity-80">{footer.subline}</p>
              )}

              {companyInfo?.address && (
                <p className="mt-3 text-sm leading-relaxed whitespace-pre-line opacity-70">
                  {companyInfo?.address}
                </p>
              )}

              {companyInfo?.tatLicense && (
                <p className="mt-2 text-sm opacity-60">
                  ใบอนุญาตนำเที่ยวเลขที่ : {companyInfo?.tatLicense}
                </p>
              )}
            </div>

            {/* Card 2: Navigation — Auto-fit grid for many menus */}
            {hasNav && (
              <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
                <div
                  className="grid gap-6"
                  style={{
                    gridTemplateColumns:
                      footer.navItems!.length > 2
                        ? 'repeat(auto-fit, minmax(120px, 1fr))'
                        : `repeat(${footer.navItems!.length}, 1fr)`,
                  }}
                >
                  {footer.navItems!.map((section, sectionIdx) => (
                    <div key={section.id || sectionIdx}>
                      <h4 className="mb-3 text-base font-semibold">{section.title}</h4>
                      <ul className="space-y-2 text-base opacity-80">
                        {section.subNavItems &&
                          section.subNavItems.map((link, linkIdx) => (
                            <li
                              key={link.id || linkIdx}
                              className="transition-opacity duration-200 hover:opacity-100"
                            >
                              <CMSLink publicContext={publicContext} {...link.link} />
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Card 3: ติดต่อเรา & Social */}
            <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
              <h4 className="mb-4 text-base font-semibold">ติดต่อเรา</h4>

              <ul className="space-y-3">
                {/* เวลาทำการ */}
                {companyInfo?.businessHours && (
                  <li className="flex items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                      <SocialIcon type="clock" className="size-4" />
                    </span>
                    <span className="text-base opacity-90">
                      เวลาทำการ : {companyInfo.businessHours}
                    </span>
                  </li>
                )}

                {/* Call Center */}
                {companyInfo?.callCenter && (
                  <li className="flex items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                      <SocialIcon type="phone" className="size-4" />
                    </span>
                    <a
                      href={`tel:${companyInfo.callCenter.replace(/[^\d+]/g, '')}`}
                      className="text-base opacity-90 transition-opacity duration-200 hover:opacity-100"
                    >
                      Call Center : {companyInfo.callCenter}
                    </a>
                  </li>
                )}

                {/* เบอร์โทรศัพท์ */}
                {companyInfo?.phones &&
                  Array.isArray(companyInfo.phones) &&
                  (companyInfo.phones as { number: string; label?: string | null }[]).map(
                    (p, idx) =>
                      p.number ? (
                        <li key={idx} className="flex items-center gap-3">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                            <SocialIcon type="phone" className="size-4" />
                          </span>
                          <a
                            href={`tel:${p.number.replace(/[^\d+]/g, '')}`}
                            className="text-base opacity-90 transition-opacity duration-200 hover:opacity-100"
                          >
                            {p.label ? `${p.number} (${p.label})` : p.number}
                          </a>
                        </li>
                      ) : null,
                  )}

                {/* อีเมล */}
                {companyInfo?.email && (
                  <li className="flex items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                      <SocialIcon type="email" className="size-4" />
                    </span>
                    <a
                      href={`mailto:${companyInfo.email}`}
                      className="text-base opacity-90 transition-opacity duration-200 hover:opacity-100"
                    >
                      {companyInfo.email}
                    </a>
                  </li>
                )}
              </ul>

              {/* Social Media Links — แนวนอน */}
              {companyInfo?.socialLinks && companyInfo.socialLinks.length > 0 && (
                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/20 pt-5">
                  {companyInfo.socialLinks
                    .filter((link) => link.showInFooter !== false)
                    .map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex size-9 items-center justify-center rounded-lg bg-white/15 transition-all duration-200 hover:bg-white/30"
                      >
                        <SocialIcon type={link.platform} className="size-5" />
                      </a>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 flex flex-col items-center justify-center gap-4 border-t border-white/15 pt-6 text-center text-sm">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {(footer as any).showTrustBadges !== false && companyInfo?.trustBadges && (
                <Media
                  resource={companyInfo.trustBadges}
                  alt="Trust Badges"
                  className="h-8 shrink-0 overflow-hidden"
                  imgClassName="!max-h-full !w-auto object-contain"
                />
              )}
              <p className="text-sm opacity-70">
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
              <ul className="flex flex-wrap justify-center gap-4">
                {footer.legalLinks.map((item, index) => (
                  <li
                    key={index}
                    className="text-sm opacity-70 transition-opacity duration-200 hover:opacity-100"
                  >
                    <CMSLink publicContext={publicContext} {...item.link} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Powered by WOW */}
          <PoweredByWow className="text-xs text-white/70" invertLogo />
        </div>
      </footer>
    </section>
  )
}

export default WowtourFooter4
