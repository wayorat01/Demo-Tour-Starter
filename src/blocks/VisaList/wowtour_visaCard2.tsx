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

const WowtourVisaCard2: React.FC<
  WowtourVisaListBlockType & { publicContext: PublicContextProps }
> = ({ headingSettings, items, gridColumns = '4' }) => {
  const heading = headingSettings?.heading
  const description = headingSettings?.showDescription ? headingSettings?.description : null

  const gridColsClass =
    gridColumns === '2'
      ? 'md:grid-cols-1 lg:grid-cols-2'
      : gridColumns === '3'
        ? 'md:grid-cols-1 lg:grid-cols-3'
        : 'md:grid-cols-2 lg:grid-cols-2'

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {/* Heading */}
        {heading && (
          <div className="mb-10">
            <div className="flex items-center gap-3">
              <div
                className="h-8 w-1 rounded-full"
                style={{
                  background:
                    'linear-gradient(to bottom, var(--primary, #2563eb), var(--primary, #2563eb)88)',
                }}
              />
              <h2
                className="text-2xl font-bold md:text-3xl"
                style={{ color: 'var(--foreground, #1a1a2e)' }}
              >
                {heading}
              </h2>
            </div>
            {description && <p className="text-muted-foreground mt-2 ml-4 pl-1">{description}</p>}
          </div>
        )}

        {/* Visa Cards Grid — Horizontal Layout */}
        <div className={`grid grid-cols-1 gap-5 ${gridColsClass}`}>
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
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:flex-row"
                style={{ color: 'inherit', minHeight: '180px' }}
              >
                {/* Left — Image */}
                <div className="relative w-full shrink-0 overflow-hidden sm:w-48 md:w-56">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={imageAlt || item.title || ''}
                      className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-110 sm:h-full"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 sm:h-full">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}

                  {/* Gradient overlay on image */}
                  <div
                    className="pointer-events-none absolute inset-0 hidden sm:block"
                    style={{
                      background:
                        'linear-gradient(to right, transparent 60%, rgba(255,255,255,0.5) 100%)',
                    }}
                  />

                  {/* Tag badge on image */}
                  {item.tag && (
                    <span
                      className="absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-bold shadow-md backdrop-blur-sm"
                      style={{
                        backgroundColor: 'rgba(37, 99, 235, 0.9)',
                        color: '#ffffff',
                      }}
                    >
                      {item.tag}
                    </span>
                  )}
                </div>

                {/* Right — Content */}
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    {/* Title */}
                    <h3
                      className="mb-2 text-lg leading-snug font-bold transition-colors duration-200 group-hover:text-blue-600"
                      style={{ color: 'var(--foreground, #1a1a2e)' }}
                    >
                      {item.title}
                    </h3>

                    {/* Description */}
                    {item.description && (
                      <p className="text-muted-foreground mb-3 line-clamp-2 text-sm leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Bottom: Price + Button */}
                  <div className="flex items-center justify-between gap-3">
                    {item.price ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-muted-foreground text-xs">เริ่มต้น</span>
                        <span
                          className="text-xl font-extrabold"
                          style={{ color: 'var(--destructive, #dc2626)' }}
                        >
                          ฿{item.price}
                        </span>
                      </div>
                    ) : (
                      <div />
                    )}

                    {/* Configurable Button */}
                    {showButton && (
                      <a
                        href={btnLink!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 hover:opacity-90"
                        style={{
                          ...getButtonStyle(btnStyle, btnColor),
                          textDecoration: 'none',
                        }}
                      >
                        <ButtonIcon icon={btnIcon} size={14} />
                        {btnLabel}
                      </a>
                    )}
                  </div>
                </div>

                {/* Accent bar — left edge */}
                <div
                  className="absolute top-0 bottom-0 left-0 hidden w-1 transition-all duration-300 group-hover:w-1.5 sm:block"
                  style={{
                    background: 'linear-gradient(to bottom, var(--primary, #2563eb), #7c3aed)',
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default WowtourVisaCard2
