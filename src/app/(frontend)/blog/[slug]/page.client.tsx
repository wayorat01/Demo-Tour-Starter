'use client'

import React from 'react'
import { Post, Media as MediaType, Tag } from '@/payload-types'
import { Home, ArrowRight, Clock } from 'lucide-react'
import Link from 'next/link'
import { BlogShareBar } from './BlogShareBar'
import '@/blocks/BlogListing/wowtour_blogListing1.css'

interface BlogDetailClientProps {
  post: Post
  relatedPosts: Post[]
  contentElement?: React.ReactNode
  showTags?: boolean
}

function formatThaiDate(dateString: string | null | undefined): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getImageUrl(media: MediaType | string | null | undefined): string {
  if (!media) return ''
  if (typeof media === 'string') return media
  return media.url || ''
}

export const BlogDetailClient: React.FC<BlogDetailClientProps> = ({
  post,
  relatedPosts,
  contentElement,
  showTags = true,
}) => {
  const coverUrl = getImageUrl(post.coverImage as MediaType | string | null)
  const coverAlt = (typeof post.coverImage === 'object' && post.coverImage?.alt) || post.title || ''
  const postDate = formatThaiDate(post.publishedAt)
  const excerpt = (post as any).excerpt || ''
  const tags = ((post as any).tags || [])
    .map((t: any) => (typeof t === 'object' ? t : null))
    .filter(Boolean) as Tag[]
  const postUrl = `/blog/${post.slug}`

  // Extract plain text from rich text content for display
  // We'll render a simplified version since we don't have RichText in the client
  const contentText = typeof post.content === 'string' ? post.content : ''

  return (
    <>
      <BlogShareBar title={post.title} url={postUrl} />

      {/* Hero Cover */}
      <section className="blog-detail-hero">
        {coverUrl ? (
          <img src={coverUrl} alt={coverAlt} className="blog-detail-hero__image" />
        ) : (
          <div className="blog-detail-hero__image blog-detail-hero__image--placeholder" />
        )}
        <div className="blog-detail-hero__overlay">
          <div className="container">
            <nav className="blog-detail-breadcrumb">
              <Link href="/" className="blog-detail-breadcrumb__link">
                <Home size={14} />
                <span className="blog-detail-breadcrumb__home-text">หน้าแรก</span>
              </Link>
              <span className="blog-detail-breadcrumb__sep">›</span>
              <Link href="/blog" className="blog-detail-breadcrumb__link">
                บทความ
              </Link>
              <span className="blog-detail-breadcrumb__sep">›</span>
              <span className="blog-detail-breadcrumb__current">{post.title}</span>
            </nav>
            <h1 className="blog-detail-hero__title text-3xl font-medium md:text-4xl">
              {post.title}
            </h1>
            <div className="blog-detail-hero__meta">
              {postDate && <span>{postDate}</span>}
              {post.readTime && (
                <span className="blog-detail-hero__readtime">
                  <Clock size={14} />
                  {post.readTime} นาที
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="blog-detail-body">
        <div className="container">
          <div className="blog-detail-body__inner">
            {/* Tags */}
            {showTags && tags.length > 0 && (
              <div className="blog-detail-tags">
                {tags.map((tag) => (
                  <span key={tag.id} className="blog-detail-tag">
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Excerpt */}
            {excerpt && <p className="blog-detail-excerpt">{excerpt}</p>}

            {/* Rich text content */}
            <div className="blog-detail-content prose max-w-none" id="blog-content">
              {contentElement}
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="blog-detail-related">
          <div className="container">
            <h2 className="blog-detail-related__title">บทความล่าสุด</h2>
            <div className="blog-listing-grid">
              {relatedPosts.map((rPost) => {
                const rCoverUrl = getImageUrl(rPost.coverImage as MediaType | string | null)
                const rCoverAlt =
                  (typeof rPost.coverImage === 'object' && rPost.coverImage?.alt) ||
                  rPost.title ||
                  ''
                const rDate = formatThaiDate(rPost.publishedAt)
                const rExcerpt = (rPost as any).excerpt || ''

                return (
                  <article key={rPost.id} className="blog-listing-card">
                    <div className="blog-listing-card__image-wrapper">
                      {rCoverUrl ? (
                        <img
                          src={rCoverUrl}
                          alt={rCoverAlt}
                          className="blog-listing-card__image"
                          loading="lazy"
                        />
                      ) : (
                        <div
                          className="blog-listing-card__image"
                          style={{ background: 'var(--muted)' }}
                        />
                      )}
                    </div>
                    <div className="blog-listing-card__content">
                      {rDate && <span className="blog-listing-card__date">{rDate}</span>}
                      <h3 className="blog-listing-card__title">{rPost.title}</h3>
                      {rExcerpt && <p className="blog-listing-card__excerpt">{rExcerpt}</p>}
                      <Link href={`/blog/${rPost.slug}`} className="blog-listing-card__readmore">
                        อ่านต่อ
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <style jsx global>{`
        /* Hero */
        .blog-detail-hero {
          position: relative;
          width: 100%;
          height: 400px;
          overflow: hidden;
        }
        @media (min-width: 768px) {
          .blog-detail-hero {
            height: 500px;
          }
        }
        .blog-detail-hero__image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .blog-detail-hero__image--placeholder {
          background: linear-gradient(135deg, var(--primary), var(--accent));
        }
        .blog-detail-hero__overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 48px 0 32px;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
          color: #fff;
        }
        .blog-detail-hero__title {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 12px 0 8px;
          line-height: 1.3;
          max-width: 800px;
        }
        @media (min-width: 768px) {
          .blog-detail-hero__title {
            font-size: 2.25rem;
          }
        }
        .blog-detail-hero__meta {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 0.85rem;
          opacity: 0.85;
        }
        .blog-detail-hero__readtime {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* Breadcrumb */
        .blog-detail-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          opacity: 0.85;
          flex-wrap: nowrap;
          overflow: hidden;
        }
        .blog-detail-breadcrumb__link {
          display: inline-flex;
          flex-direction: row;
          align-items: center;
          gap: 4px;
          color: inherit;
          text-decoration: none;
          white-space: nowrap;
          flex-shrink: 0;
          flex-wrap: nowrap;
        }
        .blog-detail-breadcrumb__link svg {
          flex-shrink: 0;
        }
        .blog-detail-breadcrumb__home-text {
          display: none;
        }
        .blog-detail-breadcrumb__link:hover {
          text-decoration: underline;
        }
        .blog-detail-breadcrumb__sep {
          opacity: 0.5;
          flex-shrink: 0;
          font-size: 0.7rem;
        }
        .blog-detail-breadcrumb__current {
          font-weight: 500;
          max-width: 40vw;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex-shrink: 1;
          min-width: 0;
        }
        @media (min-width: 768px) {
          .blog-detail-breadcrumb__home-text {
            display: inline;
          }
          .blog-detail-breadcrumb__current {
            max-width: 500px;
          }
          .blog-detail-breadcrumb {
            font-size: 0.8rem;
          }
        }

        /* Body */
        .blog-detail-body {
          padding: 48px 0;
        }
        .blog-detail-body__inner {
          max-width: 780px;
          margin: 0 auto;
        }

        /* Tags */
        .blog-detail-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 24px;
        }
        .blog-detail-tag {
          padding: 4px 12px;
          background: var(--secondary);
          color: var(--secondary-foreground);
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        /* Excerpt */
        .blog-detail-excerpt {
          font-size: 1.1rem;
          color: var(--muted-foreground);
          line-height: 1.7;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--border);
          font-style: italic;
        }

        /* Content */
        .blog-detail-content {
          font-size: 1rem;
          line-height: 1.8;
          color: var(--foreground);
        }

        /* Related Posts */
        .blog-detail-related {
          padding: 48px 0 64px;
          background: var(--muted);
        }
        .blog-detail-related__title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--foreground);
          margin: 0 0 24px;
        }
        .blog-detail-related__grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        @media (min-width: 640px) {
          .blog-detail-related__grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .blog-detail-related__grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        .blog-detail-related__card {
          background: var(--card);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: rgba(0, 0, 0, 0.06) 0px 2px 12px -2px;
          transition:
            box-shadow 0.3s ease,
            transform 0.3s ease;
        }
        .blog-detail-related__card:hover {
          box-shadow: rgba(0, 0, 0, 0.12) 0px 8px 24px -6px;
          transform: translateY(-3px);
        }
        .blog-detail-related__card-img-wrapper {
          position: relative;
          width: 100%;
          padding-top: 75%;
          overflow: hidden;
        }
        .blog-detail-related__card-img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .blog-detail-related__card:hover .blog-detail-related__card-img {
          transform: scale(1.05);
        }
        .blog-detail-related__card-content {
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .blog-detail-related__card-date {
          font-size: 0.7rem;
          color: var(--muted-foreground);
        }
        .blog-detail-related__card-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--foreground);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin: 0;
        }
        .blog-detail-related__card-excerpt {
          font-size: 0.75rem;
          color: var(--muted-foreground);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin: 0;
        }
        .blog-detail-related__card-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: var(--primary);
          font-size: 0.8rem;
          font-weight: 500;
          text-decoration: none;
          margin-top: 4px;
        }
        .blog-detail-related__card-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </>
  )
}
