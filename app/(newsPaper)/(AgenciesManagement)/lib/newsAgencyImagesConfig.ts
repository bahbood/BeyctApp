// app/(newsPaper)/(AgenciesManagement)/lib/newsAgencyImagesConfig.ts
// ثابت‌ها و کمک‌تابع‌های امن برای استفاده در کامپوننت‌های کلاینت (بدون server-only و بدون fs)

/** مسیر عمومی تصاویر خبرگزاری در public/newsAgencyImages */
export const NEWS_AGENCY_IMAGES_PUBLIC_PREFIX = '/newsAgencyImages'

export const NEWS_AGENCY_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
export const NEWS_AGENCY_RECEIPT_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf']

/** لوگو باید مربع (۱:۱) و حداکثر ۱۵۰ کیلوبایت باشد */
export const MAX_LOGO_SIZE = 150 * 1024

/** بنر حداکثر ۲۰۰ کیلوبایت */
export const MAX_BANNER_SIZE = 200 * 1024

/** رسید واریز بانکی (می تواند PDF باشد) */
export const MAX_RECEIPT_SIZE = 5 * 1024 * 1024

export type NewsAgencyImageKind = 'logo' | 'banner' | 'receipt'

const baseName = (name: string) => name.split(/[\\/]/).pop() ?? ''

/** مسیر عمومی تصویر برای نمایش در مرورگر */
export function newsAgencyImageUrl(filename: string | null | undefined): string {
  if (!filename) return ''
  return `${NEWS_AGENCY_IMAGES_PUBLIC_PREFIX}/${encodeURIComponent(baseName(filename))}`
}

/** اعتبارسنجی نام فایل ارسالی از فرم (جلوگیری از path traversal) */
export function isSafeNewsAgencyImageName(
  filename: string,
  kind: NewsAgencyImageKind = 'logo',
): boolean {
  if (!filename || filename.includes('/') || filename.includes('\\')) return false
  const dot = filename.lastIndexOf('.')
  const ext = dot > 0 ? filename.slice(dot).toLowerCase() : ''
  const allowed =
    kind === 'receipt' ? NEWS_AGENCY_RECEIPT_EXTENSIONS : NEWS_AGENCY_IMAGE_EXTENSIONS
  return allowed.includes(ext)
}
