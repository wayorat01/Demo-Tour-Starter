'use client'

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Media as MediaType } from '@/payload-types'
import { Media } from '@/components/Media'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import './wowtour_promotionCard1.css'

interface PromotionElement {
  image: MediaType | string
  title?: string | null
  imageHeight?: string
}

interface WowtourPromotionCard1Props {
  headingSettings?: {
    heading?: string | null
    showDescription?: boolean
    description?: string | null
  }
  elements?: PromotionElement[]
}

export const WowtourPromotionCard1: React.FC<WowtourPromotionCard1Props> = ({
  headingSettings,
  elements,
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!elements || elements.length === 0) return null

  const heading = headingSettings?.heading
  const showDescription = headingSettings?.showDescription ?? false
  const description = headingSettings?.description

  const handleImageClick = (index: number) => {
    setCurrentIndex(index)
    setLightboxOpen(true)
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? elements.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === elements.length - 1 ? 0 : prev + 1))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious()
    if (e.key === 'ArrowRight') handleNext()
    if (e.key === 'Escape') setLightboxOpen(false)
  }

  const currentImage = elements[currentIndex]
  const imageTitle =
    currentImage?.title ||
    (currentImage?.image && typeof currentImage.image === 'object'
      ? (currentImage.image as MediaType).alt
      : null) ||
    `รูปที่ ${currentIndex + 1} จาก ${elements.length}`

  return (
    <>
      <section className="promo-card1-section">
        <div className="container">
          {/* Heading */}
          {(heading || (showDescription && description)) && (
            <div className="promo-card1-header">
              {heading && <h2 className="promo-card1-header__title">{heading}</h2>}
              {showDescription && description && (
                <p className="promo-card1-header__desc">{description}</p>
              )}
            </div>
          )}

          {/* Grid */}
          <div className="promo-card1-grid">
            {elements.map((item, index) => (
              <motion.div
                key={index}
                className="promo-card1-item"
                style={{ '--card-height': item.imageHeight || '18rem' } as React.CSSProperties}
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                onClick={() => handleImageClick(index)}
              >
                <Media
                  resource={item.image}
                  fill
                  imgClassName="promo-card1-item__image"
                  htmlElement={null}
                />
                {/* Hover overlay */}
                <div className="promo-card1-item__overlay">
                  <svg
                    className="promo-card1-item__icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                    <path d="M11 8v6M8 11h6" />
                  </svg>
                </div>
                {/* Title overlay */}
                {item.title && (
                  <div className="promo-card1-item__title-bar">
                    <span>{item.title}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          className="h-full max-h-[95vh] w-full max-w-[95vw] border-none bg-black/95 p-0"
          onKeyDown={handleKeyDown}
        >
          <span className="sr-only">
            <DialogTitle>{imageTitle}</DialogTitle>
          </span>

          {/* Close */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 rounded-full text-white hover:bg-white/20"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Counter */}
          <div className="absolute top-4 left-4 z-50 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
            {currentIndex + 1} / {elements.length}
          </div>

          {/* Navigation */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 left-4 z-50 h-12 w-12 -translate-y-1/2 rounded-full text-white hover:bg-white/20"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-4 z-50 h-12 w-12 -translate-y-1/2 rounded-full text-white hover:bg-white/20"
            onClick={handleNext}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>

          {/* Main Image */}
          <div className="flex h-full w-full items-center justify-center p-8">
            {currentImage && (
              <motion.div
                key={currentIndex}
                className="relative max-h-full max-w-full"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <Media
                  resource={currentImage.image}
                  imgClassName="max-w-full max-h-[85vh] object-contain rounded-lg"
                  htmlElement={null}
                />
              </motion.div>
            )}
          </div>

          {/* Caption */}
          {imageTitle && (
            <div className="absolute bottom-4 left-1/2 z-50 max-w-[80%] -translate-x-1/2 rounded-lg bg-black/50 px-4 py-2 text-center text-white">
              {imageTitle}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
