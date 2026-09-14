'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { storeActivationAction, StoreActivationState } from '../action/storeActivationAction'
import CaptchaCMP, { CaptchaHandler } from '@/app/components/(captcha)/Captcha_CMP'
import Captcha_InputCMP from '@/app/components/(captcha)/captcha_Input_CMP'

export default function ActivationForm({ storeId }: { storeId: number }) {
  const captchaRef = useRef<CaptchaHandler>(null)
  const router = useRouter()
  const [state, formAction, isPending] = useActionState<StoreActivationState, FormData>(storeActivationAction, null)

  useEffect(() => {
    if (state?.success === true) {
      router.refresh()
    }
  }, [state, router])

  useEffect(() => {
    if (state?.success === false && state?.errors?.userCaptcha) {
      captchaRef.current?.clear()
    }
  }, [state])

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="store_id" value={storeId} />

      <div className="flex flex-col gap-2">
        <CaptchaCMP className="w-full flex" name="captchaId" ref={captchaRef} />
        <Captcha_InputCMP name="userCaptchaInput" />
      </div>
      {state?.errors?.userCaptcha && (
        <span className="text-[10px] text-red-600">{state.errors.userCaptcha}</span>
      )}

      {state?.errors?.message && (
        <pre className="text-red-700 text-[10px] text-right">{state.errors.message}</pre>
      )}

      {state?.success === true && (
        <span className="text-[10px] text-green-600">اشتراک شما با موفقیت تمدید شد</span>
      )}

      <button type="submit" disabled={isPending}
        className="block bg-green-600 hover:bg-green-700 text-white w-full rounded-md px-3 pt-2 pb-2 text-center outline-0 disabled:opacity-50 cursor-pointer">
        {isPending ? 'در حال پردازش...' : 'خرید اشتراک یکساله'}
      </button>
    </form>
  )
}
