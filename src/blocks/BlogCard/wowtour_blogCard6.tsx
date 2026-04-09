'use client'

import React, { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { Post, Media as MediaType, Category } from '@/payload-types'
import { PublicContextProps } from '@/utilities/publicContextProps'
import { BlogCardBlockProps } from './Component'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import './wowtour_blogCard6.css'

interface WowtourBlogCard6Props extends BlogCardBlockProps {
  posts: Post[]
}

/**
 * Format date to Thai format
 */
function formatThaiDate(dateString: string | null | undefined): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Get image URL from media
 */
function getImageUrl(media: MediaType | string | null | undefined): string {
  if (!media) return ''
  if (typeof media === 'string') return media
  return media.url || ''
}

const WowtourBlogCard6: React.FC<WowtourBlogCard6Props> = (props) => {
  const {
    sectionTitle = 'บทความท่องเที่ยว',
    sectionDescription,
    sectionIconImage,
    viewAllLink = '/blog',
    viewAllLabel = 'ดูบทความทั้งหมด',
    posts = [],
    cardSettings,
    showExcerpt = true,
  } = props

  // Image border radius from CMS
  const imageBorderRadius = cardSettings?.imageBorderRadius ?? 0

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    loop: true,
    slidesToScroll: 1,
  })

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    setScrollSnaps(emblaApi.scrollSnapList())
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', () => {
      setScrollSnaps(emblaApi.scrollSnapList())
      onSelect()
    })
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi])
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  if (!posts || posts.length === 0) return null

  return (
    <section
      className="blog-card6-section"
      style={
        {
          '--image-radius': `${imageBorderRadius}px`,
        } as React.CSSProperties
      }
    >
      <div className="container">
        {/* Section Header — Centered */}
        <div className="blog-card6-header">
          <h2 className="blog-card6-header__title">{sectionTitle}</h2>
          {sectionDescription && <p className="blog-card6-header__tagline">{sectionDescription}</p>}
        </div>

        {/* Slider Wrapper */}
        <div className="blog-card6-slider-wrap">
          {/* Prev Arrow */}
          <button
            className="blog-card6-arrow blog-card6-arrow--prev"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            aria-label="Previous"
          >
            <ChevronLeft />
          </button>

          {/* Slider */}
          <div className="blog-card6-slider" ref={emblaRef}>
            <div className="blog-card6-slider__container">
              {posts.map((post) => (
                <div className="blog-card6-slider__slide" key={post.id}>
                  <BlogCard6Slide post={post} showExcerpt={showExcerpt} />
                </div>
              ))}
            </div>
          </div>

          {/* Next Arrow */}
          <button
            className="blog-card6-arrow blog-card6-arrow--next"
            onClick={scrollNext}
            disabled={!canScrollNext}
            aria-label="Next"
          >
            <ChevronRight />
          </button>
        </div>

        {/* Dot Indicators */}
        {scrollSnaps.length > 1 && (
          <div className="blog-card6-dots">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                className={`blog-card6-dots__dot ${index === selectedIndex ? 'blog-card6-dots__dot--active' : ''}`}
                onClick={() => scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/**
 * Individual Slide — Full-width hero image with text overlay
 */
const BlogCard6Slide: React.FC<{ post: Post; showExcerpt?: boolean }> = ({ post, showExcerpt }) => {
  const coverUrl = getImageUrl(post.coverImage as MediaType | string | null)
  const coverAlt = (typeof post.coverImage === 'object' && post.coverImage?.alt) || post.title || ''
  const postDate = formatThaiDate(post.publishedAt)
  const postUrl = `/blog/${post.slug}`
  const excerpt = post.excerpt || ''

  return (
    <a href={postUrl} className="blog-card6-card">
      {/* Hero Image */}
      <div className="blog-card6-card__image-wrap">
        {coverUrl ? (
          <img src={coverUrl} alt={coverAlt} className="blog-card6-card__image" loading="lazy" />
        ) : (
          <div className="blog-card6-card__image blog-card6-card__image--placeholder" />
        )}
      </div>

      {/* Text Overlay Card */}
      <div className="blog-card6-card__overlay">
        <h3 className="blog-card6-card__title">{post.title}</h3>
        {postDate && <span className="blog-card6-card__date">{postDate}</span>}
        {showExcerpt && excerpt && <p className="blog-card6-card__excerpt">{excerpt}</p>}
        <span className="blog-card6-card__readmore">อ่านต่อ &gt;&gt;</span>
      </div>
    </a>
  )
}

export { WowtourBlogCard6 }
