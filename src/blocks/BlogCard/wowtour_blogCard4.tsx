'use client'

import React from 'react'
import { Post, Media as MediaType, Category } from '@/payload-types'
import { PublicContextProps } from '@/utilities/publicContextProps'
import { BlogCardBlockProps } from './Component'
import './wowtour_blogCard4.css'

interface WowtourBlogCard4Props extends BlogCardBlockProps {
  posts: Post[]
}

function formatThaiDate(dateString: string | null | undefined): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
}

function getImageUrl(media: MediaType | string | null | undefined): string {
  if (!media) return ''
  if (typeof media === 'string') return media
  return media.url || ''
}

const WowtourBlogCard4: React.FC<WowtourBlogCard4Props> = (props) => {
  const {
    sectionTitle = 'บทความท่องเที่ยว',
    sectionDescription,
    sectionIconImage,
    viewAllLink = '/blog',
    viewAllLabel = 'อ่านต่อ',
    posts = [],
    cardSettings,
  } = props

  // Decorative settings from CMS
  const decorativeSettings = (props as any).decorativeSettings || {}
  const decorativeImage = decorativeSettings.image as MediaType | string | null | undefined
  const decorativeImageUrl = getImageUrl(decorativeImage)
  const positionPreset = decorativeSettings.positionPreset || 'topRight'
  const decorativeWidth = decorativeSettings.width ?? 280
  const decorativeHeight = decorativeSettings.height ?? 280
  const decorativeOpacity = (decorativeSettings.opacity ?? 20) / 100

  // Calculate compass position styles
  const getCompassPositionStyle = (): React.CSSProperties => {
    switch (positionPreset) {
      case 'topLeft':
        return { top: '10px', left: '10px', bottom: 'auto', right: 'auto' }
      case 'topCenter':
        return {
          top: '10px',
          left: '50%',
          bottom: 'auto',
          right: 'auto',
          transform: 'translateX(-50%)',
        }
      case 'topRight':
        return { top: '10px', right: '-10px', bottom: 'auto', left: 'auto' }
      case 'centerLeft':
        return {
          top: '50%',
          left: '10px',
          bottom: 'auto',
          right: 'auto',
          transform: 'translateY(-50%)',
        }
      case 'center':
        return {
          top: '50%',
          left: '50%',
          bottom: 'auto',
          right: 'auto',
          transform: 'translate(-50%, -50%)',
        }
      case 'centerRight':
        return {
          top: '50%',
          right: '-20px',
          bottom: 'auto',
          left: 'auto',
          transform: 'translateY(-50%)',
        }
      case 'bottomLeft':
        return { bottom: '10px', left: '10px', top: 'auto', right: 'auto' }
      case 'bottomCenter':
        return {
          bottom: '10px',
          left: '50%',
          top: 'auto',
          right: 'auto',
          transform: 'translateX(-50%)',
        }
      case 'bottomRight':
        return { bottom: '10px', right: '-10px', top: 'auto', left: 'auto' }
      default:
        return { top: '10px', right: '-10px' }
    }
  }

  const compassStyle: React.CSSProperties = {
    ...getCompassPositionStyle(),
    width: `${decorativeWidth}px`,
    height: `${decorativeHeight}px`,
    opacity: decorativeOpacity,
  }

  const borderRadius = cardSettings?.borderRadius ?? 12
  if (!posts || posts.length === 0) return null

  const featuredPost = posts[0]
  const postDate = formatThaiDate(featuredPost.publishedAt)
  const postUrl = `/blog/${featuredPost.slug}`
  const excerpt = featuredPost.excerpt || ''

  const bgImageUrl = getImageUrl(featuredPost.coverImage as MediaType | string | null)
  const bgImageAlt =
    (typeof featuredPost.coverImage === 'object' && featuredPost.coverImage?.alt) ||
    featuredPost.title ||
    ''

  // Use decorative image first, fallback to sectionIconImage
  const sectionIconUrl =
    decorativeImageUrl || getImageUrl(sectionIconImage as MediaType | string | null | undefined)
  const categories = featuredPost.categories as Category[] | undefined

  return (
    <section
      className="blog-card4-section"
      style={
        {
          '--card-radius': `${borderRadius}px`,
        } as React.CSSProperties
      }
    >
      <div className="container">
        <div className="blog-card4-layout">
          {/* Left: Featured Image */}
          <div className="blog-card4-left">
            {bgImageUrl ? (
              <img
                src={bgImageUrl}
                alt={bgImageAlt}
                className="blog-card4-left__image"
                loading="lazy"
              />
            ) : (
              <div className="blog-card4-left__image blog-card4-left__image--placeholder" />
            )}
          </div>

          {/* Right: Section Title */}
          <div className="blog-card4-right">
            <div className="blog-card4-compass" aria-hidden="true" style={compassStyle}>
              {sectionIconUrl ? (
                <img src={sectionIconUrl} alt="" className="blog-card4-compass__img" />
              ) : (
                <svg viewBox="0 0 200 200" className="blog-card4-compass__svg">
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    opacity="0.3"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    opacity="0.2"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="50"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    opacity="0.15"
                  />
                  <line
                    x1="100"
                    y1="10"
                    x2="100"
                    y2="40"
                    stroke="currentColor"
                    strokeWidth="2"
                    opacity="0.3"
                  />
                  <line
                    x1="100"
                    y1="160"
                    x2="100"
                    y2="190"
                    stroke="currentColor"
                    strokeWidth="2"
                    opacity="0.3"
                  />
                  <line
                    x1="10"
                    y1="100"
                    x2="40"
                    y2="100"
                    stroke="currentColor"
                    strokeWidth="2"
                    opacity="0.3"
                  />
                  <line
                    x1="160"
                    y1="100"
                    x2="190"
                    y2="100"
                    stroke="currentColor"
                    strokeWidth="2"
                    opacity="0.3"
                  />
                  <polygon points="100,25 95,45 105,45" fill="currentColor" opacity="0.35" />
                  <circle cx="100" cy="100" r="5" fill="currentColor" opacity="0.3" />
                </svg>
              )}
            </div>

            <h2 className="blog-card4-right__title">{sectionTitle}</h2>
            {sectionDescription && <p className="blog-card4-right__desc">{sectionDescription}</p>}
          </div>

          {/* Card overlay — spans full width at bottom */}
          <div className="blog-card4-card">
            <h3 className="blog-card4-card__title">
              <a href={postUrl}>{featuredPost.title}</a>
            </h3>
            <span className="blog-card4-card__meta">
              {categories && categories.length > 0 && <>{categories[0]?.title} — </>}
              {postDate}
            </span>
            {excerpt && <p className="blog-card4-card__excerpt">{excerpt}</p>}
            <div className="blog-card4-card__actions">
              <a href={postUrl} className="blog-card4-card__btn">
                {viewAllLabel}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export { WowtourBlogCard4 }
