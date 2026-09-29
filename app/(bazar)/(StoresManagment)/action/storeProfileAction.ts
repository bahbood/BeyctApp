// app/(bazar)/(StoresManagment)/action/storeProfileAction.ts

'use server'

import captchaValidationAction from '@/app/components/(captcha)/action/captchaValidationAction'
import { getUserFromSession } from '@/app/(Auth)/lib/session'
import { db } from '@/app/db'
import { stores } from '@/app/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getStoreByUserId } from '../../lib/getStoreByUserId'
import { deleteStoreImage, saveStoreImage, StoreImageError } from '../lib/storeImagesDb'

const MAX_ABOUT_LENGTH = 2000

export type StoreProfileState = {
  success: boolean
  errors?: {
    store_desc?: string
    store_about?: string
    store_address?: string
    store_tell?: string
    store_mobile?: string
    store_shaba_number?: string
    store_logo?: string
    store_header_banner?: string
    userCaptcha?: string
    message?: string
  }
  values?: {
    store_desc: string
    store_about: string
    store_address: string
    store_tell: string
    store_mobile: string
    store_shaba_number: string
  }
} | null

const optional = (value: FormDataEntryValue | null) => ((value as string) || '').trim()

export async function storeProfileAction(
  prevState: StoreProfileState,
  formData: FormData
): Promise<StoreProfileState> {
  const store_desc = optional(formData.get('store_desc'))
  const store_about = optional(formData.get('store_about'))
  const store_address = optional(formData.get('store_address'))
  const store_tell = optional(formData.get('store_tell'))
  const store_mobile = optional(formData.get('store_mobile'))
  const store_shaba_number = optional(formData.get('store_shaba_number'))
  const captchaId = formData.get('captchaId') as string
  const userCaptchaInput = formData.get('userCaptchaInput') as string
  const logoFile = formData.get('store_logo') as File | null
  const bannerFile = formData.get('store_header_banner') as File | null

  const values = { store_desc, store_about, store_address, store_tell, store_mobile, store_shaba_number }

  const errors: NonNullable<StoreProfileState>['errors'] = {}

  if (store_desc.length < 5) errors.store_desc = 'تعریف کوتاه فروشگاه حداقل ۵ کاراکتر'
  if (store_desc.length > 200) errors.store_desc = 'تعریف کوتاه فروشگاه حداکثر ۲۰۰ کاراکتر'
  if (store_about.length > MAX_ABOUT_LENGTH) errors.store_about = `درباره فروشگاه حداکثر ${MAX_ABOUT_LENGTH} کاراکتر`
  if (store_address.length > 250) errors.store_address = 'آدرس حداکثر ۲۵۰ کاراکتر'
  if (store_tell && !/^\d{11}$/.test(store_tell)) errors.store_tell = 'تلفن باید ۱۱ رقم باشد'
  if (store_mobile && !/^\d{11}$/.test(store_mobile)) errors.store_mobile = 'موبایل باید ۱۱ رقم باشد'
  if (store_shaba_number && !/^\d{22}$/.test(store_shaba_number)) errors.store_shaba_number = 'شماره شبا باید ۲۲ رقم باشد'

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, values }
  }

  if (!captchaId || !userCaptchaInput) {
    return { success: false, errors: { userCaptcha: 'کد امنیتی وارد نشده' }, values }
  }

  const captchaResult = await captchaValidationAction(captchaId, userCaptchaInput)
  if (!captchaResult) {
    return { success: false, errors: { userCaptcha: 'کد امنیتی بدرستی وارد نشده' }, values }
  }

  const userinfo = await getUserFromSession()
  const userId = userinfo?.id

  if (!userId) {
    return { success: false, errors: { message: 'نشست نامعتبر ، کاربری لاگین نکرده' }, values }
  }

  const store = await getStoreByUserId(userId)

  if (!store) {
    return { success: false, errors: { message: 'فروشگاهی برای این کاربر یافت نشد' }, values }
  }

  try {
    let store_logo = store.store_logo
    let store_header_banner = store.store_header_banner

    if (logoFile && logoFile.size > 0) {
      const newLogo = await saveStoreImage(logoFile, 'logo', store.id)
      await deleteStoreImage(store.store_logo)
      store_logo = newLogo
    }

    if (bannerFile && bannerFile.size > 0) {
      const newBanner = await saveStoreImage(bannerFile, 'banner', store.id)
      await deleteStoreImage(store.store_header_banner)
      store_header_banner = newBanner
    }

    await db
      .update(stores)
      .set({
        store_desc,
        store_about: store_about || null,
        store_address: store_address || null,
        store_tell: store_tell || null,
        store_mobile: store_mobile || null,
        store_shaba_number: store_shaba_number || null,
        store_logo,
        store_header_banner,
      })
      .where(eq(stores.id, store.id))

    revalidatePath('/myStore')
    revalidatePath('/storeProfile')

    return { success: true, values }
  } catch (error) {
    console.error('Store profile update error:', error)

    if (error instanceof StoreImageError) {
      return { success: false, errors: { message: error.message }, values }
    }

    return { success: false, errors: { message: 'خطا در ارتباط با سرور' }, values }
  }
}

/** حذف لوگو یا بنر فعلی فروشگاه */
export async function deleteStoreImageAction(kind: 'logo' | 'banner'): Promise<{ success: boolean; message?: string }> {
  const userinfo = await getUserFromSession()
  const userId = userinfo?.id

  if (!userId) {
    return { success: false, message: 'نشست نامعتبر ، کاربری لاگین نکرده' }
  }

  const store = await getStoreByUserId(userId)

  if (!store) {
    return { success: false, message: 'فروشگاهی برای این کاربر یافت نشد' }
  }

  try {
    if (kind === 'logo') {
      await deleteStoreImage(store.store_logo)
      await db.update(stores).set({ store_logo: null }).where(eq(stores.id, store.id))
    } else {
      await deleteStoreImage(store.store_header_banner)
      await db.update(stores).set({ store_header_banner: null }).where(eq(stores.id, store.id))
    }

    revalidatePath('/storeProfile')
    revalidatePath('/myStore')

    return { success: true }
  } catch (error) {
    console.error('Delete store image error:', error)
    return { success: false, message: 'خطا در ارتباط با سرور' }
  }
}
