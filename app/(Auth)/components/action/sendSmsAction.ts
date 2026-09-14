// app/(Auth)/components/action/sendSmsAction.ts
'use server'

import { Send_SMS } from '@/app/(Auth)/api/route'
import { setSmsCode, generateSmsCode } from '@/app/(Auth)/lib/smsCache'

export type SendSmsState = {
  success: boolean
  message?: string
} | null

export async function sendSmsAction(mobile_number: string): Promise<SendSmsState> {
  if (!/^09[0-9]{9}$/.test(mobile_number)) {
    return { success: false, message: 'شماره موبایل نامعتبر است.' }
  }

  const code = generateSmsCode()

  try {
    await Send_SMS({
      mobile_number,
      message_text: `کد تایید شما: ${code}`,
      verify_code: code,
    })

    setSmsCode(mobile_number, code)
    console.log("@@@@@@: ", mobile_number , " ---> " , code );
    return { success: true, message: 'کد تایید با موفقیت ارسال شد.' }
  } catch (error) {
    console.error('Send SMS error:', error)
    return { success: false, message: 'ارسال پیامک با خطا مواجه شد.' }
  }
}
