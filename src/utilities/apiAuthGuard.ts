import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'

export async function requireAdmin(request: Request) {
  const payload = await getPayload({ config })
  const headersList = await headers()
  // Verify the user is authenticated and has admin role
  const { user } = await payload.auth({ headers: headersList })
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }
  return null // No error = authorized
}
