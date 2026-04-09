import React from 'react'
import RichText from '@/components/RichText'
import Image from 'next/image'
import type { Media as MediaType } from '@/payload-types'
import type { PublicContextProps } from '@/utilities/publicContextProps'

type ServiceItem = {
  itemTitle?: string | null
  itemDescription?: any
  itemImage?: MediaType | string | null
  itemImageBorderRadius?: string | null
  id?: string | null
}

type WowtourTourGroup1Props = {
  bannerImage?: MediaType | string | null
  bannerBorderRadius?: string | null
  mainTitle?: string | null
  mainTitleColor?: string | null
  mainDescription?: any
  serviceItems?: ServiceItem[] | null
  publicContext: PublicContextProps
}

export const WowtourTourGroup1: React.FC<WowtourTourGroup1Props> = ({
  bannerImage,
  bannerBorderRadius,
  mainTitle,
  mainTitleColor,
  mainDescription,
  serviceItems,
  publicContext,
}) => {
  const bannerRadius = bannerBorderRadius ? `${bannerBorderRadius}px` : '0px'

  return (
    <section className="container pt-4 pb-12 md:pt-6 lg:pb-16">
      <div className="space-y-10">
        {/* Banner */}
        {bannerImage && typeof bannerImage === 'object' && bannerImage.url && (
          <div className="relative w-full overflow-hidden" style={{ borderRadius: bannerRadius }}>
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

        {/* Main Title & Description */}
        <div className="space-y-4 text-center">
          {mainTitle && (
            <h2
              className={`text-2xl font-medium${!mainTitleColor ? 'text-primary' : ''}`}
              style={mainTitleColor ? { color: mainTitleColor } : undefined}
            >
              {mainTitle}
            </h2>
          )}
          {mainDescription && (
            <div className="prose prose-slate mx-auto max-w-3xl max-w-none text-base">
              <RichText
                content={mainDescription}
                publicContext={publicContext}
                overrideStyle={{
                  p: 'text-base mb-3 leading-relaxed',
                }}
              />
            </div>
          )}
        </div>

        {/* Service Items */}
        {serviceItems && serviceItems.length > 0 && (
          <div className="space-y-12 md:space-y-16">
            {serviceItems.map((item, index) => {
              const itemRadius = item.itemImageBorderRadius
                ? `${item.itemImageBorderRadius}px`
                : '0px'
              const isEven = index % 2 === 0

              return (
                <div
                  key={item.id || index}
                  className="flex flex-col items-center gap-8 md:flex-row md:gap-12"
                >
                  {/* Content Side */}
                  <div className="w-full space-y-4 md:w-1/2">
                    {item.itemTitle && (
                      <h3 className="text-foreground text-xl font-bold md:text-2xl">
                        {item.itemTitle}
                      </h3>
                    )}
                    {item.itemDescription && (
                      <div className="prose prose-slate tour-group-richtext max-w-none text-base">
                        <RichText
                          content={item.itemDescription}
                          publicContext={publicContext}
                          overrideStyle={{
                            p: 'text-base mb-3 leading-relaxed',
                            li: 'text-base',
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Image Side */}
                  {item.itemImage && typeof item.itemImage === 'object' && item.itemImage.url && (
                    <div className="w-full md:w-1/2">
                      <div
                        className="relative w-full overflow-hidden"
                        style={{ borderRadius: itemRadius }}
                      >
                        <Image
                          src={item.itemImage.url}
                          alt={item.itemImage.alt || item.itemTitle || 'Service'}
                          width={item.itemImage.width || 600}
                          height={item.itemImage.height || 400}
                          className="h-auto w-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

export default WowtourTourGroup1
