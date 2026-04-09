import { Media } from '@/components/Media'
import { Footer, CompanyInfo } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { PublicContextProps } from '@/utilities/publicContextProps'
import { SocialIcon } from '@/components/SocialIcon'
import { Clock, Phone, Mail } from 'lucide-react'

import { FooterAdminLink } from '../FooterAdminLink'
import { PoweredByWow } from '../PoweredByWow'

/**
 * WowtourFooter1 — "Premium Magazine"
 * Large hero-style brand on the left, compact stacked sections on the right.
 * Full-bleed bg-primary/5 with decorative accent line.
 */
const WowtourFooter1: React.FC<{
  footer: Footer
  publicContext: PublicContextProps
  companyInfo: CompanyInfo
  isLoggedIn: boolean
}> = ({ footer, publicContext, companyInfo, isLoggedIn }) => {
  const logo = companyInfo?.footerLogo || companyInfo?.companyLogo

  return (
    <section className="bg-primary pt-16 pb-6 lg:pt-24 lg:pb-8">
      <div className="container">
        <footer>
          {/* Asymmetric Grid: Large Brand (60%) + Compact Info (40%) */}
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
            {/* Left: Large Brand Statement */}
            <div className="flex flex-col justify-between gap-8 lg:col-span-2">
              {/* Logo */}
              {logo && (
                <Media
                  resource={logo}
                  alt="logo"
                  className="h-14 self-start overflow-hidden"
                  imgClassName="!max-h-full !w-auto object-contain"
                />
              )}

              <div>
                {/* Company Name — Hero sized */}
                {companyInfo?.companyName && (
                  <h2
                    className="font-semibold tracking-tight text-white"
                    style={{ fontSize: '1.5rem' }}
                  >
                    {companyInfo?.companyName}
                  </h2>
                )}

                {/* Decorative Accent Line */}
                <div className="my-4 h-1 w-20 rounded-full bg-white" />

                {/* Tagline */}
                {footer.subline && (
                  <p className="max-w-md text-base leading-relaxed text-white/80 not-italic">
                    {footer.subline}
                  </p>
                )}
              </div>

              {/* Address + Business Reg */}
              <div className="space-y-1">
                {companyInfo?.address && (
                  <p className="text-base text-white/80">
                    {companyInfo.address.split('\n').map((line, i, arr) => (
                      <span key={i}>
                        {line}
                        {i < arr.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                )}
                {companyInfo?.tatLicense && (
                  <p className="text-sm text-white/70">
                    ใบอนุญาตนำเที่ยวเลขที่ : {companyInfo?.tatLicense}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Compact stacked sections */}
            <div className="flex flex-col gap-8 lg:col-span-3">
              {/* Contact + Navigation — grid layout */}
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-10">
                {/* Nav Items */}
                {footer.navItems &&
                  footer.navItems.length > 0 &&
                  footer.navItems.map((section, sectionIdx) => (
                    <div key={section.id ? `${section.id}-${sectionIdx}` : sectionIdx}>
                      <h3 className="mb-3 text-base font-semibold tracking-wider text-white uppercase">
                        {section.title}
                      </h3>
                      <ul className="space-y-2">
                        {section.subNavItems &&
                          section.subNavItems.map((link, linkIdx) => (
                            <li
                              key={link.id ? `${link.id}-${linkIdx}` : linkIdx}
                              className="text-base text-white/80 transition-colors duration-200 hover:text-white"
                            >
                              <CMSLink publicContext={publicContext} {...link.link} />
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))}

                {/* Contact Info — mobile: row ใหม่, desktop: row เดียวกับ nav */}
                <div className="col-span-2 lg:col-span-1">
                  <h3 className="mb-3 text-base font-semibold tracking-wider text-white uppercase">
                    ติดต่อเรา
                  </h3>
                  <div className="space-y-2.5">
                    {companyInfo?.businessHours && (
                      <div className="flex items-start gap-2.5 text-base text-white/80">
                        <Clock className="mt-0.5 size-4 shrink-0 text-white/60" />
                        <div>
                          <div className="text-xs text-white/60">เวลาทำการ</div>
                          <span>{companyInfo.businessHours}</span>
                        </div>
                      </div>
                    )}
                    {companyInfo?.callCenter && (
                      <a
                        href={`tel:${companyInfo.callCenter.replace(/[^\d+]/g, '')}`}
                        className="flex items-start gap-2.5 text-base text-white/80 transition-colors hover:text-white"
                      >
                        <Phone className="mt-0.5 size-4 shrink-0 text-white/60" />
                        <div>
                          <div className="text-xs text-white/60">Call Center</div>
                          <span>{companyInfo.callCenter}</span>
                        </div>
                      </a>
                    )}
                    {(companyInfo?.phones as any[])?.map(
                      (p: any, i: number) =>
                        p?.number && (
                          <a
                            key={i}
                            href={`tel:${p.number.replace(/[^\d+]/g, '')}`}
                            className="flex items-start gap-2.5 text-base text-white/80 transition-colors hover:text-white"
                          >
                            <Phone className="mt-0.5 size-4 shrink-0 text-white/60" />
                            <div>
                              <div className="text-xs text-white/60">{p.label || 'โทรศัพท์'}</div>
                              <span>{p.number}</span>
                            </div>
                          </a>
                        ),
                    )}
                    {companyInfo?.email && (
                      <a
                        href={`mailto:${companyInfo.email}`}
                        className="flex items-start gap-2.5 text-base text-white/80 transition-colors hover:text-white"
                      >
                        <Mail className="mt-0.5 size-4 shrink-0 text-white/60" />
                        <div>
                          <div className="text-xs text-white/60">อีเมล</div>
                          <span>{companyInfo.email}</span>
                        </div>
                      </a>
                    )}
                  </div>

                  {/* Social Media Icons */}
                  {(() => {
                    const socialItems: {
                      icon: Parameters<typeof SocialIcon>[0]['type']
                      href: string
                      label: string
                    }[] = []
                    if (companyInfo?.socialLinks) {
                      for (const social of companyInfo.socialLinks) {
                        if (social.showInFooter === false) continue
                        socialItems.push({
                          icon: social.platform,
                          label: social.label || social.platform,
                          href: social.url,
                        })
                      }
                    }
                    if (socialItems.length === 0) return null
                    return (
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        {socialItems.map((item, idx) => (
                          <a
                            key={idx}
                            href={item.href}
                            target={item.href.startsWith('http') ? '_blank' : undefined}
                            rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                            className="flex size-9 items-center justify-center rounded-lg bg-white/10 text-white transition-colors duration-200 hover:bg-white/20"
                            title={item.label}
                          >
                            <SocialIcon type={item.icon} className="size-4" />
                          </a>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-white/20 pt-4 text-sm sm:flex-row">
            <div className="flex flex-wrap items-center justify-center gap-3 text-center sm:text-left">
              {(footer as any).showTrustBadges !== false && companyInfo?.trustBadges && (
                <Media
                  resource={companyInfo.trustBadges}
                  alt="Trust Badges"
                  className="h-8 shrink-0 overflow-hidden"
                  imgClassName="!max-h-full !w-auto object-contain"
                />
              )}
              <p className="text-sm text-white/80">
                © {new Date().getFullYear()} {companyInfo?.companyName || 'Company Name'}. All
                rights reserved.
              </p>
              <span className="text-sm text-white/30">•</span>
              <PoweredByWow className="text-white/70" invertLogo />
              <span className="text-sm text-white/30">•</span>
              <FooterAdminLink
                isLoggedIn={isLoggedIn}
                className="inline-flex items-center gap-1 text-xs text-white/60 transition-colors duration-200 hover:text-white"
              />
            </div>
            {footer.legalLinks && footer.legalLinks.length > 0 && (
              <ul className="flex flex-wrap justify-center gap-4 sm:justify-end">
                {footer.legalLinks.map((item, index) => (
                  <li
                    key={index}
                    className="text-sm text-white/80 transition-colors duration-200 hover:text-white"
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

export default WowtourFooter1
