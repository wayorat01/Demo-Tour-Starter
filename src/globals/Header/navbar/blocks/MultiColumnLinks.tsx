'use client'

import { NavigationMenuLink } from '@/components/ui/navigation-menu'
import { Icon } from '@/components/Icon'
import { Media } from '@/components/Media'
import { PublicContextProps } from '@/utilities/publicContextProps'
import type { Media as MediaType } from '@/payload-types'

export type MultiColumnLinksProps = {
  title?: string
  columns?: number
  links?: Array<{
    id?: string
    link?: {
      label: string
      url?: string
      newTab?: boolean
      type?: 'reference' | 'custom'
      reference?: {
        value: string
        relationTo: string
      }
      section?: string
    }
    icon?: string
    customImage?: MediaType | string
  }>
  publicContext: PublicContextProps
}

export const MultiColumnLinks: React.FC<MultiColumnLinksProps> = ({
  title,
  columns = 2,
  links = [],
  publicContext,
}) => {
  // Generate grid columns class
  const gridColsClass =
    {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
    }[columns] || 'grid-cols-2'

  return (
    <div>
      {title && (
        <div className="border-border mb-4 pb-2 text-left lg:border-b">
          <strong className="text-left text-base font-semibold" style={{ color: 'inherit' }}>
            {title}
          </strong>
        </div>
      )}
      <div className={`grid gap-3 ${gridColsClass}`}>
        {links?.map((linkItem, index) => (
          <NavigationMenuLink
            key={linkItem.id || index}
            href={linkItem.link?.url || '#'}
            target={linkItem.link?.newTab ? '_blank' : undefined}
            className="group hover:text-primary flex flex-row items-center gap-2 py-1.5 text-left transition-colors"
            style={{ color: 'inherit', opacity: 0.85 }}
          >
            {/* Custom Image (country flag, etc.) takes priority over icon */}
            {linkItem.customImage && typeof linkItem.customImage === 'object' ? (
              <div className="flex size-5 shrink-0 items-center justify-center">
                <Media
                  resource={linkItem.customImage}
                  imgClassName="w-5 h-5 rounded-full object-cover"
                />
              </div>
            ) : linkItem.icon ? (
              <div className="flex size-5 shrink-0 items-center justify-center">
                <Icon icon={linkItem.icon} className="size-4" />
              </div>
            ) : null}
            <span className="text-sm font-medium">{linkItem.link?.label}</span>
          </NavigationMenuLink>
        ))}
      </div>
    </div>
  )
}
