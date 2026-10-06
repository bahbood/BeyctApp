// app/(newsPaper)/(AgenciesManagement)/lib/newsAgencyImagesDb.ts
// ذخیره‌سازی تصاویر خبرگزاری (لوگو، بنر) و رسید واریز بانکی در public/newsAgencyImages
// الگوی نام فایل: {kind}_{agencyId}_{تاریخ شمسی}_{کد یکتا} — مثال: logo_10_14050331_a56bcd8e9

import 'server-only'
import { mkdir, unlink, writeFile, access } from 'fs/promises'
import { constants } from 'fs'
import path from 'path'
import { randomInt } from 'crypto'
import { jalaaliStamp } from '@/app/lib/jalaliDate'
import {
  NEWS_AGENCY_IMAGE_EXTENSIONS,
  NEWS_AGENCY_RECEIPT_EXTENSIONS,
  MAX_LOGO_SIZE,
  MAX_BANNER_SIZE,
  MAX_RECEIPT_SIZE,
  type NewsAgencyImageKind,
  newsAgencyImageUrl,
  isSafeNewsAgencyImageName,
} from './newsAgencyImagesConfig'

const NEWS_AGENCY_IMAGES_DIR = path.join(process.cwd(), 'public', 'newsAgencyImages')

export {
  MAX_LOGO_SIZE,
  MAX_BANNER_SIZE,
  MAX_RECEIPT_SIZE,
  newsAgencyImageUrl,
  isSafeNewsAgencyImageName,
}

const IMAGE_EXTENSIONS = NEWS_AGENCY_IMAGE_EXTENSIONS
const RECEIPT_EXTENSIONS = NEWS_AGENCY_RECEIPT_EXTENSIONS

/** خطای اعتبارسنجی فایل که باید به کاربر نمایش داده شود */
export class NewsAgencyImageError extends Error {}

const allowedFor = (kind: NewsAgencyImageKind) => (kind === 'receipt' ? RECEIPT_EXTENSIONS : IMAGE_EXTENSIONS)

const maxSizeFor = (kind: NewsAgencyImageKind) => {
  if (kind === 'logo') return MAX_LOGO_SIZE
  if (kind === 'banner') return MAX_BANNER_SIZE
  return MAX_RECEIPT_SIZE
}

const sizeLabel = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${Math.round(bytes / 1024 / 1024)}MB` : `${Math.round(bytes / 1024)}KB`

const CODE_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'
const CODE_LENGTH = 9

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

/** ذخیره فایل و بازگرداندن نام فایل ذخیره شده */
export async function saveNewsAgencyImage(
  file: File,
  kind: NewsAgencyImageKind,
  agencyId: number,
): Promise<string> {
  const ext = path.extname(file.name).toLowerCase()

  if (!allowedFor(kind).includes(ext)) {
    throw new NewsAgencyImageError(`فرمت فایل مجاز نیست. فرمت‌های مجاز: ${allowedFor(kind).join(' , ')}`)
  }
  if (file.size === 0) {
    throw new NewsAgencyImageError('فایل انتخاب شده خالی است')
  }
  if (file.size > maxSizeFor(kind)) {
    throw new NewsAgencyImageError(`حجم فایل بیش از حد مجاز است. حداکثر: ${sizeLabel(maxSizeFor(kind))}`)
  }

  const stamp = jalaaliStamp()
  let stored = ''
  for (let attempt = 0; attempt < 10; attempt++) {
    stored = `${kind}_${agencyId}_${stamp}_${generateCode()}${ext}`
    if (!(await fileExists(path.join(NEWS_AGENCY_IMAGES_DIR, stored)))) break
    stored = ''
  }
  if (!stored) {
    throw new NewsAgencyImageError('تولید نام فایل تصویر ناموفق بود')
  }

  await mkdir(NEWS_AGENCY_IMAGES_DIR, { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(path.join(NEWS_AGENCY_IMAGES_DIR, stored), buffer)

  return stored
}

/** حذف فایل از دیسک */
export async function deleteNewsAgencyImageFile(filename: string | null | undefined): Promise<void> {
  if (!filename) return

  const safeName = path.basename(filename)
  const ext = path.extname(safeName).toLowerCase()
  if (![...IMAGE_EXTENSIONS, ...RECEIPT_EXTENSIONS].includes(ext)) return

  try {
    await unlink(path.join(NEWS_AGENCY_IMAGES_DIR, safeName))
  } catch (error) {
    console.error('deleteNewsAgencyImageFile error:', error)
  }
}
