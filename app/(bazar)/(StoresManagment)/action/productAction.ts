'use server'

import { db } from '@/app/db'
import { products } from '@/app/db/schema'
import { eq, and } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { decryptSession, getUserFromSession } from '@/app/(Auth)/lib/session'
import { getStoreByUserId } from '../../lib/getStoreByUserId'

export type ProductActionState = {
  success: boolean
  errors?: {
    product_name?: string
    price?: string
    inventory?: string
    off_percent?: string
    message?: string
  }
  values?: {
    product_name: string
    product_shortdesc: string
    product_desc: string
    inventory: string
    price: string
    off_percent: string
  }
} | null

export async function addProductAction(prevState: ProductActionState, formData: FormData): Promise<ProductActionState> {
  const product_name = formData.get('product_name') as string
  const product_shortdesc = formData.get('product_shortdesc') as string
  const product_desc = formData.get('product_desc') as string
  const inventory = formData.get('inventory') as string
  const price = formData.get('price') as string
  const off_percent = formData.get('off_percent') as string

  const errors: Record<string, string> = {}
  if (!product_name || product_name.trim().length < 2) errors.product_name = 'نام محصول حداقل ۲ کاراکتر'
  if (!price || isNaN(Number(price)) || Number(price) <= 0) errors.price = 'قیمت معتبر وارد کنید'
  if (inventory && (isNaN(Number(inventory)) || Number(inventory) < 0)) errors.inventory = 'موجودی معتبر وارد کنید'
  if (off_percent && (isNaN(Number(off_percent)) || Number(off_percent) < 0 || Number(off_percent) >= 100)) errors.off_percent = 'درصد تخفیف بین ۰ تا ۹۹'

  const values = { product_name: product_name || '', product_shortdesc: product_shortdesc || '', product_desc: product_desc || '', inventory: inventory || '0', price: price || '', off_percent: off_percent || '0' }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, values }
  }

  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value
  if (!sessionCookie) return { success: false, errors: { message: 'کاربر وارد سیستم نیست' }, values }

  const payload = await decryptSession(sessionCookie)
  if (!payload) return { success: false, errors: { message: 'نشست نامعتبر' }, values }

  const userId = Number(payload.userId)
  const store = await getStoreByUserId(userId)
  if (!store) return { success: false, errors: { message: 'فروشگاهی یافت نشد' }, values }

  try {
    await db.insert(products).values({
      product_name: product_name.trim(),
      product_shortdesc: product_shortdesc.trim() || null,
      product_desc: product_desc.trim() || null,
      inventory: inventory ? Number(inventory) : 0,
      price: price,
      off_percent: off_percent || '0',
      store_id: store.id,
    })

    return { success: true }
  } catch (error) {
    console.error('Add product error:', error)
    return { success: false, errors: { message: 'خطا در ارتباط با سرور' }, values }
  }
}

export async function updateProductAction(prevState: ProductActionState, formData: FormData): Promise<ProductActionState> {
  const productId = Number(formData.get('product_id'))
  const product_name = formData.get('product_name') as string
  const product_shortdesc = formData.get('product_shortdesc') as string
  const product_desc = formData.get('product_desc') as string
  const inventory = formData.get('inventory') as string
  const price = formData.get('price') as string
  const off_percent = formData.get('off_percent') as string

  const errors: Record<string, string> = {}
  if (!product_name || product_name.trim().length < 2) errors.product_name = 'نام محصول حداقل ۲ کاراکتر'
  if (!price || isNaN(Number(price)) || Number(price) <= 0) errors.price = 'قیمت معتبر وارد کنید'
  if (inventory && (isNaN(Number(inventory)) || Number(inventory) < 0)) errors.inventory = 'موجودی معتبر وارد کنید'
  if (off_percent && (isNaN(Number(off_percent)) || Number(off_percent) < 0 || Number(off_percent) >= 100)) errors.off_percent = 'درصد تخفیف بین ۰ تا ۹۹'

  const values = { product_name: product_name || '', product_shortdesc: product_shortdesc || '', product_desc: product_desc || '', inventory: inventory || '0', price: price || '', off_percent: off_percent || '0' }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, values }
  }

  const userinfo=await getUserFromSession()
  
    const userId = userinfo?.id
  
    if( !userId )
    {
      return { success: false, errors: { message: '    !!! نشست نامعتبر ، کاربری لاگین نکرده' }, values }
    }
    
  
  const store = await getStoreByUserId(userId)
  if (!store) return { success: false, errors: { message: 'فروشگاهی یافت نشد' }, values }

  try {
    const existing = await db
      .select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.store_id, store.id)))
      .limit(1)

    if (existing.length === 0) {
      return { success: false, errors: { message: 'محصول یافت نشد' }, values }
    }

    await db.update(products).set({
      product_name: product_name.trim(),
      product_shortdesc: product_shortdesc.trim() || null,
      product_desc: product_desc.trim() || null,
      inventory: inventory ? Number(inventory) : 0,
      price: price,
      off_percent: off_percent || '0',
    }).where(eq(products.id, productId))

    return { success: true }
  } catch (error) {
    console.error('Update product error:', error)
    return { success: false, errors: { message: 'خطا در ارتباط با سرور' }, values }
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

    return { success: true }
  } catch (error) {
    console.error('Toggle product on_air error:', error)
    return { success: false, message: 'خطا در ارتباط با سرور' }
  }
}
