// app/(newsPaper)/(AgenciesManagement)/lib/newsImagesDb.ts
// خبرهای جدید در Neon Object Storage ذخیره می‌شوند؛ نام‌های قدیمی همچنان از public خوانده می‌شوند.

import 'server-only'
import { mkdir, unlink, writeFile, access } from 'fs/promises'
import { constants } from 'fs'
import path from 'path'
import { randomInt } from 'crypto'
import { jalaaliStamp } from '@/app/lib/jalaliDate'
import {
  NEWS_IMAGE_EXTENSIONS,
  MAX_FILE_SIZE,
  MAX_IMAGES_PER_NEWS,
  MAX_TOTAL_IMAGE_SIZE,
  newsImageSizeLabel as sizeLabel,
  newsImageUrl,
  isSafeNewsImageName,
} from './newsImagesConfig'
import {
  deleteNewsObject,
  isNewsObjectStorageConfigured,
  putNewsObject,
} from './newsObjectStorage'

const NEWS_IMAGES_DIR = path.join(process.cwd(), 'public', 'newsImages', 'newsIMGs')

export { MAX_FILE_SIZE, MAX_IMAGES_PER_NEWS, MAX_TOTAL_IMAGE_SIZE, newsImageUrl, isSafeNewsImageName }

const ALLOWED_EXTENSIONS = NEWS_IMAGE_EXTENSIONS
const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
}

const CODE_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'
const CODE_LENGTH = 9

/** خطای اعتبارسنجی فایل که باید به کاربر نمایش داده شود */
export class NewsImageError extends Error {}

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
 * در فضای ابری احتمال برخورد بسیار پایین است؛ برای فایل‌های محلی هم نام بررسی می‌شود.
 */
export async function buildNewsImageName(userId: number, ext: string): Promise<string> {
  const stamp = jalaaliStamp()

  for (let attempt = 0; attempt < 10; attempt++) {
    const stored = `${userId}_${stamp}_${generateCode()}${ext}`
    if (!(await fileExists(path.join(NEWS_IMAGES_DIR, stored)))) {
      return stored
    }
  }

  throw new NewsImageError('تولید نام فایل تصویر ناموفق بود')
}

/** ذخیره تصویر در Neon Object Storage و بازگرداندن نام ذخیره‌سازی‌شده */
export async function saveNewsImage(file: File, userId: number): Promise<string> {
  const ext = path.extname(file.name).toLowerCase()

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new NewsImageError(`فرمت فایل مجاز نیست. فرمت‌های مجاز: ${ALLOWED_EXTENSIONS.join(' , ')}`)
  }
  if (file.size === 0) {
    throw new NewsImageError('فایل انتخاب شده خالی است')
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new NewsImageError(`حجم فایل بیش از حد مجاز است. حداکثر: ${sizeLabel(MAX_FILE_SIZE)}`)
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const expectedFormat: Record<string, string> = {
    '.jpg': 'jpeg',
    '.jpeg': 'jpeg',
    '.png': 'png',
    '.gif': 'gif',
    '.webp': 'webp',
  }

  // بررسی امضای واقعی فایل؛ MIME و پسوند ارسالی کاربر به‌تنهایی قابل اعتماد نیستند.
  let actualFormat: string | null = null
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    actualFormat = 'jpeg'
  } else if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    actualFormat = 'png'
  } else if (
    buffer.length >= 6 &&
    (buffer.toString('ascii', 0, 6) === 'GIF87a' || buffer.toString('ascii', 0, 6) === 'GIF89a')
  ) {
    actualFormat = 'gif'
  } else if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    actualFormat = 'webp'
  }

  if (!actualFormat || actualFormat !== expectedFormat[ext]) {
    throw new NewsImageError('محتوای فایل با پسوند تصویر مطابقت ندارد یا فایل تصویر معتبر نیست')
  }

  const stored = await buildNewsImageName(userId, ext)
  const storageConfigured = isNewsObjectStorageConfigured()

  // در Vercel هرگز به نوشتن روی فایل‌سیستم فقط‌خواندنی برنمی‌گردیم.
  if (process.env.VERCEL === '1' && !storageConfigured) {
    throw new NewsImageError('تنظیمات Neon Object Storage در محیط سرور کامل نیست')
  }

  if (storageConfigured) {
    try {
      await putNewsObject(stored, buffer, CONTENT_TYPES[ext])
      // پیشوند s3: محل نگهداری فایل را بدون تغییر ساختار دیتابیس مشخص می‌کند.
      return `s3:${stored}`
    } catch (error) {
      console.error('saveNewsImage Object Storage error:', error)
      throw new NewsImageError('ذخیره تصویر در فضای ذخیره‌سازی ناموفق بود؛ تنظیمات Neon را بررسی کنید')
    }
  }

  // فقط برای توسعه محلی بدون تنظیم Object Storage.
  await mkdir(NEWS_IMAGES_DIR, { recursive: true })
  await writeFile(path.join(NEWS_IMAGES_DIR, stored), buffer, { flag: 'wx' })
  return stored
}

/** حذف تصویر از فضای ابری یا از پوشه قدیمی local */
export async function deleteNewsImageFile(filename: string | null | undefined): Promise<void> {
  if (!filename) return

  if (filename.startsWith('s3:')) {
    const key = filename.slice(3)
    if (!isSafeNewsImageName(key)) return
    try {
      await deleteNewsObject(key)
    } catch (error) {
      console.error('deleteNewsImageFile Object Storage error:', error)
    }
    return
  }

  const safeName = path.basename(filename)
  if (!ALLOWED_EXTENSIONS.includes(path.extname(safeName).toLowerCase())) return

  try {
    await unlink(path.join(NEWS_IMAGES_DIR, safeName))
  } catch (error) {
    // فایل‌های قدیمی داخل public در زمان اجرای Vercel قابل حذف نیستند.
    console.error('deleteNewsImageFile local file error:', error)
  }
}
