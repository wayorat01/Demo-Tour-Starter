import React from 'react'
import type { WowtourProductCardBlock as WowtourProductCardBlockType } from '@/payload-types'
import type { PublicContextProps } from '@/utilities/publicContextProps'
import { resolveLocalization } from '@/utilities/resolveLocalization'

// Independent Service Card components (copied from TourCard, fully separate)
import { WowtourServiceCard1 } from './wowtour_serviceCard1'
import { WowtourServiceCard2 } from './wowtour_serviceCard2'
import { WowtourServiceCard3 } from './wowtour_serviceCard3'
import { WowtourServiceCard4 } from './wowtour_serviceCard4'
import { WowtourServiceCard5 } from './wowtour_serviceCard5'
import { WowtourServiceCard6 } from './wowtour_serviceCard6'

type WowtourProductCardBlockProps = WowtourProductCardBlockType & {
    publicContext: PublicContextProps
}

const blockComponents: Record<string, React.FC<any>> = {
    WOWTOUR_PRODUCT_CARD_1: WowtourServiceCard1,
    WOWTOUR_PRODUCT_CARD_2: WowtourServiceCard2,
    WOWTOUR_PRODUCT_CARD_3: WowtourServiceCard3,
    WOWTOUR_PRODUCT_CARD_4: WowtourServiceCard4,
    WOWTOUR_PRODUCT_CARD_5: WowtourServiceCard5,
    WOWTOUR_PRODUCT_CARD_6: WowtourServiceCard6,
}

// Default heading titles per product type
const defaultTitles: Record<string, string> = {
    admission: 'บัตรเข้าชม',
    cruise: 'เรือสำราญ',
    car_rental: 'รถเช่า',
}

/**
 * Transform ServiceByType items into TourItem-compatible format
 * so the ServiceCard components can render them with the same style.
 */
function mapItemsToTours(items: NonNullable<WowtourProductCardBlockType['items']>) {
    return items.map((item) => {
        const hasDiscount = item.originalPrice && item.price && item.originalPrice > item.price

        return {
            // Core display fields
            coverImage: item.coverImage,
            tourTitle: item.title || '',
            tourDescription: item.shortDescription || '',
            countryName: item.location || '',
            tourCode: '',
            id: item.id || '',

            // Duration
            stayDay: item.duration || '',
            stayNight: null,

            // Price
            startPrice: item.price ? String(item.price) : null,
            discountPrice: hasDiscount ? String(item.price) : null,

            // Badge → recommendedLabel
            recommendedLabel: item.badge || null,

            // Link
            interTourSlug: null,
            directLink: item.linkUrl || '#',

            // Not applicable for services
            airlineLogo: null,
            travelPeriods: [],
            pdfLink: null,
            wordLink: null,
            bannerLink: null,

            // Toggle settings — show only relevant fields
            toggleSettings: {
                showCountryTag: !!item.location,
                showRecommendedTag: !!item.badge,
                showTourCode: false,
                showDescription: !!item.shortDescription,
                showTravelPeriod: false,
                showAirline: false,
                showDuration: !!item.duration,
                showStartPrice: !!item.price,
                showDiscountPrice: hasDiscount,
                showDetailButton: true,
                cardDownloadButton: 'none',
            },
        }
    })
}

export const WowtourProductCardBlock: React.FC<WowtourProductCardBlockProps> = (props) => {
    const { designVersion, productType, headingSettings, items } = props

    if (!designVersion || !(designVersion in blockComponents)) {
        return null
    }

    // Resolve heading title: custom title > default by product type
    const apiTitle =
        headingSettings?.title || defaultTitles[productType || 'admission'] || 'สินค้า'

    // Transform items into tour-compatible format
    const tours = mapItemsToTours(items || [])


    // Serialize to prevent React Server Component serialization errors with Payload objects AND resolve localization
    const sanitizedProps = resolveLocalization(JSON.parse(JSON.stringify(props)), props.publicContext.locale)
    const sanitizedTours = resolveLocalization(JSON.parse(JSON.stringify(tours)), props.publicContext.locale)

    const Component = blockComponents[designVersion]
    return Component ? (
        <Component
            {...sanitizedProps}
            tours={sanitizedTours}
            apiTitle={apiTitle}
        />
    ) : null
}
