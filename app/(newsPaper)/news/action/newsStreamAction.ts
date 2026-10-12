// app/(newsPaper)/news/action/newsStreamAction.ts
// اکشن‌های جریان پیوسته اخبار (بارگذاری بیشتر + ثبت خوانده شدن)

'use server'

import { getUserFromSession } from '@/app/(Auth)/lib/session'
import {
  getNewsStreamPage,
  getPublicNewsStreamItems,
  markNewsRead,
} from '@/app/(newsPaper)/lib/publicNewsDb'
import type {
  NewsStreamCursor,
  NewsStreamDirection,
  NewsStreamPage,
} from '@/app/(newsPaper)/lib/newsStreamTypes'

/** اعتبارسنجی کرسر دریافتی از کلاینت */
function parseCursor(input: unknown): NewsStreamCursor {
  if (!input || typeof input !== 'object') return null

  const { publishedAt, id } = input as { publishedAt?: unknown; id?: unknown }
  const numericId = Number(id)
  if (typeof publishedAt !== 'string' || !Number.isFinite(numericId)) return null

  const date = new Date(publishedAt)
  if (Number.isNaN(date.getTime())) return null

  return { publishedAt: date.toISOString(), id: numericId }
}

/** بارگذاری یک صفحه دیگر از جریان در جهت قدیمی‌تر یا جدیدتر */
export async function loadNewsStreamAction(
  direction: NewsStreamDirection,
  cursor: NewsStreamCursor,
): Promise<NewsStreamPage> {
  if (direction !== 'older' && direction !== 'newer') {
    return { items: [], hasMore: false }
  }

  const userinfo = await getUserFromSession()
  const userId = userinfo?.id ?? null

  const { rows, hasMore } = await getNewsStreamPage({ cursor: parseCursor(cursor), direction })
  const items = await getPublicNewsStreamItems(rows, userId)

  return { items, hasMore }
}

/** ثبت خوانده شدن یک خبر توسط کاربر وارد شده (برای مهمان کاری انجام نمی‌شود) */
export async function markNewsReadAction(newsId: number): Promise<{ success: boolean }> {
  const userinfo = await getUserFromSession()
  if (!userinfo?.id || !Number.isFinite(newsId)) return { success: false }

  await markNewsRead(newsId, userinfo.id)
  return { success: true }
}
