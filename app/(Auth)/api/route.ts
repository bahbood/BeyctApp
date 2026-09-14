// app/(Auth)/api/route.ts

import { NextResponse } from 'next/server'
import { updateSession } from '@/app/(Auth)/lib/session'

export async function GET() {
  try {
    // در اینجا updateSession مجاز است چون در Route Handler است
    const result = await updateSession()
    
    if (result.success && result.user) {
      return NextResponse.json({ 
        user: result.user,
        success: true 
      })
    } else {
      return NextResponse.json({ 
        user: null,
        success: false 
      })
    }
  } catch (error) {
    return NextResponse.json({ 
      user: null,
      success: false 
    }, { status: 500 })
  }
}


export async function Send_SMS({
  mobile_number,
  message_text,
  verify_code
}: {
  mobile_number: string;
  message_text: string;
  verify_code: string;
}) {
  const apiKey = process.env.SMS_API_KEY;
  const lineNumber = process.env.SMS_LINE_NUMBER;

  if (!apiKey) {
    throw new Error("SMS_IR_API_KEY is not defined.");
  }
  if (!lineNumber) {
    throw new Error("SMS_LINE_NUMBER is not defined.");
  }

  const response = await fetch(
    "https://api.sms.ir/v1/send/bulk",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/plain",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        lineNumber: lineNumber,
        messageText : verify_code ,
        "mobiles": [
          mobile_number,
        ],
        "sendDateTime": null
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message ?? "پیامک ارسال نشد.");
  }

  return result;
}



 