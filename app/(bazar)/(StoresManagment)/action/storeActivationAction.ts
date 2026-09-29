// app/(bazar)/(StoresManagment)/action/storeActivationAction.ts

'use server'

import captchaValidationAction from '@/app/components/(captcha)/action/captchaValidationAction'
import { getUserFromSession } from '@/app/(Auth)/lib/session'
import { db } from '@/app/db'
import { stores, users } from '@/app/db/schema'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { calculateExpiredAt, isSubscriptionPlan, SubscriptionPlan } from '../lib/storeSubscription'
import { deleteStoreImage, saveStoreImage, StoreImageError } from '../lib/storeImagesDb'

export type StoreActivationState = {
  success: boolean
  errors?: {
    subscription_plan?: string
    payment_receipt?: string
    userCaptcha?: string
    message?: string
  }
} | null

/** ارسال درخواست فعالسازی فروشگاه : انتخاب مدت اشتراک و بارگذاری رسید واریز بانکی */
export async function storeActivationAction(
  prevState: StoreActivationState,
  formData: FormData
): Promise<StoreActivationState> {
  const captchaId = formData.get('captchaId') as string
  const userCaptchaInput = formData.get('userCaptchaInput') as string
  const subscriptionPlan = formData.get('subscription_plan') as string
  const receipt = formData.get('payment_receipt') as File | null

  const errors: NonNullable<StoreActivationState>['errors'] = {}

  if (!isSubscriptionPlan(subscriptionPlan)) {
    errors.subscription_plan = 'مدت اشتراک را انتخاب کنید'
  }

  if (!receipt || receipt.size === 0) {
    errors.payment_receipt = 'تصویر رسید واریز بانکی را پیوست کنید'
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors }
  }

  if (!captchaId || !userCaptchaInput) {
    return { success: false, errors: { userCaptcha: 'کد امنیتی وارد نشده' } }
  }

  const captchaResult = await captchaValidationAction(captchaId, userCaptchaInput)
  if (!captchaResult) {
    return { success: false, errors: { userCaptcha: 'کد امنیتی بدرستی وارد نشده' } }
  }

  const userinfo = await getUserFromSession()
  const userId = userinfo?.id

  if (!userId) {
    return { success: false, errors: { message: 'نشست نامعتبر ، کاربری لاگین نکرده' } }
  }

  try {
    const existingStore = await db
      .select()
      .from(stores)
      .where(eq(stores.user_id, userId))
      .limit(1)

    if (existingStore.length === 0) {
      return { success: false, errors: { message: 'فروشگاهی برای این کاربر یافت نشد' } }
    }

    const store = existingStore[0]

    if (store.store_status === 'active' && new Date(store.expired_at) > new Date()) {
      return { success: false, errors: { message: 'اشتراک فروشگاه شما فعال است' } }
    }

    const receiptName = await saveStoreImage(receipt as File, 'receipt', store.id)
    await deleteStoreImage(store.payment_receipt)

    await db
      .update(stores)
      .set({
        subscription_plan: subscriptionPlan as SubscriptionPlan,
        payment_receipt: receiptName,
        activation_requested_at: new Date(),
        store_status: 'pending',
        expired_at: calculateExpiredAt(subscriptionPlan as SubscriptionPlan),
      })
      .where(eq(stores.id, store.id))

    revalidatePath('/myStore')
    revalidatePath('/storeProfile')

    return { success: true }
  } catch (error) {
    console.error('Store activation error:', error)

    if (error instanceof StoreImageError) {
      return { success: false, errors: { payment_receipt: error.message } }
    }

    return { success: false, errors: { message: 'خطا در ارتباط با سرور' } }
  }
}

/** تایید نهایی مدیر سایت : فروشگاه فعال و کاربر به عنوان صاحب فروشگاه فعال علامت میخورد */
export async function approveStoreActivationAction(storeId: number): Promise<{ success: boolean; message?: string }> {
  const userinfo = await getUserFromSession()

  if (!userinfo || userinfo.role !== 'admin') {
    return { success: false, message: 'دسترسی مجاز نیست' }
  }

  try {
    const storeList = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1)

    if (storeList.length === 0) {
      return { success: false, message: 'فروشگاه یافت نشد' }
    }

    const store = storeList[0]

    await db
      .update(stores)
      .set({
        store_status: 'active',
        on_air: true,
        activated_at: new Date(),
        expired_at: calculateExpiredAt(store.subscription_plan ?? 'monthly'),
      })
      .where(eq(stores.id, storeId))

    await db
      .update(users)
      .set({ store_active: true })
      .where(and(eq(users.id, store.user_id)))

    revalidatePath('/myStore')
    revalidatePath('/storeProfile')

    return { success: true }
  } catch (error) {
    console.error('Approve store activation error:', error)
    return { success: false, message: 'خطا در ارتباط با سرور' }
  }
}
