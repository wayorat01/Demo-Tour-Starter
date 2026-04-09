'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import { CMSLink } from '@/components/Link'
import { Icon } from '@/components/Icon'
import { Media } from '@/components/Media'
import { PublicContextProps } from '@/utilities/publicContextProps'
import type { Media as MediaType } from '@/payload-types'
import { cn } from '@/utilities/cn'
import localization from '@/localization.config'

type NavItem = {
  id?: string | null
  blockType: string
  label?: string | null
  icon?: string | null
  link?: any
  subitems?: any[]
  blocks?: any[]
}

/** Resolve link href the same way CMSLink does */
function resolveLinkHref(link: any, locale?: string): string {
  if (!link) return ''
  const localePrefix = locale && locale !== localization.defaultLocale ? `/${locale}` : ''

  if (
    link.type === 'reference' &&
    typeof link.reference?.value === 'object' &&
    link.reference.value.slug
  ) {
    const ref = link.reference.value
    const relationToPrefix =
      link.reference?.relationTo !== 'pages' ? `/${link.reference.relationTo}` : ''
    // Use breadcrumbs if available
    if (ref.breadcrumbs?.length > 0) {
      const lastUrl = ref.breadcrumbs[ref.breadcrumbs.length - 1]?.url
      if (lastUrl) {
        const normalizedUrl = ref.slug === 'home' ? '' : lastUrl
        return `${localePrefix}${relationToPrefix}${normalizedUrl}` || '/'
      }
    }
    const slug = ref.slug === 'home' ? '' : `/${ref.slug}`
    return `${localePrefix}${relationToPrefix}${slug}` || '/'
  }

  if (link.url) return link.url
  return ''
}

export function MobileDrillDown({
  items,
  publicContext,
  onLinkClick,
}: {
  items: NavItem[]
  publicContext: PublicContextProps
  onLinkClick?: () => void
}) {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)
  const pathname = usePathname()

  // Find the active item
  const activeItem = items.find((item) => item.id === activeSubmenu)

  return (
    <div className="relative overflow-hidden">
      {/* Main menu - slides out when submenu is active */}
      <div
        className="flex flex-col gap-1 transition-transform duration-300 ease-in-out"
        style={{
          transform: activeSubmenu ? 'translateX(-100%)' : 'translateX(0)',
          position: activeSubmenu ? 'absolute' : 'relative',
          width: '100%',
          opacity: activeSubmenu ? 0 : 1,
          pointerEvents: activeSubmenu ? 'none' : 'auto',
        }}
      >
        {items.map((item: any, idx) => {
          if (item.blockType === 'link') {
            const linkHref = resolveLinkHref(item.link, publicContext.locale)
            const normalizedPathname = pathname.replace(/\/$/, '') || '/'
            const normalizedHref = linkHref.replace(/\/$/, '') || '/'
            const active = normalizedPathname === normalizedHref
            return (
              <CMSLink
                publicContext={publicContext}
                key={item.id ? `${item.id}-${idx}` : idx}
                {...item.link}
                className={cn(
                  'flex w-full px-0 py-3 text-base font-normal',
                  active && 'text-primary font-medium',
                )}
                onClick={onLinkClick}
              />
            )
          } else if (item.blockType === 'sub' || item.blockType === 'submenu') {
            return (
              <button
                key={item.id ? `${item.id}-${idx}` : idx}
                type="button"
                className="flex w-full items-center justify-between px-0 py-3 text-left text-base font-normal"
                onClick={() => setActiveSubmenu(item.id || null)}
              >
                <span className="inline-flex items-center">
                  {item.icon && <Icon className="mr-2 h-5" icon={item.icon} />}
                  {item.label}
                </span>
                <ChevronRight className="text-muted-foreground h-4 w-4" />
              </button>
            )
          }
          return null
        })}
      </div>

      {/* Submenu - slides in from right */}
      <div
        className="flex flex-col transition-transform duration-300 ease-in-out"
        style={{
          transform: activeSubmenu ? 'translateX(0)' : 'translateX(100%)',
          position: activeSubmenu ? 'relative' : 'absolute',
          width: '100%',
          opacity: activeSubmenu ? 1 : 0,
          top: 0,
        }}
      >
        {activeItem && (
          <>
            {/* Back button */}
            <button
              type="button"
              className="text-primary mb-2 flex items-center gap-2 px-0 py-3 text-sm font-medium"
              onClick={() => setActiveSubmenu(null)}
            >
              <ArrowLeft className="h-4 w-4" />
              กลับ
            </button>

            {/* Submenu title */}
            <h3 className="mb-4 text-base font-semibold">{activeItem.label}</h3>

            {/* Submenu content */}
            {activeItem.blockType === 'sub' && activeItem.subitems && (
              <div className="flex flex-col gap-1">
                {activeItem.subitems.map((subitem: any, subIdx: number) => {
                  const subHref = resolveLinkHref(subitem.link, publicContext.locale)
                  const subActive =
                    subHref &&
                    (pathname.replace(/\/$/, '') || '/') === (subHref.replace(/\/$/, '') || '/')
                  return (
                    <CMSLink
                      publicContext={publicContext}
                      key={subitem.id ? `${subitem.id}-${subIdx}` : subIdx}
                      {...subitem.link}
                      label=""
                      iconBefore={undefined}
                      iconAfter={undefined}
                      className={cn(
                        'hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-3 transition-colors',
                        subActive && 'bg-accent text-primary',
                      )}
                      onClick={onLinkClick}
                    >
                      {subitem.link?.iconBefore && (
                        <Icon icon={subitem.link.iconBefore} className="h-5 w-5" />
                      )}
                      <div>
                        <div className={cn('text-sm font-medium', subActive && 'text-primary')}>
                          {subitem.link?.label}
                        </div>
                        {subitem.Description && (
                          <p className="text-muted-foreground mt-0.5 text-xs">
                            {subitem.Description}
                          </p>
                        )}
                      </div>
                    </CMSLink>
                  )
                })}
              </div>
            )}

            {activeItem.blockType === 'submenu' && activeItem.blocks && (
              <div className="flex flex-col gap-4">
                {activeItem.blocks.map((block: any, blockIdx: number) => {
                  if (block.blockType === 'tourCategoryMenu') {
                    // Normalize tours from polymorphic { relationTo, value } format
                    const tourItems = (block.tours || [])
                      .map((tour: any) => {
                        if (typeof tour === 'string') return null
                        if (tour && 'relationTo' in tour && tour.value) {
                          return typeof tour.value === 'object'
                            ? { ...tour.value, relationTo: tour.relationTo }
                            : null
                        }
                        return tour
                      })
                      .filter(
                        (tour: any) =>
                          typeof tour === 'object' && tour !== null && tour.isActive !== false,
                      )
                    
                    if (tourItems.length === 0) return null

                    return (
                      <div key={block.id || `block-${blockIdx}`}>
                        {block.title && (
                          <div className="mb-3">
                            <h4 className="text-muted-foreground mb-1.5 text-sm font-medium">
                              {block.title}
                            </h4>
                            <div
                              className="h-0.5 w-full rounded-full"
                              style={{ backgroundColor: block.underlineColor || '#f97316' }}
                            />
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-1">
                          {tourItems.map((tour: any, tourIdx: number) => {
                            const tourHref = `/intertours/${tour.slug}`
                            const tourActive = pathname.startsWith(tourHref)
                            return (
                              <CMSLink
                                key={tour.id ? `${tour.id}-${tourIdx}` : tourIdx}
                                publicContext={publicContext}
                                url={tourHref}
                                className={cn(
                                  'group hover:bg-accent flex items-center gap-2 rounded-lg px-2 py-2 transition-colors',
                                  tourActive && 'bg-primary hover:bg-primary/90 text-white',
                                )}
                                onClick={onLinkClick}
                              >
                                {tour.flagCode && tour.flagCode.length === 2 ? (
                                  <div
                                    className="relative flex-shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-100 shadow-sm"
                                    style={{ width: 20, height: 20 }}
                                  >
                                    <img
                                      src={`https://flagcdn.com/w40/${tour.flagCode.toLowerCase()}.png`}
                                      srcSet={`https://flagcdn.com/w80/${tour.flagCode.toLowerCase()}.png 2x`}
                                      alt={tour.flagCode}
                                      className="absolute inset-0 h-full w-full object-cover"
                                      loading="lazy"
                                    />
                                  </div>
                                ) : tour.flagIcon && typeof tour.flagIcon === 'object' ? (
                                  <div
                                    className="flex-shrink-0 overflow-hidden rounded-full"
                                    style={{ width: 20, height: 20 }}
                                  >
                                    <Media
                                      resource={tour.flagIcon as MediaType}
                                      imgClassName="w-full h-full object-cover"
                                      className="h-full w-full"
                                    />
                                  </div>
                                ) : null}
                                <span className="flex-1 truncate text-xs font-medium">{tour.title}</span>
                                {tour.tourCount !== undefined && tour.tourCount > 0 && (
                                  <span
                                    className={cn(
                                      'flex-shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                                      tourActive
                                        ? 'text-primary bg-white'
                                        : 'bg-primary text-primary-foreground',
                                    )}
                                  >
                                    {tour.tourCount}
                                  </span>
                                )}
                              </CMSLink>
                            )
                          })}
                        </div>
                      </div>
                    )
                  }

                  const links = block.links || block.items || []
                  return links.map((linkItem: any, linkIdx: number) => (
                    <CMSLink
                      publicContext={publicContext}
                      key={linkItem.id ? `${linkItem.id}-${linkIdx}` : linkIdx}
                      {...(linkItem.link || {})}
                      className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
                      onClick={onLinkClick}
                    />
                  ))
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
