import { db } from '@/app/db'
import { stores } from '@/app/db/schema'
import { eq } from 'drizzle-orm'

export async function getStoreByUserId(userId: number) {
  const result = await db
    .select()
    .from(stores)
    .where(eq(stores.user_id, userId))
    .limit(1)

  return result[0] || null
}
