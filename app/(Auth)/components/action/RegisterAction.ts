// app/(Auth)/components/action/RegisterAction.ts
// حروف لاتین کوچک و بزرگ و اعداد و زیرخط و @#$%^& --- حداقل 5 و حداکثر 50 کاراکتر   --  نام کاربری
//  pattern="^[a-zA-Z0-9_@#$%^&]{5,50}$" 

 //پسوورد -- پترن پسورود حداقل 5 حرف حتما 	حداقل شامل  1 حرف کوچک -- حداقل 1 حرف بزرگ و  حداقل یک نشانه از @#$%^& باشد
//  pattern="/^(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&])[a-zA-Z0-9@#$%^&]{5,}$/"
// moblil_number    =>     pattern="/^09[0-9]{9}$/"

'use server'

import captchaValidationAction from '@/app/components/(captcha)/action/captchaValidationAction'
import { db , } from '@/app/db'
import { eq, or } from 'drizzle-orm'
import { users } from '@/app/db/schema'
import bcrypt from 'bcryptjs'
import { verifySmsCode } from '@/app/(Auth)/lib/smsCache'

export type RegisterState = {
  success: boolean
 
  errors?:{
    userName?:string 
    passWord?:string
    mobile_number?:string
    userCaptcha?:string
    sms_code?:string
   
    publicError?:string
 }
  values?:{
    userName:string
    mobile_number:string
 }
 } | null


 
 export async function RegisterAction(prevState: RegisterState, formData: FormData): Promise<RegisterState> {
   // 1. دریافت داده‌های فرم
   const userName = formData.get('userName') as string
   const password = formData.get('password') as string
   const mobile_number = formData.get('mobile_number') as string
   const captchaId = formData.get('captchaId') as string
   const userCaptchaInput = formData.get('userCaptchaInput') as string
   const sms_code = formData.get('sms_code') as string
 
  
 
   
   // 2. اعتبارسنجی اولیه

   const userName_validation: boolean =  /^[a-zA-Z0-9_@#$%^&]{5,50}$/.test(userName)
   const mobile_validation: boolean =  /^09[0-9]{9}$/.test(mobile_number)
   const password_validation: boolean =  /^[a-zA-Z0-9@#$%^&]{6,20}$/.test(password)
   const userCaptchaInput_validation: boolean =/^[ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789]{5}$/.test(userCaptchaInput)
   const sms_code_validation: boolean = /^[0-9]{5}$/.test(sms_code)
 
   if (!userName_validation || !mobile_validation || !password_validation || !captchaId || !userCaptchaInput_validation || !sms_code_validation) {
     
     return {
         success: false,
         errors:{
        userName: userName_validation ? "نام کاربری : باید حداقل داری 5 کاراکتر  شامل حروف لاتین ، اعداد ، زیر خط و علامت های @#$%^& باشد ." : undefined,
        passWord: password_validation ? "گذرواژه : باید  حداقل 5 حرف شامل حداقل  یک حرف کوچک -- حداقل یک حرف بزرگ و  حداقل یک  از نشانه های   @ # $ % ^ &  باشد . " : undefined,
        mobile_number:mobile_validation ? " شماره همراه : بدرستی وارد نشده است ." :undefined ,
        userCaptcha: userCaptchaInput_validation ? "کد امنیتی : بدرستی وارد نشده و یا خالی است ." : undefined,
        sms_code: sms_code_validation ? "کد تایید پیامکی : بدرستی وارد نشده است ." : undefined,
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

  // 3.5. اعتبارسنجی کد تایید پیامکی 
  const smsCodeValid = verifySmsCode(mobile_number, sms_code);
  if (!smsCodeValid) {
    return {
      success: false,
      errors:{
        sms_code: "کد تایید پیامکی : نامعتبر یا منقضی شده است . لطفا مجددا ارسال کنید .",
      },
      values:{ 
        userName:userName,
        mobile_number:mobile_number
      }
    }
  }
 
  // 4. بررسی تکراری نبودن نام کاربری و شماره موبایل و ذخیره در دیتابیس


   try {
     //  جستجوی کاربر در دیتابیس
     const existingUser = await db
       .select()
       .from(users)
       .where(
         or(
          eq(users.user_name, userName),
          eq(users.mobile_number, mobile_number)
          )
       );
       
 
     const errors: Record<string, string> = {};

        if (existingUser.some(u => u.user_name === userName)) {
          errors.userName = "این نام کاربری قبلاً استفاده شده است.";
        }

        if (existingUser.some(u => u.mobile_number === mobile_number)) {
          errors.mobile_number = "این شماره موبایل قبلاً ثبت شده است.";
        }

        if (Object.keys(errors).length) {
          return {
            success: false,
            errors,
            values: {
              userName,
              mobile_number,
            },
          };
        }
 
     // 6. هش کردن رمز عبور
     const hashedPassword = await bcrypt.hash(password, 10);
 
     // 7. درج کاربر جدید در دیتابیس
     await db.insert(users).values({
       user_name: userName,
       password: hashedPassword,
       mobile_number: mobile_number,
       mobile_number_isvalid: true,
       role: 'user',
       is_active: true,
     });
 
     return {
         success: true,
       };
 
   } catch (error) {
     console.error('Register error:', error)
     return {
         success: false,
         errors:{
            publicError:"به دلیل اشکال فنی  امکان ثبت نام شما در سایت نیست - با مدیریت سایت تماس بگیرید ."
          },
         values:{ 
         userName:userName,
          mobile_number:mobile_number
        }
       }
   }
 
 
 }
