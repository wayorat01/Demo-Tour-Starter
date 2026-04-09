import { NextResponse } from 'next/server'
import { getCachedSearchOptions } from '@/utilities/getSearchOptions'

// Cache filter options for 5 minutes — data changes infrequently
export const revalidate = 300

export async function GET() {
  try {
    const data = await getCachedSearchOptions()

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
