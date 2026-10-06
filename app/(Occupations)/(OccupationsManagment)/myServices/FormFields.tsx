// app/(Occupations)/(OccupationsManagment)/myServices/FormFields.tsx

'use client'

import CaptchaCMP, { CaptchaHandler } from '@/app/components/(captcha)/Captcha_CMP'
import Captcha_InputCMP from '@/app/components/(captcha)/captcha_Input_CMP'
import { ReactNode, RefObject } from 'react'

export const fieldClass =
  'block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300 focus:outline-sky-600'

export function InputRow({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex w-full items-center gap-2">
        <label className="text-right text-[10px] pr-2">{label} :</label>
        {error && <span className="text-[10px] text-red-600">{error}</span>}
      </div>
      {children}
    </div>
  )
}

export function CaptchaBlock({
  captchaRef,
  error,
}: {
  captchaRef: RefObject<CaptchaHandler | null>
  error?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-right text-[10px] pr-2">کد امنیتی :</label>
      <CaptchaCMP className="w-full flex" name="captchaId" ref={captchaRef} />
      <Captcha_InputCMP name="userCaptchaInput" />
      {error && <span className="text-[10px] text-red-600">{error}</span>}
    </div>
  )
}

export function MessageBox({ message }: { message?: string }) {
  if (!message) return null
  return <pre className="text-red-700 text-[10px] text-right whitespace-pre-wrap">{message}</pre>
}
