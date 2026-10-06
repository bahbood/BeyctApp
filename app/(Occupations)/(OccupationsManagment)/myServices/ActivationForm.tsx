// app/(Occupations)/(OccupationsManagment)/myServices/ActivationForm.tsx
// فعال سازی خدمت با پرداخت اشتراک سالانه

'use client'

import { CaptchaHandler } from '@/app/components/(captcha)/Captcha_CMP'
import type { Service } from '@/app/db/schema'
import { serviceActivationAction, ServiceActivationState } from '../action/serviceActivationAction'
import { formatDate, SERVICE_SUBSCRIPTION_LABEL, SERVICE_YEARLY_PRICE } from '../lib/serviceSubscription'
import { useActionState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CaptchaBlock, fieldClass, InputRow, MessageBox } from './FormFields'

const faNumber = new Intl.NumberFormat('fa-IR')

type ActivationService = Pick<
  Service,
  'id' | 'title' | 'service_status' | 'expired_at' | 'activation_requested_at' | 'payment_receipt'
>

export default function ActivationForm({ service, onDone }: { service: ActivationService; onDone?: () => void }) {
  const captchaRef = useRef<CaptchaHandler>(null)
  const router = useRouter()
  const [state, formAction, isPending] = useActionState<ServiceActivationState, FormData>(
    serviceActivationAction,
    null,
  )

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

  const isPendingReview = service.service_status === 'pending'
  const isSubscriptionActive = service.service_status === 'active' && new Date(service.expired_at) > new Date()

  // تا زمانی که مدیر سایت تعیین تکلیف درخواست قبلی را مشخص نکرده، امکان ارسال
  // درخواست جدید وجود ندارد؛ بنابراین فقط وضعیت فعلی نمایش داده می شود.
  if (isPendingReview) {
    return (
      <div className="max-w-xs justify-self-center flex flex-col gap-3">
        <h3 className="text-sm font-bold text-gray-700 border-b border-gray-200 pb-2">فعال سازی اشتراک خدمت</h3>

        <div className="flex flex-col gap-2 rounded-md border border-amber-200 bg-amber-50 p-3">
          <span className="text-[10px] font-bold text-amber-800">درخواست شما در انتظار تایید مدیر سایت است</span>
          {service.activation_requested_at && (
            <span className="text-[10px] text-amber-700">
              تاریخ ارسال درخواست: {formatDate(service.activation_requested_at)}
            </span>
          )}
          {service.payment_receipt && (
            <span className="text-[10px] text-amber-700">رسید واریز دریافت شد</span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onDone?.()}
          className="block bg-gray-500 hover:bg-gray-600 text-white w-full rounded-md px-3 pt-2 pb-2 text-xs text-center outline-0 cursor-pointer"
        >
          بستن
        </button>
      </div>
    )
  }

  return (
    <form action={formAction} className="max-w-xs justify-self-center flex-col gap-4">
      <h3 className="text-sm font-bold text-gray-700 border-b border-gray-200 pb-2">
        {isSubscriptionActive ? 'تمدید اشتراک خدمت' : 'فعال سازی اشتراک خدمت'}
      </h3>
      <p className="text-[10px] text-gray-500 leading-relaxed">
        خدمت «{service.title}» پس از پرداخت {SERVICE_SUBSCRIPTION_LABEL} و تایید مدیر سایت، به مدت یک سال در بانک مشاغل
        نمایش داده می شود.
      </p>

      <input type="hidden" name="service_id" value={service.id} readOnly />

      <InputRow label="مبلغ قابل پرداخت">
        <div className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800">
          {faNumber.format(SERVICE_YEARLY_PRICE)} تومان — {SERVICE_SUBSCRIPTION_LABEL}
        </div>
      </InputRow>

      <InputRow label="رسید واریز بانکی" error={state?.errors?.payment_receipt}>
        <input
          id="payment_receipt"
          name="payment_receipt"
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          required
          className={`${fieldClass} py-2 file:ml-2 file:rounded-sm file:border-0 file:bg-gray-200 file:px-2 file:py-1 file:text-[10px]`}
        />
        <span className="text-[10px] text-gray-400">
          فرمت‌های مجاز: jpg , jpeg , png , webp , pdf - حداکثر ۱ مگابایت
        </span>
      </InputRow>

      <CaptchaBlock captchaRef={captchaRef} error={state?.errors?.userCaptcha} />

      <MessageBox message={state?.errors?.message} />

      {state?.success === true && (
        <span className="text-[10px] text-green-600">درخواست فعالسازی با موفقیت ثبت شد</span>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="block bg-green-600 hover:bg-green-700 text-white w-full rounded-md px-3 pt-2 pb-2 text-xs text-center outline-0 disabled:opacity-50 cursor-pointer"
      >
        {isPending ? 'در حال ارسال...' : 'ارسال درخواست فعالسازی'}
      </button>
    </form>
  )
}
