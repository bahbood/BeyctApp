// app/(Auth)/components/action/profileAction.ts
'use server'

import captchaValidationAction from '@/app/components/(captcha)/action/captchaValidationAction'
import { db } from '@/app/db'
import { eq } from 'drizzle-orm'
import { users } from '@/app/db/schema'
import { createSession, decryptSession } from '../../lib/session'
import { cookies } from 'next/headers'
import { logined_User_Info } from '@/app/components/(Flyouts)/(Provider)/FlyoutPageContextProvider'

export type ProfileState = {
  success: boolean
  user?: logined_User_Info
  errors?: {
    name?: string
    family?: string
    email?: string
    userCaptcha?: string
   
    publicError?: string
  }
  values?: {
    name: string
    family: string
    email: string
  }
} | null

export async function ProfileAction(prevState: ProfileState, formData: FormData): Promise<ProfileState> {
 const name = String(formData.get('name') ?? '').trim();
const family = String(formData.get('family') ?? '').trim();
const email = String(formData.get('email') ?? '').trim();
const captchaId = String(formData.get('captchaId') ?? '').trim();
const userCaptchaInput = String(formData.get('userCaptchaInput') ?? '').trim();


  // 2. اعتبارسنجی اولیه

   const name_validation: boolean =  /^[\p{L}\p{M}\s]{2,20}$/u.test(name.trim());
   const family_validation: boolean = /^[\p{L}\p{M}\s]{2,25}$/u.test(family.trim());
   const eamil_validation: boolean = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
   const userCaptchaInput_validation: boolean = /^[ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789]{5}$/.test(userCaptchaInput)
   
 
if( !name_validation || !family_validation || !eamil_validation || !userCaptchaInput_validation || !captchaId)
{
  return{
    success:false,
    errors:{
      name : !name_validation ? "نام باید بین ۲ تا ۲۰ حرف باشد." : undefined ,
      family : !family_validation ? "نام خانوادگی باید بین ۲ تا ۲۵ حرف باشد." : undefined ,
      email : !eamil_validation ? "ایمیل دارای فرمت معتبر نیست ." : undefined ,
      userCaptcha : !userCaptchaInput_validation ? "کد امنیتی  وارد نشده ." : undefined ,
      publicError: !captchaId ? "اشکال فنی و یا مداخله  در ارسال مقادیر به سرور - با مدیریت سایت تماس بگیرید ." : undefined,

    }
  }
}

  
  

  const values = { name: name || '', family: family || '',   email: email || '', }

  


  const captchaResult = await captchaValidationAction(captchaId, userCaptchaInput)
  if (!captchaResult) {
    return { success: false, errors: { userCaptcha: 'کد امنیتی بدرستی وارد نشده' }, values }
  }

  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value
  if (!sessionCookie) {
    return { success: false, errors: { publicError: 'کاربر وارد سیستم نیست' }, values }
  }

  const payload = await decryptSession(sessionCookie)
  if (!payload) {
    console.log(payload)
    return { success: false, errors: { publicError: 'نشست نامعتبر' }, values }
  }

 const userId = Number(payload.userId)

if (!Number.isInteger(userId) || userId <= 0) {
  return {
    success: false,
    errors: { publicError: 'شناسه کاربر نامعتبر است.' },
    values,
  }
}

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
      payload.mobile as string,
      email.trim(),
      payload.store_active as boolean,
      payload.news_agency_active as boolean,
      payload.serviceman_active as boolean
    )

    if (!sessionResult.success) {
      return { success: false, errors: { publicError: 'خطا در به‌روزرسانی نشست' }, values }
    }

    return {
      success: true,
      user: sessionResult.user,
    }
  } catch (error) {
    console.error('Profile update error:', error)
    return { success: false, errors: { publicError: 'خطا در ارتباط با سرور' }, values }
  }
}
