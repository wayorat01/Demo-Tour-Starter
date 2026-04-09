import React from 'react'
import type { WowtourVisaListBlock as WowtourVisaListBlockType } from '@/payload-types'
import type { PublicContextProps } from '@/utilities/publicContextProps'
import type { Media } from '@/payload-types'
import { ButtonIcon, getButtonStyle } from './ButtonIcon'

const getMediaUrl = (media: Media | string | null | undefined): string | null => {
  if (!media) return null
  if (typeof media === 'string') return media
  return media.url || null
}

const getMediaAlt = (media: Media | string | null | undefined): string => {
  if (!media || typeof media === 'string') return ''
  return media.alt || ''
}

const WowtourVisaCard3: React.FC<
  WowtourVisaListBlockType & { publicContext: PublicContextProps }
> = ({ headingSettings, items, gridColumns = '4' }) => {
  const heading = headingSettings?.heading
  const description = headingSettings?.showDescription ? headingSettings?.description : null

  const gridColsClass =
    gridColumns === '2'
      ? 'md:grid-cols-2'
      : gridColumns === '3'
        ? 'md:grid-cols-2 lg:grid-cols-3'
        : 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {/* Heading */}
        {heading && (
          <div className="mb-10">
            <h2
              className="text-2xl font-bold md:text-3xl"
              style={{ color: 'var(--foreground, #1a1a2e)' }}
            >
              {heading}
            </h2>
            {description && <p className="text-muted-foreground mt-2">{description}</p>}
          </div>
        )}

        {/* Visa Cards Grid */}
        <div className={`grid grid-cols-1 gap-6 ${gridColsClass}`}>
          {items?.map((item, index) => {
            const imageUrl = getMediaUrl(item.image as Media)
            const imageAlt = getMediaAlt(item.image as Media)

            // Button config
            const btnLabel = item.buttonSettings?.buttonLabel
            const btnIcon = item.buttonSettings?.buttonIcon || 'none'
            const btnPdfUrl = getMediaUrl(item.buttonSettings?.buttonPdfFile as Media)
            const btnLink = btnPdfUrl || item.buttonSettings?.buttonLink || null
            const btnStyle = item.buttonSettings?.buttonStyle || 'primary'
            const btnColor = item.buttonSettings?.buttonColor || null
            const showButton = !!btnLabel && !!btnLink

            return (
              <div
                key={item.id || index}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Cover Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={imageAlt || item.title || ''}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}

                  {/* Tag badge — top-left */}
                  {item.tag && (
                    <span
                      className="absolute top-3 left-3 rounded-lg px-3 py-1 text-xs font-bold shadow-md"
                      style={{
                        backgroundColor: 'var(--primary, #2563eb)',
                        color: '#ffffff',
                      }}
                    >
                      {item.tag}
                    </span>
                  )}

                  {/* Price badge — top-right */}
                  {item.price && (
                    <span
                      className="absolute top-3 right-3 rounded-lg px-3 py-1 text-sm font-extrabold shadow-md"
                      style={{
                        backgroundColor: 'rgba(220, 38, 38, 0.9)',
                        color: '#ffffff',
                      }}
                    >
                      ฿{item.price}
                    </span>
                  )}
                </div>

                {/* Card Content */}
                <div className="flex flex-1 flex-col p-5">
                  {/* Title */}
                  <h3
                    className="mb-2 text-base leading-tight font-bold"
                    style={{ color: 'var(--foreground, #1a1a2e)' }}
                  >
                    {item.title}
                  </h3>

                  {/* Description */}
                  {item.description && (
                    <p className="text-muted-foreground mb-4 line-clamp-2 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Configurable Button */}
                  {showButton && (
                    <div className="border-t border-gray-100 pt-4">
                      <a
                        href={btnLink!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:opacity-90"
                        style={{
                          ...getButtonStyle(btnStyle, btnColor),
                          textDecoration: 'none',
                        }}
                      >
                        <ButtonIcon icon={btnIcon} size={16} />
                        {btnLabel}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default WowtourVisaCard3
