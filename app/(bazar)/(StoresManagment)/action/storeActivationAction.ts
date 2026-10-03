// app/(bazar)/(StoresManagment)/action/storeActivationAction.ts

'use server'

import captchaValidationAction from '@/app/components/(captcha)/action/captchaValidationAction'
import { getUserFromSession } from '@/app/(Auth)/lib/session'
import { db } from '@/app/db'
import { messages, stores, users, userRoles } from '@/app/db/schema'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import {
  calculateExpiredAt,
  formatDate,
  isSubscriptionPlan,
  SUBSCRIPTION_LABELS,
  SUBSCRIPTION_PRICES,
  type SubscriptionPlan,
} from '../lib/storeSubscription'
import { deleteStoreImage, saveStoreImage, StoreImageError } from '../lib/storeImagesDb'

export type StoreActivationState = {
  success: boolean
  /**
   * آیا کد امنیتی در سرور مصرف شده است؟
   * کد امنیتی فقط در صورت صحت حذف می‌شود، بنابراین اگر این مقدار true باشد
   * فرم باید یک کد جدید بارگذاری کند وگرنه کاربر در تلاش بعدی همیشه خطا می‌بیند.
   */
  captchaConsumed?: boolean
  errors?: {
    subscription_plan?: string
    payment_receipt?: string
    userCaptcha?: string
    message?: string
  }
} | null

/** مسیر صفحه مدیریت درخواست‌های فعالسازی */
const ADMIN_STORES_PATH = '/admin/stores'

/** اطمینان از اینکه کاربر فعلی مدیر سایت است */
async function requireAdmin(): Promise<{ id: number } | null> {
  const userinfo = await getUserFromSession()
  if (!userinfo?.id || userinfo.role !== userRoles.enumValues[0]) return null
  return { id: userinfo.id }
}

function revalidateActivationPaths() {
  revalidatePath('/myStore')
  revalidatePath('/storeProfile')
  revalidatePath('/messages')
  revalidatePath(ADMIN_STORES_PATH)
}

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

  // اعتبارسنجی فیلدها پیش از کد امنیتی انجام می‌شود تا کاربر بابت خطای ساده
  // مجبور به حل دوباره کد امنیتی نشود
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

  // از این لحظه کد امنیتی مصرف شده است
  const consumed = { captchaConsumed: true } as const

  const userinfo = await getUserFromSession()
  const userId = userinfo?.id

  if (!userId) {
    return { success: false, ...consumed, errors: { message: 'نشست نامعتبر ، کاربری لاگین نکرده' } }
  }

  try {
    const [store] = await db.select().from(stores).where(eq(stores.user_id, userId)).limit(1)

    if (!store) {
      return { success: false, ...consumed, errors: { message: 'فروشگاهی برای این کاربر یافت نشد' } }
    }

    if (store.store_status === 'pending') {
      return {
        success: false,
        ...consumed,
        errors: {
          message:
            'درخواست فعالسازی شما قبلاً ثبت شده و در انتظار بررسی مدیر سایت است. تا زمان تعیین تکلیف آن، امکان ارسال درخواست جدید وجود ندارد.',
        },
      }
    }

    if (store.store_status === 'active' && new Date(store.expired_at) > new Date()) {
      return { success: false, ...consumed, errors: { message: 'اشتراک فروشگاه شما فعال است' } }
    }

    const plan = subscriptionPlan as SubscriptionPlan
    const receiptName = await saveStoreImage(receipt as File, 'receipt', store.id)
    const previousReceipt = store.payment_receipt

    await db.transaction(async (tx) => {
      await tx
        .update(stores)
        .set({
          subscription_plan: plan,
          payment_receipt: receiptName,
          activation_requested_at: new Date(),
          store_status: 'pending',
          // expired_at عمدا تغییر نمی‌کند : مدت اشتراک از لحظه تایید مدیر محاسبه می‌شود
        })
        .where(eq(stores.id, store.id))

      const [admin] = await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.role, userRoles.enumValues[0]))
        .orderBy(users.id)
        .limit(1)

      if (!admin) {
        throw new Error('admin user not found')
      }

      await tx.insert(messages).values({
        sender_id: userId,
        receiver_id: admin.id,
        subject: `درخواست فعال سازی فروشگاه : ${store.store_name}`,
        body: [
          `کاربر درخواست فعال سازی فروشگاه «${store.store_name}» را ارسال کرده است.`,
          '',
          `شناسه فروشگاه : ${store.id}`,
          `نام مدیر فروشگاه : ${store.store_manager}`,
          `مدت اشتراک درخواستی : ${SUBSCRIPTION_LABELS[plan]} (${SUBSCRIPTION_PRICES[plan].toLocaleString('fa-IR')} تومان)`,
          `تاریخ ثبت درخواست : ${formatDate(new Date())}`,
          previousReceipt ? `رسید قبلی : ${previousReceipt}` : '',
          '',
          `برای بررسی، تایید یا رد درخواست به صفحه زیر مراجعه کنید : ${ADMIN_STORES_PATH}`,
        ]
          .filter(Boolean)
          .join('\n'),
        message_type: 'store_activation_request',
      })
    })

    // فایل رسید قبلی فقط پس از موفقیت تراکنش حذف می‌شود
    if (previousReceipt && previousReceipt !== receiptName) {
      await deleteStoreImage(previousReceipt)
    }

    revalidateActivationPaths()

    return { success: true }
  } catch (error) {
    console.error('Store activation error:', error)

    if (error instanceof StoreImageError) {
      return { success: false, ...consumed, errors: { payment_receipt: error.message } }
    }

    return { success: false, ...consumed, errors: { message: 'خطا در ثبت درخواست، لطفاً دوباره تلاش کنید' } }
  }
}

/**
 * تایید نهایی مدیر سایت : فروشگاه فعال، کاربر به عنوان صاحب فروشگاه فعال علامت می‌خورد
 * و پیام تایید برای کاربر ارسال می‌شود.
 *
 * مدت اشتراک از لحظه تایید محاسبه می‌شود، نه از زمان ثبت درخواست.
 */
export async function approveStoreActivationAction(
  storeId: number
): Promise<{ success: boolean; message?: string }> {
  const admin = await requireAdmin()

  if (!admin) {
    return { success: false, message: 'دسترسی مجاز نیست' }
  }

  try {
    const [store] = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1)

    if (!store) {
      return { success: false, message: 'فروشگاه یافت نشد' }
    }

    if (store.store_status !== 'pending') {
      return { success: false, message: 'این درخواست در وضعیت «در انتظار تایید» نیست' }
    }

    if (!isSubscriptionPlan(store.subscription_plan)) {
      return { success: false, message: 'مدت اشتراک برای این فروشگاه مشخص نشده است' }
    }

    if (!store.payment_receipt) {
      return { success: false, message: 'رسید واریز برای این فروشگاه ثبت نشده است' }
    }

    const activatedAt = new Date()
    const expiredAt = calculateExpiredAt(store.subscription_plan, activatedAt)
    const planLabel = SUBSCRIPTION_LABELS[store.subscription_plan]

    await db.transaction(async (tx) => {
      await tx
        .update(stores)
        .set({
          store_status: 'active',
          on_air: true,
          activated_at: activatedAt,
          expired_at: expiredAt,
        })
        .where(and(eq(stores.id, storeId), eq(stores.store_status, 'pending')))

      await tx.update(users).set({ store_active: true }).where(eq(users.id, store.user_id))

      if (store.user_id !== admin.id) {
        await tx.insert(messages).values({
          sender_id: admin.id,
          receiver_id: store.user_id,
          subject: 'فروشگاه شما فعال شد',
          body: [
            `درخواست فعالسازی فروشگاه «${store.store_name}» تایید شد.`,
            '',
            `مدت اشتراک : ${planLabel}`,
            `تاریخ فعال سازی : ${formatDate(activatedAt)}`,
            `تاریخ پایان اشتراک : ${formatDate(expiredAt)}`,
            '',
            'از این پس فروشگاه شما در بازار نمایش داده می‌شود.',
          ].join('\n'),
          message_type: 'standard',
        })
      }
    })

    revalidateActivationPaths()

    return { success: true }
  } catch (error) {
    console.error('Approve store activation error:', error)
    return { success: false, message: 'خطا در تایید درخواست' }
  }
}

/**
 * رد درخواست فعالسازی توسط مدیر سایت.
 * وضعیت فروشگاه به غیرفعال برمی‌گردد و اطلاعات اشتراک/رسید پاک می‌شود
 * تا کاربر بتواند درخواست صحیح جدیدی ثبت کند.
 */
export async function rejectStoreActivationAction(
  storeId: number,
  reason?: string
): Promise<{ success: boolean; message?: string }> {
  const admin = await requireAdmin()

  if (!admin) {
    return { success: false, message: 'دسترسی مجاز نیست' }
  }

  try {
    const [store] = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1)

    if (!store) {
      return { success: false, message: 'فروشگاه یافت نشد' }
    }

    if (store.store_status !== 'pending') {
      return { success: false, message: 'این درخواست در وضعیت «در انتظار تایید» نیست' }
    }

    const receiptToDelete = store.payment_receipt
    const cleanReason = (reason || '').trim().slice(0, 500)

    await db.transaction(async (tx) => {
      await tx
        .update(stores)
        .set({
          store_status: 'inactive',
          on_air: false,
          subscription_plan: null,
          payment_receipt: null,
          activation_requested_at: null,
          activated_at: null,
        })
        .where(and(eq(stores.id, storeId), eq(stores.store_status, 'pending')))

      await tx.update(users).set({ store_active: false }).where(eq(users.id, store.user_id))

      if (store.user_id !== admin.id) {
        await tx.insert(messages).values({
          sender_id: admin.id,
          receiver_id: store.user_id,
          subject: 'درخواست فعالسازی فروشگاه تایید نشد',
          body: [
            `درخواست فعالسازی فروشگاه «${store.store_name}» تایید نشد.`,
            '',
            cleanReason ? `دلیل : ${cleanReason}` : '',
            '',
            'می‌توانید اطلاعات درخواست را اصلاح کرده و دوباره ارسال کنید.',
          ]
            .filter(Boolean)
            .join('\n'),
          message_type: 'standard',
        })
      }
    })

    await deleteStoreImage(receiptToDelete)

    revalidateActivationPaths()

    return { success: true }
  } catch (error) {
    console.error('Reject store activation error:', error)
    return { success: false, message: 'خطا در رد درخواست' }
  }
}