'use client'

import React from 'react'
import { Post, Media as MediaType, Category } from '@/payload-types'
import { PublicContextProps } from '@/utilities/publicContextProps'
import { BlogCardBlockProps } from './Component'

import './wowtour_blogCard5.css'

interface WowtourBlogCard5Props extends BlogCardBlockProps {
  posts: Post[]
}

/**
 * Format date to short Thai format (e.g. 8 ก.ย. 61)
 */
function formatThaiDateShort(dateString: string | null | undefined): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('th-TH', {
    year: '2-digit',
    month: 'short',
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

const WowtourBlogCard5: React.FC<WowtourBlogCard5Props> = (props) => {
  const {
    sectionTitle = 'บทความท่องเที่ยว',
    sectionDescription,
    sectionIconImage,
    viewAllLink = '/blog',
    viewAllLabel = 'ดูบทความทั้งหมด',
    posts = [],
    cardSettings,
    showExcerpt = false,
  } = props

  // Image border radius from CMS (default 0, max 100)
  const imageBorderRadius = cardSettings?.imageBorderRadius ?? 0

  // Resolve icon image URL
  const iconImageUrl = sectionIconImage
    ? typeof sectionIconImage === 'string'
      ? sectionIconImage
      : sectionIconImage?.url || ''
    : ''

  if (!posts || posts.length === 0) return null

  return (
    <section
      className="blog-card5-section"
      style={
        {
          '--image-radius': `${imageBorderRadius}px`,
        } as React.CSSProperties
      }
    >
      <div className="container">
        {/* Section Header */}
        <div className="blog-card5-header">
          <div className="blog-card5-header__left">
            <div className="blog-card5-header__title-row">
              {iconImageUrl && (
                <span className="blog-card5-header__icon">
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
              <h2 className="blog-card5-header__title">{sectionTitle}</h2>
            </div>
            {sectionDescription && <p className="blog-card5-header__desc">{sectionDescription}</p>}
          </div>
          <div className="blog-card5-header__right">
            <a href={viewAllLink} className="blog-card5-viewall">
              {viewAllLabel}
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="blog-card5-divider" />

        {/* Cards Grid */}
        <div className="blog-card5-grid">
          {posts.map((post) => (
            <BlogCard5Item key={post.id} post={post} showExcerpt={showExcerpt} />
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * Individual Blog Card — Horizontal: Image Left + Text Right
 */
const BlogCard5Item: React.FC<{ post: Post; showExcerpt?: boolean }> = ({ post, showExcerpt }) => {
  const coverUrl = getImageUrl(post.coverImage as MediaType | string | null)
  const coverAlt = (typeof post.coverImage === 'object' && post.coverImage?.alt) || post.title || ''
  const postDate = formatThaiDateShort(post.publishedAt)
  const postUrl = `/blog/${post.slug}`
  const excerpt = post.excerpt || ''

  return (
    <a href={postUrl} className="blog-card5-item">
      {/* Image */}
      <div className="blog-card5-item__image-wrap">
        {coverUrl ? (
          <img src={coverUrl} alt={coverAlt} className="blog-card5-item__image" loading="lazy" />
        ) : (
          <div className="blog-card5-item__image blog-card5-item__image--placeholder" />
        )}
      </div>

      {/* Text */}
      <div className="blog-card5-item__body">
        <h3 className="blog-card5-item__title">{post.title}</h3>
        {postDate && <span className="blog-card5-item__date">{postDate}</span>}
        {showExcerpt && excerpt && <p className="blog-card5-item__excerpt">{excerpt}</p>}
      </div>
    </a>
  )
}

export { WowtourBlogCard5 }
