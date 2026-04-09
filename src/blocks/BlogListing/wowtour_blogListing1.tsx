'use client'

import React from 'react'
import { Post, Media as MediaType } from '@/payload-types'
import { ChevronLeft, ChevronRight, Home, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import './wowtour_blogListing1.css'

interface WowtourBlogListing1Props {
  source?: 'all' | 'curated' | 'by_tag'
  layout?: 'grid' | 'list'
  posts: Post[]
  totalPages: number
  currentPage: number
  totalDocs: number
  postsPerPage?: number
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

export const WowtourBlogListing1: React.FC<WowtourBlogListing1Props> = ({
  layout = 'grid',
  posts,
  totalPages,
  currentPage,
  totalDocs,
}) => {
  return (
    <>
      {/* Posts Grid */}
      <section className="blog-listing-content">
        <div className="container">
          {posts.length === 0 ? (
            <div className="blog-listing-empty">
              <div className="blog-listing-empty__icon">📝</div>
              <h2 className="blog-listing-empty__title">ยังไม่มีบทความ</h2>
              <p className="blog-listing-empty__desc">กรุณาเพิ่มบทความผ่าน Admin Panel</p>
            </div>
          ) : (
            <>
              <div
                className={`blog-listing-grid ${layout === 'list' ? 'blog-listing-grid--list' : ''}`}
              >
                {posts.map((post) => {
                  const coverUrl = getImageUrl(post.coverImage as MediaType | string | null)
                  const coverAlt =
                    (typeof post.coverImage === 'object' && post.coverImage?.alt) ||
                    post.title ||
                    ''
                  const postDate = formatThaiDate(post.publishedAt)
                  const excerpt = (post as any).excerpt || ''

                  return (
                    <article key={post.id} className="blog-listing-card">
                      <div className="blog-listing-card__image-wrapper">
                        {coverUrl ? (
                          <img
                            src={coverUrl}
                            alt={coverAlt}
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
                        {postDate && <span className="blog-listing-card__date">{postDate}</span>}
                        <h2 className="blog-listing-card__title">{post.title}</h2>
                        {excerpt && <p className="blog-listing-card__excerpt">{excerpt}</p>}
                        <Link
                          href={`/blog/${post.slug || post.id}`}
                          className="blog-listing-card__readmore"
                        >
                          อ่านต่อ
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </article>
                  )
                })}
              </div>

              {/* Pagination (only for non-curated) */}
              {totalPages > 1 && (
                <nav className="blog-listing-pagination">
                  <Link
                    href={`?page=${currentPage - 1}`}
                    className={`blog-listing-pagination__btn ${currentPage <= 1 ? 'blog-listing-pagination__btn--disabled' : ''}`}
                    aria-disabled={currentPage <= 1}
                    tabIndex={currentPage <= 1 ? -1 : undefined}
                  >
                    <ChevronLeft size={16} />
                  </Link>

                  <div className="blog-listing-pagination__pages">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <Link
                        key={pageNum}
                        href={`?page=${pageNum}`}
                        className={`blog-listing-pagination__page ${pageNum === currentPage ? 'blog-listing-pagination__page--active' : ''}`}
                      >
                        {pageNum}
                      </Link>
                    ))}
                  </div>

                  <Link
                    href={`?page=${currentPage + 1}`}
                    className={`blog-listing-pagination__btn ${currentPage >= totalPages ? 'blog-listing-pagination__btn--disabled' : ''}`}
                    aria-disabled={currentPage >= totalPages}
                    tabIndex={currentPage >= totalPages ? -1 : undefined}
                  >
                    <ChevronRight size={16} />
                  </Link>
                </nav>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}
