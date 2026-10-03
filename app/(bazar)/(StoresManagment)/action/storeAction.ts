// app/(bazar)/(StoresManagment)/action/storeAction.ts

'use server'

import captchaValidationAction from '@/app/components/(captcha)/action/captchaValidationAction'
import { getUserFromSession } from '@/app/(Auth)/lib/session'
import { db } from '@/app/db'
import { stores, users } from '@/app/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { deleteStoreImage } from '../lib/storeImagesDb'

export type StoreActionState = {
  success: boolean
  /**
   * آیا کد امنیتی در سرور مصرف شده است؟
   * کد امنیتی فقط در صورت صحت حذف می‌شود، بنابراین اگر این مقدار true باشد
   * فرم باید یک کد جدید بارگذاری کند وگرنه کاربر در تلاش بعدی همیشه خطا می‌بیند.
   */
  captchaConsumed?: boolean
  errors?: {
    store_name?: string
    store_manager?: string
    store_desc?: string
    userCaptcha?: string
    message?: string
  }
  values?: {
    store_name: string
    store_manager: string
    store_desc: string
  }
} | null

type StoreFormValues = {
  store_name: string
  store_manager: string
  store_desc: string
}

function validateStoreForm(formData: FormData): { errors: Record<string, string>; values: StoreFormValues } {
  const store_name = ((formData.get('store_name') as string) || '').trim()
  const store_manager = ((formData.get('store_manager') as string) || '').trim()
  const store_desc = ((formData.get('store_desc') as string) || '').trim()

  const errors: Record<string, string> = {}

  if (store_name.length < 2) errors.store_name = 'نام فروشگاه حداقل ۲ کاراکتر'
  if (store_name.length > 30) errors.store_name = 'نام فروشگاه حداکثر ۳۰ کاراکتر'
  if (store_manager.length < 3) errors.store_manager = 'نام مدیر فروشگاه حداقل ۳ کاراکتر'
  if (store_desc.length < 5) errors.store_desc = 'تعریف کوتاه فروشگاه حداقل ۵ کاراکتر'
  if (store_desc.length > 200) errors.store_desc = 'تعریف کوتاه فروشگاه حداکثر ۲۰۰ کاراکتر'

  return { errors, values: { store_name, store_manager, store_desc } }
}

async function validateCaptcha(formData: FormData): Promise<string | null> {
  const captchaId = formData.get('captchaId') as string
  const userCaptchaInput = formData.get('userCaptchaInput') as string

  if (!captchaId || !userCaptchaInput) {
    return 'کد امنیتی وارد نشده'
  }

  const captchaResult = await captchaValidationAction(captchaId, userCaptchaInput)
  if (!captchaResult) {
    return 'کد امنیتی بدرستی وارد نشده'
  }

  return null
}

/** ثبت درخواست تاسیس فروشگاه - فروشگاه در ابتدا غیرفعال ثبت میشود */
export async function createStoreAction(prevState: StoreActionState, formData: FormData): Promise<StoreActionState> {
  const { errors, values } = validateStoreForm(formData)

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, values }
  }

  const captchaError = await validateCaptcha(formData)
  if (captchaError) {
    return { success: false, errors: { userCaptcha: captchaError }, values }
  }

  const userinfo = await getUserFromSession()
  const userId = userinfo?.id

  if (!userId) {
    return { success: false, captchaConsumed: true, errors: { message: 'نشست نامعتبر ، کاربری لاگین نکرده' }, values }
  }

  try {
    const existingStore = await db
      .select({ id: stores.id })
      .from(stores)
      .where(eq(stores.user_id, userId))
      .limit(1)

    if (existingStore.length > 0) {
      return { success: false, captchaConsumed: true, errors: { message: 'شما قبلاً یک فروشگاه ثبت کرده‌اید' }, values }
    }

    await db.insert(stores).values({
      store_name: values.store_name,
      store_manager: values.store_manager,
      store_desc: values.store_desc,
      on_air: false,
      store_status: 'inactive',
      user_id: userId,
    })

    revalidatePath('/myStore')
    return { success: true, values }
  } catch (error) {
    console.error('Create store error:', error)

    if (error instanceof Error && error.message.includes('stores_store_name_unique')) {
      return { success: false, captchaConsumed: true, errors: { store_name: 'این نام فروشگاه قبلاً ثبت شده است' }, values }
    }

    return { success: false, captchaConsumed: true, errors: { message: 'خطا در ارتباط با سرور' }, values }
  }
}

/** ویرایش نام فروشگاه ، نام مدیر و تعریف کوتاه */
export async function updateStoreAction(prevState: StoreActionState, formData: FormData): Promise<StoreActionState> {
  const { errors, values } = validateStoreForm(formData)

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, values }
  }

  const captchaError = await validateCaptcha(formData)
  if (captchaError) {
    return { success: false, errors: { userCaptcha: captchaError }, values }
  }

  const userinfo = await getUserFromSession()
  const userId = userinfo?.id

  if (!userId) {
    return { success: false, captchaConsumed: true, errors: { message: 'نشست نامعتبر ، کاربری لاگین نکرده' }, values }
  }

  try {
    const existingStore = await db
      .select()
      .from(stores)
      .where(eq(stores.user_id, userId))
      .limit(1)

    if (existingStore.length === 0) {
      return { success: false, captchaConsumed: true, errors: { message: 'فروشگاهی برای این کاربر یافت نشد' }, values }
    }

    await db
      .update(stores)
      .set({
        store_name: values.store_name,
        store_manager: values.store_manager,
        store_desc: values.store_desc,
      })
      .where(eq(stores.id, existingStore[0].id))

    revalidatePath('/myStore')
    revalidatePath('/storeProfile')

    return { success: true, values }
  } catch (error) {
    console.error('Update store error:', error)

    if (error instanceof Error && error.message.includes('stores_store_name_unique')) {
      return { success: false, captchaConsumed: true, errors: { store_name: 'این نام فروشگاه قبلاً ثبت شده است' }, values }
    }

    return { success: false, captchaConsumed: true, errors: { message: 'خطا در ارتباط با سرور' }, values }
  }
}

/** حذف فروشگاه کاربر - محصولات فروشگاه نیز به دلیل cascade حذف میشوند */
export async function deleteStoreAction(prevState: StoreActionState, formData: FormData): Promise<StoreActionState> {
  const captchaError = await validateCaptcha(formData)
  if (captchaError) {
    return { success: false, errors: { userCaptcha: captchaError } }
  }

  const userinfo = await getUserFromSession()
  const userId = userinfo?.id

  if (!userId) {
    return { success: false, captchaConsumed: true, errors: { message: 'نشست نامعتبر ، کاربری لاگین نکرده' } }
  }

  try {
    const existingStore = await db
      .select()
      .from(stores)
      .where(eq(stores.user_id, userId))
      .limit(1)

    if (existingStore.length === 0) {
      return { success: false, captchaConsumed: true, errors: { message: 'فروشگاهی برای این کاربر یافت نشد' } }
    }

    const store = existingStore[0]

    // حذف کاربر و فروشگاه باید یکپارچه باشد، وگرنه ممکن است پرچم کاربر صاف شود
    // ولی رکورد فروشگاه باقی بماند (یا برعکس)
    await db.transaction(async (tx) => {
      await tx.update(users).set({ store_active: false }).where(eq(users.id, userId))
      await tx.delete(stores).where(eq(stores.id, store.id))
    })

    // فایل‌ها فقط پس از حذف موفق رکورد پاک می‌شوند
    await deleteStoreImage(store.store_logo)
    await deleteStoreImage(store.store_header_banner)
    await deleteStoreImage(store.payment_receipt)

    revalidatePath('/myStore')
    revalidatePath('/storeProfile')
    revalidatePath('/productsList')

    return { success: true }
  } catch (error) {
    console.error('Delete store error:', error)
    return { success: false, captchaConsumed: true, errors: { message: 'خطا در ارتباط با سرور' } }
  }
}
