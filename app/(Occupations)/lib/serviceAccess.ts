// app/(Occupations)/lib/serviceAccess.ts
// لایه دسترسی بخش خدمات (بانک مشاغل)
//
// استراتژی دو لایه ای :
// 1) proxy.ts مسیرها را در مرز ورودی فیلتر می کند (بهینه سازی optimistic)
// 2) هر صفحه/اکشن دوباره خودش بررسی می کند تا دور زدن proxy بی اثر باشد

import 'server-only'

import { redirect } from 'next/navigation'
import { getUserFromSession } from '@/app/(Auth)/lib/session'

/**
 * فقط نشست معتبر می خواهد.
 * برای صفحاتی مثل «خدمات من» که کاربر بدون خدمت هم باید بتواند وارد شود
 * و درخواست خدمت جدید ثبت کند.
 */
export async function requireServiceSession(): Promise<number> {
  const userinfo = await getUserFromSession()
  const userId = userinfo?.id

  if (!userId) {
    redirect('/')
  }

  return userId
}

/** نشست کاربر فعلی + بررسی اینکه مدیر سایت است */
export async function requireServiceAdmin(): Promise<{ id: number } | null> {
  const userinfo = await getUserFromSession()

  if (!userinfo?.id || userinfo.role !== 'admin') return null

  return { id: userinfo.id }
}
