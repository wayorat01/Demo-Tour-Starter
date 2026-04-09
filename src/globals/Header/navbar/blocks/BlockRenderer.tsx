'use client'

import { FeaturedBanner } from './FeaturedBanner'
import { FeaturedImage } from './FeaturedImage'
import { CategoryGrid } from './CategoryGrid'
import { CardGrid } from './CardGrid'
import { FeatureList } from './FeatureList'
import { SimpleLinks } from './SimpleLinks'
import { MultiColumnLinks } from './MultiColumnLinks'
import { TourCategoryMenu } from './TourCategoryMenu'
import { PublicContextProps } from '@/utilities/publicContextProps'

export type NavSubmenuBlock = {
  id?: string | null
  blockType: string
  [key: string]: any
}

export type BlockRendererProps = {
  blocks?: NavSubmenuBlock[]
  publicContext: PublicContextProps
  showFlags?: boolean
  showTourCount?: boolean
  citiesMap?: Record<string, Array<{ id: string; title: string; slug: string; tourCount: number }>>
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  blocks = [],
  publicContext,
  showFlags = true,
  showTourCount = true,
  citiesMap,
}) => {
  if (!blocks || blocks.length === 0) {
    return null
  }

  const gridColsClass =
    blocks.length === 1
      ? 'grid-cols-1'
      : blocks.length === 2
        ? 'grid-cols-1 md:grid-cols-2'
        : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'

  return (
    <div className={`grid gap-6 ${gridColsClass}`}>
      {blocks.map((block, index) => {
        switch (block.blockType) {
          case 'featuredImage':
            return (
              <FeaturedImage
                key={block.id || `featured-image-${index}`}
                title={block.title}
                subtitle={block.subtitle}
                description={block.description}
                image={block.image}
                backgroundColor={block.backgroundColor}
                link={block.link}
                publicContext={publicContext}
              />
            )
          case 'featuredBanner':
            return (
              <FeaturedBanner
                key={block.id || `featured-banner-${index}`}
                title={block.title}
                subtitle={block.subtitle}
                description={block.description}
                image={block.image}
                backgroundColor={block.backgroundColor}
                link={block.link}
                publicContext={publicContext}
              />
            )
          case 'categoryGrid':
            return (
              <CategoryGrid
                key={block.id || `category-grid-${index}`}
                title={block.title}
                items={block.items}
                publicContext={publicContext}
              />
            )
          case 'cardGrid':
            return (
              <CardGrid
                key={block.id || `card-grid-${index}`}
                title={block.title}
                cards={block.cards}
                publicContext={publicContext}
              />
            )
          case 'featureList':
            return (
              <FeatureList
                key={block.id || `feature-list-${index}`}
                title={block.title}
                features={block.features}
                publicContext={publicContext}
              />
            )
          case 'simpleLinks':
            return (
              <SimpleLinks
                key={block.id || `simple-links-${index}`}
                title={block.title}
                links={block.links}
                publicContext={publicContext}
              />
            )
          case 'multiColumnLinks':
            return (
              <MultiColumnLinks
                key={block.id || `multi-column-links-${index}`}
                title={block.title}
                columns={block.columns}
                links={block.links}
                publicContext={publicContext}
              />
            )
          case 'tourCategoryMenu':
            return (
              <TourCategoryMenu
                key={block.id || `tour-category-menu-${index}`}
                title={block.title}
                underlineColor={block.underlineColor}
                category={block.category}
                tours={block.tours}
                columns={block.columns}
                showFlags={showFlags}
                showTourCount={showTourCount}
                showCityHover={block.showCityHover !== false}
                publicContext={publicContext}
                citiesMap={citiesMap}
              />
            )
          default:
            return null
        }
      })}
    </div>
  )
}
