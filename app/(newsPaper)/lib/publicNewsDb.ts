// app/(newsPaper)/lib/publicNewsDb.ts
// کوئری‌های بخش عمومی خبرنامه (فقط اخبار منتشر شده و در بازه اعتبار)

import 'server-only'
import { db } from '@/app/db'
import { news, newsAgencies, newsImages, newsLikes } from '@/app/db/schema'
import { and, count, desc, eq, gt, inArray, isNull, or, sql } from 'drizzle-orm'
import { getImagesForNews } from '@/app/(newsPaper)/(AgenciesManagement)/lib/newsDb'
import type { NewsImage } from '@/app/db/schema'

/** تعداد اخبار در هر صفحه از لیست عمومی */
export const PUBLIC_NEWS_PAGE_SIZE = 10

/**
 * شرط دیده شدن یک خبر در بخش عمومی خبرنامه:
 * - خبرگزاری تایید شده، دارای اشتراک فعال، از دسترس خارج نشده و on_air روشن
 * - خبر on_air روشن، از دسترس خارج نشده، منتشر شده و بایگانی نشده
 */
export function publicNewsVisibility() {
  return and(
    eq(news.on_air, true),
    eq(news.is_outofaccess, false),
    // تاریخ انتشار گذشته باشد
    sql`${news.published_at} <= now()`,
    // یا تاریخ بایگانی تنظیم نشده باشد یا هنوز نرسیده باشد
    or(isNull(news.archive_at), gt(news.archive_at, sql`now()`)),

    eq(newsAgencies.news_agency_status, 'active'),
    eq(newsAgencies.on_air, true),
    eq(newsAgencies.is_outofaccess, false),
    sql`${newsAgencies.expired_at} >= now()`
  )
}

/** ردیف لیست عمومی — بدون متن کامل خبر تا بار کوئری کم بماند */
export type PublicNewsListItem = {
  id: number
  headline: string
  sub_headline: string | null
  body: string
  news_category: string | null
  news_source: string | null
  reporter: string | null
  is_breaking: boolean | null
  view_count: number
  published_at: Date
  archive_at: Date | null
  news_agency_id: number
  news_agency_name: string
  news_agency_logo: string | null
}

export type PublicNewsDetail = PublicNewsListItem & {
  body: string
  images: NewsImage[]
}

const publicNewsListColumns = {
  id: news.id,
  headline: news.headline,
  sub_headline: news.sub_headline,
  body:news.body,
  news_category: news.news_category,
  news_source: news.news_source,
  reporter: news.reporter,
  is_breaking: news.is_breaking,
  view_count: news.view_count,
  published_at: news.published_at,
  archive_at: news.archive_at,
  news_agency_id: news.news_agency_id,
  news_agency_name: newsAgencies.news_agency_name,
  news_agency_logo: newsAgencies.news_agency_logo,
}

/**
 * لیست عمومی اخبار همراه نام و لوگوی خبرگزاری — صفحه بندی شده.
 * `body` عمدا از این پروژه حذف شده چون در کارت لیست نمایش داده نمی شود.
 */
export async function getPublicNewsList(
  options: { page?: number; pageSize?: number } = {},
): Promise<{ rows: PublicNewsListItem[]; total: number }> {
  const { page = 1, pageSize = PUBLIC_NEWS_PAGE_SIZE } = options
  const offset = (Math.max(1, page) - 1) * pageSize
  const where = publicNewsVisibility()

  const [{ total }] = await db
    .select({ total: count() })
    .from(news)
    .innerJoin(newsAgencies, eq(news.news_agency_id, newsAgencies.id))
    .where(where)

  const rows = await db
    .select(publicNewsListColumns)
    .from(news)
    .innerJoin(newsAgencies, eq(news.news_agency_id, newsAgencies.id))
    .where(where)
    .orderBy(desc(news.published_at), desc(news.id))
    .limit(pageSize)
    .offset(offset)

  return { rows, total: total ?? 0 }
}

/** یک خبر عمومی به همراه تصاویر و اطلاعات خبرگزاری */
export async function getPublicNewsById(newsId: number): Promise<PublicNewsDetail | null> {
  const [row] = await db
    .select({ ...publicNewsListColumns, body: news.body })
    .from(news)
    .innerJoin(newsAgencies, eq(news.news_agency_id, newsAgencies.id))
    .where(and(eq(news.id, newsId), publicNewsVisibility()))
    .limit(1)

  if (!row) return null

  const images = await db
    .select()
    .from(newsImages)
    .where(eq(newsImages.news_id, newsId))
    .orderBy(newsImages.position)

  return { ...row, images }
}

/** شمارش پسندها برای چند خبر به صورت یکجا — مثال: Map { 12: 5, 19: 2 } */
export async function getLikeCounts(newsIds: number[]): Promise<Map<number, number>> {
  const counts = new Map<number, number>()
  if (newsIds.length === 0) return counts

  const rows = await db
    .select({ newsId: newsLikes.news_id, total: count() })
    .from(newsLikes)
    .where(inArray(newsLikes.news_id, newsIds))
    .groupBy(newsLikes.news_id)

  for (const row of rows) counts.set(row.newsId, row.total)

  return counts
}

/** شناسه خبرهایی که کاربر مشخص آن‌ها را پسندیده است */
export async function getLikedNewsIds(newsIds: number[], userId: number): Promise<Set<number>> {
  if (newsIds.length === 0) return new Set()

  const rows = await db
    .select({ newsId: newsLikes.news_id })
    .from(newsLikes)
    .where(and(inArray(newsLikes.news_id, newsIds), eq(newsLikes.user_id, userId)))

  return new Set(rows.map((row) => row.newsId))
}

/** افزایش شمارنده بازدید یک خبر */
export async function incrementNewsViewCount(newsId: number): Promise<void> {
  await db
    .update(news)
    .set({ view_count: sql`${news.view_count} + 1` })
    .where(eq(news.id, newsId))
}

/** تصاویر یک خبر برای نمایش در کارت لیست عمومی */
export async function getNewsImagesMap(newsIds: number[]) {
  return getImagesForNews(newsIds)
}
