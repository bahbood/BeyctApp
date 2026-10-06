// app/(newsPaper)/lib/getNewsAgencyByUserId.ts

import { db } from '@/app/db'
import { newsAgencies } from '@/app/db/schema'
import { eq } from 'drizzle-orm'

export async function getNewsAgencyByUserId(userId: number) {
  const result = await db
    .select()
    .from(newsAgencies)
    .where(eq(newsAgencies.user_id, userId))
    .limit(1)

  return result[0] || null
}