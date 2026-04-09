import React from 'react'

// --------------------------------------------------------
// Generic JSON-LD injector (hidden <script>, no visual output)
// --------------------------------------------------------
function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// --------------------------------------------------------
// 1. Tour Product Schema
// --------------------------------------------------------
export type TourJsonLdProps = {
  name: string
  description?: string
  imageUrl?: string
  price?: number | string
  url: string
  duration?: string
  airlineName?: string
  brandName?: string
}

export function TourJsonLd({
  name,
  description,
  imageUrl,
  price,
  url,
  duration,
  airlineName,
  brandName = 'WOW Tour',
}: TourJsonLdProps) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    ...(description && { description }),
    ...(imageUrl && { image: imageUrl }),
    brand: { '@type': 'Organization', name: brandName },
    ...(price && {
      offers: {
        '@type': 'Offer',
        price: String(price).replace(/,/g, ''),
        priceCurrency: 'THB',
        availability: 'https://schema.org/InStock',
        url,
      },
    }),
    ...(duration || airlineName
      ? {
          additionalProperty: [
            ...(duration ? [{ '@type': 'PropertyValue', name: 'ระยะเวลา', value: duration }] : []),
            ...(airlineName ? [{ '@type': 'PropertyValue', name: 'สายการบิน', value: airlineName }] : []),
          ],
        }
      : {}),
  }
  return <JsonLd data={data} />
}

// --------------------------------------------------------
// 2. Blog / Article Schema
// --------------------------------------------------------
export type ArticleJsonLdProps = {
  headline: string
  imageUrl?: string
  datePublished?: string
  dateModified?: string
  authorName?: string
  url: string
}

export function ArticleJsonLd({
  headline,
  imageUrl,
  datePublished,
  dateModified,
  authorName = 'WOW Tour',
  url,
}: ArticleJsonLdProps) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline,
    ...(imageUrl && { image: imageUrl }),
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
    author: { '@type': 'Organization', name: authorName },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  }
  return <JsonLd data={data} />
}

// --------------------------------------------------------
// 3. Organization Schema (global, every page)
// --------------------------------------------------------
export type OrganizationJsonLdProps = {
  name: string
  url: string
  logoUrl?: string
  telephone?: string
  description?: string
}

export function OrganizationJsonLd({
  name,
  url,
  logoUrl,
  telephone,
  description,
}: OrganizationJsonLdProps) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    ...(logoUrl && { logo: logoUrl }),
    ...(description && { description }),
    ...(telephone && {
      contactPoint: {
        '@type': 'ContactPoint',
        telephone,
        contactType: 'customer service',
        areaServed: 'TH',
        availableLanguage: 'Thai',
      },
    }),
  }
  return <JsonLd data={data} />
}

// --------------------------------------------------------
// 4. ItemList Schema (tour listing pages)
// --------------------------------------------------------
export type ItemListJsonLdProps = {
  name: string
  description?: string
  itemCount?: number
  items?: Array<{ position: number; url: string; name?: string }>
}

export function ItemListJsonLd({ name, description, itemCount, items = [] }: ItemListJsonLdProps) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    ...(description && { description }),
    ...(itemCount !== undefined && { numberOfItems: itemCount }),
    ...(items.length > 0 && {
      itemListElement: items.map((item) => ({
        '@type': 'ListItem',
        position: item.position,
        url: item.url,
        ...(item.name && { name: item.name }),
      })),
    }),
  }
  return <JsonLd data={data} />
}
