import React, { Fragment } from 'react'

import type { Props } from './types'

import { ImageMedia } from './ImageMedia'
import { VideoMedia } from './VideoMedia'

export const Media: React.FC<Props> = (props) => {
  const { className, htmlElement = 'div', resource } = props

  const isVideo = typeof resource === 'object' && resource?.mimeType?.includes('video')
  const Tag = (htmlElement as any) || Fragment

  // Check if this is an external URL (fake Media from API) — need full-size wrapper
  const isExternalMedia =
    typeof resource === 'object' &&
    resource?.url &&
    (resource.url.startsWith('http://') || resource.url.startsWith('https://'))

  return (
    <Tag
      {...(htmlElement !== null
        ? {
            className,
            ...(props.fill
              ? { style: { width: '100%', height: '100%', position: 'relative' as const } }
              : {}),
          }
        : {})}
    >
      {isVideo ? <VideoMedia {...props} /> : <ImageMedia {...props} />}
    </Tag>
  )
}
