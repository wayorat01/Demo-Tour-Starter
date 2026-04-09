import { Media } from '@/components/Media'
import { Footer, CompanyInfo } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { PublicContextProps } from '@/utilities/publicContextProps'
import { SocialIcon } from '@/components/SocialIcon'

import { FooterAdminLink } from '../FooterAdminLink'
import { PoweredByWow } from '../PoweredByWow'

/**
 * wowtour_footer5 — "Modern Two-Tone Split"
 * Top section with light bg for brand + nav,
 * bottom section with primary color for contact + legal.
 */
const WowtourFooter5: React.FC<{
  footer: Footer
  publicContext: PublicContextProps
  companyInfo: CompanyInfo
  isLoggedIn: boolean
}> = ({ footer, publicContext, companyInfo, isLoggedIn }) => {
  // ใช้โลโก้บริษัท (Header) แทน footer logo
  const logo = companyInfo?.companyLogo

  return (
    <section>
      <footer>
        {/* Top Section — Brand + Navigation */}
        <div className="bg-primary/5 py-12 lg:py-16">
          <div className="container">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
              {/* Brand Info */}
              <div className="flex flex-col gap-4 lg:col-span-4">
                <div className="flex flex-col items-start gap-4">
                  {logo && (
                    <Media
                      resource={logo}
                      alt="logo"
                      className="h-12 max-w-[200px] shrink-0 overflow-hidden md:h-16 md:max-w-[260px]"
                      imgClassName="!max-h-full !w-auto object-contain"
                    />
                  )}
                  {companyInfo?.companyName && (
                    <span className="text-xl font-bold tracking-tight">
                      {companyInfo?.companyName}
                    </span>
                  )}
                </div>

                {footer.subline && (
                  <p className="text-muted-foreground text-base leading-relaxed">
                    {footer.subline}
                  </p>
                )}

                {/* Contact Info */}
                <ul className="mt-2 space-y-2.5">
                  {companyInfo?.businessHours && (
                    <li className="flex items-center gap-3">
                      <span className="bg-primary/10 flex size-7 shrink-0 items-center justify-center rounded-lg">
                        <SocialIcon type="clock" className="text-primary size-4" />
                      </span>
                      <span className="text-muted-foreground text-base">
                        เวลาทำการ : {companyInfo.businessHours}
                      </span>
                    </li>
                  )}
                  {companyInfo?.callCenter && (
                    <li className="flex items-center gap-3">
                      <span className="bg-primary/10 flex size-7 shrink-0 items-center justify-center rounded-lg">
                        <SocialIcon type="phone" className="text-primary size-4" />
                      </span>
                      <a
                        href={`tel:${companyInfo.callCenter.replace(/[^\d+]/g, '')}`}
                        className="text-muted-foreground hover:text-primary text-base transition-colors duration-200"
                      >
                        Call Center : {companyInfo.callCenter}
                      </a>
                    </li>
                  )}
                  {companyInfo?.phones &&
                    Array.isArray(companyInfo.phones) &&
                    (companyInfo.phones as { number: string; label?: string | null }[]).map(
                      (p, idx) =>
                        p.number ? (
                          <li key={idx} className="flex items-center gap-3">
                            <span className="bg-primary/10 flex size-7 shrink-0 items-center justify-center rounded-lg">
                              <SocialIcon type="phone" className="text-primary size-4" />
                            </span>
                            <a
                              href={`tel:${p.number.replace(/[^\d+]/g, '')}`}
                              className="text-muted-foreground hover:text-primary text-base transition-colors duration-200"
                            >
                              {p.label ? `${p.number} (${p.label})` : p.number}
                            </a>
                          </li>
                        ) : null,
                    )}
                  {companyInfo?.email && (
                    <li className="flex items-center gap-3">
                      <span className="bg-primary/10 flex size-7 shrink-0 items-center justify-center rounded-lg">
                        <SocialIcon type="email" className="text-primary size-4" />
                      </span>
                      <a
                        href={`mailto:${companyInfo.email}`}
                        className="text-muted-foreground hover:text-primary text-base transition-colors duration-200"
                      >
                        {companyInfo.email}
                      </a>
                    </li>
                  )}
                </ul>
              </div>

              {/* Navigation — Auto-fit for many groups */}
              {footer.navItems && footer.navItems.length > 0 && (
                <div className="lg:col-span-8">
                  <div
                    className="grid gap-8"
                    style={{
                      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    }}
                  >
                    {footer.navItems.map((section, sectionIdx) => (
                      <div key={section.id || sectionIdx}>
                        <h4 className="text-foreground mb-4 text-base font-semibold tracking-wider uppercase">
                          {section.title}
                        </h4>
                        <ul className="text-muted-foreground space-y-2.5 text-base">
                          {section.subNavItems &&
                            section.subNavItems.map((link, linkIdx) => (
                              <li
                                key={link.id || linkIdx}
                                className="hover:text-primary transition-colors duration-200"
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
            </div>
          </div>
        </div>

        {/* Bottom Section — Contact + Legal (สีหลัก) */}
        <div className="bg-primary text-primary-foreground py-8">
          <div className="container">
            <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:items-start lg:justify-between lg:text-left">
              {/* Address + Business Reg */}
              <div>
                {companyInfo?.address && (
                  <p className="text-sm whitespace-pre-line opacity-80">{companyInfo?.address}</p>
                )}
                {companyInfo?.tatLicense && (
                  <p className="mt-1 text-sm opacity-60">
                    ใบอนุญาตนำเที่ยวเลขที่ : {companyInfo?.tatLicense}
                  </p>
                )}
              </div>

              {/* Social Media Links — แนวนอน ด้านขวา */}
              {companyInfo?.socialLinks && companyInfo.socialLinks.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-end">
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

            {/* Divider */}
            <div className="my-6 h-px bg-white/20" />

            {/* Copyright + Legal */}
            <div className="flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:text-left">
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
        </div>
      </footer>
    </section>
  )
}

export default WowtourFooter5
