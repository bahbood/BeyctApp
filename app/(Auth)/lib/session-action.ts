//    app/(Auth)/lib/session-action.ts
'use server'

import { cookies } from 'next/headers'
import { decryptSession } from './session'

export async function getSessionFromAction() {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value
    return await decryptSession(session)
  } catch (error) {
    console.error('Error getting session from action:', error)
    return null
  }
}

export async function checkRoleFromAction(allowedRoles: string[]) {
  const session = await getSessionFromAction()
  return session?.role ? allowedRoles.includes(session.role) : false
}