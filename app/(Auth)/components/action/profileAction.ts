// app/(Auth)/components/action/profileAction.ts
'use server'

import captchaValidationAction from '@/app/components/(captcha)/action/captchaValidationAction'
import { db } from '@/app/db'
import { eq } from 'drizzle-orm'
import { users } from '@/app/db/schema'
import { createSession, decryptSession } from '../../lib/session'
import { cookies } from 'next/headers'
import { logined_User_Info } from '@/app/components/(Flyouts)/(Provider)/FlyoutPageContextProvider'
import { fa } from 'zod/locales'

export type ProfileState = {
  success: boolean
  user?: logined_User_Info
  errors?: {
    name?: string
    family?: string
    email?: string
    userCaptcha?: string
    message?: string
    publicError?: string
  }
  values?: {
    name: string
    family: string
    email: string
  }
} | null

export async function ProfileAction(prevState: ProfileState, formData: FormData): Promise<ProfileState> {
  const name = formData.get('name') as string
  const family = formData.get('family') as string
  //const mobile = formData.get('mobile') as string
  const email = formData.get('email') as string
  const captchaId = formData.get('captchaId') as string
  const userCaptchaInput = formData.get('userCaptchaInput') as string


  // 2. اعتبارسنجی اولیه

   const name_validation: boolean =  name.trim().length < 2
   const family_validation: boolean = family.trim().length < 2
   const eamil_validation: boolean = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
   const userCaptchaInput_validation: boolean = /^[ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789]{5}$/.test(userCaptchaInput)
   
 
if( !name_validation || !family_validation || !eamil_validation || !userCaptchaInput_validation )
{
  return{
    success:false,
    errors:{
      name : name_validation ? "نام  باید بیشتر از 2 حرف باشد ." : undefined ,
      family : family_validation ? "نام خانوادگی باید بیشتر از 2 حرف باشد ." : undefined ,
      email : eamil_validation ? "ایمیل دارای فرمت معتبر نیست ." : undefined ,
      userCaptcha : userCaptchaInput_validation ? "کد امنیتی  وارد نشده ." : undefined ,
      publicError: captchaId!="" ? "اشکال فنی و یا مداخله  در ارسال مقادیر به سرور - با مدیریت سایت تماس بگیرید ." : undefined,

    }
  }
}

  const errors: Record<string, string> = {}
  

  const values = { name: name || '', family: family || '',   email: email || '', avatar: '' }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, values }
  }


  const captchaResult = await captchaValidationAction(captchaId, userCaptchaInput)
  if (!captchaResult) {
    return { success: false, errors: { userCaptcha: 'کد امنیتی بدرستی وارد نشده' }, values }
  }

  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value
  if (!sessionCookie) {
    return { success: false, errors: { message: 'کاربر وارد سیستم نیست' }, values }
  }

  const payload = await decryptSession(sessionCookie)
  if (!payload) {
    console.log(payload)
    return { success: false, errors: { message: 'نشست نامعتبر' }, values }
  }

  const userId = Number(payload.userId)

  try {
    await db.update(users).set({
      name: name.trim(),
      family: family.trim(),
     // mobile_number: mobile.trim(),
      email: email.trim() || null,
    }).where(eq(users.id, userId))

    const sessionResult = await createSession(
      userId,
      payload.userName as string,
      payload.role as string,
      payload.isActive as boolean,
      name.trim(),
      family.trim(),
      (payload.avatar as string) || '',
      "mobile",
      email.trim(),
      payload.store_active as boolean,
      payload.news_agency_active as boolean,
      payload.serviceman_active as boolean
    )

    if (!sessionResult.success) {
      return { success: false, errors: { message: 'خطا در به‌روزرسانی نشست' }, values }
    }

    return {
      success: true,
      user: sessionResult.user,
    }
  } catch (error) {
    console.error('Profile update error:', error)
    return { success: false, errors: { message: 'خطا در ارتباط با سرور' }, values }
  }
}
