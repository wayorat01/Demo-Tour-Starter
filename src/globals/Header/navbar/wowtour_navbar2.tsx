import { Phone, Clock, Headphones } from 'lucide-react'
import { BlockRenderer } from './blocks/BlockRenderer'
import { MobileDrillDown } from './MobileDrillDown'
import type { Header as HeaderType, CompanyInfo } from '@/payload-types'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { MobileMenuSheet } from './MobileMenuSheet'
import { cn } from '@/utilities/cn'
import { Media } from '@/components/Media'
import { CMSLink } from '@/components/Link'
import { Icon } from '@/components/Icon'
import localization, { locales, localeLabels } from '@/localization.config'
import { PublicContextProps } from '@/utilities/publicContextProps'
import { SearchButton } from '@/search/Component'
import { NavActiveMarker } from './NavLinkActive'
import './wowtour_navbar2.css'

// Social media icon SVGs
const socialIcons: Record<string, React.ReactNode> = {
  facebook: (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path
        d="M16.5 12.05h-2.7V18h-2.8v-5.95H9V9.5h2v-1.6c0-2 .8-3.2 3-3.2h2v2.6h-1.3c-.9 0-1 .3-1 .9v1.3h2.3l-.2 2.55z"
        fill="white"
      />
    </svg>
  ),
  line: (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#06C755" />
      <g transform="translate(4.8, 4.8) scale(0.6)">
        <path
          d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"
          fill="white"
        />
      </g>
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="ig2" x1="0" y1="24" x2="24" y2="0">
          <stop offset="0%" stopColor="#FFC107" />
          <stop offset="50%" stopColor="#F44336" />
          <stop offset="100%" stopColor="#9C27B0" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="12" fill="url(#ig2)" />
      <rect
        x="6.5"
        y="6.5"
        width="11"
        height="11"
        rx="3"
        stroke="white"
        strokeWidth="1.5"
        fill="none"
      />
      <circle cx="12" cy="12" r="2.8" stroke="white" strokeWidth="1.5" fill="none" />
      <circle cx="15.2" cy="8.8" r="0.8" fill="white" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#010101" />
      <path
        d="M16.2 8.5c-.8-.5-1.3-1.3-1.4-2.2h-2.1v8.3c0 1-.8 1.9-1.9 1.9-1 0-1.9-.8-1.9-1.9 0-1 .8-1.9 1.9-1.9.2 0 .4 0 .6.1V10.5c-.2 0-.4-.1-.6-.1-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4V10c.8.6 1.7.9 2.7.9V8.8c-.4 0-.9-.1-1.3-.3z"
        fill="white"
      />
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#12B5B0" />
      <path d="M6.5 8.5h11v7h-11z" stroke="white" strokeWidth="1.3" fill="none" rx="1" />
      <path d="M6.5 8.5 12 13l5.5-4.5" stroke="white" strokeWidth="1.3" fill="none" />
    </svg>
  ),
}

export const Navbar2: React.FC<{
  header: HeaderType
  publicContext: PublicContextProps
  companyInfo?: CompanyInfo
  citiesMap?: Record<string, any[]>
}> = ({ header, publicContext, companyInfo, citiesMap }) => {
  // Social links from companyInfo
  const socialLinks = (companyInfo?.socialLinks ?? []).filter((s) => s.showInHeader !== false)

  // Resolve topBar visibility settings (default all to true)
  const topBar = (header as any).topBar
  const showContacts = topBar?.showContacts !== false
  const showSocialIcons = topBar?.showSocialIcons !== false
  const hasEmailInSocial = socialLinks.some((s) => s.platform === 'email')

  // Prepare ordered socials to guarantee Facebook -> Email -> LINE -> Others
  const orderedSocials: Array<{ platform: string; url: string; label?: string }> = []
  
  if (showSocialIcons) {
     const pushSocial = (platform: string) => {
        const item = socialLinks.find((s) => s.platform === platform && s.url)
        if (item) orderedSocials.push({ platform: item.platform as string, url: item.url as string, label: item.label || '' })
     }
     
     // 1. Facebook
     pushSocial('facebook')
     
     // 2. Email
     if (hasEmailInSocial) {
        pushSocial('email')
     } else if (showContacts && companyInfo?.email) {
        orderedSocials.push({ platform: 'email', url: `mailto:${companyInfo.email}`, label: companyInfo.email })
     }
     
     // 3. Line
     pushSocial('line')
     
     // 4. Others
     socialLinks.forEach((social) => {
        if (!social.url || ['facebook', 'email', 'line'].includes(social.platform as string)) return
        orderedSocials.push({ platform: social.platform as string, url: social.url as string, label: social.label || '' })
     })
  }

  return (
    <>
      {/* ===== Desktop Navbar (single row) ===== */}
      <div className="wowtour-navbar2 hidden xl:block">
        <div className="container">
          <div className="wowtour-navbar2-inner">
            {/* Left: Logo */}
            <CMSLink publicContext={publicContext} url={'/'} className="wowtour-navbar2-logo">
              {companyInfo?.companyLogo ? (
                <Media resource={companyInfo.companyLogo} imgClassName="h-10 w-auto" priority />
              ) : header.logo ? (
                <Media resource={header.logo || undefined} />
              ) : null}
            </CMSLink>

            {/* Center: Navigation */}
            <NavActiveMarker>
              <nav className="wowtour-navbar2-nav">
                <NavigationMenu className="w-full max-w-none">
                  <NavigationMenuList>
                    {(header.richItems || header.items)
                      ?.filter((item) => !('hidden' in item && item.hidden))
                      .map((item) => {
                        if (item.blockType === 'link') {
                          return (
                            <CMSLink
                              publicContext={publicContext}
                              key={item.id}
                              {...item.link}
                              className="wowtour-navbar2-nav-link"
                            />
                          )
                        } else if ((item as { blockType?: string }).blockType === 'sub') {
                          return (
                            <NavigationMenuItem key={item.id}>
                              <NavigationMenuTrigger className="wowtour-navbar2-nav-link">
                                {'icon' in item && item.icon && (
                                  <Icon className={'mr-2 h-5'} icon={item.icon} />
                                )}
                                <span>{(item as { label?: string }).label}</span>
                              </NavigationMenuTrigger>
                              <NavigationMenuContent
                                style={{
                                  background: 'var(--dropdown-bg, inherit)',
                                  color: 'var(--dropdown-text, inherit)',
                                }}
                              >
                                <ul className="w-80 p-3">
                                  <NavigationMenuLink asChild>
                                    {(item as { subitems?: any[] }).subitems?.map(
                                      (subitem: any) => (
                                        <li key={subitem.id}>
                                          <CMSLink
                                            publicContext={publicContext}
                                            className={cn(
                                              'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex gap-4 rounded-md p-3 leading-none no-underline outline-hidden transition-colors select-none',
                                            )}
                                            {...subitem.link}
                                            label=""
                                            iconBefore={undefined}
                                            iconAfter={undefined}
                                          >
                                            {subitem.link.iconBefore && (
                                              <Icon icon={subitem.link.iconBefore} />
                                            )}
                                            <div>
                                              <div className="text-sm font-semibold">
                                                {subitem.link.label}
                                              </div>
                                              <p className="text-muted-foreground text-sm leading-snug">
                                                {subitem.Description}
                                              </p>
                                            </div>
                                          </CMSLink>
                                        </li>
                                      ),
                                    )}
                                  </NavigationMenuLink>
                                </ul>
                              </NavigationMenuContent>
                            </NavigationMenuItem>
                          )
                        } else if (item.blockType === 'submenu') {
                          const hasTourCategory = item.blocks?.some(
                            (b: any) => b.blockType === 'tourCategoryMenu',
                          )
                          const dropdownStyle = hasTourCategory
                            ? {
                                background: 'var(--tc-dropdown-bg, #fff)',
                                color: 'var(--tc-dropdown-text, inherit)',
                              }
                            : {
                                background: 'var(--dropdown-bg, #fff)',
                                color: 'var(--dropdown-text, inherit)',
                              }
                          const isCompact = item.blocks?.every(
                            (b: any) => b.blockType === 'tourCategoryMenu' && b.columns === '1',
                          )

                          if (isCompact) {
                            return (
                              <li
                                key={item.id}
                                className="group/compact relative flex h-full items-center"
                              >
                                <button className="wowtour-navbar2-nav-link">
                                  {'icon' in item && item.icon && (
                                    <Icon icon={item.icon} className="mr-2 h-4 w-4" />
                                  )}
                                  {(item as { label?: string }).label}
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="relative top-[1px] ml-1 h-3 w-3 transition-transform duration-200 group-hover/compact:rotate-180"
                                  >
                                    <path d="m6 9 6 6 6-6" />
                                  </svg>
                                </button>
                                <div
                                  className="bg-popover text-popover-foreground absolute top-full left-1/2 z-[99999] hidden w-max max-w-[300px] min-w-[200px] -translate-x-1/2 rounded-xl border border-black/5 shadow-lg group-hover/compact:block dark:border-white/10"
                                  style={dropdownStyle}
                                >
                                  <div className="w-full p-3">
                                    <BlockRenderer
                                      blocks={item.blocks}
                                      publicContext={publicContext}
                                      showFlags={header.dropdownSettings?.showFlags !== false}
                                      showTourCount={header.dropdownSettings?.showTourCount !== false}
                                    />
                                  </div>
                                </div>
                              </li>
                            )
                          } // Fallback to Mega Menu for more columns

                          return (
                            <NavigationMenuItem key={item.id}>
                              <NavigationMenuTrigger className="wowtour-navbar2-nav-link">
                                {'icon' in item && item.icon && (
                                  <Icon className={'mr-2 h-5'} icon={item.icon} />
                                )}
                                <span>{(item as { label?: string }).label}</span>
                              </NavigationMenuTrigger>
                              <NavigationMenuContent style={dropdownStyle}>
                                <div className="w-[calc(100vw-2rem)] max-w-screen-xl p-4">
                                  <BlockRenderer
                                    blocks={item.blocks}
                                    publicContext={publicContext}
                                    showFlags={header.dropdownSettings?.showFlags !== false}
                                    showTourCount={header.dropdownSettings?.showTourCount !== false}
                                    citiesMap={citiesMap}
                                  />
                                </div>
                              </NavigationMenuContent>
                            </NavigationMenuItem>
                          )
                        }
                      })}
                  </NavigationMenuList>
                </NavigationMenu>
              </nav>
            </NavActiveMarker>

            {/* Right: Social Icons + Hotline */}
            <div className="wowtour-navbar2-right">
              {/* Social icons */}
              {orderedSocials.length > 0 && (
                <div className="wowtour-navbar2-socials">
                  {orderedSocials.map((social, index) => {
                    const icon = socialIcons[social.platform]
                    if (!icon) return null
                    return (
                      <a
                        key={index}
                        href={social.url}
                        target={social.platform === 'email' ? undefined : "_blank"}
                        rel="noopener noreferrer"
                        className="wowtour-navbar2-social-icon"
                        title={social.label || social.platform}
                      >
                        {icon}
                      </a>
                    )
                  })}
                </div>
              )}

              {/* Hotline */}
              {showContacts && companyInfo?.callCenter && (
                <a
                  href={`tel:${companyInfo.callCenter.replace(/[^0-9+]/g, '')}`}
                  className="wowtour-navbar2-hotline"
                >
                  <div className="wowtour-navbar2-hotline-icon">
                    <Phone />
                  </div>
                  <div className="wowtour-navbar2-hotline-text">
                    <span className="wowtour-navbar2-hotline-label">Hotline</span>
                    <span className="wowtour-navbar2-hotline-number">{companyInfo.callCenter}</span>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== Mobile Navigation ===== */}
      <div className="block xl:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <CMSLink publicContext={publicContext} url={'/'} className="flex items-center gap-2">
            {companyInfo?.companyLogo ? (
              <Media resource={companyInfo.companyLogo} imgClassName="h-8 w-auto" priority />
            ) : header.logo ? (
              <Media resource={header.logo || undefined} />
            ) : null}
          </CMSLink>
          {header.isSearchEnabled && (
            <SearchButton
              className="ml-auto block xl:hidden"
              variant="outline"
              publicContext={publicContext}
            />
          )}
          <MobileMenuSheet>
            <SheetHeader>
              <SheetTitle>
                <div className="flex items-center gap-2">
                  {companyInfo?.companyLogo ? (
                    <Media resource={companyInfo.companyLogo} imgClassName="h-8 w-auto" />
                  ) : header.logo ? (
                    <Media resource={header.logo || undefined} />
                  ) : null}
                </div>
              </SheetTitle>
            </SheetHeader>
            {/* Link Group */}
            <div className="my-8 flex flex-col gap-6">
              <MobileDrillDown
                items={(
                  (header.richItems ?? header.items) as NonNullable<typeof header.richItems>
                )?.filter((item) => !('hidden' in item && item.hidden))}
                publicContext={publicContext}
              />

              
            </div>

            {/* Contact info in mobile menu */}
            {companyInfo && (
              <div className="text-muted-foreground flex flex-col gap-3 border-t pt-4 text-sm">
                {(() => {
                  const uniqueNumbers = new Set<string>()
                  const contacts: Array<{ icon: any; number: string; type: string }> = []
                  
                  const addContact = (icon: any, number: string | null | undefined, type: string) => {
                    if (!number) return
                    const cleanNum = number.replace(/[^0-9]/g, '')
                    if (cleanNum && uniqueNumbers.has(cleanNum)) return
                    if (cleanNum) uniqueNumbers.add(cleanNum)
                    contacts.push({ icon, number, type })
                  }

                  if (companyInfo.phones && companyInfo.phones.length > 0) {
                    companyInfo.phones.forEach((p: any) => addContact(<Phone className="w-4 h-4" />, p.number, 'phone'))
                  }
                  addContact(<Phone className="w-4 h-4" />, companyInfo.callCenter, 'callcenter')
                  addContact(<Headphones className="w-4 h-4" />, companyInfo.hotline, 'hotline')

                  return (
                    <>
                      {contacts.map((contact, idx) => (
                        <a
                          key={idx}
                          href={`tel:${contact.number.replace(/[^0-9+]/g, '')}`}
                          className="flex items-center gap-3"
                        >
                          {contact.icon}
                          <span>{contact.number}</span>
                        </a>
                      ))}
                      {companyInfo.businessHours && (
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4" />
                          <span>{companyInfo.businessHours}</span>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            )}

            {/* Button group */}
            <div className="mt-4 border-t pt-4">
              <div className="mt-2 flex flex-col gap-3">
                {header?.buttons?.map((btn) => (
                  <CMSLink publicContext={publicContext} key={btn.id} {...btn.link} />
                ))}
              </div>
            </div>
          </MobileMenuSheet>
        </div>
      </div>
    </>
  )
}
