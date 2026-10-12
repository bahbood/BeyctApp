// app/(newsPaper)/lib/publicNewsDb.ts
// کوئری‌های بخش عمومی خبرنامه (فقط اخبار منتشر شده و در بازه اعتبار)

import 'server-only'
import { db } from '@/app/db'
import { news, newsAgencies, newsImages, newsLikes, newsComments, newsReads, users } from '@/app/db/schema'
import { and, asc, count, desc, eq, gt, inArray, isNull, or, sql } from 'drizzle-orm'
import { getImagesForNews } from '@/app/(newsPaper)/(AgenciesManagement)/lib/newsDb'
import { toJalaaliInput } from '@/app/lib/jalaliDate'
import { NEWS_STREAM_PAGE_SIZE } from '@/app/(newsPaper)/lib/newsStreamTypes'
import type {
  NewsStreamCursor,
  NewsStreamDirection,
  NewsStreamInitialState,
  PublicNewsStreamItem,
} from '@/app/(newsPaper)/lib/newsStreamTypes'
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
  comments_enabled: boolean
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
  comments_enabled: news.comments_enabled,
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

// ─────────────────────────────────────────────────────────────
// جریان پیوسته اخبار (بدون صفحه بندی) بر پایه کرسر (published_at, id)
// ─────────────────────────────────────────────────────────────

/** شرط کرسر: اخبار قدیمی‌تر/جدیدتر از یک نقطه مشخص — مقایسه در خود دیتابیس برای حفظ دقت کامل زمان */
function streamCursorWhere(cursorId: number | null | undefined, direction: NewsStreamDirection) {
  if (cursorId === null || cursorId === undefined) return undefined
  const anchor = sql`(select a.published_at, a.id from news a where a.id = ${cursorId})`
  const tuple = sql`(${news.published_at}, ${news.id})`
  return direction === 'older' ? sql`${tuple} < ${anchor}` : sql`${tuple} > ${anchor}`
}

/** شرط کرسر شامل خود نقطه: (published_at, id) <= cursor */
function streamAtOrBeforeWhere(cursorId: number) {
  return sql`(${news.published_at}, ${news.id}) <= (select a.published_at, a.id from news a where a.id = ${cursorId})`
}

/**
 * یک صفحه از جریان اخبار در جهت مشخص.
 * `rows` همیشه از جدید به قدیم مرتب است؛ `hasMore` یعنی فراتر از این صفحه آیتم دیگری هست.
 */
export async function getNewsStreamPage(options: {
  cursor: NewsStreamCursor
  direction: NewsStreamDirection
  limit?: number
}): Promise<{ rows: PublicNewsListItem[]; hasMore: boolean }> {
  const { cursor, direction, limit = NEWS_STREAM_PAGE_SIZE } = options
  const where = and(publicNewsVisibility(), streamCursorWhere(cursor?.id, direction))

  const rows = await db
    .select(publicNewsListColumns)
    .from(news)
    .innerJoin(newsAgencies, eq(news.news_agency_id, newsAgencies.id))
    .where(where)
    .orderBy(
      direction === 'older' ? desc(news.published_at) : asc(news.published_at),
      direction === 'older' ? desc(news.id) : asc(news.id),
    )
    .limit(limit + 1)

  const hasMore = rows.length > limit
  const pageRows = rows.slice(0, limit)

  // در جهت «جدیدتر» نزدیک‌ترین آیتم‌ها ابتدا آمده‌اند؛ برای نمایش از جدید به قدیم برمی‌گردانیم
  return { rows: direction === 'newer' ? pageRows.reverse() : pageRows, hasMore }
}

/**
 * نخستین خبر خوانده‌نشده کاربر (جدیدترین خبر بدون رکورد خوانده شدن).
 * اگر کاربر مهمان باشد یا همه اخبار را خوانده باشد، جدیدترین خبر برمی‌گردد.
 */
export async function getNewsStreamAnchor(userId: number | null): Promise<NewsStreamCursor> {
  if (userId) {
    const [unread] = await db
      .select({ published_at: news.published_at, id: news.id })
      .from(news)
      .innerJoin(newsAgencies, eq(news.news_agency_id, newsAgencies.id))
      .leftJoin(newsReads, and(eq(newsReads.news_id, news.id), eq(newsReads.user_id, userId)))
      .where(and(publicNewsVisibility(), isNull(newsReads.id)))
      .orderBy(desc(news.published_at), desc(news.id))
      .limit(1)

    if (unread) return { publishedAt: unread.published_at.toISOString(), id: unread.id }
  }

  const [newest] = await db
    .select({ published_at: news.published_at, id: news.id })
    .from(news)
    .innerJoin(newsAgencies, eq(news.news_agency_id, newsAgencies.id))
    .where(publicNewsVisibility())
    .orderBy(desc(news.published_at), desc(news.id))
    .limit(1)

  return newest ? { publishedAt: newest.published_at.toISOString(), id: newest.id } : null
}

/**
 * پنجره اولیه جریان: نخستین خبر خوانده‌نشده به همراه یک خبر قبل (جدیدتر) و یک خبر بعد (قدیمی‌تر).
 */
export async function getPublicNewsStreamInitial(userId: number | null): Promise<PublicNewsListItem[]> {
  const anchor = await getNewsStreamAnchor(userId)
  if (!anchor) return []

  const [following, preceding] = await Promise.all([
    // خود خبر لنگر و یک خبر قدیمی‌تر بعد از آن
    db
      .select(publicNewsListColumns)
      .from(news)
      .innerJoin(newsAgencies, eq(news.news_agency_id, newsAgencies.id))
      .where(and(publicNewsVisibility(), streamAtOrBeforeWhere(anchor.id)))
      .orderBy(desc(news.published_at), desc(news.id))
      .limit(2),
    // یک خبر جدیدتر قبل از لنگر
    getNewsStreamPage({ cursor: anchor, direction: 'newer', limit: 1 }),
  ])

  return [...preceding.rows, ...following]
}

/** تبدیل ردیف‌های لیست به آیتم‌های آماده جریان (تصاویر، پسند، دیدگاه و وضعیت خوانده شدن) */
export async function getPublicNewsStreamItems(
  rows: PublicNewsListItem[],
  userId: number | null,
): Promise<PublicNewsStreamItem[]> {
  if (rows.length === 0) return []

  const ids = rows.map((row) => row.id)
  const [imagesMap, likeCounts, likedIds, commentCounts, readIds] = await Promise.all([
    getNewsImagesMap(ids),
    getLikeCounts(ids),
    userId ? getLikedNewsIds(ids, userId) : Promise.resolve(new Set<number>()),
    getNewsCommentCounts(ids),
    userId ? getReadNewsIds(ids, userId) : Promise.resolve(new Set<number>()),
  ])

  return rows.map((item) => ({
    id: item.id,
    headline: item.headline,
    sub_headline: item.sub_headline,
    body: item.body,
    news_category: item.news_category,
    news_source: item.news_source,
    reporter: item.reporter,
    view_count: item.view_count,
    comments_enabled: item.comments_enabled,
    comment_count: commentCounts.get(item.id) ?? 0,
    published_label: toJalaaliInput(item.published_at),
    published_at: item.published_at.toISOString(),
    news_agency_name: item.news_agency_name,
    image_names: (imagesMap.get(item.id) ?? []).map((img) => img.image_name),
    liked: likedIds.has(item.id),
    like_count: likeCounts.get(item.id) ?? 0,
    is_read: readIds.has(item.id),
  }))
}

/** وضعیت اولیه جریان برای رندر سمت سرور */
export async function getPublicNewsStreamInitialState(
  userId: number | null,
): Promise<NewsStreamInitialState> {
  const rows = await getPublicNewsStreamInitial(userId)
  if (rows.length === 0) return { items: [], hasOlder: false, hasNewer: false }

  const top = rows[0]
  const bottom = rows[rows.length - 1]

  const [olderProbe, newerProbe, items] = await Promise.all([
    db
      .select({ id: news.id })
      .from(news)
      .innerJoin(newsAgencies, eq(news.news_agency_id, newsAgencies.id))
      .where(
        and(
          publicNewsVisibility(),
          streamCursorWhere(bottom.id, 'older'),
        ),
      )
      .limit(1),
    db
      .select({ id: news.id })
      .from(news)
      .innerJoin(newsAgencies, eq(news.news_agency_id, newsAgencies.id))
      .where(
        and(
          publicNewsVisibility(),
          streamCursorWhere(top.id, 'newer'),
        ),
      )
      .limit(1),
    getPublicNewsStreamItems(rows, userId),
  ])

  return {
    items,
    hasOlder: olderProbe.length > 0,
    hasNewer: newerProbe.length > 0,
  }
}

/** شناسه خبرهایی که کاربر مشخص قبلا خوانده است */
export async function getReadNewsIds(newsIds: number[], userId: number): Promise<Set<number>> {
  if (newsIds.length === 0) return new Set()

  const rows = await db
    .select({ newsId: newsReads.news_id })
    .from(newsReads)
    .where(and(inArray(newsReads.news_id, newsIds), eq(newsReads.user_id, userId)))

  return new Set(rows.map((row) => row.newsId))
}

/** ثبت خوانده شدن یک خبر توسط کاربر — تکراری بودن خطا ایجاد نمی‌کند */
export async function markNewsRead(newsId: number, userId: number): Promise<void> {
  await db
    .insert(newsReads)
    .values({ news_id: newsId, user_id: userId })
    .onConflictDoNothing()
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

/** یک دیدگاه به همراه نام نویسنده */
export type PublicNewsComment = {
  id: number
  body: string
  created_at: Date
  user_id: number
  user_name: string
  user_family: string | null
}

/** فهرست دیدگاه‌های یک خبر به ترتیب قدیمی‌ترین → جدیدترین */
export async function getNewsComments(newsId: number): Promise<PublicNewsComment[]> {
  return db
    .select({
      id: newsComments.id,
      body: newsComments.body,
      created_at: newsComments.created_at,
      user_id: newsComments.user_id,
      user_name: users.user_name,
      user_family: users.family,
    })
    .from(newsComments)
    .innerJoin(users, eq(newsComments.user_id, users.id))
    .where(eq(newsComments.news_id, newsId))
    .orderBy(asc(newsComments.created_at), asc(newsComments.id))
}

/** شمارش دیدگاه‌ها برای چند خبر به صورت یکجا — مثال: Map { 12: 5, 19: 2 } */
export async function getNewsCommentCounts(newsIds: number[]): Promise<Map<number, number>> {
  const counts = new Map<number, number>()
  if (newsIds.length === 0) return counts

  const rows = await db
    .select({ newsId: newsComments.news_id, total: count() })
    .from(newsComments)
    .where(inArray(newsComments.news_id, newsIds))
    .groupBy(newsComments.news_id)

  for (const row of rows) counts.set(row.newsId, row.total)

  return counts
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
