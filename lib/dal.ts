import 'server-only'
 
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/session'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { getUserByEmail } from './Data/user/user'

 
export const verifySession = cache(async () => {
  const cookie = cookies().get('session')?.value
  const session = await decrypt(cookie)
 
  if (!session?.email) {
    redirect('/login')
  }
 
  return { isAuth: true, email: session.email }
})

export const getUser = cache(async () => {
    const session = await verifySession()
    if (!session) return null
      const user = await getUserByEmail(session.email)
      return user
  })