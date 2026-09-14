// app/(Auth)/actions/loginAction.ts
'use server'

import { db , } from '@/app/db'
import { eq } from 'drizzle-orm'
import { users } from '@/app/db/schema'
import { createSession } from '../../lib/session'
import { logined_User_Info } from '@/app/components/(Flyouts)/(Provider)/FlyoutPageContextProvider'
import bcrypt from 'bcryptjs'
import captchaValidationAction from '@/app/components/(captcha)/action/captchaValidationAction'



export type ResetPasswordState = {
  success: boolean
 
 errors?:{
    userName?:string 
    mobile_number?:string
    userCaptcha?:string
   
    publicError?:string
 }
  values?:{
    userName:string
    mobile_number:string
 }
 } | null



export async function ResetPasswordAction(prevState: ResetPasswordState, formData: FormData): Promise<ResetPasswordState> {
  // 1. دریافت داده‌های فرم
  const userName = formData.get('userName') as string
  const mobile_number = formData.get('mobile_number') as string
  const captchaId = formData.get('captchaId') as string
  const userCaptchaInput = formData.get('userCaptchaInput') as string

 //console.log(" >>>>>>>> ", "u:",userName ,"  p:",password ,"  cpid:",captchaId , "   ucp:", userCaptchaInput)
  
  // 2. اعتبارسنجی اولیه

   const userName_validation: boolean =  /^[a-zA-Z0-9_@#$%^&]{5,50}$/.test(userName)
   const mobile_number_validation: boolean =  /^[a-zA-Z0-9@#$%^&]{6,20}$/.test(mobile_number)
   const userCaptchaInput_validation: boolean =/^[ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789]{5}$/.test(userCaptchaInput)

  if (!userName_validation || !mobile_number_validation || !captchaId || !userCaptchaInput_validation) {
    
    // console.log(formData)
    // console.log(" u: "+userName_validation.toString() +" p: " +password_validation.toString() + " capId : "+ captchaId +" Cap_in: " +userCaptchaInput_validation.toString() +" ")

    return {
       success: false,
      errors:{
        userName: userName_validation ? "نام کاربری : باید حداقل داری 5 کاراکتر  شامل حروف لاتین ، اعداد ، زیر خط و علامت های @#$%^& باشد ." : undefined,
        userCaptcha: userCaptchaInput_validation ? "کد امنیتی : بدرستی وارد نشده و یا خالی است ." : undefined,
        publicError: captchaId!="" ? "اشکال فنی و یا مداخله  در ارسال مقادیر به سرور - با مدیریت سایت تماس بگیرید ." : undefined,
        
      },
       values:{ 
        userName:userName,
        mobile_number:mobile_number
       }
     }

  }
 
  // 3. اعتبارسنجی کد امنیتی 
  const captchaResult = await captchaValidationAction(captchaId, userCaptchaInput);

//  console.log(" 71 >>>>>>>> ", "captchaResult:",captchaResult )
  if ( !captchaResult ) { 
    return {
        success: false,
        errors:{
        userCaptcha: "کد امنیتی : بدرستی وارد نشده است ." ,
      },
        values:{ 
        userName:userName,
        mobile_number:mobile_number
       }
     }
  }

 // 4 . لاگین


  try {
    // 5. 
    // جستجوی کاربر در دیتابیس
    const user = await db
      .select()
      .from(users)
      .where(eq(users.user_name, userName))
      .limit(1);

    if (user.length === 0) {
      return {
        success: false,
        errors:{
          userName:" نام کاربری و یا گذرواژه صحیح نیست . مجددا سعی نمایید . "
        }
        ,
        values:{ 
        userName:userName,
        mobile_number:mobile_number
       }
      };
    }

      const foundUser = user[0]
   

  


    return {
        success: true,
       
      };

   
    
  } catch (error) {
    console.error('Login error:', error)
    return {
        success: false,
       errors:{
            publicError:"به دلیل اشکال فنی  امکان ورود شما به سایت نیست - با مدیریت سایت تماس بگیرید ."
          },
        values:{ 
        userName:userName,
        mobile_number:mobile_number
       }
      }
  }


}


