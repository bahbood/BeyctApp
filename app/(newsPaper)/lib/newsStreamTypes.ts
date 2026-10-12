// app/(newsPaper)/lib/newsStreamTypes.ts
// تایپ‌های مشترک جریان اخبار (قابل استفاده در کلاینت و سرور — بدون server-only)

/** یک آیتم آماده نمایش در جریان اخبار (سریالایز شده و قابل ارسال به کلاینت) */
export type PublicNewsStreamItem = {
  id: number
  headline: string
  sub_headline: string | null
  body: string
  news_category: string | null
  news_source: string | null
  reporter: string | null
  view_count: number
  comments_enabled: boolean
  comment_count: number
  published_label: string
  /** تاریخ انتشار به صورت ISO برای استفاده در کرسر */
  published_at: string
  news_agency_name: string
  image_names: string[]
  liked: boolean
  like_count: number
  is_read: boolean
}

/** کرسر جریان بر اساس (published_at, id) — null یعنی از ابتدا/انتها */
export type NewsStreamCursor = { publishedAt: string; id: number } | null

/** جهت بارگذاری: older = پایین‌تر (قدیمی‌تر)، newer = بالا (جدیدتر/خوانده‌شده) */
export type NewsStreamDirection = 'older' | 'newer'

/** خروجی یک صفحه از جریان */
export type NewsStreamPage = {
  items: PublicNewsStreamItem[]
  hasMore: boolean
}

/** وضعیت اولیه جریان که سمت سرور محاسبه می‌شود */
export type NewsStreamInitialState = {
  items: PublicNewsStreamItem[]
  hasOlder: boolean
  hasNewer: boolean
}

/** تعداد آیتم‌هایی که در هر بار اسکرول/کلیک «خبرهای بیشتر» بارگذاری می‌شود */
export const NEWS_STREAM_PAGE_SIZE = 6
