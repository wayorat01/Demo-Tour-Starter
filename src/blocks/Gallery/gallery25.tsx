/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

import { GalleryBlock, Media as MediaType } from '@/payload-types'
import { Media } from '@/components/Media'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface GalleryColumnProps {
  images: GalleryBlock['elements']
  initialY: number
  onImageClick: (index: number) => void
  startIndex: number
}

const splitIntoFourSubArrays = (arr: GalleryBlock['elements']): GalleryBlock['elements'][] => {
  if (!Array.isArray(arr)) return []

  const result: GalleryBlock['elements'][] = [[], [], [], []]
  const baseSize = Math.floor(arr.length / 4)
  const extraItems = arr.length % 4

  let index = 0

  for (let i = 0; i < 4; i++) {
    const subArraySize = baseSize + (i < extraItems ? 1 : 0)
    result[i] = arr.slice(index, index + subArraySize)
    index += subArraySize
  }

  return result
}

// Calculate start indices for each column
const getColumnStartIndices = (columns: GalleryBlock['elements'][]): number[] => {
  const indices: number[] = [0]
  for (let i = 0; i < columns.length - 1; i++) {
    indices.push(indices[i] + (columns[i]?.length || 0))
  }
  return indices
}

function GalleryColumn({ images, initialY, onImageClick, startIndex }: GalleryColumnProps) {
  if (!images) return null
  return (
    <div className="grid gap-4">
      {images.map((image, index: number) => (
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9,
            y: initialY,
          }}
          whileInView={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            delay: index * 0.1,
          }}
          key={index}
          className="bg-muted group w-full cursor-pointer overflow-hidden rounded-2xl"
          style={{ height: image.imageHeight as string }}
          onClick={() => onImageClick(startIndex + index)}
        >
          <Media
            resource={image.image}
            fill
            imgClassName={`h-full w-full rounded-2xl object-cover !static group-hover:scale-105 transition-transform duration-300`}
            htmlElement={null}
          />
        </motion.div>
      ))}
    </div>
  )
}

const Gallery25: React.FC<GalleryBlock> = ({ elements }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!elements) return null

  const columns = splitIntoFourSubArrays(elements)
  const columnStartIndices = getColumnStartIndices(columns)

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
    currentImage?.image && typeof currentImage.image === 'object'
      ? (currentImage.image as MediaType).alt || `Image ${currentIndex + 1} of ${elements.length}`
      : `Image ${currentIndex + 1} of ${elements.length}`

  return (
    <>
      <section className="py-32">
        <div className="relative container">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <GalleryColumn
              images={columns[0]}
              initialY={50}
              onImageClick={handleImageClick}
              startIndex={columnStartIndices[0]}
            />
            <GalleryColumn
              images={columns[1]}
              initialY={-50}
              onImageClick={handleImageClick}
              startIndex={columnStartIndices[1]}
            />
            <GalleryColumn
              images={columns[2]}
              initialY={50}
              onImageClick={handleImageClick}
              startIndex={columnStartIndices[2]}
            />
            <GalleryColumn
              images={columns[3]}
              initialY={-50}
              onImageClick={handleImageClick}
              startIndex={columnStartIndices[3]}
            />
          </div>
        </div>
      </section>

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          className="h-full max-h-[95vh] w-full max-w-[95vw] border-none bg-black/95 p-0"
          onKeyDown={handleKeyDown}
        >
          <span className="sr-only">
            <DialogTitle>{imageTitle}</DialogTitle>
          </span>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 rounded-full text-white hover:bg-white/20"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Image Counter */}
          <div className="absolute top-4 left-4 z-50 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
            {currentIndex + 1} / {elements.length}
          </div>

          {/* Navigation Buttons */}
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

          {/* Image Caption */}
          {currentImage?.image &&
            typeof currentImage.image === 'object' &&
            (currentImage.image as MediaType).alt && (
              <div className="absolute bottom-4 left-1/2 z-50 max-w-[80%] -translate-x-1/2 rounded-lg bg-black/50 px-4 py-2 text-center text-white">
                {(currentImage.image as MediaType).alt}
              </div>
            )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export { Gallery25 }
