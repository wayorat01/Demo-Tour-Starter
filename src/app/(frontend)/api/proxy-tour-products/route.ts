import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import {
  fetchTourProductsWithTitle,
  mapApiProductToTourItem,
  mapApiProductToTourItemCMS,
} from '@/utilities/fetchTourProducts'

/**
 * Proxy route for client components to fetch external API tour products.
 * This avoids CORS issues and `next.revalidate` server-only limitations.
 *
 * Query params:
 *   - country_slug (optional): filter by country slug
 *   - pagesize (optional): number of results per page (default: 10)
 *   - pagenumber (optional): page number (default: 1)
 *   - sortby (optional): sort order (supplierseq | periodnosoldout | periodlowtohight | price)
 *   - format (optional): 'cms' for CMS-compatible shape (Cards 1-6), default is ApiTourItem
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const countrySlug = searchParams.get('country_slug') || ''
    const pagesize = Number(searchParams.get('pagesize') || '10')
    const pagenumber = Number(searchParams.get('pagenumber') || '1')
    const sortby = searchParams.get('sortby') || ''
    const format = searchParams.get('format') || ''

    const payload = await getPayload({ config: configPromise })
    const apiSettingGlobal = await payload.findGlobal({ slug: 'api-setting' })

    if (!apiSettingGlobal?.apiEndPoint || !apiSettingGlobal?.apiKey) {
      return NextResponse.json(
        { success: false, data: [], error: 'API settings missing' },
        { status: 500 },
      )
    }

    // Find "Search Result" endpoint from API Setting → Endpoints
    const endpoints = (apiSettingGlobal as any).endpoints as any[] | undefined
    const searchEndpoint = endpoints?.find((ep: any) => ep.endpointName === 'Search Result')
    const qp: Record<string, string> = {}
    if (searchEndpoint?.queryParams) {
      for (const p of searchEndpoint.queryParams) {
        if (p.key && p.value != null) qp[p.key] = p.value
      }
    }

    const { products: rawProducts, title } = await fetchTourProductsWithTitle({
      apiEndPoint: apiSettingGlobal.apiEndPoint,
      apiKey: apiSettingGlobal.apiKey,
      mode: qp.mode || 'searchresultsproduct',
      lang: qp.lang || 'th',
      pagesize,
      pagenumber,
      sortby: sortby || qp.sortby || 'pricehightolow',
      country_slug: countrySlug,
      type: qp.type || '',
    })

    // Map products based on format
    const mappedProducts =
      format === 'cms'
        ? rawProducts.map(mapApiProductToTourItemCMS)
        : rawProducts.map(mapApiProductToTourItem)

    // Calculate total periods
    let totalPeriods = 0
    for (const p of rawProducts) {
      totalPeriods += (p.periods || []).length
    }

    return NextResponse.json({
      success: true,
      data: mappedProducts,
      title: title || null,
      pagination: {
        page: pagenumber,
        limit: pagesize,
        totalResults: mappedProducts.length,
        totalPeriods,
        totalPages: mappedProducts.length < pagesize ? pagenumber : pagenumber + 1,
      },
    })
  } catch (error) {
    console.error('[proxy-tour-products] Error:', error)
    return NextResponse.json({ success: false, data: [], error: 'Internal error' }, { status: 500 })
  }
}
