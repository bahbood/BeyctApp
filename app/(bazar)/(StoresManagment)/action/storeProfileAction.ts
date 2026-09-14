'use server'

import captchaValidationAction from '@/app/components/(captcha)/action/captchaValidationAction'
import { db } from '@/app/db'
import { stores } from '@/app/db/schema'
import { eq } from 'drizzle-orm'
import {  getUserFromSession } from '@/app/(Auth)/lib/session'


export type StoreProfileState = {
  success: boolean
  errors?: {
    store_name?: string
    store_desc?: string
    store_address?: string
    store_tell?: string
    store_mobile?: string
    store_shaba_number?: string
    userCaptcha?: string
    message?: string
  }
  values?: {
    store_name: string
    store_desc: string
    store_about: string
    store_address: string
    store_tell: string
    store_mobile: string
    store_shaba_number: string
  }
} | null

export async function storeProfileAction(prevState: StoreProfileState, formData: FormData): Promise<StoreProfileState> {
  const store_name = formData.get('store_name') as string
  const store_desc = formData.get('store_desc') as string
  const store_about = formData.get('store_about') as string
  const store_address = formData.get('store_address') as string
  const store_tell = formData.get('store_tell') as string
  const store_mobile = formData.get('store_mobile') as string
  const store_shaba_number = formData.get('store_shaba_number') as string
  const captchaId = formData.get('captchaId') as string
  const userCaptchaInput = formData.get('userCaptchaInput') as string

  const errors: Record<string, string> = {}
  if (!store_name || store_name.trim().length < 2) errors.store_name = 'نام فروشگاه حداقل ۲ کاراکتر'
  if (!store_tell || !/^\d{11}$/.test(store_tell)) errors.store_tell = 'تلفن ۱۱ رقمی'
  if (!store_mobile || !/^\d{11}$/.test(store_mobile)) errors.store_mobile = 'موبایل ۱۱ رقمی'
  if (store_shaba_number && !/^\d{22}$/.test(store_shaba_number)) errors.store_shaba_number = 'شبا ۲۲ رقمی'

  const values = { store_name: store_name || '', store_desc: store_desc || '', store_about: store_about || '', store_address: store_address || '', store_tell: store_tell || '', store_mobile: store_mobile || '', store_shaba_number: store_shaba_number || '' }

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

  const userinfo=await getUserFromSession()

  const userId = userinfo?.id

  if( !userId )
  {
    return { success: false, errors: { message: '    !!! نشست نامعتبر ، کاربری لاگین نکرده' }, values }
  }

  try {
    const existingStore = await db
      .select()
      .from(stores)
      .where(eq(stores.user_id, userId))
      .limit(1)

    if (existingStore.length === 0) {
      return { success: false, errors: { message: 'فروشگاهی برای این کاربر یافت نشد' }, values }
    }

    const storeId = existingStore[0].id

    await db.update(stores).set({
      store_desc: store_desc.trim() || null,
      store_about: store_about.trim() || null,
      store_address: store_address.trim() || null,
      store_tell: store_tell.trim(),
      store_mobile: store_mobile.trim(),
      store_shaba_number: store_shaba_number.trim() || null,
    }).where(eq(stores.id, storeId))

    return { success: true }
  } catch (error) {
    console.error('Store profile update error:', error)
    return { success: false, errors: { message: 'خطا در ارتباط با سرور' }, values }
  }
}
