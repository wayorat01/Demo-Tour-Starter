import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { allBlogListingDesignVersions } from './config'
import { WowtourBlogListing1 } from './wowtour_blogListing1'
import { Post } from '@/payload-types'
import { PublicContextProps } from '@/utilities/publicContextProps'
import { resolveLocalization } from '@/utilities/resolveLocalization'

type BlogListingDesignVersionValue = (typeof allBlogListingDesignVersions)[number]['value']

type BlogListingContent<T extends string = string> = Required<
    Record<BlogListingDesignVersionValue, React.FC<any>>
> &
    Record<T, React.FC<any>>

export interface BlogListingBlockProps {
    designVersion: BlogListingDesignVersionValue
    source?: 'all' | 'curated' | 'by_tag'
    curatedPosts?: (string | Post)[]
    filterTags?: (string | { id: string; name?: string })[]
    postsPerPage?: number
    layout?: 'grid' | 'list'
    publicContext: PublicContextProps
}

const blogListingVersions: BlogListingContent = {
    WOWTOUR_BLOGLISTING1: WowtourBlogListing1,
}

export const WowtourBlogListingBlock: React.FC<BlogListingBlockProps> = async (props) => {
    const {
        designVersion,
        source = 'all',
        curatedPosts,
        filterTags,
        postsPerPage = 12,
    } = props || {}

    const payload = await getPayload({ config: configPromise })

    let posts: Post[] = []
    let totalPages = 1
    let totalDocs = 0

    try {
        if (source === 'curated' && curatedPosts && curatedPosts.length > 0) {
            // Curated: fetch selected posts in order
            const postIds = curatedPosts.map((p) =>
                typeof p === 'object' ? p.id : p,
            )
            const result = await payload.find({
                collection: 'posts',
                depth: 1,
                limit: postIds.length,
                where: {
                    and: [
                        { id: { in: postIds } },
                        { _status: { equals: 'published' } },
                    ],
                },
            })
            // Maintain admin-specified order
            posts = postIds
                .map((id) => result.docs.find((d) => d.id === id))
                .filter(Boolean) as Post[]
            totalDocs = posts.length
        } else if (source === 'by_tag' && filterTags && filterTags.length > 0) {
            // By tag: filter posts that have any of the selected tags
            const tagIds = filterTags.map((t) =>
                typeof t === 'object' ? t.id : t,
            )
            const result = await payload.find({
                collection: 'posts',
                depth: 1,
                limit: postsPerPage,
                sort: '-publishedAt',
                where: {
                    and: [
                        { _status: { equals: 'published' } },
                        { tags: { in: tagIds } },
                    ],
                },
            })
            posts = result.docs as Post[]
            totalPages = result.totalPages
            totalDocs = result.totalDocs
        } else {
            // All: fetch latest published posts
            const result = await payload.find({
                collection: 'posts',
                depth: 1,
                limit: postsPerPage,
                sort: '-publishedAt',
                where: {
                    _status: { equals: 'published' },
                },
            })
            posts = result.docs as Post[]
            totalPages = result.totalPages
            totalDocs = result.totalDocs
        }
    } catch (error) {
        console.error('Error fetching blog listing posts:', error)
    }

    if (!designVersion) return null

    const BlogListingToRender = blogListingVersions[designVersion]

    if (!BlogListingToRender) return null

    const sanitizedPosts = resolveLocalization(JSON.parse(JSON.stringify(posts)), props.publicContext?.locale || 'th')

    return (
        <BlogListingToRender
            {...props}
            posts={sanitizedPosts}
            totalPages={totalPages}
            totalDocs={totalDocs}
            currentPage={1}
        />
    )
}
