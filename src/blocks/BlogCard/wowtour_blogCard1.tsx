'use client'

import React, { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { Post, Media as MediaType } from '@/payload-types'
import { BlogCardBlockProps } from './Component'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import './wowtour_blogCard1.css'

interface WowtourBlogCard1Props extends BlogCardBlockProps {
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

const WowtourBlogCard1: React.FC<WowtourBlogCard1Props> = (props) => {
  const {
    sectionTitle = 'บทความแนะนำ',
    sectionDescription = 'บทความท่องเที่ยวและไลฟ์สไตล์ที่คัดสรรมาเพื่อคุณ',
    sectionIcon = '✈️',
    viewAllLink = '/blog',
    viewAllLabel = 'ดูบทความทั้งหมด',
    posts = [],
  } = props as any

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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Standard Embla carousel init pattern
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
    <section className="blog-card-section">
      <div className="container">
        {/* Section Header */}
        <div className="blog-card-header">
          <div className="blog-card-header__left">
            <div className="blog-card-header__title-row">
              {sectionIcon && <span className="blog-card-header__icon">{sectionIcon}</span>}
              <h2 className="blog-card-header__title">{sectionTitle}</h2>
            </div>
            {sectionDescription && <p className="blog-card-header__desc">{sectionDescription}</p>}
          </div>
          <div className="blog-card-header__right">
            <a href={viewAllLink} className="blog-card-viewall">
              {viewAllLabel}
            </a>
          </div>
        </div>

        {/* Cards */}
        {showSlider ? (
          <div className="blog-card-carousel">
            {/* Prev Arrow — left side */}
            <button
              className="blog-card-carousel__btn blog-card-carousel__btn--prev"
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              aria-label="Previous"
            >
              <ChevronLeft />
            </button>

            <div className="blog-card-carousel__viewport" ref={emblaRef}>
              <div className="blog-card-carousel__container">
                {posts.map((post) => (
                  <div key={post.id} className="blog-card-carousel__slide">
                    <BlogCard post={post} />
                  </div>
                ))}
              </div>
            </div>

            {/* Next Arrow — right side */}
            <button
              className="blog-card-carousel__btn blog-card-carousel__btn--next"
              onClick={scrollNext}
              disabled={!canScrollNext}
              aria-label="Next"
            >
              <ChevronRight />
            </button>

            {/* Dots */}
            {scrollSnaps.length > 1 && (
              <div className="blog-card-carousel__dots">
                {scrollSnaps.map((_, index) => (
                  <button
                    key={index}
                    className={`blog-card-carousel__dot${index === selectedIndex ? 'blog-card-carousel__dot--active' : ''}`}
                    onClick={() => scrollTo(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="blog-card-carousel__viewport">
            <div className="blog-card-carousel__container">
              {posts.map((post) => (
                <div key={post.id} className="blog-card-carousel__slide">
                  <BlogCard post={post} />
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
 * Individual Blog Card
 */
const BlogCard: React.FC<{ post: Post }> = ({ post }) => {
  const coverUrl = getImageUrl(post.coverImage as MediaType | string | null)
  const coverAlt = (typeof post.coverImage === 'object' && post.coverImage?.alt) || post.title || ''
  const postDate = formatThaiDate(post.publishedAt)
  const excerpt = (post as any).excerpt || ''
  const postUrl = `/blog/${post.slug}`

  return (
    <div className="blog-post-card">
      {/* Cover Image 4:3 */}
      <div className="blog-post-card__image-wrapper">
        {coverUrl ? (
          <img src={coverUrl} alt={coverAlt} className="blog-post-card__image" loading="lazy" />
        ) : (
          <div className="blog-post-card__image" style={{ background: 'var(--muted)' }} />
        )}
      </div>

      {/* Content */}
      <div className="blog-post-card__content">
        {postDate && <span className="blog-post-card__date">{postDate}</span>}
        <h3 className="blog-post-card__title">{post.title}</h3>
        {excerpt && <p className="blog-post-card__excerpt">{excerpt}</p>}
        <a
          href={postUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="blog-post-card__readmore"
        >
          อ่านต่อ
          <ArrowRight />
        </a>
      </div>
    </div>
  )
}

export { WowtourBlogCard1 }
