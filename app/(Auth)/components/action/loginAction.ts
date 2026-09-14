// app/(Auth)/actions/loginAction.ts
'use server'

import { db , } from '@/app/db'
import { eq } from 'drizzle-orm'
import { users } from '@/app/db/schema'
import { createSession } from '../../lib/session'
import { logined_User_Info } from '@/app/components/(Flyouts)/(Provider)/FlyoutPageContextProvider'
import bcrypt from 'bcryptjs'
import captchaValidationAction from '@/app/components/(captcha)/action/captchaValidationAction'



export type LoginState = {
  success: boolean
  user?: logined_User_Info | null
 
 errors?:{
    userName?:string 
    passWord?:string
    userCaptcha?:string
   
    publicError?:string
 }
  values?:{
    userName:string
 }
 } | null



export async function loginAction(prevState: LoginState, formData: FormData): Promise<LoginState> {
  // 1. دریافت داده‌های فرم
  const userName = formData.get('userName') as string
  const password = formData.get('password') as string
  const captchaId = formData.get('captchaId') as string
  const userCaptchaInput = formData.get('userCaptchaInput') as string

 //console.log(" >>>>>>>> ", "u:",userName ,"  p:",password ,"  cpid:",captchaId , "   ucp:", userCaptchaInput)
  
  // 2. اعتبارسنجی اولیه

   const userName_validation: boolean =  /^[a-zA-Z0-9_@#$%^&]{5,50}$/.test(userName)
   const password_validation: boolean =  /^[a-zA-Z0-9@#$%^&]{6,20}$/.test(password)
   const userCaptchaInput_validation: boolean =/^[ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789]{5}$/.test(userCaptchaInput)

   // test
console.log("loginAction : u: ",userName,"p: ",password ,"cpid :" ,captchaId , "ucpIn : " ,userCaptchaInput)
console.log("validation : uV: ",userName_validation,"pV: ",password_validation ,"cpV :" ,userCaptchaInput_validation ,)

  if (!userName_validation || !password_validation || !captchaId || !userCaptchaInput_validation) {
    
    // console.log(formData)
    // console.log(" u: "+userName_validation.toString() +" p: " +password_validation.toString() + " capId : "+ captchaId +" Cap_in: " +userCaptchaInput_validation.toString() +" ")

    return {
       success: false,
      errors:{
        userName: userName_validation ? "نام کاربری : باید حداقل داری 5 کاراکتر  شامل حروف لاتین ، اعداد ، زیر خط و علامت های @#$%^& باشد ." : undefined,
        passWord: password_validation ? "گذرواژه : باید  حداقل 5 حرف شامل حداقل  یک حرف کوچک -- حداقل یک حرف بزرگ و  حداقل یک  از نشانه های   @ # $ % ^ &  باشد . " : undefined,
        userCaptcha: userCaptchaInput_validation ? "کد امنیتی : بدرستی وارد نشده و یا خالی است ." : undefined,
        publicError: captchaId!="" ? "اشکال فنی و یا مداخله  در ارسال مقادیر به سرور - با مدیریت سایت تماس بگیرید ." : undefined,
        
      },
       values:{ 
        userName:userName,
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
       }
      };
    }

      const foundUser = user[0]
    // ********** بررسی رمز عبور **********
    const passwordMatch = await bcrypt.compare(password, foundUser.password)
    if (!passwordMatch) {
      return {
       
          success: false,
          errors:{
          userName:" نام کاربری و یا گذرواژه صحیح نیست . مجددا سعی نمایید . "
        },
          values: { userName }
        };
      }


    // ساخت کوکی و ارسال به مرورگر
    const sessionResult=await createSession( foundUser.id , foundUser.user_name ,foundUser.role as string , foundUser.is_active as boolean 
      ,foundUser.name as string,foundUser.family as string,foundUser.avatar as string
      ,foundUser.mobile_number as string,foundUser.email as string
      ,foundUser.store_active as boolean,foundUser.news_agency_active as boolean,foundUser.serviceman_active as boolean);

    if( !sessionResult ){
       return {
          success: false,
          errors:{
            publicError:"به دلیل اشکال فنی  امکان ورود شما به سایت نیست - با مدیریت سایت تماس بگیرید ."
          }
          ,
           values:{ 
           userName:userName,
       }
        };
    }



    return {
        success: true,
        user:sessionResult.user || null
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
       }
      }
  }


}


