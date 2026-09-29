// proxy.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromAction } from './app/(Auth)/lib/session-action'
import { decryptSession } from './app/(Auth)/lib/session'

// 1. Specify protected and public routes
// توجه : مسیرها باید URL باشند نه مسیر فایل سیستم (route group در URL ظاهر نمیشود)
const admin_ProtectedRoutes:string[] = ['/users']
const store_ProtectedRoutes:string[] = ['/myStore', '/storeProfile', '/productsList']
const newsAgency_ProtectedRoutes:string[] = []
const services_ProtectedRoutes:string[] = []
// مسیرهایی که فقط کاربران وارد شده سایت می توانند به آن ها دسترسی داشته باشند
const loggedIn_ProtectedRoutes:string[] = ['/messages']
const publicRoutes :string[] = ['/','/bazar']

const AdminPathes = ["/newsAgenciesList"]

export default async function proxy(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname

  const is_Admin_ProtectedRoute = admin_ProtectedRoutes.some((route) => path === route || path.startsWith(route + '/'))
  const is_store_ProtectedRoute = store_ProtectedRoutes.some((route) => path === route || path.startsWith(route + '/'))
  const is_NewsAgency_ProtectedRoute = newsAgency_ProtectedRoutes.some((route) => path === route || path.startsWith(route + '/'))
  const is_services_ProtectedRoute = services_ProtectedRoutes.some((route) => path === route || path.startsWith(route + '/'))
  const is_loggedIn_ProtectedRoute = loggedIn_ProtectedRoutes.some((route) => path === route || path.startsWith(route + '/'))
 
    const isProtectedRoute = is_Admin_ProtectedRoute || is_store_ProtectedRoute || is_NewsAgency_ProtectedRoute || is_services_ProtectedRoute || is_loggedIn_ProtectedRoute
  const isPublicRoute = publicRoutes.includes(path)
  
  console.log(' *  > proxy :  path :', path)
  
  // فقط برای مسیرهایی که نیاز به بررسی سشن دارند
  if (isPublicRoute || isProtectedRoute) {
    try {
      
     const sessionCookie = req.cookies.get('session')?.value
     const session = await decryptSession(sessionCookie)

      // 4. Redirect unauthenticated users from protected routes
      if (isProtectedRoute && !session?.userId) {
        console.log(" *  > proxy : Redirect unauthenticated user to home")
        return NextResponse.redirect(new URL('/', req.nextUrl))
      }

      // 5. Update session only if user is authenticated
      // if (session?.userId) {
      //   const updateResponse = await updateSession()
      //   if (updateResponse) {
      //     console.log(" *  > proxy : Session updated successfully")
      //     return updateResponse // مهم: response برمی‌گرداند
      //   }
      // }

      
      
    } catch (error) {
      console.error("Session error:", error)
      // در صورت خطا در سشن، کاربر را به خانه بفرست
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL('/', req.nextUrl))
      }
    }
  }

  console.log(" *  > proxy :  No session update needed")
  return NextResponse.next()
}

// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}