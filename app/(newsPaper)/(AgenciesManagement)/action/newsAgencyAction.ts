// app/(newsPaper)/(AgenciesManagement)/action/newsAgencyAction.ts

'use server'

import captchaValidationAction from '@/app/components/(captcha)/action/captchaValidationAction'
import { getUserFromSession } from '@/app/(Auth)/lib/session'
import { db } from '@/app/db'
import { newsAgencies } from '@/app/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export type NewsAgencyActionState = {
  success: boolean
  /**
   * آیا کد امنیتی در سرور مصرف شده است؟
   * کد امنیتی فقط در صورت صحت حذف می‌شود، بنابراین اگر این مقدار true باشد
   * فرم باید یک کد جدید بارگذاری کند وگرنه کاربر در تلاش بعدی همیشه خطا می‌بیند.
   */
  captchaConsumed?: boolean
  errors?: {
    news_agency_name?: string
    news_agency_manager?: string
    news_agency_desc?: string
    userCaptcha?: string
    message?: string
  }
  values?: {
    news_agency_name: string
    news_agency_manager: string
    news_agency_desc: string
  }
} | null

type NewsAgencyFormValues = {
  news_agency_name: string
  news_agency_manager: string
  news_agency_desc: string
}

function validateNewsAgencyForm(formData: FormData): {
  errors: Record<string, string>
  values: NewsAgencyFormValues
} {
  const news_agency_name = ((formData.get('news_agency_name') as string) || '').trim()
  const news_agency_manager = ((formData.get('news_agency_manager') as string) || '').trim()
  const news_agency_desc = ((formData.get('news_agency_desc') as string) || '').trim()

  const errors: Record<string, string> = {}

  if (news_agency_name.length < 2) errors.news_agency_name = 'نام خبرگزاری حداقل ۲ کاراکتر'
  if (news_agency_name.length > 50) errors.news_agency_name = 'نام خبرگزاری حداکثر ۵۰ کاراکتر'
  if (news_agency_manager.length < 3) errors.news_agency_manager = 'نام مدیر خبرگزاری حداقل ۳ کاراکتر'
  if (news_agency_manager.length > 150) errors.news_agency_manager = 'نام مدیر خبرگزاری حداکثر ۱۵۰ کاراکتر'
  if (news_agency_desc.length < 5) errors.news_agency_desc = 'تعریف کوتاه خبرگزاری حداقل ۵ کاراکتر'
  if (news_agency_desc.length > 200) errors.news_agency_desc = 'تعریف کوتاه خبرگزاری حداکثر ۲۰۰ کاراکتر'

  return { errors, values: { news_agency_name, news_agency_manager, news_agency_desc } }
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

/** ثبت درخواست تاسیس خبرگزاری - خبرگزاری در ابتدا غیرفعال ثبت می شود */
export async function createNewsAgencyAction(
  prevState: NewsAgencyActionState,
  formData: FormData,
): Promise<NewsAgencyActionState> {
  const { errors, values } = validateNewsAgencyForm(formData)

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
    return {
      success: false,
      captchaConsumed: true,
      errors: { message: 'نشست نامعتبر ، کاربری لاگین نکرده' },
      values,
    }
  }

  try {
    const existing = await db
      .select({ id: newsAgencies.id })
      .from(newsAgencies)
      .where(eq(newsAgencies.user_id, userId))
      .limit(1)

    if (existing.length > 0) {
      return {
        success: false,
        captchaConsumed: true,
        errors: { message: 'شما قبلاً یک خبرگزاری ثبت کرده‌اید' },
        values,
      }
    }

    await db.insert(newsAgencies).values({
      news_agency_name: values.news_agency_name,
      news_agency_manager: values.news_agency_manager,
      news_agency_desc: values.news_agency_desc,
      on_air: false,
      news_agency_status: 'inactive',
      user_id: userId,
    })

    revalidatePath('/myNewsAgency')
    return { success: true, values }
  } catch (error) {
    console.error('Create news agency error:', error)

    if (error instanceof Error && error.message.includes('news_agencies_news_agency_name_unique')) {
      return {
        success: false,
        captchaConsumed: true,
        errors: { news_agency_name: 'این نام خبرگزاری قبلاً ثبت شده است' },
        values,
      }
    }

    return {
      success: false,
      captchaConsumed: true,
      errors: { message: 'خطا در ارتباط با سرور' },
      values,
    }
  }
}