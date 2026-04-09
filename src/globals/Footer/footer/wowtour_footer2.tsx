import { Media } from '@/components/Media'
import { Footer, CompanyInfo, PageConfig } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { PublicContextProps } from '@/utilities/publicContextProps'
import { SocialIcon } from '@/components/SocialIcon'

import { FooterAdminLink } from '../FooterAdminLink'
import { PoweredByWow } from '../PoweredByWow'

/**
 * WowTour Footer 2 — "Brand Sidebar + Content Grid"
 * Dark left brand column with accent bg, light right columns.
 * Modern grid that supports many nav groups.
 */
const WowtourFooter2: React.FC<{
  footer: Footer
  publicContext: PublicContextProps
  companyInfo: CompanyInfo
  pageConfig?: PageConfig
  isLoggedIn: boolean
}> = ({ footer, publicContext, companyInfo, pageConfig, isLoggedIn }) => {
  const logo = companyInfo?.footerLogo || companyInfo?.companyLogo

  return (
    <section className="py-16 lg:py-20">
      <div className="container">
        <footer>
          <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-2xl lg:grid-cols-12">
            {/* Brand Column — Dark accent bg */}
            <div className="bg-primary text-primary-foreground flex flex-col gap-6 p-8 lg:col-span-6 lg:p-10">
              {/* Logo */}
              {logo && (
                <Media
                  resource={logo}
                  alt="logo"
                  className="h-10 shrink-0 overflow-hidden"
                  imgClassName="!max-h-full !w-auto object-contain"
                />
              )}

              {/* Company Name */}
              {companyInfo?.companyName && (
                <h3 className="text-primary-foreground text-2xl font-medium tracking-tight">
                  {companyInfo.companyName}
                </h3>
              )}

              {/* Tagline */}
              {footer.subline && (
                <p className="text-primary-foreground/80 text-base leading-relaxed">
                  {footer.subline}
                </p>
              )}

              {/* Address */}
              {companyInfo?.address && (
                <p className="text-primary-foreground/70 text-sm leading-relaxed whitespace-pre-line">
                  {companyInfo.address}
                </p>
              )}

              {/* Contact Items (auto from Company Info) */}
              {(() => {
                // Build contact items from Company Info
                const autoItems: { icon: string; text: string; href?: string }[] = []

                // Business Hours
                if (companyInfo?.businessHours) {
                  autoItems.push({
                    icon: 'clock',
                    text: `เวลาทำการ : ${companyInfo.businessHours}`,
                  })
                }

                // Email
                if (companyInfo?.email) {
                  autoItems.push({
                    icon: 'email',
                    text: companyInfo.email,
                    href: `mailto:${companyInfo.email}`,
                  })
                }

                // Phones
                if (companyInfo?.phones && Array.isArray(companyInfo.phones)) {
                  for (const p of companyInfo.phones as {
                    number: string
                    label?: string | null
                  }[]) {
                    if (p.number) {
                      autoItems.push({
                        icon: 'phone',
                        text: p.label ? `${p.number} (${p.label})` : p.number,
                        href: `tel:${p.number.replace(/[^\d+]/g, '')}`,
                      })
                    }
                  }
                }

                const items = autoItems

                if (items.length === 0) return null

                return (
                  <ul className="mt-2 space-y-3">
                    {items.map((item: any, idx: number) => (
                      <li key={idx} className="flex items-center gap-3">
                        <span className="bg-primary-foreground/15 text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
                          <SocialIcon type={item.icon} className="size-4" />
                        </span>
                        {item.href ? (
                          <a
                            href={item.href}
                            target={item.href.startsWith('http') ? '_blank' : undefined}
                            rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                            className="text-primary-foreground/80 hover:text-primary-foreground text-base transition-colors duration-200"
                          >
                            {item.text}
                          </a>
                        ) : (
                          <span className="text-primary-foreground/80 text-base">{item.text}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )
              })()}

              {/* Business Registration */}
              {companyInfo?.tatLicense && (
                <p className="text-primary-foreground/60 text-sm">
                  ใบอนุญาตนำเที่ยวเลขที่ : {companyInfo?.tatLicense}
                </p>
              )}
            </div>

            {/* Nav Columns — Supports many groups via auto-fit grid */}
            <div className="flex flex-col bg-[#E2E8F0] p-6 lg:col-span-6 lg:p-10">
              {/* Navigation Grid & Contact Group in SAME Row */}
              {footer.navItems && footer.navItems.length > 0 && (
                <div className="grid w-full flex-1 grid-cols-2 gap-x-8 gap-y-8 text-center lg:grid-cols-3 lg:text-left">
                  {footer.navItems.map((section, sectionIdx) => (
                    <div key={section.id ? `${section.id}-${sectionIdx}` : sectionIdx}>
                      <h4 className="text-foreground mb-4 text-base font-bold tracking-wider uppercase">
                        {section.title}
                      </h4>
                      <ul className="text-muted-foreground space-y-2.5 text-base">
                        {section.subNavItems &&
                          section.subNavItems.map((link, linkIdx) => (
                            <li
                              key={link.id ? `${link.id}-${linkIdx}` : linkIdx}
                              className="hover:text-primary transition-colors duration-200"
                            >
                              <CMSLink publicContext={publicContext} {...link.link} />
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))}

                  {/* Contact Group (QR, LINE OA, Social) inside the Grid */}
                  <div className="col-span-2 flex h-full flex-1 flex-col items-center gap-4 text-center lg:col-span-1">
                    <div className="flex flex-col items-center gap-2">
                      {/* QR Code */}
                      {companyInfo?.qrCode && (
                        <div className="inline-block shrink-0 overflow-hidden rounded-lg border bg-white p-2 shadow-sm">
                          <Media
                            resource={companyInfo.qrCode as any}
                            alt="QR Code"
                            className="size-[120px] object-contain"
                          />
                        </div>
                      )}

                      {/* LINE OA */}
                      {companyInfo?.lineOA && (
                        <p className="text-foreground text-center text-base font-medium">
                          {companyInfo.lineOA}
                        </p>
                      )}
                    </div>

                    {/* Social Icons */}
                    {companyInfo?.socialLinks && companyInfo.socialLinks.length > 0 && (
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        {companyInfo.socialLinks
                          .filter((link) => link.showInFooter !== false)
                          .map((link, linkIdx) => {
                            const colors: Record<string, string> = {
                              facebook: '#1877F2',
                              line: '#00B900',
                              instagram: '#E4405F',
                              tiktok: '#000000',
                              youtube: '#FF0000',
                              twitter: '#1DA1F2',
                              whatsapp: '#25D366',
                            }
                            const color = colors[link.platform as string] || 'currentColor'

                            return (
                              <a
                                key={link.id ? `${link.id}-${linkIdx}` : linkIdx}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="drop-shadow-sm transition-opacity hover:opacity-80"
                                style={{ color }}
                              >
                                <SocialIcon type={link.platform} className="size-8" />
                              </a>
                            )
                          })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Right Side Content — Bottom */}
              <div className="border-muted-foreground/20 mt-8 flex w-full flex-col items-center border-t pt-8 text-center lg:items-end lg:text-right">
                {/* Call Center */}
                {companyInfo?.callCenter && (
                  <>
                    <span className="text-foreground text-2xl">Call Center</span>
                    <a
                      href={`tel:${companyInfo.callCenter.replace(/[^\d+]/g, '')}`}
                      className="text-primary flex items-center gap-2 text-4xl font-bold tracking-tight transition-opacity hover:opacity-80"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-8 shrink-0"
                      >
                        <path
                          fillRule="evenodd"
                          d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {companyInfo.callCenter}
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 flex flex-col items-center justify-center gap-4 px-2 text-center text-sm sm:flex-row">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {(footer as any).showTrustBadges !== false && companyInfo?.trustBadges && (
                <Media
                  resource={companyInfo.trustBadges}
                  alt="Trust Badges"
                  className="h-8 shrink-0 overflow-hidden"
                  imgClassName="!max-h-full !w-auto object-contain"
                />
              )}
              <p className="text-muted-foreground text-sm">
                © {new Date().getFullYear()} {companyInfo?.companyName || 'Company Name'}. All
                rights reserved.
              </p>
              <span className="text-muted-foreground/30 text-sm">•</span>
              <PoweredByWow />
              <span className="text-muted-foreground/30 text-sm">•</span>
              <FooterAdminLink isLoggedIn={isLoggedIn} />
            </div>
            {footer.legalLinks && footer.legalLinks.length > 0 && (
              <ul className="flex flex-wrap gap-4">
                {footer.legalLinks.map((item, index) => (
                  <li
                    key={index}
                    className="text-muted-foreground hover:text-primary text-sm transition-colors duration-200"
                  >
                    <CMSLink publicContext={publicContext} {...item.link} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </footer>
      </div>
    </section>
  )
}

export default WowtourFooter2
