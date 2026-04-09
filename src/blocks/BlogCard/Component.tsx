import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

import { allBlogCardDesignVersions } from './config'
import { WowtourBlogCard1 } from './wowtour_blogCard1'
import { WowtourBlogCard2 } from './wowtour_blogCard2'
import { WowtourBlogCard3 } from './wowtour_blogCard3'
import { WowtourBlogCard4 } from './wowtour_blogCard4'
import { WowtourBlogCard5 } from './wowtour_blogCard5'
import { WowtourBlogCard6 } from './wowtour_blogCard6'
import { Post } from '@/payload-types'
import { PublicContextProps } from '@/utilities/publicContextProps'
import { resolveLocalization } from '@/utilities/resolveLocalization'

type BlogCardDesignVersionValue = (typeof allBlogCardDesignVersions)[number]['value']

type BlogCardContent<T extends string = string> = Required<
  Record<BlogCardDesignVersionValue, React.FC<any>>
> &
  Record<T, React.FC<any>>

export interface BlogCardBlockProps {
  designVersion: BlogCardDesignVersionValue
  sectionTitle?: string
  sectionDescription?: string
  sectionIconImage?: any
  backgroundImage?: any
  backgroundImagePosition?: string
  viewAllLink?: string
  viewAllLabel?: string
  sortOrder?:
    | 'publishedAt_desc'
    | 'publishedAt_asc'
    | 'createdAt_desc'
    | 'createdAt_asc'
    | 'updatedAt_desc'
    | 'updatedAt_asc'
    | 'title_asc'
    | 'title_desc'
  cardSettings?: {
    borderRadius?: number
    imageBorderRadius?: number
  }
  banners?: Array<{
    bannerImage?: any
    bannerTitle?: string | null
    bannerDescription?: string | null
    bannerLink?: string | null
  }>
  publicContext: PublicContextProps
  showExcerpt?: boolean
}

const blogCardVersions: BlogCardContent = {
  WOWTOUR_BLOGCARD1: WowtourBlogCard1,
  WOWTOUR_BLOGCARD2: WowtourBlogCard2,
  WOWTOUR_BLOGCARD3: WowtourBlogCard3,
  WOWTOUR_BLOGCARD4: WowtourBlogCard4,
  WOWTOUR_BLOGCARD5: WowtourBlogCard5,
  WOWTOUR_BLOGCARD6: WowtourBlogCard6,
}

export const WowtourBlogCardBlock: React.FC<BlogCardBlockProps> = async (props) => {
  const { designVersion, sortOrder = 'publishedAt_desc' } = props || {}

  // Map sortOrder value to Payload sort string
  const sortMap: Record<string, string> = {
    publishedAt_desc: '-publishedAt',
    publishedAt_asc: 'publishedAt',
    createdAt_desc: '-createdAt',
    createdAt_asc: 'createdAt',
    updatedAt_desc: '-updatedAt',
    updatedAt_asc: 'updatedAt',
    title_asc: 'title',
    title_desc: '-title',
  }
  const sort = sortMap[sortOrder] || '-publishedAt'

  // V5 shows only 3 posts, others show 8
  const postLimit = designVersion === 'WOWTOUR_BLOGCARD5' ? 3 : 8

  // Fetch latest published posts (cached)
  const getCachedBlogPosts = unstable_cache(
    async (sortKey: string, limit: number) => {
      const payload = await getPayload({ config: configPromise })
      const fetchedPosts = await payload.find({
        collection: 'posts',
        depth: 1,
        limit,
        sort: sortKey,
        where: {
          _status: {
            equals: 'published',
          },
        },
      })
      const seen = new Set<string>()
      const uniquePosts = fetchedPosts.docs.filter((post) => {
        if (seen.has(post.id)) return false
        seen.add(post.id)
        return true
      })
      return JSON.parse(JSON.stringify(uniquePosts))
    },
    ['blog-card-posts'],
    { tags: ['posts'] },
  )

  let posts: Post[] = []
  try {
    posts = await getCachedBlogPosts(sort, postLimit)
  } catch (error) {
    console.error('Error fetching blog card posts:', error)
  }

  if (!designVersion) return null

  const BlogCardToRender = blogCardVersions[designVersion]

  if (!BlogCardToRender) return null
  const sanitizedPosts = resolveLocalization(
    JSON.parse(JSON.stringify(posts)),
    props.publicContext?.locale || 'th',
  )

  return <BlogCardToRender {...props} posts={sanitizedPosts} />
}
