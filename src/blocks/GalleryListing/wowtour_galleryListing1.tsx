'use client'

import React from 'react'
import { GalleryAlbum, Media as MediaType } from '@/payload-types'
import { Home, Search } from 'lucide-react'
import Link from 'next/link'
import { Media } from '@/components/Media'
import './wowtour_galleryListing1.css'

interface WowtourGalleryListing1Props {
  sectionTitle?: string
  sectionDescription?: string
  albums: GalleryAlbum[]
  totalDocs: number
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const WowtourGalleryListing1: React.FC<WowtourGalleryListing1Props> = ({
  sectionTitle = 'แกลลอรี่ภาพท่องเที่ยว',
  sectionDescription = 'รวมคอลเลคชั่นรูปภาพสถานที่ท่องเที่ยวจากทั่วทุกมุมโลก',
  albums,
}) => {
  return (
    <>
      {/* Albums Grid */}
      <section className="gallery-listing-content">
        <div className="container">
          {albums.length === 0 ? (
            <div className="gallery-listing-empty">
              <div className="gallery-listing-empty__icon">🖼️</div>
              <h2 className="gallery-listing-empty__title">ยังไม่มีแกลลอรี่</h2>
              <p className="gallery-listing-empty__desc">กรุณาเพิ่มแกลลอรี่ผ่าน Admin Panel</p>
            </div>
          ) : (
            <div className="gallery-listing-grid">
              {albums.map((album, index) => {
                const coverImage = album.coverImage as MediaType
                const updatedDate = album.updatedAt ? formatDate(album.updatedAt) : ''

                return (
                  <Link
                    key={index}
                    href={`/gallery/${album.slug}`}
                    className="gallery-listing-card"
                  >
                    <div className="gallery-listing-card__image-wrapper">
                      {coverImage && (
                        <Media
                          resource={coverImage}
                          fill
                          imgClassName="gallery-listing-card__image"
                        />
                      )}

                      {/* Normal state info */}
                      <div className="gallery-listing-card__info">
                        <p className="gallery-listing-card__title">{album.title}</p>
                        {updatedDate && <p className="gallery-listing-card__date">{updatedDate}</p>}
                      </div>

                      {/* Hover overlay */}
                      <div className="gallery-listing-card__hover">
                        <Search className="gallery-listing-card__hover-icon" strokeWidth={2} />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
