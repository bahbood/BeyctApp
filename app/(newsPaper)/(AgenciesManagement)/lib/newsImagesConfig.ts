// app/(newsPaper)/(AgenciesManagement)/lib/newsImagesConfig.ts
// ثابت‌ها و کمک‌تابع‌های امن برای استفاده در کامپوننت‌های کلاینت (بدون server-only و بدون fs)

export const NEWS_IMAGES_PUBLIC_PREFIX = '/newsImages/newsIMGs'
export const NEWS_IMAGES_OBJECT_PREFIX = '/api/news-images'

export const NEWS_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

/** حداکثر حجم هر تصویر خبر: ۲۰۰ کیلوبایت */
export const MAX_FILE_SIZE = 200 * 1024

/** سقف مجموع حجم تصاویر ارسالی در یک بار ثبت/ویرایش */
export const MAX_TOTAL_IMAGE_SIZE = 800 * 1024

/** حداکثر تعداد تصویر برای هر خبر */
export const MAX_IMAGES_PER_NEWS = 5

export function newsImageSizeLabel(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${Math.round(bytes / 1024 / 1024)}MB`
    : `${Math.round(bytes / 1024)}KB`
}

const baseName = (name: string) => name.split(/[\\/]/).pop() ?? ''

/** نام‌های s3: به API امن سمت سرور هدایت می‌شوند؛ نام‌های قدیمی از مسیر public می‌مانند. */
export function newsImageUrl(filename: string | null | undefined): string {
  if (!filename) return ''
  const name = baseName(filename)

  if (name.startsWith('s3:')) {
    const key = name.slice(3)
    return `${NEWS_IMAGES_OBJECT_PREFIX}/${encodeURIComponent(key)}`
  }

  return `${NEWS_IMAGES_PUBLIC_PREFIX}/${encodeURIComponent(name)}`
}

/** اعتبارسنجی نام فایل ارسالی از فرم (جلوگیری از path traversal) */
export function isSafeNewsImageName(filename: string): boolean {
  if (!filename || filename !== baseName(filename) || filename.includes('/') || filename.includes('\\')) return false
  const dot = filename.lastIndexOf('.')
  const ext = dot > 0 ? filename.slice(dot).toLowerCase() : ''
  return NEWS_IMAGE_EXTENSIONS.includes(ext)
}
