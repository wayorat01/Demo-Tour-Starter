'use client'

import type { StaticImageData } from 'next/image'

import { cn } from 'src/utilities/cn'
import NextImage from 'next/image'
import React from 'react'

import type { Props as MediaProps } from '../types'

import cssVariables from '@/cssVariables'
import { serverUrl as NEXT_PUBLIC_SERVER_URL } from '@/config/server'

const { breakpoints } = cssVariables

export const ImageMedia: React.FC<MediaProps> = (props) => {
  const {
    alt: altFromProps,
    fill,
    imgClassName,
    loading,
    onClick,
    onLoad: onLoadFromProps,
    priority,
    quality: qualityFromProps,
    resource,
    size: sizeFromProps,
    src: srcFromProps,
  } = props

  const [isLoading, setIsLoading] = React.useState(true)

  let width: number | undefined
  let height: number | undefined
  let alt = altFromProps
  let src: StaticImageData | string | null = srcFromProps || null

  if (!src && resource && typeof resource === 'object') {
    const {
      alt: altFromResource,
      filename: fullFilename,
      height: fullHeight,
      url,
      width: fullWidth,
    } = resource

    width = fullWidth!
    height = fullHeight!
    alt = altFromResource

    /**
     * Support both absolute and relative media URLs. When using the storage adapter with "disablePayloadAccessControl" you
     * get absolute URLs. Otherwise, we get a relative URL that needs to be prefixed to work with next/image
     */
    if (url && url.startsWith('/')) {
      src = `${NEXT_PUBLIC_SERVER_URL}${url}`
    } else {
      src = url || null
    }
  }

  // Check if the file is an SVG — use native <img> since Next.js Image
  // doesn't handle SVGs well (no width/height metadata, optimization issues)
  const isSvg =
    (typeof resource === 'object' && resource?.mimeType === 'image/svg+xml') ||
    (typeof src === 'string' && (src.endsWith('.svg') || src.includes('image/svg+xml')))

  if (isSvg && src) {
    return (
      <img
        src={typeof src === 'string' ? src : (src as StaticImageData).src}
        alt={alt || ''}
        className={cn(imgClassName)}
        onClick={onClick}
        onLoad={() => {
          setIsLoading(false)
          if (typeof onLoadFromProps === 'function') {
            onLoadFromProps()
          }
        }}
        loading={priority ? 'eager' : 'lazy'}
        style={{
          ...(fill
            ? {
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                position: 'absolute' as const,
                inset: 0,
              }
            : { maxWidth: '100%', height: 'auto' }),
          display: 'block',
        }}
      />
    )
  }

  // Only fallback to native <img> for external URLs if explicit sizing (width/height) 
  // or fill mode is missing. Next.js Image requires one or the other.
  const isExternalUrl =
    typeof src === 'string' && (src.startsWith('http://') || src.startsWith('https://'))

  const missingSizingForNextImage = !fill && (!width || !height)

  if (isExternalUrl && missingSizingForNextImage) {
    return (
      <img
        src={src as string}
        alt={alt || ''}
        className={cn(imgClassName)}
        onClick={onClick}
        onLoad={() => {
          setIsLoading(false)
          if (typeof onLoadFromProps === 'function') {
            onLoadFromProps()
          }
        }}
        loading={priority ? 'eager' : 'lazy'}
        style={{
          // Only apply width/height: 100% when imgClassName doesn't contain explicit sizing
          // This ensures gallery/content images fill their containers while logos stay auto-sized
          ...(imgClassName && /\b(h-|w-|size-)/.test(imgClassName)
            ? {}
            : { width: '100%', height: '100%' }),
          // Always default to object-fit: cover for fill-type images
          // imgClassName can override via CSS specificity if needed
          objectFit: imgClassName && /object-contain/.test(imgClassName) ? 'contain' : 'cover',
          display: 'block',
        }}
      />
    )
  }

  // NOTE: this is used by the browser to determine which image to download at different screen sizes
  const sizes = sizeFromProps
    ? sizeFromProps
    : Object.entries(breakpoints)
        .map(([, value]) => `(max-width: ${value}px) ${value}px`)
        .join(', ')

  return (
    <>
      {src && (
        <NextImage
          alt={alt || ''}
          className={cn(imgClassName)}
          fill={fill}
          height={!fill ? height : undefined}
          onClick={onClick}
          onLoad={() => {
            setIsLoading(false)
            if (typeof onLoadFromProps === 'function') {
              onLoadFromProps()
            }
          }}
          loading={loading}
          priority={priority}
          quality={qualityFromProps ?? 75}
          sizes={sizes}
          src={src}
          width={!fill ? width : undefined}
        />
      )}
    </>
  )
}
