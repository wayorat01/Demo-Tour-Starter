import { Clock, Phone, Mail, Headphones } from 'lucide-react'
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
import { StickyNavDetector } from './StickyNavDetector'
import './wowtour_navbar1.css'

// Social media icon SVGs
const socialIcons: Record<string, React.ReactNode> = {
  facebook: (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  line: (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  ),
  instagram: (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  ),
  tiktok: (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  ),
  youtube: (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  twitter: (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  whatsapp: (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  ),
}

export const Navbar1: React.FC<{
  header: HeaderType
  publicContext: PublicContextProps
  companyInfo?: CompanyInfo
  citiesMap?: Record<string, any[]>
}> = ({ header, publicContext, companyInfo, citiesMap }) => {
  // Resolve topBar visibility settings (default all to true)
  const topBar = (header as any).topBar
  const showBusinessHours = topBar?.showBusinessHours !== false
  const showTourismLicense = topBar?.showTourismLicense === true
  const showContacts = topBar?.showContacts !== false
  const showSocialIcons = topBar?.showSocialIcons !== false
  const showSocialLabels = topBar?.showSocialLabels !== false

  // Get social links from company info that have "เปิดใช้งาน Header" checked
  const socialLinks = (companyInfo?.socialLinks ?? []).filter((s) => s.showInHeader !== false)

  // Check if LINE already exists in socialLinks (to avoid duplicate with lineOA field)
  const hasLineInSocial = socialLinks.some((s) => s.platform === 'line')
  // Check if Email already exists in socialLinks (to avoid duplicate with email field)
  const hasEmailInSocial = socialLinks.some((s) => s.platform === 'email')

  return (
    <>
      <section className="z-50">
        {/* ===== Top Bar (Desktop only) ===== */}
        <div className="wowtour-navbar1-topbar">
          <div className="container">
            <div className="wowtour-navbar1-topbar-inner">
              {/* Left: Logo */}
              <CMSLink publicContext={publicContext} url={'/'} className="wowtour-navbar1-logo">
                {companyInfo?.companyLogo ? (
                  <Media resource={companyInfo.companyLogo} imgClassName="h-14 w-auto" priority />
                ) : header.logo ? (
                  <Media resource={header.logo || undefined} priority />
                ) : null}
              </CMSLink>

              {/* Right: Contact Info */}
              <div className="wowtour-navbar1-contact">
                {/* Row 1: Social Links + Email + LINE + Business Hours */}
                <div className="wowtour-navbar1-contact-row">
                  {/* Social Media Links ที่ติ๊ก "เปิดใช้งาน Header" */}
                  {showSocialIcons &&
                    socialLinks.map((social: any, idx: number) => (
                      <a
                        key={social.id || idx}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="wowtour-navbar1-contact-item"
                      >
                        <span
                          className={`wowtour-navbar1-icon-circle ${social.platform || 'default'}`}
                        >
                          {socialIcons[social.platform] || null}
                        </span>
                        {showSocialLabels && social.label && (
                          <span className="label">{social.label}</span>
                        )}
                      </a>
                    ))}

                  {/* Email จาก field เดี่ยว (ถ้าไม่มี email ใน socialLinks แล้ว) */}
                  {showContacts && !hasEmailInSocial && companyInfo?.email && (
                    <a
                      href={`mailto:${companyInfo.email}`}
                      className="wowtour-navbar1-contact-item"
                    >
                      <span className="wowtour-navbar1-icon-circle email">
                        <Mail className="h-4 w-4" />
                      </span>
                      {showSocialLabels && <span className="label">{companyInfo.email}</span>}
                    </a>
                  )}

                  {/* LINE จาก field เดี่ยว (ถ้าไม่มี LINE ใน socialLinks แล้ว) */}
                  {showContacts && !hasLineInSocial && companyInfo?.lineOA && (
                    <a
                      href={companyInfo.lineLink || `https://line.me/R/ti/p/${companyInfo.lineOA}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="wowtour-navbar1-contact-item"
                    >
                      <span className="wowtour-navbar1-icon-circle line">{socialIcons.line}</span>
                      {showSocialLabels && <span className="label">{companyInfo.lineOA}</span>}
                    </a>
                  )}
                </div>

                {/* Row 2: License (if enabled) + Business Hours + Hotline */}
                <div className="wowtour-navbar1-contact-row">
                  {showTourismLicense && companyInfo?.tatLicense && (
                    <div className="wowtour-navbar1-contact-item license" style={{ gap: '6px' }}>
                      <div className="label-group" style={{ borderRight: '1px solid var(--border)', paddingRight: '1rem', marginRight: '0.25rem' }}>
                        <span className="hours-label" style={{ fontSize: '12px' }}>ใบอนุญาตเลขที่ :&nbsp;</span>
                        <span className="hours-value" style={{ fontSize: '13px', fontWeight: 600 }}>{companyInfo.tatLicense}</span>
                      </div>
                    </div>
                  )}
                  {showBusinessHours && companyInfo?.businessHours && (
                    <div className="wowtour-navbar1-contact-item hours">
                      <span className="wowtour-navbar1-icon-circle clock">
                        <Clock className="h-4 w-4" />
                      </span>
                      <div className="label-group">
                        <span className="hours-label">เวลาทำการ</span>
                        <span className="hours-value">{companyInfo.businessHours}</span>
                      </div>
                    </div>
                  )}

                  {showContacts && companyInfo?.callCenter && (
                    <a
                      href={`tel:${companyInfo.callCenter.replace(/[^0-9+]/g, '')}`}
                      className="wowtour-navbar1-contact-item hotline"
                    >
                      <span className="wowtour-navbar1-icon-circle phone">
                        <Phone className="h-4 w-4" />
                      </span>
                      <div className="label-group">
                        <span className="hotline-label">Hotline</span>
                        <span className="hotline-number">{companyInfo.callCenter}</span>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Gradient Divider ===== */}
        <div className="wowtour-navbar1-gradient" />
      </section>

      {/* ===== Navigation Bar (Desktop) ===== */}
      <StickyNavDetector className="wowtour-navbar1-nav">
        <div className="container">
          <NavActiveMarker>
            <nav className="wowtour-navbar1-nav-inner">
              <NavigationMenu className="wowtour-navbar1-menu-content">
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
                            className="wowtour-navbar1-nav-link"
                          />
                        )
                      } else if ((item as { blockType?: string }).blockType === 'sub') {
                        return (
                          <NavigationMenuItem key={item.id}>
                            <NavigationMenuTrigger className="wowtour-navbar1-nav-link">
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
                                  {(item as { subitems?: any[] }).subitems?.map((subitem: any) => (
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
                                  ))}
                                </NavigationMenuLink>
                              </ul>
                            </NavigationMenuContent>
                          </NavigationMenuItem>
                        )
                      } else if (item.blockType === 'submenu') {
                        // Rich submenu — use BlockRenderer for full mega menu
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
                              <button className="wowtour-navbar1-nav-link">
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
                                    citiesMap={citiesMap}
                                  />
                                </div>
                              </div>
                            </li>
                          )
                        } // Fallback to Mega Menu for more columns

                        return (
                          <NavigationMenuItem key={item.id}>
                            <NavigationMenuTrigger className="wowtour-navbar1-nav-link">
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
        </div>
      </StickyNavDetector>

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
