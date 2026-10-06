// app/(newsPaper)/lib/newsAgencyAccess.ts
// لایه دسترسی بخش مدیریت خبرگزاری
//
// استراتژی دو لایه ای :
// 1) proxy.ts مسیرها را در مرز ورودی فیلتر می کند (بهینه سازی optimistic)
// 2) هر صفحه/اکشن دوباره خودش بررسی می کند تا دور زدن proxy بی اثر باشد

import 'server-only'

import { redirect } from 'next/navigation'
import { getUserFromSession } from '@/app/(Auth)/lib/session'
import { getNewsAgencyByUserId } from './getNewsAgencyByUserId'
import type { NewsAgency } from '@/app/db/schema'

export type NewsAgencyAccess = {
  userId: number
  agency: NewsAgency
}

/**
 * فقط نشست معتبر می خواهد.
 * برای صفحاتی مثل «خبرگزاری من» که کاربر بدون خبرگزاری هم باید بتواند وارد شود.
 */
export async function requireNewsSession(): Promise<number> {
  const userinfo = await getUserFromSession()
  const userId = userinfo?.id

  if (!userId) {
    redirect('/')
  }

  return userId
}

/** نشست کاربر + خبرگزاری متعلق به او (بدون بررسی وضعیت اشتراک) */
export async function requireNewsAgencyAccess(): Promise<NewsAgencyAccess> {
  const userinfo = await getUserFromSession()
  const userId = userinfo?.id

  if (!userId) {
    redirect('/')
  }

  const agency = await getNewsAgencyByUserId(userId)

  if (!agency) {
    redirect('/myNewsAgency')
  }

  return { userId, agency }
}
