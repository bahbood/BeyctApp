// app/(newsPaper)/(AgenciesManagement)/myNewsAgency/AddNewsAgencyForm.tsx

'use client'

import { useActionState, useEffect, useRef } from 'react'
import { createNewsAgencyAction } from '../action/newsAgencyAction'
import { CaptchaBlock, InputRow, MessageBox, fieldClass } from './FormFields'
import type { CaptchaHandler } from '@/app/components/(captcha)/Captcha_CMP'
import { useRouter } from 'next/navigation'

export default function AddNewsAgencyForm() {
  const [state, formAction, isPending] = useActionState(createNewsAgencyAction, null)
  const captchaRef = useRef<CaptchaHandler>(null)
  const router = useRouter()

  useEffect(() => {
    if (state?.success) {
      captchaRef.current?.clear()
      router.refresh()
    }

    if (!state?.success && state?.captchaConsumed) {
      captchaRef.current?.clear()
    }
  }, [state, router])

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <h2 className="text-sm font-bold text-gray-800">ثبت درخواست تاسیس خبرگزاری</h2>

      <InputRow label="نام خبرگزاری" error={state?.errors?.news_agency_name}>
        <input
          name="news_agency_name"
          type="text"
          minLength={2}
          maxLength={50}
          className={fieldClass}
          placeholder="مثال: پایگاه خبری من"
          defaultValue={state?.values?.news_agency_name}
          required
        />
      </InputRow>

      <InputRow label="نام مدیر خبرگزاری" error={state?.errors?.news_agency_manager}>
        <input
          name="news_agency_manager"
          type="text"
          minLength={3}
          maxLength={150}
          className={fieldClass}
          placeholder="نام و نام خانوادگی مدیر"
          defaultValue={state?.values?.news_agency_manager}
          required
        />
      </InputRow>

      <InputRow label="تعریف کوتاه خبرگزاری" error={state?.errors?.news_agency_desc}>
        <input
          name="news_agency_desc"
          type="text"
          minLength={5}
          maxLength={200}
          className={fieldClass}
          placeholder="توضیح کوتاه در مورد فعالیت خبرگزاری"
          defaultValue={state?.values?.news_agency_desc}
          required
        />
      </InputRow>

      <MessageBox message={state?.errors?.message} />

      <CaptchaBlock captchaRef={captchaRef} error={state?.errors?.userCaptcha} />

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 bg-sky-600 hover:bg-sky-700 text-white text-xs rounded-md px-6 py-2 outline-0 cursor-pointer disabled:opacity-50"
      >
        {isPending ? 'در حال ارسال...' : 'ارسال درخواست'}
      </button>
    </form>
  )
}