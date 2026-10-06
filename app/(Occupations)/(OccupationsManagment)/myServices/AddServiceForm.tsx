// app/(Occupations)/(OccupationsManagment)/myServices/AddServiceForm.tsx

'use client'

import { CaptchaHandler } from '@/app/components/(captcha)/Captcha_CMP'
import type { ServiceCategory } from '@/app/db/schema'
import { createServiceAction, ServiceActionState } from '../action/serviceAction'
import { useActionState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CaptchaBlock, MessageBox } from './FormFields'
import ServiceFormInputs, { emptyServiceValues } from './ServiceFormInputs'

export default function AddServiceForm({ categories }: { categories: ServiceCategory[] }) {
  const captchaRef = useRef<CaptchaHandler>(null)
  const router = useRouter()
  const [state, formAction, isPending] = useActionState<ServiceActionState, FormData>(createServiceAction, null)

  useEffect(() => {
    if (state?.success === true) {
      router.refresh()
    }
  }, [state, router])

  useEffect(() => {
    // کد امنیتی فقط در صورت صحت در سرور مصرف می شود. اگر مصرف شده باشد باید
    // کد جدید بارگذاری شود، وگرنه تلاش بعدی کاربر همیشه با خطا مواجه می شود.
    if (state?.success === false && state.captchaConsumed) {
      captchaRef.current?.clear()
    }
  }, [state])

  return (
    <form action={formAction} className="max-w-xs justify-self-center flex flex-col gap-4">
      <h3 className="text-sm font-bold text-gray-700 border-b border-gray-200 pb-2">ثبت خدمت جدید</h3>
      <p className="text-[10px] text-gray-500 leading-relaxed">
        خدمت شما پس از ثبت غیرفعال خواهد بود. برای نمایش در بانک مشاغل باید اشتراک سالانه خریداری کنید و رسید واریز
        بانکی را ثبت کنید.
      </p>

      <ServiceFormInputs defaults={emptyServiceValues} errors={state?.errors ?? {}} categories={categories} />

      <CaptchaBlock captchaRef={captchaRef} error={state?.errors?.userCaptcha} />

      <MessageBox message={state?.errors?.message} />

      {state?.success === true && (
        <span className="text-[10px] text-green-600">خدمت جدید با موفقیت ثبت شد</span>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="block bg-sky-600 hover:bg-sky-700 text-white w-full rounded-md px-3 pt-2 pb-2 text-xs text-center outline-0 disabled:opacity-50 cursor-pointer"
      >
        {isPending ? 'در حال ثبت...' : 'ثبت خدمت'}
      </button>
    </form>
  )
}
