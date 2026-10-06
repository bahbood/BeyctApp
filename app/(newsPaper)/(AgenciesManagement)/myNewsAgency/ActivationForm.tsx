// app/(newsPaper)/(AgenciesManagement)/myNewsAgency/ActivationForm.tsx

'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { newsAgencyActivationAction } from '../action/newsAgencyActivationAction'
import { CaptchaBlock, InputRow, MessageBox, fieldClass } from './FormFields'
import type { CaptchaHandler } from '@/app/components/(captcha)/Captcha_CMP'
import {
  NEWS_AGENCY_SUBSCRIPTION_LABELS,
  NEWS_AGENCY_SUBSCRIPTION_PRICES,
} from '../lib/newsAgencySubscription'

export default function ActivationForm({ onDone }: { onDone?: () => void }) {
  const [state, formAction, isPending] = useActionState(newsAgencyActivationAction, null)
  const captchaRef = useRef<CaptchaHandler>(null)
  const [receiptPreview, setReceiptPreview] = useState<string>('')

  useEffect(() => {
    if (state?.success) {
      captchaRef.current?.clear()
      onDone?.()
      return
    }

    if (!state?.success && state?.captchaConsumed) {
      captchaRef.current?.clear()
    }
  }, [state, onDone])

  function handleReceiptChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (receiptPreview) {
      URL.revokeObjectURL(receiptPreview)
    }
    if (file) {
      setReceiptPreview(URL.createObjectURL(file))
    } else {
      setReceiptPreview('')
    }
  }

  useEffect(() => {
    return () => {
      if (receiptPreview) URL.revokeObjectURL(receiptPreview)
    }
  }, [receiptPreview])

  const plans = ['monthly', 'yearly'] as const

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <h2 className="text-sm font-bold text-gray-800">درخواست فعالسازی خبرگزاری</h2>

      <div className="flex flex-col gap-2">
        <label className="text-right text-[10px] pr-2">مدت اشتراک :</label>
        {plans.map((plan) => (
          <label key={plan} className="flex items-center gap-2 rounded-md border border-gray-200 bg-white p-3">
            <input type="radio" name="subscription_plan" value={plan} required className="size-4" />
            <span className="text-xs">
              {NEWS_AGENCY_SUBSCRIPTION_LABELS[plan]} —{' '}
              {NEWS_AGENCY_SUBSCRIPTION_PRICES[plan].toLocaleString('fa-IR')} تومان
            </span>
          </label>
        ))}
        {state?.errors?.subscription_plan && (
          <span className="text-[10px] text-red-600">{state.errors.subscription_plan}</span>
        )}
      </div>

      <InputRow label="تصویر رسید واریز بانکی" error={state?.errors?.payment_receipt}>
        <input
          type="file"
          name="payment_receipt"
          accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
          onChange={handleReceiptChange}
          className={fieldClass}
          required
        />
        {receiptPreview && (
          <div className="mt-2 rounded-md border border-gray-200 bg-white p-2">
            <img src={receiptPreview} alt="پیش‌نمایش رسید" className="w-full max-w-xs mx-auto rounded" />
          </div>
        )}
        <p className="text-[10px] text-gray-500">فرمت‌های مجاز : JPG, PNG, WEBP, PDF — حداکثر ۵ مگابایت</p>
      </InputRow>

      <MessageBox message={state?.errors?.message} />
      <CaptchaBlock captchaRef={captchaRef} error={state?.errors?.userCaptcha} />

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 bg-green-600 hover:bg-green-700 text-white text-xs rounded-md px-6 py-2 outline-0 cursor-pointer disabled:opacity-50"
      >
        {isPending ? 'در حال ارسال...' : 'ارسال درخواست فعالسازی'}
      </button>
    </form>
  )
}