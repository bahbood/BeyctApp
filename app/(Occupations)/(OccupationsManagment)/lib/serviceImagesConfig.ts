// app/(Occupations)/(OccupationsManagment)/lib/serviceImagesConfig.ts
// ثابت‌ها و کمک‌تابع‌های امن برای استفاده در کامپوننت‌های کلاینت (بدون server-only و بدون fs)

/** مسیر عمومی تصاویر خدمات در public/serviceImages */
export const SERVICE_IMAGES_PUBLIC_PREFIX = '/serviceImages'

export const SERVICE_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
export const SERVICE_RECEIPT_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf']

/**
 * بنر خدمت حداکثر ۱ مگابایت
 * (فرم ثبت/ویرایش فقط همین فایل را می فرستد و باید زیر حد bodySizeLimit دو مگابایتی server action بماند)
 */
export const MAX_BANNER_SIZE = 1024 * 1024

/** رسید واریز اشتراک سالانه حداکثر ۱ مگابایت (همان محدودیت bodySizeLimit) */
export const MAX_RECEIPT_SIZE = 1024 * 1024

export type ServiceImageKind = 'banner' | 'receipt'

const baseName = (name: string) => name.split(/[\\/]/).pop() ?? ''

/** مسیر عمومی تصویر برای نمایش در مرورگر */
export function serviceImageUrl(filename: string | null | undefined): string {
  if (!filename) return ''
  return `${SERVICE_IMAGES_PUBLIC_PREFIX}/${encodeURIComponent(baseName(filename))}`
}

/** اعتبارسنجی نام فایل ارسالی از فرم (جلوگیری از path traversal) */
export function isSafeServiceImageName(filename: string, kind: ServiceImageKind = 'banner'): boolean {
  if (!filename || filename.includes('/') || filename.includes('\\')) return false
  const dot = filename.lastIndexOf('.')
  const ext = dot > 0 ? filename.slice(dot).toLowerCase() : ''
  const allowed = kind === 'receipt' ? SERVICE_RECEIPT_EXTENSIONS : SERVICE_IMAGE_EXTENSIONS
  return allowed.includes(ext)
}
