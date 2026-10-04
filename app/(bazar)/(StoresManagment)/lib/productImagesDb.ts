// app/(bazar)/(StoresManagment)/lib/productImagesDb.ts
// ذخیره‌سازی تصاویر محصول در public/storeImages/productsIMGs
// الگوی نام فایل: {userId}_{تاریخ شمسی}_{کد یکتا} — مثال: 10_14050331_a56bcd8e9

import 'server-only'
import { mkdir, unlink, writeFile, access } from 'fs/promises'
import { constants } from 'fs'
import path from 'path'
import { randomInt } from 'crypto'
import { jalaaliStamp } from '@/app/lib/jalaliDate'

const PRODUCT_IMAGES_DIR = path.join(process.cwd(), 'public', 'storeImages', 'productsIMGs')
const PUBLIC_URL_PREFIX = '/storeImages/productsIMGs'

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

/** حداکثر حجم هر تصویر: ۳۰۰ کیلوبایت */
export const MAX_FILE_SIZE = 300 * 1024

/** حداکثر تعداد تصویر برای هر محصول */
export const MAX_IMAGES_PER_PRODUCT = 3

const CODE_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'
const CODE_LENGTH = 9

/** خطای اعتبارسنجی فایل که باید به کاربر نمایش داده شود */
export class ProductImageError extends Error {}

const sizeLabel = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${Math.round(bytes / 1024 / 1024)}MB` : `${Math.round(bytes / 1024)}KB`

/** تولید کد یکتای ۹ کاراکتری — مثال: a56bcd8e9 */
function generateCode(): string {
  let code = ''
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[randomInt(0, CODE_ALPHABET.length)]
  }
  return code
}

async function fileExists(fullPath: string): Promise<boolean> {
  try {
    await access(fullPath, constants.F_OK)
    return true
  } catch {
    return false
  }
}

/**
 * ساخت نام فایل یکتا بر اساس شناسه کاربر، تاریخ شمسی و کد تصادفی.
 * در صورت تکراری بودن نام، کد دوباره ساخته می‌شود.
 */
export async function buildProductImageName(userId: number, ext: string): Promise<string> {
  const stamp = jalaaliStamp()

  for (let attempt = 0; attempt < 10; attempt++) {
    const stored = `${userId}_${stamp}_${generateCode()}${ext}`
    if (!(await fileExists(path.join(PRODUCT_IMAGES_DIR, stored)))) {
      return stored
    }
  }

  throw new ProductImageError('تولید نام فایل تصویر ناموفق بود')
}

/** ذخیره یک تصویر و بازگرداندن نام فایل ذخیره‌شده */
export async function saveProductImage(file: File, userId: number): Promise<string> {
  const ext = path.extname(file.name).toLowerCase()

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new ProductImageError(`فرمت فایل مجاز نیست. فرمت‌های مجاز: ${ALLOWED_EXTENSIONS.join(' , ')}`)
  }
  if (file.size === 0) {
    throw new ProductImageError('فایل انتخاب شده خالی است')
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new ProductImageError(`حجم فایل بیش از حد مجاز است. حداکثر: ${sizeLabel(MAX_FILE_SIZE)}`)
  }

  const stored = await buildProductImageName(userId, ext)

  await mkdir(PRODUCT_IMAGES_DIR, { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(path.join(PRODUCT_IMAGES_DIR, stored), buffer)

  return stored
}

/** حذف فایل تصویر از دیسک */
export async function deleteProductImageFile(filename: string | null | undefined): Promise<void> {
  if (!filename) return

  const safeName = path.basename(filename)
  if (!ALLOWED_EXTENSIONS.includes(path.extname(safeName).toLowerCase())) return

  try {
    await unlink(path.join(PRODUCT_IMAGES_DIR, safeName))
  } catch (error) {
    console.error('deleteProductImageFile error:', error)
  }
}

/** مسیر عمومی تصویر برای نمایش در مرورگر */
export function productImageUrl(filename: string | null | undefined): string {
  if (!filename) return ''
  return `${PUBLIC_URL_PREFIX}/${encodeURIComponent(path.basename(filename))}`
}

/** اعتبارسنجی نام فایل ارسالی از فرم (جلوگیری از path traversal) */
export function isSafeProductImageName(filename: string): boolean {
  return (
    !!filename &&
    path.basename(filename) === filename &&
    ALLOWED_EXTENSIONS.includes(path.extname(filename).toLowerCase())
  )
}
