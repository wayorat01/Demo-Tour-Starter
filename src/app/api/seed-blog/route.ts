import { seedBlogData } from '@/seed/seed-blog'
import { NextResponse } from 'next/server'

import { requireAdmin } from '@/utilities/apiAuthGuard'

export async function POST(request: Request) {
  const authError = await requireAdmin(request)
  if (authError) return authError
  const result = await seedBlogData()
  return NextResponse.json(result)
}
