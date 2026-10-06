// app/(Occupations)/(OccupationsManagment)/lib/serviceImagesDb.ts
// ذخیره‌سازی بنر خدمت و رسید واریز اشتراک سالانه در public/serviceImages
// الگوی نام فایل: {kind}_{serviceId}_{تاریخ شمسی}_{کد یکتا} — مثال: banner_10_14050331_a56bcd8e9

import 'server-only'
import { mkdir, unlink, writeFile, access } from 'fs/promises'
import { constants } from 'fs'
import path from 'path'
import { randomInt } from 'crypto'
import { jalaaliStamp } from '@/app/lib/jalaliDate'
import {
  SERVICE_IMAGE_EXTENSIONS,
  SERVICE_RECEIPT_EXTENSIONS,
  MAX_BANNER_SIZE,
  MAX_RECEIPT_SIZE,
  type ServiceImageKind,
  serviceImageUrl,
  isSafeServiceImageName,
} from './serviceImagesConfig'

const SERVICE_IMAGES_DIR = path.join(process.cwd(), 'public', 'serviceImages')

export { MAX_BANNER_SIZE, MAX_RECEIPT_SIZE, serviceImageUrl, isSafeServiceImageName }

/** خطای اعتبارسنجی فایل که باید به کاربر نمایش داده شود */
export class ServiceImageError extends Error {}

const allowedFor = (kind: ServiceImageKind) => (kind === 'receipt' ? SERVICE_RECEIPT_EXTENSIONS : SERVICE_IMAGE_EXTENSIONS)

const maxSizeFor = (kind: ServiceImageKind) => (kind === 'receipt' ? MAX_RECEIPT_SIZE : MAX_BANNER_SIZE)

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
export async function saveServiceImage(file: File, kind: ServiceImageKind, serviceId: number): Promise<string> {
  const ext = path.extname(file.name).toLowerCase()

  if (!allowedFor(kind).includes(ext)) {
    throw new ServiceImageError(`فرمت فایل مجاز نیست. فرمت‌های مجاز: ${allowedFor(kind).join(' , ')}`)
  }
  if (file.size === 0) {
    throw new ServiceImageError('فایل انتخاب شده خالی است')
  }
  if (file.size > maxSizeFor(kind)) {
    throw new ServiceImageError(`حجم فایل بیش از حد مجاز است. حداکثر: ${sizeLabel(maxSizeFor(kind))}`)
  }

  const stamp = jalaaliStamp()
  let stored = ''
  for (let attempt = 0; attempt < 10; attempt++) {
    stored = `${kind}_${serviceId}_${stamp}_${generateCode()}${ext}`
    if (!(await fileExists(path.join(SERVICE_IMAGES_DIR, stored)))) break
    stored = ''
  }
  if (!stored) {
    throw new ServiceImageError('تولید نام فایل تصویر ناموفق بود')
  }

  await mkdir(SERVICE_IMAGES_DIR, { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(path.join(SERVICE_IMAGES_DIR, stored), buffer)

  return stored
}

/** حذف فایل از دیسک */
export async function deleteServiceImageFile(filename: string | null | undefined): Promise<void> {
  if (!filename) return

  const safeName = path.basename(filename)
  const ext = path.extname(safeName).toLowerCase()
  if (![...SERVICE_IMAGE_EXTENSIONS, ...SERVICE_RECEIPT_EXTENSIONS].includes(ext)) return

  try {
    await unlink(path.join(SERVICE_IMAGES_DIR, safeName))
  } catch (error) {
    console.error('deleteServiceImageFile error:', error)
  }
}
