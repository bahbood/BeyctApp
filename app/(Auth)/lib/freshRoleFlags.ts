// app/(Auth)/lib/freshRoleFlags.ts

import 'server-only'

import { db } from '@/app/db'
import { users } from '@/app/db/schema'
import { eq } from 'drizzle-orm'
import type { logined_User_Info } from '@/app/components/(Flyouts)/(Provider)/FlyoutPageContextProvider'

/**
 * پرچم‌های فعال بودن نقش‌ها (store_active و ...) داخل توکن نشست کش می‌شوند و
 * تا زمان خروج/ورود مجدد به‌روز نمی‌شوند. به همین دلیل پس از تایید یا حذف
 * فروشگاه، منوی کناری تا مدت زمانی نامناسب نشان داده می‌شد.
 *
 * چون چیدمان اصلی در هر درخواست اجرا می‌شود، خواندن این پرچم‌ها از دیتابیس
 * باعث می‌شود منو بلافاصله پس از تغییر وضعیت به‌روز شود، بدون آنکه
 * نیازی به دستکاری کوکی یا خروج/ورود مجدد باشد.
 */
export async function withFreshRoleFlags(user: logined_User_Info | null): Promise<logined_User_Info | null> {
  if (!user?.id) return user

  try {
    const [row] = await db
      .select({
        store_active: users.store_active,
        news_agency_active: users.news_agency_active,
        serviceman_active: users.serviceman_active,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)

    if (!row) return user

    return {
      ...user,
      store_active: row.store_active ?? false,
      news_agency_active: row.news_agency_active ?? false,
      serviceman_active: row.serviceman_active ?? false,
    }
  } catch (error) {
    // در صورت خطا، همان اطلاعات نشست نمایش داده می‌شود تا صفحه خراب نشود
    console.error('withFreshRoleFlags error:', error)
    return user
  }
}