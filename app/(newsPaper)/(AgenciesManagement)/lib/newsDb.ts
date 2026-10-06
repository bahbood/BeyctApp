// app/(newsPaper)/(AgenciesManagement)/lib/newsDb.ts
// کوئری‌های مدیریت اخبار (فقط برای مدیر خود خبرگزاری)

import 'server-only'
import { db } from '@/app/db'
import { news, newsImages } from '@/app/db/schema'
import { asc, count, desc, eq, inArray } from 'drizzle-orm'
import type { NewsImage } from '@/app/db/schema'

/** تعداد اخبار در هر صفحه از لیست مدیریتی خبرگزاری */
export const AGENCY_NEWS_PAGE_SIZE = 10

/** ستون هایی که کارت لیست مدیریتی واقعا استفاده می کند — بدون `body` */
export type AgencyNewsListItem = {
  id: number
  headline: string
  sub_headline: string | null
  on_air: boolean | null
  is_breaking: boolean | null
  comments_enabled: boolean
  published_at: Date
  archive_at: Date | null
}

const agencyNewsListColumns = {
  id: news.id,
  headline: news.headline,
  sub_headline: news.sub_headline,
  on_air: news.on_air,
  is_breaking: news.is_breaking,
  comments_enabled: news.comments_enabled,
  published_at: news.published_at,
  archive_at: news.archive_at,
}

/**
 * لیست صفحه بندی شده اخبار یک خبرگزاری همراه تصاویرش، جدیدترین ابتدا.
 * متن کامل خبر (`body`) لود نمی شود چون در لیست نمایش داده نمی شود.
 */
export async function getNewsListByAgencyId(
  agencyId: number,
  options: { page?: number; pageSize?: number } = {},
): Promise<{ rows: (AgencyNewsListItem & { images: NewsImage[] })[]; total: number }> {
  const { page = 1, pageSize = AGENCY_NEWS_PAGE_SIZE } = options
  const offset = (Math.max(1, page) - 1) * pageSize

  const [{ total }] = await db
    .select({ total: count() })
    .from(news)
    .where(eq(news.news_agency_id, agencyId))

  const rows = await db
    .select(agencyNewsListColumns)
    .from(news)
    .where(eq(news.news_agency_id, agencyId))
    .orderBy(desc(news.created_at), desc(news.id))
    .limit(pageSize)
    .offset(offset)

  const imagesByNews = await getImagesForNews(rows.map((row) => row.id))

  return {
    rows: rows.map((row) => ({
      ...row,
      images: imagesByNews.get(row.id) ?? [],
    })),
    total: total ?? 0,
  }
}

/** تصاویر چند خبر به صورت یکجا، گروه بندی شده بر اساس شناسه خبر */
export async function getImagesForNews(newsIds: number[]): Promise<Map<number, NewsImage[]>> {
  const grouped = new Map<number, NewsImage[]>()

  if (newsIds.length === 0) return grouped

  const rows = await db
    .select()
    .from(newsImages)
    .where(inArray(newsImages.news_id, newsIds))
    .orderBy(asc(newsImages.position))

  for (const row of rows) {
    const list = grouped.get(row.news_id)
    if (list) list.push(row)
    else grouped.set(row.news_id, [row])
  }

  return grouped
}
