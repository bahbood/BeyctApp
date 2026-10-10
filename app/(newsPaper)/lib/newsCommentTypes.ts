// app/(newsPaper)/lib/newsCommentTypes.ts
// نوع امن برای کلاینت (بدون وابستگی به server-only)

/** حداکثر طول متن یک دیدگاه */
export const MAX_COMMENT_LENGTH = 1000

export type NewsCommentView = {
  id: number
  body: string
  /** تاریخ ثبت دیدگاه به صورت ISO — در کلاینت تبدیل می‌شود */
  created_at: string
  user_id: number
  user_name: string
  user_family: string | null
}
