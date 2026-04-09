import * as React from 'react'
import type { Page } from '@/payload-types'
import { cn } from '@/utilities'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { PublicContextProps } from '@/utilities/publicContextProps'
import localization from '@/localization.config'
import Link from 'next/link'

interface BreadcrumbProps {
  items?:
    | {
        doc?: (string | null) | Page
        url?: string | null
        label?: string | null
        id?: string | null
      }[]
    | null
  className?: string
  publicContext?: PublicContextProps
  disableWrapper?: boolean
}

export function Breadcrumbs({ items, className, publicContext, disableWrapper }: BreadcrumbProps) {
  if (!items?.length) return null
  const localePrefix =
    publicContext?.locale !== localization.defaultLocale ? `/${publicContext?.locale}` : ''

  const filteredItems = items.filter(
    (item) =>
      item.url !== '/' &&
      item.url !== '' &&
      item.label?.toLowerCase() !== 'home' &&
      item.label !== 'หน้าแรก',
  )

  const breadcrumbContent = (
    <Breadcrumb>
      <BreadcrumbList className={cn('text-muted-foreground text-sm', className)}>
        <BreadcrumbItem>
          <BreadcrumbLink className="hover:text-foreground transition-colors duration-200" asChild>
            <Link href={localePrefix || '/'}>หน้าแรก</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {filteredItems.map((item, index) => (
          <React.Fragment key={item.id ? `${item.id}-${index}` : index}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {index === filteredItems.length - 1 ? (
                <BreadcrumbPage className="font-medium">{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  className="hover:text-foreground transition-colors duration-200"
                  asChild
                >
                  <Link href={localePrefix + (item.url || '#')}>{item.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )

  if (disableWrapper) return breadcrumbContent

  return <div className="container mt-6 mb-4 md:mt-8 md:mb-6">{breadcrumbContent}</div>
}
