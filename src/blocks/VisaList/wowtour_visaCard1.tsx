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

const WowtourVisaCard1: React.FC<
  WowtourVisaListBlockType & { publicContext: PublicContextProps }
> = ({ headingSettings, items, gridColumns = '4' }) => {
  const heading = headingSettings?.heading
  const description = headingSettings?.showDescription ? headingSettings?.description : null

  const gridColsClass =
    gridColumns === '2'
      ? 'md:grid-cols-2'
      : gridColumns === '3'
        ? 'md:grid-cols-2 lg:grid-cols-3'
        : 'md:grid-cols-2 lg:grid-cols-4'

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
                className="group block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ color: 'inherit' }}
              >
                {/* Cover Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={imageAlt || item.title || ''}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-4">
                  {/* Tag / Badge */}
                  {item.tag && (
                    <span
                      className="mb-2 inline-block rounded px-3 py-1 text-xs font-semibold"
                      style={{
                        backgroundColor: 'var(--primary, #2563eb)',
                        color: 'var(--primary-foreground, #ffffff)',
                      }}
                    >
                      {item.tag}
                    </span>
                  )}

                  {/* Title */}
                  <h3
                    className="mb-1 text-base leading-tight font-bold"
                    style={{ color: 'var(--foreground, #1a1a2e)' }}
                  >
                    {item.title}
                  </h3>

                  {/* Description */}
                  {item.description && (
                    <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">
                      {item.description}
                    </p>
                  )}

                  {/* Price Row */}
                  {item.price && (
                    <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
                      <span className="text-muted-foreground text-xs">VISA</span>
                      <span
                        className="text-lg font-bold"
                        style={{ color: 'var(--destructive, #dc2626)' }}
                      >
                        ฿{item.price}
                      </span>
                    </div>
                  )}

                  {/* Configurable Button */}
                  {showButton && (
                    <div className="mt-3 pt-2">
                      <a
                        href={btnLink!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:opacity-90"
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

export default WowtourVisaCard1
