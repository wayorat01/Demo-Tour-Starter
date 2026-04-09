import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { allGalleryListingDesignVersions } from './config'
import { WowtourGalleryListing1 } from './wowtour_galleryListing1'
import { GalleryAlbum } from '@/payload-types'
import { PublicContextProps } from '@/utilities/publicContextProps'
import { resolveLocalization } from '@/utilities/resolveLocalization'

type GalleryListingDesignVersionValue = (typeof allGalleryListingDesignVersions)[number]['value']

type GalleryListingContent<T extends string = string> = Required<
    Record<GalleryListingDesignVersionValue, React.FC<any>>
> &
    Record<T, React.FC<any>>

export interface GalleryListingBlockProps {
    designVersion: GalleryListingDesignVersionValue
    sectionTitle?: string
    sectionDescription?: string
    source?: 'all' | 'curated'
    curatedAlbums?: (string | GalleryAlbum)[]
    albumsPerPage?: number
    publicContext: PublicContextProps
}

const galleryListingVersions: GalleryListingContent = {
    WOWTOUR_GALLERYLISTING1: WowtourGalleryListing1,
}

export const WowtourGalleryListingBlock: React.FC<GalleryListingBlockProps> = async (props) => {
    const {
        designVersion,
        source = 'all',
        curatedAlbums,
        albumsPerPage = 20,
    } = props || {}

    const payload = await getPayload({ config: configPromise })

    let albums: GalleryAlbum[] = []
    let totalDocs = 0

    try {
        if (source === 'curated' && curatedAlbums && curatedAlbums.length > 0) {
            const albumIds = curatedAlbums.map((a) =>
                typeof a === 'object' ? a.id : a,
            )
            const result = await payload.find({
                collection: 'gallery-albums',
                depth: 2,
                limit: albumIds.length,
                where: {
                    id: { in: albumIds },
                },
            })
            // Maintain admin-specified order
            albums = albumIds
                .map((id) => result.docs.find((d) => d.id === id))
                .filter(Boolean) as GalleryAlbum[]
            totalDocs = albums.length
        } else {
            const result = await payload.find({
                collection: 'gallery-albums',
                depth: 2,
                limit: albumsPerPage,
                sort: '-updatedAt',
            })
            albums = result.docs as GalleryAlbum[]
            totalDocs = result.totalDocs
        }
    } catch (error) {
        console.error('Error fetching gallery listing albums:', error)
    }

    if (!designVersion) return null

    const GalleryListingToRender = galleryListingVersions[designVersion]

    if (!GalleryListingToRender) return null

    const sanitizedAlbums = resolveLocalization(JSON.parse(JSON.stringify(albums)), props.publicContext?.locale || 'th')

    return (
        <GalleryListingToRender
            {...props}
            albums={sanitizedAlbums}
            totalDocs={totalDocs}
        />
    )
}
