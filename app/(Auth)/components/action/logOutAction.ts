// app/(Auth)/actions/logoutAction.ts

'use server'

import { revalidatePath } from 'next/cache'
import { deleteSession } from '../../lib/session'
import { logined_User_Info } from '@/app/components/(Flyouts)/(Provider)/FlyoutPageContextProvider'
import captchaValidationAction from '@/app/components/(captcha)/action/captchaValidationAction'
export type LogOutState = {
  success: boolean
  user?: logined_User_Info | null
  errors?: {
     userCaptcha?:string
     publicError?:string
  }
 
}



export async function logoutAction(prevState: LogOutState | null, formData: FormData): Promise<LogOutState> {
  try {
    // 1. دریافت داده‌های فرم
    const captchaId = formData.get('captchaId') as string
    const userCaptchaInput = formData.get('userCaptchaInput') as string

    // 2. اعتبارسنجی کد امنیتی
   const userCaptchaInput_validation: boolean =/^[ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789]{5}$/.test(userCaptchaInput)


    if (!captchaId || !userCaptchaInput) {
      return {
        success: false,
        errors: {
          userCaptcha: userCaptchaInput_validation ? "کد امنیتی : بدرستی وارد نشده و یا خالی است ." : undefined,
          publicError: captchaId!="" ? "اشکال فنی و یا مداخله  در ارسال مقادیر به سرور - با مدیریت سایت تماس بگیرید ." : undefined,

        },
       
      }
    }

    // 3. اعتبارسنجی کد امنیتی
    const captchaResult = await captchaValidationAction(captchaId, userCaptchaInput)
    if (!captchaResult) {
      return {
        success: false,
        errors: {
          userCaptcha: "کد امنیتی : بدرستی وارد نشده است ." ,

        },
       
      }
    }

    // 4. حذف سشن
    const result = await deleteSession()
    
    if (result.success) {
      revalidatePath('/')
      return { 
        success: true,
        user: null
      }
    }
    
    return {
      success: false,
      errors: {
          publicError:"به دلیل بروز اشکال فنی  امکان خروج شما از سایت نیست - با مدیریت سایت تماس بگیرید ."

      }
    }
  } catch (error) {
    console.error('Logout error:', error)
    return {
      success: false,
      errors: {
          publicError:"به دلیل بروز اشکال فنی  امکان خروج شما از سایت نیست - با مدیریت سایت تماس بگیرید ."

      }
    }
  }
}