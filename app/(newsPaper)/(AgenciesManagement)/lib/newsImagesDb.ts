// app/(newsPaper)/(AgenciesManagement)/lib/newsImagesDb.ts
// ذخیره‌سازی تصاویر خبر در public/newsImages/newsIMGs
// الگوی نام فایل: {userId}_{تاریخ شمسی}_{کد یکتا} — مثال: 10_14050331_a56bcd8e9

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
  newsImageSizeLabel as sizeLabel,
  newsImageUrl,
  isSafeNewsImageName,
} from './newsImagesConfig'

const NEWS_IMAGES_DIR = path.join(process.cwd(), 'public', 'newsImages', 'newsIMGs')

export { MAX_FILE_SIZE, MAX_IMAGES_PER_NEWS, newsImageUrl, isSafeNewsImageName }

const ALLOWED_EXTENSIONS = NEWS_IMAGE_EXTENSIONS

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
 * در صورت تکراری بودن نام، کد دوباره ساخته می‌شود.
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

/** ذخیره یک تصویر و بازگرداندن نام فایل ذخیره شده */
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

  const stored = await buildNewsImageName(userId, ext)

  await mkdir(NEWS_IMAGES_DIR, { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(path.join(NEWS_IMAGES_DIR, stored), buffer)

  return stored
}

/** حذف فایل تصویر از دیسک */
export async function deleteNewsImageFile(filename: string | null | undefined): Promise<void> {
  if (!filename) return

  const safeName = path.basename(filename)
  if (!ALLOWED_EXTENSIONS.includes(path.extname(safeName).toLowerCase())) return

  try {
    await unlink(path.join(NEWS_IMAGES_DIR, safeName))
  } catch (error) {
    console.error('deleteNewsImageFile error:', error)
  }
}
