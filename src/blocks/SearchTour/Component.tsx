import React from 'react'
import type { WowtourSearchTourBlock as WowtourSearchTourBlockType } from '@/payload-types'
import type { PublicContextProps } from '@/utilities/publicContextProps'
import { WowtourSearch1 } from './wowtour_search1'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getCachedSearchOptions } from '@/utilities/getSearchOptions'

type WowtourSearchTourBlockProps = WowtourSearchTourBlockType & {
    publicContext: PublicContextProps
}

const blockComponents: Record<string, any> = {
    WOWTOUR_SEARCH_TOUR_1: WowtourSearch1,
}

export const WowtourSearchTourBlock = async (props: WowtourSearchTourBlockProps) => {
    const { designVersion, publicContext } = props

    if (!designVersion || !(designVersion in blockComponents)) {
        return null
    }
    
    // Server-Side Data Fetching
    const pageConfig = await getCachedGlobal('page-config', publicContext?.locale || 'th', 2)()
    const searchOptions = await getCachedSearchOptions()

    // ⚡ Prune payload to prevent massive Hydration Lag
    const globalSettings = pageConfig?.searchSectionSettings || {}
    const searchFields = globalSettings?.searchFields || {}
    
    // Only send the minimal options needed by the enabled fields
    const minimalOptions = {
        filterOptions: { priceRange: searchOptions?.filterOptions?.priceRange || { min: 0, max: 1000000 } },
        countryList: searchFields?.countryField?.enabled ? searchOptions?.countryList : [],
        cityList: (searchFields?.countryField?.enabled && searchFields?.countryField?.includeCity) ? searchOptions?.cityList : [],
        airlines: searchFields?.airlineField?.enabled ? searchOptions?.airlines : [],
        festivalList: searchFields?.festivalField?.enabled ? searchOptions?.festivalList : [],
        wholesaleList: searchFields?.wholesaleField?.enabled ? searchOptions?.wholesaleList : [],
    }

    // Only pass searchSectionSettings to reduce JSON serialization size instead of injecting deep page-config object
    const minimalGlobalSettings = { searchSectionSettings: globalSettings }

    const Component = blockComponents[designVersion]
    return Component ? (
        <>
            <div id="DEBUG_GLOBAL_SETTINGS" style={{display: 'none'}} data-content={JSON.stringify(searchFields)}></div>
            <Component 
                {...props} 
        preloadedGlobalSettings={minimalGlobalSettings} 
        preloadedSearchOptions={minimalOptions} 
    />
        </>
    ) : null
}
