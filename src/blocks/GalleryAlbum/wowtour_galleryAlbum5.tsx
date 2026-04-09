'use client'

import React from 'react'
import { Search } from 'lucide-react'

import { Media } from '@/components/Media'
import type { WowtourGalleryAlbumBlock, Media as MediaType, GalleryAlbum } from '@/payload-types'
import type { PublicContextProps } from '@/utilities/publicContextProps'
import Link from 'next/link'

import './wowtour_galleryAlbum5.css'

type WowtourGalleryAlbum5Props = WowtourGalleryAlbumBlock & {
  publicContext: PublicContextProps
}

/* ── Grid position helpers ── */
type GridPos = { gridColumn: string; gridRow: string }

/** Positions for a partial group of 1–8 items, offset by `r` rows */
const getPartialPositions = (count: number, r: number): GridPos[] => {
  switch (count) {
    case 1:
      return [{ gridColumn: '1 / 4', gridRow: `${1 + r}` }]
    case 2:
      return [
        { gridColumn: '1', gridRow: `${1 + r}` },
        { gridColumn: '2 / 4', gridRow: `${1 + r}` },
      ]
    case 3:
      return [
        { gridColumn: '1', gridRow: `${1 + r}` },
        { gridColumn: '2', gridRow: `${1 + r}` },
        { gridColumn: '3', gridRow: `${1 + r}` },
      ]
    case 4:
      return [
        { gridColumn: '1', gridRow: `${1 + r} / ${3 + r}` },
        { gridColumn: '2', gridRow: `${1 + r}` },
        { gridColumn: '3', gridRow: `${1 + r}` },
        { gridColumn: '2 / 4', gridRow: `${2 + r}` },
      ]
    case 5:
      return [
        { gridColumn: '1', gridRow: `${1 + r} / ${3 + r}` },
        { gridColumn: '2', gridRow: `${1 + r}` },
        { gridColumn: '3', gridRow: `${1 + r}` },
        { gridColumn: '2', gridRow: `${2 + r}` },
        { gridColumn: '3', gridRow: `${2 + r}` },
      ]
    case 6:
      return [
        { gridColumn: '1', gridRow: `${1 + r}` },
        { gridColumn: '2', gridRow: `${1 + r}` },
        { gridColumn: '3', gridRow: `${1 + r}` },
        { gridColumn: '1', gridRow: `${2 + r}` },
        { gridColumn: '2', gridRow: `${2 + r}` },
        { gridColumn: '3', gridRow: `${2 + r}` },
      ]
    case 7:
      return [
        { gridColumn: '1', gridRow: `${1 + r} / ${3 + r}` },
        { gridColumn: '2', gridRow: `${1 + r}` },
        { gridColumn: '3', gridRow: `${1 + r} / ${3 + r}` },
        { gridColumn: '2', gridRow: `${2 + r}` },
        { gridColumn: '1', gridRow: `${3 + r}` },
        { gridColumn: '2', gridRow: `${3 + r}` },
        { gridColumn: '3', gridRow: `${3 + r}` },
      ]
    case 8:
      return [
        { gridColumn: '1', gridRow: `${1 + r} / ${3 + r}` },
        { gridColumn: '2', gridRow: `${1 + r}` },
        { gridColumn: '3', gridRow: `${1 + r}` },
        { gridColumn: '2', gridRow: `${2 + r}` },
        { gridColumn: '3', gridRow: `${2 + r}` },
        { gridColumn: '1', gridRow: `${3 + r}` },
        { gridColumn: '2', gridRow: `${3 + r}` },
        { gridColumn: '3', gridRow: `${3 + r}` },
      ]
    default:
      return []
  }
}

/** Full 9-item mosaic pattern, offset by `r` rows */
const getFull9Positions = (r: number): GridPos[] => [
  { gridColumn: '1', gridRow: `${1 + r} / ${3 + r}` }, // tall
  { gridColumn: '2', gridRow: `${1 + r}` },
  { gridColumn: '3', gridRow: `${1 + r} / ${3 + r}` }, // tall
  { gridColumn: '2', gridRow: `${2 + r}` },
  { gridColumn: '1', gridRow: `${3 + r}` },
  { gridColumn: '2', gridRow: `${3 + r} / ${5 + r}` }, // tall
  { gridColumn: '3', gridRow: `${3 + r}` },
  { gridColumn: '1', gridRow: `${4 + r}` },
  { gridColumn: '3', gridRow: `${4 + r}` },
]

/** Build all item positions for any count */
const getAllPositions = (totalCount: number): GridPos[] => {
  const positions: GridPos[] = []
  const fullGroups = Math.floor(totalCount / 9)
  const remainder = totalCount % 9

  for (let g = 0; g < fullGroups; g++) {
    positions.push(...getFull9Positions(g * 4))
  }

  if (remainder > 0) {
    positions.push(...getPartialPositions(remainder, fullGroups * 4))
  }

  return positions
}

/** Calculate total grid rows */
const getTotalRows = (totalCount: number): number => {
  const fullGroups = Math.floor(totalCount / 9)
  const remainder = totalCount % 9
  let remainderRows = 0
  if (remainder >= 1 && remainder <= 3) remainderRows = 1
  else if (remainder >= 4 && remainder <= 6) remainderRows = 2
  else if (remainder >= 7) remainderRows = 3
  return fullGroups * 4 + remainderRows
}

export const WowtourGalleryAlbum5: React.FC<WowtourGalleryAlbum5Props> = ({
  headingSettings,
  albums,
  cardSettings,
  buttonSettings,
  ...rest
}) => {
  // Extract heading settings
  const heading = headingSettings?.heading ?? 'แกลลอรี่'
  const tagline = (headingSettings as any)?.tagline ?? 'The journey is the destination'

  // Extract button settings
  const showButton = buttonSettings?.showButton ?? true
  const buttonText = buttonSettings?.buttonText ?? 'ดูแกลลอรี่ทั้งหมด'
  const buttonLink = buttonSettings?.buttonLink ?? '/gallery'

  // Extract card settings
  const borderRadius = cardSettings?.borderRadius ?? 6

  // Resolve albums and filter out hidden ones
  const hiddenAlbumIdsRaw = (rest as any).hiddenAlbumIds
  const hiddenIds: string[] = (() => {
    if (!hiddenAlbumIdsRaw) return []
    if (typeof hiddenAlbumIdsRaw === 'string') {
      try {
        return JSON.parse(hiddenAlbumIdsRaw)
      } catch {
        return []
      }
    }
    if (Array.isArray(hiddenAlbumIdsRaw)) return hiddenAlbumIdsRaw
    return []
  })()
  const albumItems = ((albums as GalleryAlbum[] | undefined) ?? []).filter(
    (album) => !hiddenIds.includes(album.id),
  )

  if (!albumItems || albumItems.length === 0) return null

  // Format date in Thai
  const formatDateThai = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('th-TH-u-ca-gregory', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  // Calculate grid layout
  const positions = getAllPositions(albumItems.length)
  const totalRows = getTotalRows(albumItems.length)

  const renderAlbumCard = (album: GalleryAlbum, index: number) => {
    const coverImage = album.coverImage as MediaType
    const albumSlug = album.slug || ''
    const updatedDate = album.updatedAt ? formatDateThai(album.updatedAt) : ''
    const pos = positions[index]

    const itemStyle: React.CSSProperties = pos
      ? { gridColumn: pos.gridColumn, gridRow: pos.gridRow }
      : {}

    const cardContent = (
      <div className="gallery5__card" style={{ borderRadius: `${borderRadius}px` }}>
        <div className="gallery5__img-wrap">
          {coverImage && <Media resource={coverImage} fill imgClassName="gallery5__img" />}
          <div className="gallery5__overlay">
            <Search className="gallery5__overlay-icon" strokeWidth={2} />
            <span className="gallery5__overlay-title">{album.title}</span>
            {updatedDate && <span className="gallery5__overlay-date">{updatedDate}</span>}
          </div>
        </div>
      </div>
    )

    if (albumSlug) {
      return (
        <Link
          key={album.id || index}
          href={`/gallery/${albumSlug}`}
          className="gallery5__link"
          style={itemStyle}
        >
          {cardContent}
        </Link>
      )
    }

    return (
      <div key={album.id || index} style={itemStyle}>
        {cardContent}
      </div>
    )
  }

  const gridStyle: React.CSSProperties = {
    gridTemplateColumns:
      albumItems.length <= 2 ? `repeat(${albumItems.length}, 1fr)` : '1fr 1.2fr 1fr',
    gridTemplateRows: `repeat(${totalRows}, 250px)`,
  }

  return (
    <section className="gallery5">
      <div className="container">
        {/* Heading */}
        <div className="gallery5__heading-wrap">
          <div className="gallery5__heading-line">
            <h2>{heading}</h2>
          </div>
          {tagline && <p className="gallery5__tagline">{tagline}</p>}
        </div>

        {/* Mosaic Grid */}
        <div className="gallery5__grid" style={gridStyle}>
          {albumItems.map((album, i) => renderAlbumCard(album, i))}
        </div>

        {/* Button */}
        {showButton && (
          <div className="gallery5__btn-wrap">
            <Link href={buttonLink} className="gallery5__btn" prefetch={false}>
              {buttonText}
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

export default WowtourGalleryAlbum5
