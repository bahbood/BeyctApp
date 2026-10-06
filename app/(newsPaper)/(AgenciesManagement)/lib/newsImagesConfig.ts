// app/(newsPaper)/(AgenciesManagement)/lib/newsImagesConfig.ts
// ثابت‌ها و کمک‌تابع‌های امن برای استفاده در کامپوننت‌های کلاینت (بدون server-only و بدون fs)

/** مسیر عمومی تصاویر خبر در public/newsImages/newsIMGs */
export const NEWS_IMAGES_PUBLIC_PREFIX = '/newsImages/newsIMGs'

export const NEWS_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

/** حداکثر حجم هر تصویر خبر: ۲۰۰ کیلوبایت */
export const MAX_FILE_SIZE = 200 * 1024

/** حداکثر تعداد تصویر برای هر خبر */
export const MAX_IMAGES_PER_NEWS = 5

export function newsImageSizeLabel(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${Math.round(bytes / 1024 / 1024)}MB`
    : `${Math.round(bytes / 1024)}KB`
}

const baseName = (name: string) => name.split(/[\\/]/).pop() ?? ''

/** مسیر عمومی تصویر برای نمایش در مرورگر */
export function newsImageUrl(filename: string | null | undefined): string {
  if (!filename) return ''
  return `${NEWS_IMAGES_PUBLIC_PREFIX}/${encodeURIComponent(baseName(filename))}`
}

/** اعتبارسنجی نام فایل ارسالی از فرم (جلوگیری از path traversal) */
export function isSafeNewsImageName(filename: string): boolean {
  if (!filename || filename.includes('/') || filename.includes('\\')) return false
  const dot = filename.lastIndexOf('.')
  const ext = dot > 0 ? filename.slice(dot).toLowerCase() : ''
  return NEWS_IMAGE_EXTENSIONS.includes(ext)
}
