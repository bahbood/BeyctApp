// app/(Occupations)/(OccupationsManagment)/action/serviceActivationAction.ts

'use server'

import captchaValidationAction from '@/app/components/(captcha)/action/captchaValidationAction'
import { getUserFromSession } from '@/app/(Auth)/lib/session'
import { db } from '@/app/db'
import { messages, serviceCategories, services, users } from '@/app/db/schema'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import {
  calculateYearlyExpiredAt,
  formatDate,
  SERVICE_SUBSCRIPTION_LABEL,
  SERVICE_YEARLY_PRICE,
} from '../lib/serviceSubscription'
import { deleteServiceImageFile, saveServiceImage, ServiceImageError } from '../lib/serviceImagesDb'
import { syncServicemanActive } from '../../lib/syncServicemanActive'
import { requireServiceAdmin } from '../../lib/serviceAccess'

export type ServiceActivationState = {
  success: boolean
  /**
   * آیا کد امنیتی در سرور مصرف شده است؟
   * کد امنیتی فقط در صورت صحت حذف می‌شود، بنابراین اگر این مقدار true باشد
   * فرم باید یک کد جدید بارگذاری کند وگرنه کاربر در تلاش بعدی همیشه خطا می‌بیند.
   */
  captchaConsumed?: boolean
  errors?: {
    payment_receipt?: string
    userCaptcha?: string
    message?: string
  }
} | null

/** مسیر صفحه مدیریت درخواست‌های فعالسازی خدمات */
const ADMIN_SERVICES_PATH = '/admin/services'

function revalidateActivationPaths() {
  revalidatePath('/myServices')
  revalidatePath('/asnaf')
  revalidatePath('/messages')
  revalidatePath(ADMIN_SERVICES_PATH)
}

/**
 * ارسال درخواست فعالسازی خدمت : پرداخت اشتراک سالانه و بارگذاری رسید واریز بانکی
 * خدمت پس از تایید مدیر سایت برای یک سال فعال می شود.
 */
export async function serviceActivationAction(
  prevState: ServiceActivationState,
  formData: FormData,
): Promise<ServiceActivationState> {
  const serviceId = Number(((formData.get('service_id') as string) || '').trim())
  const captchaId = formData.get('captchaId') as string
  const userCaptchaInput = formData.get('userCaptchaInput') as string
  const receipt = formData.get('payment_receipt') as File | null

  const errors: NonNullable<ServiceActivationState>['errors'] = {}

  if (!Number.isInteger(serviceId) || serviceId <= 0) {
    errors.message = 'شناسه خدمت نامعتبر است'
  }

  if (!receipt || receipt.size === 0) {
    errors.payment_receipt = 'تصویر رسید واریز بانکی را پیوست کنید'
  }

  // اعتبارسنجی فیلدها پیش از کد امنیتی انجام می شود تا کاربر بابت خطای ساده
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
    const [service] = await db
      .select()
      .from(services)
      .where(and(eq(services.id, serviceId), eq(services.user_id, userId)))
      .limit(1)

    if (!service) {
      return { success: false, ...consumed, errors: { message: 'خدمت مورد نظر یافت نشد' } }
    }

    if (service.service_status === 'pending') {
      return {
        success: false,
        ...consumed,
        errors: {
          message:
            'درخواست فعالسازی شما قبلاً ثبت شده و در انتظار بررسی مدیر سایت است. تا زمان تعیین تکلیف آن، امکان ارسال درخواست جدید وجود ندارد.',
        },
      }
    }

    if (service.service_status === 'active' && new Date(service.expired_at) > new Date()) {
      return { success: false, ...consumed, errors: { message: 'اشتراک این خدمت فعال است' } }
    }

    const receiptName = await saveServiceImage(receipt as File, 'receipt', service.id)
    const previousReceipt = service.payment_receipt

    const [category] = await db
      .select({ name: serviceCategories.name })
      .from(serviceCategories)
      .where(eq(serviceCategories.id, service.category_id))
      .limit(1)

    await db.transaction(async (tx) => {
      await tx
        .update(services)
        .set({
          payment_receipt: receiptName,
          activation_requested_at: new Date(),
          service_status: 'pending',
          // expired_at عمدا تغییر نمی کند : مدت اشتراک از لحظه تایید مدیر محاسبه می شود
        })
        .where(eq(services.id, service.id))

      const [admin] = await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.role, 'admin'))
        .orderBy(users.id)
        .limit(1)

      if (!admin) {
        throw new Error('admin user not found')
      }

      await tx.insert(messages).values({
        sender_id: userId,
        receiver_id: admin.id,
        subject: `درخواست فعال سازی خدمت : ${service.title}`,
        body: [
          `کاربر درخواست فعالسازی خدمت «${service.title}» را ارسال کرده است.`,
          '',
          `شناسه خدمت : ${service.id}`,
          `دسته بندی : ${category?.name ?? '-'}`,
          `مبلغ اشتراک سالانه : ${SERVICE_YEARLY_PRICE.toLocaleString('fa-IR')} تومان`,
          `تاریخ ثبت درخواست : ${formatDate(new Date())}`,
          previousReceipt ? `رسید قبلی : ${previousReceipt}` : '',
          '',
          `برای بررسی، تایید یا رد درخواست به صفحه زیر مراجعه کنید : ${ADMIN_SERVICES_PATH}`,
        ]
          .filter(Boolean)
          .join('\n'),
        message_type: 'service_activation_request',
      })
    })

    // فایل رسید قبلی فقط پس از موفقیت تراکنش حذف می شود
    if (previousReceipt && previousReceipt !== receiptName) {
      await deleteServiceImageFile(previousReceipt)
    }

    revalidateActivationPaths()

    return { success: true }
  } catch (error) {
    console.error('Service activation error:', error)

    if (error instanceof ServiceImageError) {
      return { success: false, ...consumed, errors: { payment_receipt: error.message } }
    }

    return { success: false, ...consumed, errors: { message: 'خطا در ثبت درخواست، لطفاً دوباره تلاش کنید' } }
  }
}

/**
 * تایید نهایی مدیر سایت : خدمت برای یک سال فعال،
 * کاربر به عنوان صاحب خدمت فعال علامت می خورد و پیام تایید ارسال می شود.
 *
 * مدت اشتراک از لحظه تایید محاسبه می شود، نه از زمان ثبت درخواست.
 */
export async function approveServiceActivationAction(
  serviceId: number,
): Promise<{ success: boolean; message?: string }> {
  const admin = await requireServiceAdmin()

  if (!admin) {
    return { success: false, message: 'دسترسی مجاز نیست' }
  }

  try {
    const [service] = await db.select().from(services).where(eq(services.id, serviceId)).limit(1)

    if (!service) {
      return { success: false, message: 'خدمت یافت نشد' }
    }

    if (service.service_status !== 'pending') {
      return { success: false, message: 'این درخواست در وضعیت «در انتظار تایید» نیست' }
    }

    if (!service.payment_receipt) {
      return { success: false, message: 'رسید واریز برای این خدمت ثبت نشده است' }
    }

    const activatedAt = new Date()
    const expiredAt = calculateYearlyExpiredAt(activatedAt)

    await db.transaction(async (tx) => {
      await tx
        .update(services)
        .set({
          service_status: 'active',
          on_air: true,
          activated_at: activatedAt,
          expired_at: expiredAt,
        })
        .where(and(eq(services.id, serviceId), eq(services.service_status, 'pending')))

      if (service.user_id !== admin.id) {
        await tx.insert(messages).values({
          sender_id: admin.id,
          receiver_id: service.user_id,
          subject: 'خدمت شما فعال شد',
          body: [
            `درخواست فعالسازی خدمت «${service.title}» تایید شد.`,
            '',
            `مدت اشتراک : ${SERVICE_SUBSCRIPTION_LABEL}`,
            `تاریخ فعال سازی : ${formatDate(activatedAt)}`,
            `تاریخ پایان اشتراک : ${formatDate(expiredAt)}`,
            '',
            'از این پس این خدمت در بانک مشاغل سایت نمایش داده می شود.',
          ].join('\n'),
          message_type: 'standard',
        })
      }
    })

    await syncServicemanActive(service.user_id)

    revalidateActivationPaths()

    return { success: true }
  } catch (error) {
    console.error('Approve service activation error:', error)
    return { success: false, message: 'خطا در تایید درخواست' }
  }
}

/**
 * رد درخواست فعالسازی توسط مدیر سایت.
 * وضعیت خدمت به غیرفعال برمی گردد و اطلاعات اشتراک/رسید پاک می شود
 * تا کاربر بتواند درخواست صحیح جدیدی ثبت کند.
 */
export async function rejectServiceActivationAction(
  serviceId: number,
  reason?: string,
): Promise<{ success: boolean; message?: string }> {
  const admin = await requireServiceAdmin()

  if (!admin) {
    return { success: false, message: 'دسترسی مجاز نیست' }
  }

  try {
    const [service] = await db.select().from(services).where(eq(services.id, serviceId)).limit(1)

    if (!service) {
      return { success: false, message: 'خدمت یافت نشد' }
    }

    if (service.service_status !== 'pending') {
      return { success: false, message: 'این درخواست در وضعیت «در انتظار تایید» نیست' }
    }

    const receiptToDelete = service.payment_receipt
    const cleanReason = (reason || '').trim().slice(0, 500)

    await db.transaction(async (tx) => {
      await tx
        .update(services)
        .set({
          service_status: 'inactive',
          on_air: false,
          payment_receipt: null,
          activation_requested_at: null,
          activated_at: null,
        })
        .where(and(eq(services.id, serviceId), eq(services.service_status, 'pending')))

      if (service.user_id !== admin.id) {
        await tx.insert(messages).values({
          sender_id: admin.id,
          receiver_id: service.user_id,
          subject: 'درخواست فعالسازی خدمت تایید نشد',
          body: [
            `درخواست فعالسازی خدمت «${service.title}» تایید نشد.`,
            '',
            cleanReason ? `دلیل : ${cleanReason}` : '',
            '',
            'می توانید اطلاعات درخواست را اصلاح کرده و دوباره ارسال کنید.',
          ]
            .filter(Boolean)
            .join('\n'),
          message_type: 'standard',
        })
      }
    })

    await deleteServiceImageFile(receiptToDelete)
    await syncServicemanActive(service.user_id)

    revalidateActivationPaths()

    return { success: true }
  } catch (error) {
    console.error('Reject service activation error:', error)
    return { success: false, message: 'خطا در رد درخواست' }
  }
}
