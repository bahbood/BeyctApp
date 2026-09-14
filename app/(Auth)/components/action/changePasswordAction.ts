import captchaValidationAction from "@/app/components/(captcha)/action/captchaValidationAction"

export type ChangePasswordState = {
  success: boolean
  errors?:{
    Old_PassWord?:string 
    New_PassWord?:string
    userCaptcha?:string
   
    publicError?:string
}
  
 } | null
 

 export async function ChangePasswordAction(prevState: ChangePasswordState, formData: FormData): Promise<ChangePasswordState> {
   // 1. دریافت داده‌های فرم
   const Old_PassWord = formData.get('Old_PassWord') as string
   const New_PassWord = formData.get('New_PassWord') as string
   const captchaId = formData.get('captchaId') as string
   const userCaptchaInput = formData.get('userCaptchaInput') as string
 
  //console.log(" >>>>>>>> ", "u:",userName ,"  p:",password ,"  cpid:",captchaId , "   ucp:", userCaptchaInput)
   
   // 2. اعتبارسنجی اولیه
 
    const Old_PassWord_validation: boolean =  /^[a-zA-Z0-9@#$%^&]{6,20}$/.test(Old_PassWord)
    const New_PassWord_validation: boolean =  /^[a-zA-Z0-9@#$%^&]{6,20}$/.test(New_PassWord)
    const userCaptchaInput_validation: boolean =/^[ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789]{5}$/.test(userCaptchaInput)
 
   if (!Old_PassWord_validation || !New_PassWord_validation || !captchaId || !userCaptchaInput_validation) {
     
     // console.log(formData)
     // console.log(" u: "+userName_validation.toString() +" p: " +password_validation.toString() + " capId : "+ captchaId +" Cap_in: " +userCaptchaInput_validation.toString() +" ")
 
     return {
        success: false,
       errors:{
         Old_PassWord: Old_PassWord_validation ? "نام کاربری : باید حداقل داری 5 کاراکتر  شامل حروف لاتین ، اعداد ، زیر خط و علامت های @#$%^& باشد ." : undefined,
         New_PassWord: New_PassWord_validation ? "گذرواژه : باید  حداقل 5 حرف شامل حداقل  یک حرف کوچک -- حداقل یک حرف بزرگ و  حداقل یک  از نشانه های   @ # $ % ^ &  باشد . " : undefined,
         userCaptcha: userCaptchaInput_validation ? "کد امنیتی : بدرستی وارد نشده و یا خالی است ." : undefined,
         publicError: captchaId!="" ? "اشکال فنی و یا مداخله  در ارسال مقادیر به سرور - با مدیریت سایت تماس بگیرید ." : undefined,
         
       }
        
      }
 
   }
  
   // 3. اعتبارسنجی کد امنیتی 
   const captchaResult = await captchaValidationAction(captchaId, userCaptchaInput);
 
    return {
        success: false,
       errors:{
         userCaptcha: userCaptchaInput_validation ? "کد امنیتی : بدرستی وارد نشده و یا خالی است ." : undefined,
         
       }
        
      }
 //  console.log(" 71 >>>>>>>> ", "captchaResult:",captchaResult )
   if ( !captchaResult ) { 
     return {
         success: false,
         errors:{
         userCaptcha: "کد امنیتی : بدرستی وارد نشده است ." ,
       },
       
        }
      }
   }
 
  // 4 . لاگین
 
 
   
 
 
 
 
 
 