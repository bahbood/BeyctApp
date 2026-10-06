// app/(Occupations)/lib/syncServicemanActive.ts
// پرچم serviceman_active کاربر باید همیشه با وجود حداقل یک خدمت فعال و منقضی نشده هماهنگ باشد

import 'server-only'

import { db } from '@/app/db'
import { services, users } from '@/app/db/schema'
import { and, eq, gt, sql } from 'drizzle-orm'

/** به روزرسانی پرچم «خدمات فعال» کاربر بر اساس وضعیت فعلی خدمات او */
export async function syncServicemanActive(userId: number): Promise<void> {
  const [{ hasActive }] = await db
    .select({ hasActive: sql<boolean>`count(*) > 0` })
    .from(services)
    .where(
      and(
        eq(services.user_id, userId),
        eq(services.service_status, 'active'),
        gt(services.expired_at, new Date()),
      ),
    )

  await db.update(users).set({ serviceman_active: hasActive }).where(eq(users.id, userId))
}
