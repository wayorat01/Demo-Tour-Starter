import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const apiSettingGlobal = await payload.findGlobal({ slug: 'api-setting' })

    if (!apiSettingGlobal?.apiEndPoint || !apiSettingGlobal?.apiKey) {
      return NextResponse.json(
        { success: false, data: [], error: 'API settings missing' },
        { status: 500 },
      )
    }

    // Find "LoadCountry" endpoint from API Setting → Endpoints
    const endpoints = (apiSettingGlobal as any).endpoints as any[] | undefined
    const countryEndpoint = endpoints?.find((ep: any) => ep.endpointName === 'LoadCountry')

    let url = apiSettingGlobal.apiEndPoint
    const query = new URLSearchParams()
    query.append('apiKey', apiSettingGlobal.apiKey)

    if (countryEndpoint?.queryParams) {
      for (const p of countryEndpoint.queryParams) {
        if (p.key && p.value != null) query.append(p.key, p.value)
      }
    } else {
      query.append('mode', 'LoadCountry')
    }

    const finalUrl = url + (url.includes('?') ? '&' : '?') + query.toString()

    const res = await fetch(finalUrl, {
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `API returned ${res.status}` },
        { status: res.status },
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[proxy-countries] Error:', error)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}
