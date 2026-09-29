// app/(bazar)/(StoresManagment)/lib/storeImagesDb.ts

import 'server-only'
import { mkdir, unlink, writeFile } from 'fs/promises'
import path from 'path'

const STORE_IMAGES_DIR = path.join(process.cwd(), 'public', 'storeImages')

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
const RECEIPT_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf']

const MAX_IMAGE_SIZE = 2 * 1024 * 1024
const MAX_RECEIPT_SIZE = 5 * 1024 * 1024

export type StoreImageKind = 'logo' | 'banner' | 'receipt'

/** خطای اعتبارسنجی فایل که باید به کاربر نمایش داده شود */
export class StoreImageError extends Error {}

const allowedFor = (kind: StoreImageKind) => (kind === 'receipt' ? RECEIPT_EXTENSIONS : IMAGE_EXTENSIONS)
const maxSizeFor = (kind: StoreImageKind) => (kind === 'receipt' ? MAX_RECEIPT_SIZE : MAX_IMAGE_SIZE)

const sizeLabel = (bytes: number) => `${bytes / 1024 / 1024}MB`

export async function saveStoreImage(file: File, kind: StoreImageKind, storeId: number): Promise<string> {
  const ext = path.extname(file.name).toLowerCase()
  if (!allowedFor(kind).includes(ext)) {
    throw new StoreImageError(`فرمت فایل مجاز نیست. فرمت‌های مجاز: ${allowedFor(kind).join(' , ')}`)
  }
  if (file.size === 0) {
    throw new StoreImageError('فایل انتخاب شده خالی است')
  }
  if (file.size > maxSizeFor(kind)) {
    throw new StoreImageError(`حجم فایل بیش از حد مجاز است. حداکثر: ${sizeLabel(maxSizeFor(kind))}`)
  }

  const stored = `${kind}_${storeId}_${Date.now()}${ext}`

  await mkdir(STORE_IMAGES_DIR, { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(path.join(STORE_IMAGES_DIR, stored), buffer)

  return stored
}

export async function deleteStoreImage(filename: string | null | undefined): Promise<void> {
  if (!filename) return

  const safeName = path.basename(filename)
  const fullPath = path.join(STORE_IMAGES_DIR, safeName)

  try {
    await unlink(fullPath)
  } catch (error) {
    console.error('deleteStoreImage error:', error)
  }
}
