import 'server-only'
import { db } from '@/app/db'
import { slides } from '@/app/db/schema'
import { eq, desc, and, lte, gte } from 'drizzle-orm'

export async function getAllSlides() {
  return db.select().from(slides).orderBy(desc(slides.order))
}

export async function getSlideById(id: number) {
  const result = await db.select().from(slides).where(eq(slides.id, id))
  return result[0] || null
}

export async function getActiveSlides() {
  const now = new Date()
  return db
    .select()
    .from(slides)
    .where(
      and(
        eq(slides.isActive, true),
        lte(slides.show_startDate, now),
        gte(slides.show_endDate, now)
      )
    )
    .orderBy(desc(slides.order) )
}
