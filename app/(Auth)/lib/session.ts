 //app/(Auth)/lib/session.ts
 "use server"

import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { userRoles } from '@/app/db/schema/users' 
import { logined_User_Info } from '@/app/components/(Flyouts)/(Provider)/FlyoutPageContextProvider'


const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)
 

 //////////// createSession 11111111111111111111111111111111111
// app/(Auth)/lib/session.ts

export async function createSession(
  userId: number,
  userName: string,
  role: string,
  isActive: boolean,
  name: string,
  family: string,
  avatar: string,
  mobile?: string,
  email?: string,
  store_active?: boolean,
  news_agency_active?: boolean,
  serviceman_active?: boolean
): Promise<{ success: boolean; user?: logined_User_Info }> {
  try {
    let expireTime = 0
    if (role === userRoles.enumValues[0] || role === userRoles.enumValues[1]) {
      expireTime = 30 * 60 * 1000
    } else {
      expireTime = 7 * 24 * 60 * 60 * 1000
    }

    const expiresAt = new Date(Date.now() + expireTime)
    const session = await encryptSession({
      userId,
      userName,
      role,
      isActive,
      expiresAt,
      name,
      family,
      avatar,
      mobile,
      email,
      store_active,
      news_agency_active,
      serviceman_active
    }, expiresAt)

    const cookieStore = await cookies()
    cookieStore.set('session', session, {
      httpOnly: true,
      secure: true,
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
    })

    return {
      success: true,
      user: {
        id:userId,
        name:name,
        family:family,
        avatar: avatar || '',
        mobile: mobile || '',
        email: email || '',
        role: role || '',
        store_active: store_active || false,
        news_agency_active: news_agency_active || false,
        serviceman_active: serviceman_active || false,
      }
    }
  } catch (error) {
    console.error('Error creating session:', error)
    return { success: false }
  }
}
 //////////// createSession end 11111111111111111111111111111111111


 ///////////// updateSession 22222222222222222222222222222222222
export async function updateSession():Promise<{ success: boolean; user?: logined_User_Info | null }> 
{
  try {
    
  
    const session = (await cookies()).get('session')?.value
   
    if (!session) {
      return { success: false, user: null }
    }

    const payload = await decryptSession(session) as SessionPayload
    if (!payload) {
      return { success: false, user: null }
    }

   // چک کردن زمان انقضا
    const _expiresAt = new Date(payload.expiresAt )
    if (_expiresAt < new Date()) {
      await deleteSession()
      return { success: false, user: null }
    }
  
    const role = payload.role as string
    const userId = Number(payload.userId)
    const userName = payload.userName as string
    const isActive = payload.isActive as boolean
     const name = payload.name as string || ""
    const family = payload.family as string || ''
    const avatar = payload.avatar as string || ''
    const mobile = payload.mobile as string || ''
    const email = payload.email as string || ''

    let expireTime = 0
      if (role === userRoles.enumValues[0] || role === userRoles.enumValues[1]) {
      expireTime = 30 * 60 * 1000
    } else {
      expireTime = 7 * 24 * 60 * 60 * 1000
    }

    const expiresAt = new Date(Date.now() + expireTime)
    const newsession = await encryptSession({ userId, userName, role, isActive , expiresAt ,name,family,avatar, mobile, email, store_active: payload.store_active, news_agency_active: payload.news_agency_active, serviceman_active: payload.serviceman_active}, expiresAt)
    const cookieStore = await cookies()

    cookieStore.set('session', newsession, {
      httpOnly: true,
      secure: true,
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
    })
    return {
      success: true,
      user: {
        name: name,
        family: family,
        avatar: avatar || '',
        mobile: mobile || '',
        email: email || '',
      }
    }
  } catch (error) {
    console.error('Error updating session:', error)
    return { success: false, user: null }
  }

    
 
  }
///////////// updateSession end 22222222222222222222222222222222222

////  deleteSession     33333
export async function deleteSession(): Promise<{ success: boolean }> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('session')
    return { success: true }
  } catch (error) {
    console.error('Error deleting session:', error)
    return { success: false }
  }
}
////  deleteSession  end   33333


//// getUserFromSession 4
export async function getUserFromSession(): Promise<logined_User_Info | null> {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value

    if (!session) {
      return null
    }

    const payload = await decryptSession(session) as SessionPayload
    if (!payload) {
      return null
    }

    // بررسی انقضای سشن
    const expiresAt = new Date(payload.expiresAt)
    if (expiresAt < new Date()) {
      // کوکی منقضی شده، اما اینجا نمی‌توانیم حذفش کنیم
      return null
    }

    // برگرداندن اطلاعات کاربر
    return {
      id: payload.userId ,
      name: payload.name as string || payload.userName as string,
      family: payload.family as string || '',
      avatar: payload.avatar as string || '',
      mobile: payload.mobile as string || '',
      email: payload.email as string || '',
      role: payload.role as string || '',
      store_active: payload.store_active as boolean || false,
      news_agency_active: payload.news_agency_active as boolean || false,
      serviceman_active: payload.serviceman_active as boolean || false,
    }
  } catch (error) {
    console.error('Error getting user from session:', error)
    return null
  }
}
//// getUserFromSession 4

////checkRoleAuthorisation
  export async function checkRoleAuthorisation(allowedRoles: string[]): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value
    
    if (!session) {
      return false
    }

    const payload = await decryptSession(session) as SessionPayload
    if (!payload) {
      return false
    }

    const role = payload.role as string
    return allowedRoles.includes(role)
  } catch (error) {
    console.error('Error checking role authorization:', error)
    return false
  }
}
/////checkRoleAuthorisation


////encrypt
  export async function encryptSession(payload: SessionPayload, expiresAt: Date): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt )
    .sign(encodedKey)
}
////encrypt

//////decrypt
export async function decryptSession(session: string | undefined): Promise<SessionPayload | null> {
  if (!session) {
    console.log("+ > session: decrypt - session not exist")
    return null
  }

  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload as SessionPayload
  } catch (error) {
    console.log("+ > session: decrypt - Failed to decrypt and verify session", error)
    return null
  }
}
//////decrypt

  

  export interface SessionPayload {  
    userId: number;
    userName: string; 
    role: string; 
    isActive:boolean;
    expiresAt:Date;
    name:string;
    family:string;
    avatar:string;
    [key: string]: any; 
  } 
  
 
  // export enum Roles{
  //   USER = "USER" ,
  //   ADMIN ="ADMIN" ,
  //   StoreMan ="StoreMan" ,
  //   NewsAgencyMan ="NewsAgencyMan" ,
  //   NewsAgencyReporter ="NewsAgencyReporter" ,
  // }

  // USER
  // ADMIN
  // StoreMan
  // NewsAgencyMan
  // NewsAgencyReporter