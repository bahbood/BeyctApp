// proxy.ts
import { NextRequest, NextResponse } from 'next/server'
import { decryptSession } from './app/(Auth)/lib/session'

// 1. Specify protected and public routes
// توجه : مسیرها باید URL باشند نه مسیر فایل سیستم (route group در URL ظاهر نمیشود)
const admin_ProtectedRoutes:string[] = ['/users', '/admin']
const store_ProtectedRoutes:string[] = ['/myStore', '/storeProfile', '/productsList']
// بخش مدیریت خبرگزاری - فقط برای کاربران وارد شده
// (بررسی مالکیت و وضعیت انتشار در خود صفحه/اکشن انجام می شود)
const newsAgency_ProtectedRoutes:string[] = [
  '/myNewsAgency',
  '/newsAgencyProfile',
  '/newsList',
  '/addNews',
]
// بخش خدمات (بانک مشاغل) - فقط برای کاربران وارد شده
// (بررسی مالکیت خدمت در خود صفحه/اکشن نیز انجام می شود)
const services_ProtectedRoutes:string[] = ['/myServices']
// مسیرهایی که فقط کاربران وارد شده سایت می توانند به آن ها دسترسی داشته باشند
const loggedIn_ProtectedRoutes:string[] = ['/messages']
// صفحات عمومی که بدون لاگین هم قابل مشاهده هستند
const publicRoutes :string[] = ['/','/bazar','/asnaf']

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

  // فقط برای مسیرهایی که نیاز به بررسی سشن دارند
  if (isPublicRoute || isProtectedRoute) {
    try {
      const sessionCookie = req.cookies.get('session')?.value
      const session = await decryptSession(sessionCookie)

      // 4. Redirect unauthenticated users from protected routes
      if (isProtectedRoute && !session?.userId) {
        return NextResponse.redirect(new URL('/', req.nextUrl))
      }

      // 4.1 مسیرهای مدیریتی فقط برای نقش admin
      // (بررسی نقش در خود صفحه/اکشن سمت سرور هم تکرار می‌شود تا لایه دفاعی داشته باشیم)
      if (is_Admin_ProtectedRoute && session?.role !== 'admin') {
        return NextResponse.redirect(new URL('/', req.nextUrl))
      }
    } catch (error) {
      console.error('Session error:', error)
      // در صورت خطا در سشن، کاربر را به خانه بفرست
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL('/', req.nextUrl))
      }
    }
  }

  return NextResponse.next()
}

// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}