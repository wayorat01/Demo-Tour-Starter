import * as React from 'react'
import GalleryAlbumSelectorClient from './index.client'
import { UIFieldServerProps } from 'payload'

type GalleryAlbumSelectorProps = UIFieldServerProps

const GalleryAlbumSelector: React.FC<GalleryAlbumSelectorProps> = ({ path }) => {
  return <GalleryAlbumSelectorClient path={path} />
}

export default GalleryAlbumSelector
