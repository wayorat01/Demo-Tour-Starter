'use client'

import React, { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { Post, Media as MediaType, Category } from '@/payload-types'
import { PublicContextProps } from '@/utilities/publicContextProps'
import { BlogCardBlockProps } from './Component'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import './wowtour_blogCard2.css'

interface WowtourBlogCard2Props extends BlogCardBlockProps {
  posts: Post[]
}

/**
 * Format date to Thai format
 */
function formatThaiDate(dateString: string | null | undefined): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  return date.toLocaleDateString('th-TH', options)
}

/**
 * Get image URL from media
 */
function getImageUrl(media: MediaType | string | null | undefined): string {
  if (!media) return ''
  if (typeof media === 'string') return media
  return media.url || ''
}

/**
 * Get first category title
 */
function getFirstCategoryTitle(categories: Post['categories']): string {
  if (!categories || categories.length === 0) return ''
  const first = categories[0]
  if (typeof first === 'string') return ''
  return (first as Category).title || ''
}

const WowtourBlogCard2: React.FC<WowtourBlogCard2Props> = (props) => {
  const {
    sectionTitle = 'บทความแนะนำ',
    sectionDescription = 'บทความท่องเที่ยวและไลฟ์สไตล์ที่คัดสรรมาเพื่อคุณ',
    sectionIconImage,
    viewAllLink = '/blog',
    viewAllLabel = 'ดูบทความทั้งหมด',
    posts = [],
  } = props

  // Resolve icon image URL
  const iconImageUrl = sectionIconImage
    ? typeof sectionIconImage === 'string'
      ? sectionIconImage
      : sectionIconImage?.url || ''
    : ''

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
  })

  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
    setSelectedIndex(emblaApi.selectedScrollSnap())
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

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi])

  if (!posts || posts.length === 0) return null

  const showSlider = posts.length > 4

  return (
    <section className="blog-card2-section">
      <div className="container">
        {/* Section Header */}
        <div className="blog-card2-header">
          <div className="blog-card2-header__left">
            <div className="blog-card2-header__title-row">
              {iconImageUrl && (
                <span className="blog-card2-header__icon">
                  <img
                    src={iconImageUrl}
                    alt="section icon"
                    style={{
                      width: '1.2em',
                      height: '1.2em',
                      objectFit: 'contain',
                      verticalAlign: 'middle',
                    }}
                  />
                </span>
              )}
              <h2 className="blog-card2-header__title">{sectionTitle}</h2>
            </div>
            {sectionDescription && <p className="blog-card2-header__desc">{sectionDescription}</p>}
          </div>
          <div className="blog-card2-header__right">
            <a href={viewAllLink} className="blog-card2-viewall">
              {viewAllLabel}
            </a>
          </div>
        </div>

        {/* Cards */}
        {showSlider ? (
          <div className="blog-card2-carousel">
            {/* Prev Arrow — left side */}
            <button
              className="blog-card2-carousel__btn blog-card2-carousel__btn--prev"
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              aria-label="Previous"
            >
              <ChevronLeft />
            </button>

            <div className="blog-card2-carousel__viewport" ref={emblaRef}>
              <div className="blog-card2-carousel__container">
                {posts.map((post) => (
                  <div key={post.id} className="blog-card2-carousel__slide">
                    <BlogCard2 post={post} />
                  </div>
                ))}
              </div>
            </div>

            {/* Next Arrow — right side */}
            <button
              className="blog-card2-carousel__btn blog-card2-carousel__btn--next"
              onClick={scrollNext}
              disabled={!canScrollNext}
              aria-label="Next"
            >
              <ChevronRight />
            </button>

            {/* Dots */}
            {scrollSnaps.length > 1 && (
              <div className="blog-card2-carousel__dots">
                {scrollSnaps.map((_, index) => (
                  <button
                    key={index}
                    className={`blog-card2-carousel__dot${index === selectedIndex ? 'blog-card2-carousel__dot--active' : ''}`}
                    onClick={() => scrollTo(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="blog-card2-carousel__viewport">
            <div className="blog-card2-carousel__container">
              {posts.map((post) => (
                <div key={post.id} className="blog-card2-carousel__slide">
                  <BlogCard2 post={post} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

/**
 * Individual Blog Card — Full-Image Overlay Style
 */
const BlogCard2: React.FC<{ post: Post }> = ({ post }) => {
  const coverUrl = getImageUrl(post.coverImage as MediaType | string | null)
  const coverAlt = (typeof post.coverImage === 'object' && post.coverImage?.alt) || post.title || ''
  const postDate = formatThaiDate(post.publishedAt)
  const excerpt = post.excerpt || ''
  const postUrl = `/blog/${post.slug}`
  const categoryTitle = getFirstCategoryTitle(post.categories)

  return (
    <a href={postUrl} className="blog-card2__card">
      {/* Background Image */}
      {coverUrl ? (
        <img src={coverUrl} alt={coverAlt} className="blog-card2__image" loading="lazy" />
      ) : (
        <div className="blog-card2__image blog-card2__image--placeholder" />
      )}

      {/* Gradient Overlay */}
      <div className="blog-card2__overlay" />

      {/* Tag / Category — Top Right */}
      {categoryTitle && <span className="blog-card2__tag">{categoryTitle}</span>}

      {/* Content — Bottom */}
      <div className="blog-card2__content">
        <h3 className="blog-card2__title">{post.title}</h3>
        {postDate && <span className="blog-card2__date">{postDate}</span>}
        {excerpt && <p className="blog-card2__excerpt">{excerpt}</p>}
      </div>
    </a>
  )
}

export { WowtourBlogCard2 }
