'use client'

import React from 'react'
import { Post, Media as MediaType, Category } from '@/payload-types'
import { PublicContextProps } from '@/utilities/publicContextProps'
import { BlogCardBlockProps } from './Component'
import './wowtour_blogCard3.css'

interface BannerItem {
  bannerImage?: MediaType | string | null
  bannerTitle?: string | null
  bannerDescription?: string | null
  bannerLink?: string | null
}

interface WowtourBlogCard3Props extends BlogCardBlockProps {
  posts: Post[]
  banners?: BannerItem[]
}

/**
 * Format date to Thai format
 */
function formatThaiDate(dateString: string | null | undefined): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
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

const WowtourBlogCard3: React.FC<WowtourBlogCard3Props> = (props) => {
  const {
    sectionTitle = 'บทความให้ความรู้',
    sectionDescription,
    sectionIconImage,
    viewAllLink = '/blog',
    viewAllLabel = 'ดูบทความทั้งหมด',
    posts = [],
    banners = [],
    cardSettings,
  } = props

  const borderRadius = cardSettings?.borderRadius ?? 12

  // Resolve icon image URL
  const iconImageUrl = sectionIconImage
    ? typeof sectionIconImage === 'string'
      ? sectionIconImage
      : sectionIconImage?.url || ''
    : ''

  if (!posts || posts.length === 0) return null

  // Show only first 4 posts for the grid
  const displayPosts = posts.slice(0, 4)
  const displayBanners = banners?.slice(0, 2) || []

  return (
    <section
      className="blog-card3-section"
      style={{ '--card-radius': `${borderRadius}px` } as React.CSSProperties}
    >
      <div className="container">
        <div className="blog-card3-layout">
          {/* === Left Column: Header + Cards === */}
          <div className="blog-card3-left">
            {/* Section Header */}
            <div className="blog-card3-header">
              <div className="blog-card3-header__left">
                <div className="blog-card3-header__title-row">
                  {iconImageUrl && (
                    <span className="blog-card3-header__icon">
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
                  <h2 className="blog-card3-header__title">{sectionTitle}</h2>
                </div>
                {sectionDescription && (
                  <p className="blog-card3-header__desc">{sectionDescription}</p>
                )}
              </div>
              <div className="blog-card3-header__right">
                <a href={viewAllLink} className="blog-card3-viewall">
                  {viewAllLabel}
                </a>
              </div>
            </div>

            {/* Blog Cards 2x2 Grid */}
            <div className="blog-card3-cards">
              {displayPosts.map((post) => (
                <BlogCard3Item key={post.id} post={post} />
              ))}
            </div>
          </div>

          {/* === Right Column: Banners === */}
          {displayBanners.length > 0 && (
            <div className="blog-card3-banners">
              {displayBanners.map((banner, index) => {
                const bannerUrl = getImageUrl(banner.bannerImage)
                const bannerAlt =
                  (typeof banner.bannerImage === 'object' && banner.bannerImage?.alt) ||
                  `Banner ${index + 1}`
                if (!bannerUrl) return null
                const inner = (
                  <div className="blog-card3-banner">
                    <img
                      src={bannerUrl}
                      alt={bannerAlt}
                      className="blog-card3-banner__image"
                      loading="lazy"
                    />
                    {(banner.bannerTitle || banner.bannerDescription) && (
                      <div className="blog-card3-banner__overlay">
                        {banner.bannerTitle && (
                          <h3 className="blog-card3-banner__title">{banner.bannerTitle}</h3>
                        )}
                        {banner.bannerDescription && (
                          <p className="blog-card3-banner__desc">{banner.bannerDescription}</p>
                        )}
                      </div>
                    )}
                  </div>
                )
                return banner.bannerLink ? (
                  <a
                    key={index}
                    href={banner.bannerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="blog-card3-banner-link"
                  >
                    {inner}
                  </a>
                ) : (
                  <div key={index}>{inner}</div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/**
 * Individual Blog Card — Horizontal Thumbnail + Text Style
 */
const BlogCard3Item: React.FC<{ post: Post }> = ({ post }) => {
  const coverUrl = getImageUrl(post.coverImage as MediaType | string | null)
  const coverAlt = (typeof post.coverImage === 'object' && post.coverImage?.alt) || post.title || ''
  const postDate = formatThaiDate(post.publishedAt)
  const postUrl = `/blog/${post.slug}`

  return (
    <a href={postUrl} className="blog-card3-item">
      {/* Thumbnail */}
      <div className="blog-card3-item__thumb">
        {coverUrl ? (
          <img src={coverUrl} alt={coverAlt} className="blog-card3-item__image" loading="lazy" />
        ) : (
          <div className="blog-card3-item__image blog-card3-item__image--placeholder" />
        )}
      </div>

      {/* Text Content */}
      <div className="blog-card3-item__content">
        <h3 className="blog-card3-item__title">{post.title}</h3>
        {postDate && <span className="blog-card3-item__date">{postDate}</span>}
      </div>
    </a>
  )
}

export { WowtourBlogCard3 }
