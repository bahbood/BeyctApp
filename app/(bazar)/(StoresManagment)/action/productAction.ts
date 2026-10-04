'use server'

import { db } from '@/app/db'
import { products, productImages } from '@/app/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { decryptSession, getUserFromSession } from '@/app/(Auth)/lib/session'
import { getStoreByUserId } from '../../lib/getStoreByUserId'
import { jalaaliInputToDate } from '@/app/lib/jalaliDate'
import {
  MAX_FILE_SIZE,
  MAX_IMAGES_PER_PRODUCT,
  deleteProductImageFile,
  isSafeProductImageName,
  saveProductImage,
} from '../lib/productImagesDb'

export type ProductActionErrors = {
  product_name?: string
  price?: string
  inventory?: string
  off_percent?: string
  registered_at?: string
  archive_at?: string
  images?: string
  message?: string
}

export type ProductActionValues = {
  product_name: string
  product_shortdesc: string
  product_desc: string
  inventory: string
  price: string
  off_percent: string
  registered_at: string
  archive_at: string
  on_air: boolean
}

export type ProductActionState = {
  success: boolean
  errors?: ProductActionErrors
  values?: ProductActionValues
} | null

type ParsedFields = {
  errors: ProductActionErrors
  values: ProductActionValues
  registeredAt: Date
  archiveAt: Date | null
}

/** استخراج فایل‌های انتخاب‌شده از فرم (فایل‌های خالی نادیده گرفته می‌شوند) */
function extractFiles(formData: FormData, key = 'images'): File[] {
  return formData
    .getAll(key)
    .filter((entry): entry is File => entry instanceof File && entry.size > 0 && entry.name !== '')
}

/**
 * خواندن و اعتبارسنجی فیلدهای مشترک فرم افزودن/ویرایش محصول.
 * تاریخ‌ها به‌صورت شمسی (YYYY/MM/DD) از فرم دریافت و به میلادی تبدیل می‌شوند.
 */
function parseProductFields(formData: FormData): ParsedFields {
  const product_name = (formData.get('product_name') as string) ?? ''
  const product_shortdesc = (formData.get('product_shortdesc') as string) ?? ''
  const product_desc = (formData.get('product_desc') as string) ?? ''
  const inventory = (formData.get('inventory') as string) ?? ''
  const price = (formData.get('price') as string) ?? ''
  const off_percent = (formData.get('off_percent') as string) ?? ''
  const registered_at = (formData.get('registered_at') as string) ?? ''
  const archive_at = (formData.get('archive_at') as string) ?? ''
  const on_air = formData.get('on_air') === 'on' || formData.get('on_air') === 'true'

  const errors: ProductActionErrors = {}
  if (!product_name || product_name.trim().length < 2) errors.product_name = 'نام محصول حداقل ۲ کاراکتر'
  if (product_name.trim().length > 50) errors.product_name = 'نام محصول حداکثر ۵۰ کاراکتر'
  if (!price || isNaN(Number(price)) || Number(price) <= 0) errors.price = 'قیمت معتبر وارد کنید'
  if (inventory && (isNaN(Number(inventory)) || Number(inventory) < 0)) errors.inventory = 'موجودی معتبر وارد کنید'
  if (off_percent && (isNaN(Number(off_percent)) || Number(off_percent) < 0 || Number(off_percent) >= 100)) errors.off_percent = 'درصد تخفیف بین ۰ تا ۹۹'

  const registeredAt = registered_at.trim()
    ? jalaaliInputToDate(registered_at)
    : new Date()

  if (registered_at.trim() && !registeredAt) {
    errors.registered_at = 'تاریخ ثبت محصول نامعتبر است'
  }

  const parsedArchive = archive_at.trim() ? jalaaliInputToDate(archive_at) : null
  if (archive_at.trim() && !parsedArchive) {
    errors.archive_at = 'تاریخ انقضا نامعتبر است'
  }

  if (registeredAt && parsedArchive && parsedArchive <= registeredAt) {
    errors.archive_at = 'تاریخ انقضا باید بعد از تاریخ ثبت محصول باشد'
  }

  const files = extractFiles(formData)
  if (files.length > MAX_IMAGES_PER_PRODUCT) {
    errors.images = `حداکثر ${MAX_IMAGES_PER_PRODUCT} تصویر می‌توانید انتخاب کنید`
  }

  // حجم هر تصویر پیش از نوشتن روی دیسک بررسی می‌شود تا پیام خطای دقیق به کاربر نمایش داده شود
  const oversized = files.find((file) => file.size > MAX_FILE_SIZE)
  if (oversized && !errors.images) {
    errors.images = `حجم فایل «${oversized.name}» بیش از حد مجاز است. حداکثر حجم هر تصویر ${MAX_FILE_SIZE / 1024} کیلوبایت`
  }

  const values: ProductActionValues = {
    product_name: product_name || '',
    product_shortdesc: product_shortdesc || '',
    product_desc: product_desc || '',
    inventory: inventory || '0',
    price: price || '',
    off_percent: off_percent || '0',
    registered_at: registered_at || '',
    archive_at: archive_at || '',
    on_air,
  }

  return { errors, values, registeredAt: registeredAt ?? new Date(), archiveAt: parsedArchive }
}

/** ذخیره فایل‌های تصویر و بازگرداندن نام فایل‌ها */
async function storeImageFiles(files: File[], userId: number): Promise<string[]> {
  const stored: string[] = []

  try {
    for (const file of files) {
      stored.push(await saveProductImage(file, userId))
    }
  } catch (error) {
    await Promise.all(stored.map((name) => deleteProductImageFile(name)))
    throw error
  }

  return stored
}

export async function addProductAction(prevState: ProductActionState, formData: FormData): Promise<ProductActionState> {
  const { errors, values, registeredAt, archiveAt } = parseProductFields(formData)

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, values }
  }

  const userinfo = await getUserFromSession()
  const userId = userinfo?.id

  if (!userId) {
    return { success: false, errors: { message: 'نشست نامعتبر، کاربری لاگین نکرده است' }, values }
  }

  const store = await getStoreByUserId(userId)
  if (!store) return { success: false, errors: { message: 'فروشگاهی یافت نشد' }, values }

  const files = extractFiles(formData)
  let savedImages: string[] = []

  try {
    savedImages = await storeImageFiles(files, userId)

    const inserted = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(products)
        .values({
          product_name: values.product_name.trim(),
          product_shortdesc: values.product_shortdesc.trim() || null,
          product_desc: values.product_desc.trim() || null,
          inventory: Number(values.inventory || 0),
          price: values.price,
          off_percent: values.off_percent || '0',
          store_id: store.id,
          registered_at: registeredAt,
          archive_at: archiveAt,
          on_air: values.on_air,
        })
        .returning({ id: products.id })

      if (savedImages.length > 0) {
        await tx.insert(productImages).values(
          savedImages.map((imageName, index) => ({
            product_id: created.id,
            image_name: imageName,
            position: index,
          }))
        )
      }

      return created
    })

    revalidatePath('/productsList')
    console.log(`Product #${inserted.id} created with ${savedImages.length} image(s)`)

    return { success: true }
  } catch (error) {
    await Promise.all(savedImages.map((name) => deleteProductImageFile(name)))
    console.error('Add product error:', error)
    return { success: false, errors: { message: 'خطا در ذخیره محصول' }, values }
  }
}

export async function updateProductAction(prevState: ProductActionState, formData: FormData): Promise<ProductActionState> {
  const productId = Number(formData.get('product_id'))
  const { errors, values, registeredAt, archiveAt } = parseProductFields(formData)

  if (!productId || isNaN(productId)) {
    return { success: false, errors: { message: 'شناسه محصول نامعتبر است' }, values }
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, values }
  }

  const userinfo = await getUserFromSession()
  const userId = userinfo?.id

  if (!userId) {
    return { success: false, errors: { message: 'نشست نامعتبر، کاربری لاگین نکرده است' }, values }
  }

  const store = await getStoreByUserId(userId)
  if (!store) return { success: false, errors: { message: 'فروشگاهی یافت نشد' }, values }

  const existingImages = await db
    .select()
    .from(productImages)
    .where(eq(productImages.product_id, productId))
    .orderBy(asc(productImages.position))

  const knownNames = existingImages.map((image) => image.image_name)

  // تصاویری که مدیر نگه داشته است
  const keptNames = formData
    .getAll('existing_images')
    .map((entry) => String(entry))
    .filter((name) => isSafeProductImageName(name) && knownNames.includes(name))

  const removedNames = knownNames.filter((name) => !keptNames.includes(name))

  const files = extractFiles(formData)
  if (keptNames.length + files.length > MAX_IMAGES_PER_PRODUCT) {
    return {
      success: false,
      errors: { images: `حداکثر ${MAX_IMAGES_PER_PRODUCT} تصویر برای هر محصول مجاز است` },
      values,
    }
  }

  let savedImages: string[] = []

  try {
    const owned = await db
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.id, productId), eq(products.store_id, store.id)))
      .limit(1)

    if (owned.length === 0) {
      return { success: false, errors: { message: 'محصول یافت نشد' }, values }
    }

    savedImages = await storeImageFiles(files, userId)

    const finalNames = [
      ...keptNames,
      ...savedImages,
    ].slice(0, MAX_IMAGES_PER_PRODUCT)

    await db.transaction(async (tx) => {
      await tx
        .update(products)
        .set({
          product_name: values.product_name.trim(),
          product_shortdesc: values.product_shortdesc.trim() || null,
          product_desc: values.product_desc.trim() || null,
          inventory: Number(values.inventory || 0),
          price: values.price,
          off_percent: values.off_percent || '0',
          registered_at: registeredAt,
          archive_at: archiveAt,
          on_air: values.on_air,
        })
        .where(eq(products.id, productId))

      // بازنویسی کامل ردیف‌های تصویر با ترتیب نهایی
      await tx.delete(productImages).where(eq(productImages.product_id, productId))
      if (finalNames.length > 0) {
        await tx.insert(productImages).values(
          finalNames.map((imageName, index) => ({
            product_id: productId,
            image_name: imageName,
            position: index,
          }))
        )
      }
    })

    await Promise.all(removedNames.map((name) => deleteProductImageFile(name)))

    revalidatePath('/productsList')
    revalidatePath(`/productsList/${productId}/edit`)

    return { success: true }
  } catch (error) {
    await Promise.all(savedImages.map((name) => deleteProductImageFile(name)))
    console.error('Update product error:', error)
    return { success: false, errors: { message: 'خطا در ذخیره تغییرات' }, values }
  }
}

export async function toggleProductOnAirAction(productId: number): Promise<{ success: boolean; message?: string }> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value
  if (!sessionCookie) return { success: false, message: 'کاربر وارد سیستم نیست' }

  const payload = await decryptSession(sessionCookie)
  if (!payload) return { success: false, message: 'نشست نامعتبر' }

  const userId = Number(payload.userId)
  const store = await getStoreByUserId(userId)
  if (!store) return { success: false, message: 'فروشگاهی یافت نشد' }

  try {
    const existing = await db
      .select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.store_id, store.id)))
      .limit(1)

    if (existing.length === 0) return { success: false, message: 'محصول یافت نشد' }

    await db.update(products).set({
      on_air: !existing[0].on_air,
    }).where(eq(products.id, productId))

    revalidatePath('/productsList')

    return { success: true }
  } catch (error) {
    console.error('Toggle product on_air error:', error)
    return { success: false, message: 'خطا در ارتباط با سرور' }
  }
}
