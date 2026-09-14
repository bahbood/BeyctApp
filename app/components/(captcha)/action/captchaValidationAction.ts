// app/components/(captchCMP)/action/captchaValidationAction.ts

'use server';

import { verifyCaptcha } from "./createCaptchaImageAction";

/**
 * اعتبارسنجی کد امنیتی کپچا
 * @param captchaId - شناسه یکتای کپچا
 * @param userCaptchaInput - کد وارد شده توسط کاربر
 * @returns نتیجه اعتبارسنجی
 */
export default async function captchaValidationAction(
  captchaId: string, 
  userCaptchaInput: string
): Promise<boolean> {
  
  // اعتبارسنجی پارامترهای ورودی
  if (!captchaId || !userCaptchaInput || userCaptchaInput.trim() === '') {
    return false;
  }

  try {
    // فراخوانی تابع verifyCaptcha از سرور
    const isValid = await verifyCaptcha(captchaId, userCaptchaInput);
    return isValid;
    
  } catch (error) {
    console.error('Error in captchaValidationAction:', error);
    return false;
  }
}


