import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import type { User } from '../payload-types'

export const getMeUser = async (args?: {
  nullUserRedirect?: string
  validUserRedirect?: string
}): Promise<{
  token?: string
  user: User | null
}> => {
  const { nullUserRedirect, validUserRedirect } = args || {}
  
  const payload = await getPayload({ config: configPromise })
  const nextHeaders = await headers()
  
  const { user } = await payload.auth({ headers: nextHeaders })

  if (validUserRedirect && user) {
    redirect(validUserRedirect)
  }

  if (nullUserRedirect && !user) {
    redirect(nullUserRedirect)
  }

  let token: string | undefined
  const authHeader = nextHeaders.get('Authorization')
  if (authHeader?.startsWith('JWT ')) {
    token = authHeader.split(' ')[1]
  } else {
    // If we need the token from cookies, we could get it, 
    // but the token is usually a cookie called payload-token
    const cookieHeader = nextHeaders.get('cookie')
    if (cookieHeader) {
      const match = cookieHeader.match(/payload-token=([^;]+)/)
      if (match) token = match[1]
    }
  }

  return {
    token,
    user: user as User | null,
  }
}
