import React from 'react'
import RichText from '@/components/RichText'
import Image from 'next/image'
import type { Media as MediaType } from '@/payload-types'
import type { PublicContextProps } from '@/utilities/publicContextProps'

type WowtourStaticContent1Props = {
  bannerImage?: MediaType | string | null
  bannerBorderRadius?: string | null
  articleSections?: Array<{
    sectionTitle?: string | null
    sectionTitleAlign?: 'left' | 'center' | 'right' | null
    sectionTitleColor?: string | null
    sectionDescription?: any
    id?: string | null
  }> | null
  publicContext: PublicContextProps
}

export const WowtourStaticContent1: React.FC<WowtourStaticContent1Props> = ({
  bannerImage,
  bannerBorderRadius,
  articleSections,
  publicContext,
}) => {
  const radiusValue = bannerBorderRadius ? `${bannerBorderRadius}px` : '0px'

  return (
    <section className="container pt-4 pb-12 md:pt-6 lg:pb-16">
      <div className="space-y-10">
        {/* Banner */}
        {bannerImage && typeof bannerImage === 'object' && bannerImage.url && (
          <div className="relative w-full overflow-hidden" style={{ borderRadius: radiusValue }}>
            <Image
              src={bannerImage.url}
              alt={bannerImage.alt || 'Banner'}
              width={bannerImage.width || 1200}
              height={bannerImage.height || 400}
              className="h-auto w-full object-cover"
              priority
            />
          </div>
        )}

        {/* Article Sections */}
        {articleSections && articleSections.length > 0 && (
          <div className="space-y-10">
            {articleSections.map((section, index) => (
              <div key={section.id || index} className="space-y-4">
                {section.sectionTitle && (
                  <h2
                    className={`text-xl md:text-2xl font-medium${!section.sectionTitleColor ? 'text-primary' : ''}`}
                    style={{
                      textAlign: section.sectionTitleAlign || 'left',
                      ...(section.sectionTitleColor ? { color: section.sectionTitleColor } : {}),
                    }}
                  >
                    {section.sectionTitle}
                  </h2>
                )}
                {section.sectionDescription && (
                  <div className="prose prose-slate static-content-richtext max-w-none text-base">
                    <RichText
                      content={section.sectionDescription}
                      publicContext={publicContext}
                      overrideStyle={{
                        p: 'text-base mb-3 leading-relaxed',
                        li: 'text-base',
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default WowtourStaticContent1
