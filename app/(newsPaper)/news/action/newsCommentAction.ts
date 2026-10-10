// app/(newsPaper)/news/action/newsCommentAction.ts

'use server'

import { getUserFromSession } from '@/app/(Auth)/lib/session'
import { db } from '@/app/db'
import { news, newsComments } from '@/app/db/schema'
import { eq } from 'drizzle-orm'
import { getNewsComments } from '@/app/(newsPaper)/lib/publicNewsDb'
import { MAX_COMMENT_LENGTH, type NewsCommentView } from '@/app/(newsPaper)/lib/newsCommentTypes'

export type NewsCommentState =
  | { success: true; comment: NewsCommentView }
  | { success: false; errors: { message: string } }

/** خواندن دیدگاه‌های یک خبر (به صورت درخواستی هنگام باز کردن بخش دیدگاه‌ها) */
export async function fetchNewsCommentsAction(newsId: number): Promise<NewsCommentView[]> {
  if (!Number.isFinite(newsId)) return []

  const rows = await getNewsComments(newsId)
  return rows.map((row) => ({
    id: row.id,
    body: row.body,
    created_at: row.created_at.toISOString(),
    user_id: row.user_id,
    user_name: row.user_name,
    user_family: row.user_family,
  }))
}

/** ثبت دیدگاه جدید — فقط کاربران وارد شده و برای خبرهایی که دیدگاه‌گیری آن‌ها فعال است */
export async function createNewsCommentAction(
  newsId: number,
  body: string,
): Promise<NewsCommentState> {
  const userinfo = await getUserFromSession()
  if (!userinfo?.id) {
    return { success: false, errors: { message: 'برای ثبت دیدگاه باید وارد سایت شوید' } }
  }

  const text = (body || '').trim()
  if (text.length === 0) {
    return { success: false, errors: { message: 'متن دیدگاه نمی‌تواند خالی باشد' } }
  }
  if (text.length > MAX_COMMENT_LENGTH) {
    return { success: false, errors: { message: `متن دیدگاه حداکثر ${MAX_COMMENT_LENGTH} کاراکتر` } }
  }

  const [target] = await db
    .select({ id: news.id, comments_enabled: news.comments_enabled })
    .from(news)
    .where(eq(news.id, newsId))
    .limit(1)

  if (!target) {
    return { success: false, errors: { message: 'خبر یافت نشد' } }
  }
  if (!target.comments_enabled) {
    return { success: false, errors: { message: 'امکان ثبت دیدگاه برای این خبر غیرفعال است' } }
  }

  const [inserted] = await db
    .insert(newsComments)
    .values({ news_id: newsId, user_id: userinfo.id, body: text })
    .returning({ id: newsComments.id, created_at: newsComments.created_at })

  return {
    success: true,
    comment: {
      id: inserted.id,
      body: text,
      created_at: inserted.created_at.toISOString(),
      user_id: userinfo.id,
      user_name: userinfo.name || '',
      user_family: userinfo.family || null,
    },
  }
}
