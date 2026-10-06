// app/(Occupations)/(OccupationsManagment)/action/serviceAction.ts

'use server'

import captchaValidationAction from '@/app/components/(captcha)/action/captchaValidationAction'
import { getUserFromSession } from '@/app/(Auth)/lib/session'
import { db } from '@/app/db'
import { serviceCategories, services } from '@/app/db/schema'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { deleteServiceImageFile, saveServiceImage, ServiceImageError } from '../lib/serviceImagesDb'
import { syncServicemanActive } from '../../lib/syncServicemanActive'

export type ServiceFormValues = {
  service_id: string
  title: string
  short_desc: string
  contact1: string
  contact2: string
  office_address: string
  category_id: string
}

export type ServiceActionState = {
  success: boolean
  /**
   * آیا کد امنیتی در سرور مصرف شده است؟
   * کد امنیتی فقط در صورت صحت حذف می‌شود، بنابراین اگر این مقدار true باشد
   * فرم باید یک کد جدید بارگذاری کند وگرنه کاربر در تلاش بعدی همیشه خطا می‌بیند.
   */
  captchaConsumed?: boolean
  errors?: {
    title?: string
    short_desc?: string
    contact1?: string
    contact2?: string
    office_address?: string
    category_id?: string
    banner?: string
    userCaptcha?: string
    message?: string
  }
  values?: ServiceFormValues
} | null

function readValues(formData: FormData): ServiceFormValues {
  return {
    service_id: ((formData.get('service_id') as string) || '').trim(),
    title: ((formData.get('title') as string) || '').trim(),
    short_desc: ((formData.get('short_desc') as string) || '').trim(),
    contact1: ((formData.get('contact1') as string) || '').trim(),
    contact2: ((formData.get('contact2') as string) || '').trim(),
    office_address: ((formData.get('office_address') as string) || '').trim(),
    category_id: ((formData.get('category_id') as string) || '').trim(),
  }
}

function validateServiceForm(formData: FormData): { errors: Record<string, string>; values: ServiceFormValues } {
  const values = readValues(formData)
  const errors: Record<string, string> = {}

  if (values.title.length < 3) errors.title = 'عنوان خدمت حداقل ۳ کاراکتر'
  if (values.title.length > 100) errors.title = 'عنوان خدمت حداکثر ۱۰۰ کاراکتر'

  if (values.short_desc.length < 5) errors.short_desc = 'توضیح کوتاه حداقل ۵ کاراکتر'
  if (values.short_desc.length > 200) errors.short_desc = 'توضیح کوتاه حداکثر ۲۰۰ کاراکتر'

  if (!/^[0-9]{11}$/.test(values.contact1)) errors.contact1 = 'شماره تماس ۱ باید ۱۱ رقم باشد'
  if (values.contact2 && !/^[0-9]{11}$/.test(values.contact2)) errors.contact2 = 'شماره تماس ۲ باید ۱۱ رقم باشد'

  if (values.office_address.length < 5) errors.office_address = 'آدرس دفتر حداقل ۵ کاراکتر'
  if (values.office_address.length > 250) errors.office_address = 'آدرس دفتر حداکثر ۲۵۰ کاراکتر'

  if (!values.category_id) errors.category_id = 'دسته بندی خدمت را انتخاب کنید'

  return { errors, values }
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

/** دسته بندی باید وجود داشته و فعال باشد */
async function categoryExists(categoryId: number): Promise<boolean> {
  const rows = await db
    .select({ id: serviceCategories.id })
    .from(serviceCategories)
    .where(eq(serviceCategories.id, categoryId))
    .limit(1)

  return rows.length > 0
}

function readBanner(formData: FormData): File | null {
  const banner = formData.get('banner') as File | null
  if (!banner || banner.size === 0 || banner.name === '') return null
  return banner
}

function revalidateServicePaths() {
  revalidatePath('/myServices')
  revalidatePath('/asnaf')
}

/**
 * ثبت خدمت جدید — هر کاربر می تواند چند خدمت متمایز ثبت کند.
 * خدمت تازه ثبت شده غیرفعال است و برای نمایش باید اشتراک سالانه بخرد.
 */
export async function createServiceAction(prevState: ServiceActionState, formData: FormData): Promise<ServiceActionState> {
  const { errors, values } = validateServiceForm(formData)

  if (values.category_id && !(await categoryExists(Number(values.category_id)))) {
    errors.category_id = 'دسته بندی انتخاب شده معتبر نیست'
  }

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

  let newServiceId: number | null = null

  try {
    const [inserted] = await db
      .insert(services)
      .values({
        title: values.title,
        short_desc: values.short_desc,
        contact1: values.contact1,
        contact2: values.contact2 || null,
        office_address: values.office_address,
        category_id: Number(values.category_id),
        on_air: false,
        service_status: 'inactive',
        user_id: userId,
      })
      .returning({ id: services.id })

    newServiceId = inserted.id

    const banner = readBanner(formData)
    if (banner) {
      try {
        const bannerName = await saveServiceImage(banner, 'banner', newServiceId)
        await db.update(services).set({ banner: bannerName }).where(eq(services.id, newServiceId))
      } catch (fileError) {
        // ثبت رکورد بدون بنر بی معناست : همه چیز به حالت اول برمی گردد
        await db.delete(services).where(eq(services.id, newServiceId))
        newServiceId = null

        if (fileError instanceof ServiceImageError) {
          return { success: false, captchaConsumed: true, errors: { banner: fileError.message }, values }
        }
        throw fileError
      }
    }

    revalidateServicePaths()

    return { success: true, values }
  } catch (error) {
    console.error('Create service error:', error)

    if (newServiceId) {
      try {
        await db.delete(services).where(eq(services.id, newServiceId))
      } catch {
        // پاکسازی تلاش دوم است - خطای آن نباید خطای اصلی را بپوشاند
      }
    }

    if (error instanceof Error && error.message.includes('services_user_title_unique')) {
      return {
        success: false,
        captchaConsumed: true,
        errors: { title: 'شما قبلاً خدمتی با این عنوان ثبت کرده‌اید' },
        values,
      }
    }

    if (error instanceof ServiceImageError) {
      return { success: false, captchaConsumed: true, errors: { banner: error.message }, values }
    }

    return { success: false, captchaConsumed: true, errors: { message: 'خطا در ارتباط با سرور' }, values }
  }
}

/** ویرایش اطلاعات خدمت — بنر در صورت انتخاب فایل جدید جایگزین می شود */
export async function updateServiceAction(prevState: ServiceActionState, formData: FormData): Promise<ServiceActionState> {
  const { errors, values } = validateServiceForm(formData)

  if (values.category_id && !(await categoryExists(Number(values.category_id)))) {
    errors.category_id = 'دسته بندی انتخاب شده معتبر نیست'
  }

  const serviceId = Number(values.service_id)
  if (!values.service_id || !Number.isInteger(serviceId) || serviceId <= 0) {
    errors.message = 'شناسه خدمت نامعتبر است'
  }

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
    const [existing] = await db
      .select()
      .from(services)
      .where(and(eq(services.id, serviceId), eq(services.user_id, userId)))
      .limit(1)

    if (!existing) {
      return { success: false, captchaConsumed: true, errors: { message: 'خدمت مورد نظر یافت نشد' }, values }
    }

    const banner = readBanner(formData)
    let newBannerName: string | null = null

    if (banner) {
      try {
        newBannerName = await saveServiceImage(banner, 'banner', existing.id)
      } catch (fileError) {
        if (fileError instanceof ServiceImageError) {
          return { success: false, captchaConsumed: true, errors: { banner: fileError.message }, values }
        }
        throw fileError
      }
    }

    await db
      .update(services)
      .set({
        title: values.title,
        short_desc: values.short_desc,
        contact1: values.contact1,
        contact2: values.contact2 || null,
        office_address: values.office_address,
        category_id: Number(values.category_id),
        ...(newBannerName ? { banner: newBannerName } : {}),
        updated_at: new Date(),
      })
      .where(eq(services.id, existing.id))

    // فایل بنر قبلی فقط پس از موفقیت حذف می شود
    if (newBannerName && existing.banner && existing.banner !== newBannerName) {
      await deleteServiceImageFile(existing.banner)
    }

    revalidateServicePaths()

    return { success: true, values }
  } catch (error) {
    console.error('Update service error:', error)

    if (error instanceof Error && error.message.includes('services_user_title_unique')) {
      return {
        success: false,
        captchaConsumed: true,
        errors: { title: 'شما قبلاً خدمتی با این عنوان ثبت کرده‌اید' },
        values,
      }
    }

    return { success: false, captchaConsumed: true, errors: { message: 'خطا در ارتباط با سرور' }, values }
  }
}

/** حذف خدمت کاربر — بنر و رسید واریز نیز از دیسک پاک می شوند */
export async function deleteServiceAction(prevState: ServiceActionState, formData: FormData): Promise<ServiceActionState> {
  const serviceId = Number(((formData.get('service_id') as string) || '').trim())

  if (!Number.isInteger(serviceId) || serviceId <= 0) {
    return { success: false, errors: { message: 'شناسه خدمت نامعتبر است' } }
  }

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
    const [existing] = await db
      .select()
      .from(services)
      .where(and(eq(services.id, serviceId), eq(services.user_id, userId)))
      .limit(1)

    if (!existing) {
      return { success: false, captchaConsumed: true, errors: { message: 'خدمت مورد نظر یافت نشد' } }
    }

    await db.delete(services).where(eq(services.id, existing.id))

    // فایل‌ها فقط پس از حذف موفق رکورد پاک می شوند
    await deleteServiceImageFile(existing.banner)
    await deleteServiceImageFile(existing.payment_receipt)

    await syncServicemanActive(userId)

    revalidateServicePaths()

    return { success: true }
  } catch (error) {
    console.error('Delete service error:', error)
    return { success: false, captchaConsumed: true, errors: { message: 'خطا در ارتباط با سرور' } }
  }
}

/**
 * نمایش/پنهان سازی خدمت توسط صاحب آن (on_air)
 * فقط خدمت فعال و منقضی نشده اجازه نمایش در بانک مشاغل را دارد
 */
export async function toggleServiceOnAirAction(
  serviceId: number,
): Promise<{ success: boolean; on_air?: boolean; message?: string }> {
  const userinfo = await getUserFromSession()
  const userId = userinfo?.id

  if (!userId) {
    return { success: false, message: 'نشست نامعتبر ، کاربری لاگین نکرده' }
  }

  try {
    const [service] = await db
      .select()
      .from(services)
      .where(and(eq(services.id, serviceId), eq(services.user_id, userId)))
      .limit(1)

    if (!service) {
      return { success: false, message: 'خدمت مورد نظر یافت نشد' }
    }

    if (service.service_status !== 'active') {
      return { success: false, message: 'ابتدا اشتراک سالانه خدمت را فعال کنید' }
    }

    if (new Date(service.expired_at) < new Date()) {
      return { success: false, message: 'اشتراک خدمت منقضی شده است' }
    }

    if (service.is_outofaccess) {
      return { success: false, message: 'این خدمت توسط مدیر سایت محدود شده است' }
    }

    const next = !service.on_air

    await db.update(services).set({ on_air: next, updated_at: new Date() }).where(eq(services.id, service.id))

    revalidateServicePaths()

    return { success: true, on_air: next }
  } catch (error) {
    console.error('Toggle service on_air error:', error)
    return { success: false, message: 'خطا در ارتباط با سرور' }
  }
}
