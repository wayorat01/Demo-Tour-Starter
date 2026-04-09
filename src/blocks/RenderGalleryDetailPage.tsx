'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Media } from '@/components/Media'
import type { GalleryAlbum, Media as MediaType } from '@/payload-types'

type RenderGalleryDetailPageProps = {
  album: GalleryAlbum
}

export const RenderGalleryDetailPage: React.FC<RenderGalleryDetailPageProps> = ({ album }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const images = album.images ?? []

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => setLightboxOpen(false)

  const goToPrev = () => {
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }

  const goToNext = () => {
    setLightboxIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }

  return (
    <>
      {/* Hero Banner */}
      <div
        className="w-full"
        style={{
          background:
            'linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 70%, black) 100%)',
        }}
      >
        <div className="container py-8 md:py-12">
          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center gap-2 text-sm text-white/70">
            <Link href="/" className="flex items-center gap-1 transition-colors hover:text-white" prefetch={false}>
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              หน้าแรก
            </Link>
            <span>/</span>
            <Link href="/gallery" className="transition-colors hover:text-white" prefetch={false}>
              แกลลอรี่
            </Link>
            <span>/</span>
            <span className="max-w-[200px] truncate font-medium text-white md:max-w-[400px]">
              {album.title}
            </span>
          </nav>

          <h1 className="mb-2 flex items-center gap-3 text-3xl font-medium text-white md:text-4xl">
            {album.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-white/80">
            <span>{images.length} รูปภาพ</span>
            <span>•</span>
            <span>
              อัพเดทเมื่อ{' '}
              {album.updatedAt
                ? new Date(album.updatedAt).toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : ''}
            </span>
          </div>
        </div>
      </div>

      <section className="w-full py-8 md:py-12">
        <div className="container">
          {/* Image Grid */}
          <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
            {images.map((item, index) => {
              const img = item.image as MediaType
              return (
                <div
                  key={index}
                  className="group relative mb-4 cursor-pointer break-inside-avoid overflow-hidden rounded-lg"
                  onClick={() => openLightbox(index)}
                >
                  {img && (
                    <Media
                      resource={img}
                      imgClassName="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 rounded-lg bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
                  {item.caption && (
                    <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <p className="text-sm text-white">{item.caption}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {images.length === 0 && (
            <div className="text-muted-foreground py-12 text-center">
              ยังไม่มีรูปภาพในอัลบั้มนี้
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && images.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
            onClick={closeLightbox}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Counter */}
          <div className="absolute top-4 left-4 z-50 text-sm text-white/80">
            {lightboxIndex + 1} / {images.length}
          </div>

          {/* Previous */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 left-4 z-50 h-12 w-12 -translate-y-1/2 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation()
              goToPrev()
            }}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          {/* Image */}
          <div className="relative max-h-[85vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const currentImage = images[lightboxIndex]?.image as MediaType
              return currentImage ? (
                <Media
                  resource={currentImage}
                  imgClassName="max-w-full max-h-[85vh] object-contain"
                />
              ) : null
            })()}
            {images[lightboxIndex]?.caption && (
              <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <p className="text-center text-white">{images[lightboxIndex].caption}</p>
              </div>
            )}
          </div>

          {/* Next */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-4 z-50 h-12 w-12 -translate-y-1/2 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation()
              goToNext()
            }}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </div>
      )}
    </>
  )
}
