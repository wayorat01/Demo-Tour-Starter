import { Clock, Phone, Headphones, Mail } from 'lucide-react'
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
import { NavActiveMarker } from './NavLinkActive'
import { StickyNavDetector } from './StickyNavDetector'
import './wowtour_navbar6.css'

// Social platform icons — using clean filled SVGs for consistent visual weight
// Each icon individually sized for optical balance within the round button
const socialRoundIcons: Record<string, React.ReactNode> = {
  facebook: (
    <svg viewBox="0 0 320 512" fill="currentColor" className="h-[14px] w-[14px]">
      <path d="M80 299.3V512H196V299.3h86.5l18-97.8H196V166.9c0-51.7 20.3-71.5 72.7-71.5c16.8 0 29.4.4 47.3 2.8V14.3C299.2 10.2 273.7 0 235 0C148.2 0 80 56.6 80 159.4V201.5H0v97.8H80z" />
    </svg>
  ),
  line: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[16px] w-[16px]">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  ),
  email: <Mail className="h-[16px] w-[16px]" />,
  instagram: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[16px] w-[16px]">
      <path d="M7.03.084c-1.277.06-2.149.264-2.913.558a5.88 5.88 0 0 0-2.126 1.384A5.88 5.88 0 0 0 .607 4.152C.313 4.916.11 5.788.048 7.065.01 7.817-.004 8.084 0 12.002c.004 3.917.022 4.184.06 4.936.06 1.277.264 2.149.558 2.913a5.88 5.88 0 0 0 1.384 2.126 5.88 5.88 0 0 0 2.126 1.384c.764.294 1.636.498 2.913.558.752.034 1.019.048 4.936.044 3.917-.004 4.184-.022 4.936-.06 1.277-.06 2.149-.264 2.913-.558a5.88 5.88 0 0 0 2.126-1.384 5.88 5.88 0 0 0 1.384-2.126c.294-.764.498-1.636.558-2.913.034-.752.048-1.019.044-4.936-.004-3.917-.022-4.184-.06-4.936-.06-1.277-.264-2.149-.558-2.913a5.88 5.88 0 0 0-1.384-2.126A5.88 5.88 0 0 0 19.848.607c-.764-.294-1.636-.498-2.913-.558C16.183.01 15.916-.004 11.998 0 8.081.004 7.814.022 7.062.06zm.34 21.608c-1.17-.054-1.805-.249-2.228-.413a3.72 3.72 0 0 1-1.382-.895 3.72 3.72 0 0 1-.895-1.382c-.164-.423-.36-1.058-.413-2.228-.06-1.265-.072-1.644-.076-4.848.004-3.204.02-3.583.076-4.848.054-1.17.249-1.805.413-2.228a3.72 3.72 0 0 1 .895-1.382 3.72 3.72 0 0 1 1.382-.895c.423-.164 1.058-.36 2.228-.413 1.265-.06 1.644-.072 4.848-.076 3.204.004 3.583.02 4.848.076 1.17.054 1.805.249 2.228.413.537.204.92.448 1.382.895.447.462.691.845.895 1.382.164.423.36 1.058.413 2.228.06 1.265.072 1.644.076 4.848-.004 3.204-.02 3.583-.076 4.848-.054 1.17-.249 1.805-.413 2.228a3.72 3.72 0 0 1-.895 1.382 3.72 3.72 0 0 1-1.382.895c-.423.164-1.058.36-2.228.413-1.265.06-1.644.072-4.848.076-3.204-.004-3.583-.02-4.848-.076zM11.97 5.784A6.218 6.218 0 1 0 12.03 18.22 6.218 6.218 0 0 0 11.97 5.784zm.06 10.252a4.034 4.034 0 1 1-.06-8.068 4.034 4.034 0 0 1 .06 8.068zm6.406-10.845a1.453 1.453 0 1 0-2.906 0 1.453 1.453 0 0 0 2.906 0z" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[16px] w-[16px]">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[14px] w-[14px]">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  ),
}

export const Navbar6WowTour: React.FC<{
  header: HeaderType
  publicContext: PublicContextProps
  companyInfo?: CompanyInfo
  citiesMap?: Record<string, any[]>
}> = ({ header, publicContext, companyInfo, citiesMap }) => {
  const socialLinks = (companyInfo?.socialLinks ?? []).filter((s) => s.showInHeader !== false)

  // Resolve topBar visibility settings (default all to true, except license = false)
  const topBar = (header as any).topBar
  const showSocialIcons = topBar?.showSocialIcons !== false
  const showBusinessHours = topBar?.showBusinessHours !== false
  const showContacts = topBar?.showContacts !== false

  return (
    <>
      <div className="wowtour-navbar6-top-wrapper bg-background">
        {/* ===== Row 1: Top Bar (Business Hours, Contacts) ===== */}
        <div className="wowtour-navbar6-topbar hidden xl:block">
          <div className="container">
            <div className="wowtour-navbar6-infobar-inner">
              {/* Left: Contact Info */}
              <div className="wowtour-navbar6-info-items">
                {/* Business Hours */}
                {showBusinessHours && companyInfo?.businessHours && (
                  <div className="wowtour-navbar6-info-item">
                    <Clock className="h-4 w-4" />
                    <span>
                      <span className="wowtour-navbar6-info-label">เวลาทำการ</span>
                      {companyInfo.businessHours}
                    </span>
                  </div>
                )}

                {/* Phone Number */}
                {showContacts && companyInfo?.callCenter && (
                  <a
                    href={`tel:${companyInfo.callCenter.replace(/[^0-9+]/g, '')}`}
                    className="wowtour-navbar6-info-item"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <Phone className="h-4 w-4" />
                    <span>
                      <span className="wowtour-navbar6-info-label">เบอร์โทรติดต่อ</span>
                      {companyInfo.callCenter}
                    </span>
                  </a>
                )}

                {/* Hotline */}
                {showContacts && companyInfo?.hotline && (
                  <a
                    href={`tel:${companyInfo?.hotline?.replace(/[^0-9+]/g, '')}`}
                    className="wowtour-navbar6-info-item"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <Headphones className="h-4 w-4" />
                    <span>
                      <span className="wowtour-navbar6-info-label">Hotline</span>
                      {companyInfo?.hotline}
                    </span>
                  </a>
                )}
              </div>

              {/* Right: Social Icons (round buttons) */}
              <div className="wowtour-navbar6-socials">
                {showSocialIcons && socialLinks.map((social: any, idx: number) => {
                  if (!social.url) return null
                  const icon = socialRoundIcons[social.platform]
                  return (
                    <a
                      key={social.id || idx}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="wowtour-navbar6-social-btn"
                    >
                      {icon}
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ===== Row 2: Centered Logo ===== */}
        <div className="wowtour-navbar6-logo-bar">
          <CMSLink publicContext={publicContext} url={'/'} className="inline-flex items-center">
            {companyInfo?.companyLogo ? (
              <Media resource={companyInfo.companyLogo} imgClassName="h-12 w-auto" priority />
            ) : header.logo ? (
              <Media resource={header.logo || undefined} imgClassName="h-12 w-auto" priority />
            ) : null}
          </CMSLink>
        </div>
      </div>

      <StickyNavDetector className="wowtour-navbar6-sticky-wrapper z-50">
        {/* ===== Row 3: Centered Nav Links (Sticky) ===== */}
        <div className="wowtour-navbar6-sticky">
          <div className="wowtour-navbar6-navstrip">
            <div className="container">
              <div className="wowtour-navbar6-navstrip-inner">
                <NavActiveMarker>
                  <nav className="wowtour-navbar6-nav">
                    <NavigationMenu>
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
                                  className="wowtour-navbar6-nav-link"
                                />
                              )
                            } else if ((item as { blockType?: string }).blockType === 'sub') {
                              return (
                                <NavigationMenuItem key={item.id}>
                                  <NavigationMenuTrigger className="wowtour-navbar6-nav-link">
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
                                (b: any) =>
                                  b.blockType === 'tourCategoryMenu' &&
                                  (!b.columns || b.columns === '1'),
                              )

                              if (isCompact) {
                                return (
                                  <li
                                    key={item.id}
                                    className="group/compact relative flex h-full items-center"
                                  >
                                    <button className="wowtour-navbar6-nav-link">
                                      {'icon' in item && item.icon && (
                                        <Icon icon={item.icon} className="mr-2 h-4 w-4" />
                                      )}
                                      <span>{(item as { label?: string }).label}</span>
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
                                      className="absolute top-full left-1/2 z-[99999] hidden w-max max-w-[400px] min-w-[320px] -translate-x-1/2 rounded-xl border border-black/5 shadow-lg group-hover/compact:block lg:min-w-[350px] dark:border-white/10"
                                      style={dropdownStyle}
                                    >
                                      <div className="w-full p-4">
                                        <BlockRenderer
                                          blocks={item.blocks}
                                          publicContext={publicContext}
                                          showFlags={header.dropdownSettings?.showFlags !== false}
                                          showTourCount={
                                            header.dropdownSettings?.showTourCount !== false
                                          }
                                          citiesMap={citiesMap}
                                        />
                                      </div>
                                    </div>
                                  </li>
                                )
                              }

                              return (
                                <NavigationMenuItem key={item.id}>
                                  <NavigationMenuTrigger className="wowtour-navbar6-nav-link">
                                    {'icon' in item && item.icon && (
                                      <Icon className={'mr-2 h-5'} icon={item.icon} />
                                    )}
                                    <span>{(item as { label?: string }).label}</span>
                                  </NavigationMenuTrigger>
                                  <NavigationMenuContent style={dropdownStyle}>
                                    <div className="mx-auto w-[calc(100vw-2rem)] max-w-screen-xl p-4">
                                      <BlockRenderer
                                        blocks={item.blocks}
                                        publicContext={publicContext}
                                        showFlags={header.dropdownSettings?.showFlags !== false}
                                        showTourCount={
                                          header.dropdownSettings?.showTourCount !== false
                                        }
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
              </div>
            </div>
          </div>
        </div>
      </StickyNavDetector>

      {/* ===== Mobile Navigation ===== */}
      <div className="bg-background sticky top-0 z-50 block shadow-sm xl:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <CMSLink publicContext={publicContext} url={'/'} className="flex items-center gap-2">
            {companyInfo?.companyLogo ? (
              <Media resource={companyInfo.companyLogo} imgClassName="h-8 w-auto" priority />
            ) : header.logo ? (
              <Media resource={header.logo || undefined} imgClassName="h-8 w-auto" />
            ) : null}
          </CMSLink>
          <MobileMenuSheet>
            <SheetHeader>
              <SheetTitle>
                <div className="flex items-center gap-2">
                  {companyInfo?.companyLogo ? (
                    <Media resource={companyInfo.companyLogo} imgClassName="h-8 w-auto" />
                  ) : header.logo ? (
                    <Media resource={header.logo || undefined} imgClassName="h-8 w-auto" />
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
