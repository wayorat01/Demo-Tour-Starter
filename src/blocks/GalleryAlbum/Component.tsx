import React from 'react'
import type { WowtourGalleryAlbumBlock as WowtourGalleryAlbumBlockType } from '@/payload-types'
import type { PublicContextProps } from '@/utilities/publicContextProps'
import { WowtourGalleryAlbum1 } from './wowtour_galleryAlbum1'
import { WowtourGalleryAlbum2 } from './wowtour_galleryAlbum2'
import { WowtourGalleryAlbum3 } from './wowtour_galleryAlbum3'
import { WowtourGalleryAlbum4 } from './wowtour_galleryAlbum4'
import { WowtourGalleryAlbum5 } from './wowtour_galleryAlbum5'

type WowtourGalleryAlbumBlockProps = WowtourGalleryAlbumBlockType & {
  publicContext: PublicContextProps
}

const blockComponents: Record<string, React.FC<WowtourGalleryAlbumBlockProps>> = {
  WOWTOUR_GALLERY_ALBUM_1: WowtourGalleryAlbum1,
  WOWTOUR_GALLERY_ALBUM_2: WowtourGalleryAlbum2,
  WOWTOUR_GALLERY_ALBUM_3: WowtourGalleryAlbum3,
  WOWTOUR_GALLERY_ALBUM_4: WowtourGalleryAlbum4,
  WOWTOUR_GALLERY_ALBUM_5: WowtourGalleryAlbum5,
}

export const WowtourGalleryAlbumBlock: React.FC<WowtourGalleryAlbumBlockProps> = (props) => {
  const { designVersion } = props

  if (!designVersion || !(designVersion in blockComponents)) {
    return null
  }

  const Component = blockComponents[designVersion]
  return Component ? <Component {...props} /> : null
}
