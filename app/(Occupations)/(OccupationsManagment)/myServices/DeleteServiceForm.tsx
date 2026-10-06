// app/(Occupations)/(OccupationsManagment)/myServices/DeleteServiceForm.tsx

'use client'

import { CaptchaHandler } from '@/app/components/(captcha)/Captcha_CMP'
import { deleteServiceAction, ServiceActionState } from '../action/serviceAction'
import { useActionState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CaptchaBlock, MessageBox } from './FormFields'

export default function DeleteServiceForm({ serviceId, onDone }: { serviceId: number; onDone?: () => void }) {
  const captchaRef = useRef<CaptchaHandler>(null)
  const router = useRouter()
  const [state, formAction, isPending] = useActionState<ServiceActionState, FormData>(deleteServiceAction, null)

  useEffect(() => {
    if (state?.success === true) {
      router.refresh()
      onDone?.()
    }
  }, [state, router, onDone])

  useEffect(() => {
    if (state?.success === false && state.captchaConsumed) {
      captchaRef.current?.clear()
    }
  }, [state])

  return (
    <form action={formAction} className="max-w-xs justify-self-center flex flex-col gap-4">
      <h3 className="text-sm font-bold text-red-700 border-b border-gray-200 pb-2">حذف خدمت</h3>
      <p className="text-[10px] text-gray-600 leading-relaxed">
        با حذف خدمت، اطلاعات ، بنر و رسید واریز آن برای همیشه پاک می شود و این عملیات قابل بازگشت نیست.
      </p>

      <input type="hidden" name="service_id" value={serviceId} readOnly />

      <CaptchaBlock captchaRef={captchaRef} error={state?.errors?.userCaptcha} />

      <MessageBox message={state?.errors?.message} />

      <button
        type="submit"
        disabled={isPending}
        className="block bg-red-600 hover:bg-red-700 text-white w-full rounded-md px-3 pt-2 pb-2 text-xs text-center outline-0 disabled:opacity-50 cursor-pointer"
      >
        {isPending ? 'در حال حذف...' : 'حذف قطعی خدمت'}
      </button>
    </form>
  )
}
