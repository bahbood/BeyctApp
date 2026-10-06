// app/(newsPaper)/(AgenciesManagement)/action/newsAgencyActivationAction.ts

'use server'

import captchaValidationAction from '@/app/components/(captcha)/action/captchaValidationAction'
import { getUserFromSession } from '@/app/(Auth)/lib/session'
import { db } from '@/app/db'
import { messages, newsAgencies, users, userRoles } from '@/app/db/schema'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import {
  calculateNewsAgencyExpiredAt,
  formatNewsAgencyDate,
  isNewsAgencySubscriptionPlan,
  NEWS_AGENCY_SUBSCRIPTION_LABELS,
  NEWS_AGENCY_SUBSCRIPTION_PRICES,
  type NewsAgencyPlan,
} from '../lib/newsAgencySubscription'
import {
  deleteNewsAgencyImageFile,
  saveNewsAgencyImage,
  NewsAgencyImageError,
} from '../lib/newsAgencyImagesDb'

export type NewsAgencyActivationState = {
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

/** مسیر صفحه مدیریت درخواست‌های فعالسازی خبرگزاری */
const ADMIN_NEWS_AGENCIES_PATH = '/admin/newsAgencies'

/** اطمینان از اینکه کاربر فعلی مدیر سایت است */
async function requireAdmin(): Promise<{ id: number } | null> {
  const userinfo = await getUserFromSession()
  if (!userinfo?.id || userinfo.role !== userRoles.enumValues[0]) return null
  return { id: userinfo.id }
}

function revalidateActivationPaths() {
  revalidatePath('/myNewsAgency')
  revalidatePath('/newsAgencyProfile')
  revalidatePath('/messages')
  revalidatePath(ADMIN_NEWS_AGENCIES_PATH)
}

/** ارسال درخواست فعالسازی خبرگزاری : انتخاب مدت اشتراک و بارگذاری رسید واریز بانکی */
export async function newsAgencyActivationAction(
  prevState: NewsAgencyActivationState,
  formData: FormData,
): Promise<NewsAgencyActivationState> {
  const captchaId = formData.get('captchaId') as string
  const userCaptchaInput = formData.get('userCaptchaInput') as string
  const subscriptionPlan = formData.get('subscription_plan') as string
  const receipt = formData.get('payment_receipt') as File | null

  const errors: NonNullable<NewsAgencyActivationState>['errors'] = {}

  if (!isNewsAgencySubscriptionPlan(subscriptionPlan)) {
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

  const consumed = { captchaConsumed: true } as const

  const userinfo = await getUserFromSession()
  const userId = userinfo?.id

  if (!userId) {
    return { success: false, ...consumed, errors: { message: 'نشست نامعتبر ، کاربری لاگین نکرده' } }
  }

  try {
    const [agency] = await db.select().from(newsAgencies).where(eq(newsAgencies.user_id, userId)).limit(1)

    if (!agency) {
      return { success: false, ...consumed, errors: { message: 'خبرگزاری برای این کاربر یافت نشد' } }
    }

    if (agency.news_agency_status === 'pending') {
      return {
        success: false,
        ...consumed,
        errors: {
          message:
            'درخواست فعالسازی شما قبلاً ثبت شده و در انتظار بررسی مدیر سایت است. تا زمان تعیین تکلیف آن، امکان ارسال درخواست جدید وجود ندارد.',
        },
      }
    }

    if (agency.news_agency_status === 'active' && new Date(agency.expired_at) > new Date()) {
      return { success: false, ...consumed, errors: { message: 'اشتراک خبرگزاری شما فعال است' } }
    }

    const plan = subscriptionPlan as NewsAgencyPlan
    const receiptName = await saveNewsAgencyImage(receipt as File, 'receipt', agency.id)
    const previousReceipt = agency.payment_receipt

    await db.transaction(async (tx) => {
      await tx
        .update(newsAgencies)
        .set({
          subscription_plan: plan,
          payment_receipt: receiptName,
          activation_requested_at: new Date(),
          news_agency_status: 'pending',
          // expired_at عمدا تغییر نمی‌کند : مدت اشتراک از لحظه تایید مدیر محاسبه می‌شود
        })
        .where(eq(newsAgencies.id, agency.id))

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
        subject: `درخواست فعال سازی خبرگزاری : ${agency.news_agency_name}`,
        body: [
          `کاربر درخواست فعال سازی خبرگزاری «${agency.news_agency_name}» را ارسال کرده است.`,
          '',
          `شناسه خبرگزاری : ${agency.id}`,
          `نام مدیر خبرگزاری : ${agency.news_agency_manager}`,
          `مدت اشتراک درخواستی : ${NEWS_AGENCY_SUBSCRIPTION_LABELS[plan]} (${NEWS_AGENCY_SUBSCRIPTION_PRICES[
            plan
          ].toLocaleString('fa-IR')} تومان)`,
          `تاریخ ثبت درخواست : ${formatNewsAgencyDate(new Date())}`,
          previousReceipt ? `رسید قبلی : ${previousReceipt}` : '',
          '',
          `برای بررسی، تایید یا رد درخواست به صفحه زیر مراجعه کنید : ${ADMIN_NEWS_AGENCIES_PATH}`,
        ]
          .filter(Boolean)
          .join('\n'),
        message_type: 'news_agency_request',
      })
    })

    if (previousReceipt && previousReceipt !== receiptName) {
      await deleteNewsAgencyImageFile(previousReceipt)
    }

    revalidateActivationPaths()

    return { success: true }
  } catch (error) {
    console.error('News agency activation error:', error)

    if (error instanceof NewsAgencyImageError) {
      return { success: false, ...consumed, errors: { payment_receipt: error.message } }
    }

    return { success: false, ...consumed, errors: { message: 'خطا در ثبت درخواست، لطفاً دوباره تلاش کنید' } }
  }
}

/** تایید نهایی مدیر سایت : خبرگزاری فعال می شود */
export async function approveNewsAgencyActivationAction(
  newsAgencyId: number,
): Promise<{ success: boolean; message?: string }> {
  const admin = await requireAdmin()

  if (!admin) {
    return { success: false, message: 'دسترسی مجاز نیست' }
  }

  try {
    const [agency] = await db.select().from(newsAgencies).where(eq(newsAgencies.id, newsAgencyId)).limit(1)

    if (!agency) {
      return { success: false, message: 'خبرگزاری یافت نشد' }
    }

    if (agency.news_agency_status !== 'pending') {
      return { success: false, message: 'این درخواست در وضعیت «در انتظار تایید» نیست' }
    }

    if (!isNewsAgencySubscriptionPlan(agency.subscription_plan)) {
      return { success: false, message: 'مدت اشتراک برای این خبرگزاری مشخص نشده است' }
    }

    if (!agency.payment_receipt) {
      return { success: false, message: 'رسید واریز برای این خبرگزاری ثبت نشده است' }
    }

    const activatedAt = new Date()
    const expiredAt = calculateNewsAgencyExpiredAt(agency.subscription_plan, activatedAt)
    const planLabel = NEWS_AGENCY_SUBSCRIPTION_LABELS[agency.subscription_plan]

    await db.transaction(async (tx) => {
      await tx
        .update(newsAgencies)
        .set({
          news_agency_status: 'active',
          on_air: true,
          activated_at: activatedAt,
          expired_at: expiredAt,
        })
        .where(and(eq(newsAgencies.id, newsAgencyId), eq(newsAgencies.news_agency_status, 'pending')))

      await tx.update(users).set({ news_agency_active: true }).where(eq(users.id, agency.user_id))

      if (agency.user_id !== admin.id) {
        await tx.insert(messages).values({
          sender_id: admin.id,
          receiver_id: agency.user_id,
          subject: 'خبرگزاری شما فعال شد',
          body: [
            `درخواست فعالسازی خبرگزاری «${agency.news_agency_name}» تایید شد.`,
            '',
            `مدت اشتراک : ${planLabel}`,
            `تاریخ فعال سازی : ${formatNewsAgencyDate(activatedAt)}`,
            `تاریخ پایان اشتراک : ${formatNewsAgencyDate(expiredAt)}`,
            '',
            'از این پس خبرگزاری شما در بخش خبرنامه قابل استفاده است.',
          ].join('\n'),
          message_type: 'standard',
        })
      }
    })

    revalidateActivationPaths()

    return { success: true }
  } catch (error) {
    console.error('Approve news agency activation error:', error)
    return { success: false, message: 'خطا در تایید درخواست' }
  }
}

/** رد درخواست فعالسازی خبرگزاری توسط مدیر سایت */
export async function rejectNewsAgencyActivationAction(
  newsAgencyId: number,
  reason?: string,
): Promise<{ success: boolean; message?: string }> {
  const admin = await requireAdmin()

  if (!admin) {
    return { success: false, message: 'دسترسی مجاز نیست' }
  }

  try {
    const [agency] = await db.select().from(newsAgencies).where(eq(newsAgencies.id, newsAgencyId)).limit(1)

    if (!agency) {
      return { success: false, message: 'خبرگزاری یافت نشد' }
    }

    if (agency.news_agency_status !== 'pending') {
      return { success: false, message: 'این درخواست در وضعیت «در انتظار تایید» نیست' }
    }

    const receiptToDelete = agency.payment_receipt
    const cleanReason = (reason || '').trim().slice(0, 500)

    await db.transaction(async (tx) => {
      await tx
        .update(newsAgencies)
        .set({
          news_agency_status: 'inactive',
          on_air: false,
          subscription_plan: null,
          payment_receipt: null,
          activation_requested_at: null,
          activated_at: null,
        })
        .where(and(eq(newsAgencies.id, newsAgencyId), eq(newsAgencies.news_agency_status, 'pending')))

      await tx.update(users).set({ news_agency_active: false }).where(eq(users.id, agency.user_id))

      if (agency.user_id !== admin.id) {
        await tx.insert(messages).values({
          sender_id: admin.id,
          receiver_id: agency.user_id,
          subject: 'درخواست فعالسازی خبرگزاری تایید نشد',
          body: [
            `درخواست فعالسازی خبرگزاری «${agency.news_agency_name}» تایید نشد.`,
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

    await deleteNewsAgencyImageFile(receiptToDelete)

    revalidateActivationPaths()

    return { success: true }
  } catch (error) {
    console.error('Reject news agency activation error:', error)
    return { success: false, message: 'خطا در رد درخواست' }
  }
}