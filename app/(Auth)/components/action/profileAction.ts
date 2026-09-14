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
    mobile?: string
    email?: string
    userCaptcha?: string
    message?: string
  }
  values?: {
    name: string
    family: string
    mobile: string
    email: string
    avatar: string
  }
} | null

export async function ProfileAction(prevState: ProfileState, formData: FormData): Promise<ProfileState> {
  const name = formData.get('name') as string
  const family = formData.get('family') as string
  const mobile = formData.get('mobile') as string
  const email = formData.get('email') as string
  const captchaId = formData.get('captchaId') as string
  const userCaptchaInput = formData.get('userCaptchaInput') as string

  const errors: Record<string, string> = {}
  if (!name || name.trim().length < 2) errors.name = 'نام باید حداقل ۲ کاراکتر باشد'
  if (!family || family.trim().length < 2) errors.family = 'نام خانوادگی باید حداقل ۲ کاراکتر باشد'
  if (!mobile || !/^09\d{9}$/.test(mobile)) errors.mobile = 'شماره موبایل ۱۱ رقمی و با ۰۹ شروع شود'
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'ایمیل را بدرستی وارد کنید'

  const values = { name: name || '', family: family || '', mobile: mobile || '', email: email || '', avatar: '' }

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
      mobile_number: mobile.trim(),
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
      mobile.trim(),
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
