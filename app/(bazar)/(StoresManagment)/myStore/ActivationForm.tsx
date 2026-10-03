// app/(bazar)/(StoresManagment)/myStore/ActivationForm.tsx

'use client'

import { CaptchaHandler } from '@/app/components/(captcha)/Captcha_CMP'
import type { Store } from '@/app/db/schema'
import { storeActivationAction, StoreActivationState } from '../action/storeActivationAction'
import { formatDate, SUBSCRIPTION_LABELS, SUBSCRIPTION_PRICES } from '../lib/storeSubscription'
import { useActionState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CaptchaBlock, fieldClass, InputRow, MessageBox } from './FormFields'

const PLANS = ['monthly', 'yearly'] as const

const faNumber = new Intl.NumberFormat('fa-IR')

export default function ActivationForm({ store, onDone }: { store: Store; onDone?: () => void }) {
  const captchaRef = useRef<CaptchaHandler>(null)
  const router = useRouter()
  const [state, formAction, isPending] = useActionState<StoreActivationState, FormData>(storeActivationAction, null)

  useEffect(() => {
    if (state?.success === true) {
      router.refresh()
      onDone?.()
    }
  }, [state, router, onDone])

  useEffect(() => {
    // کد امنیتی فقط در صورت صحت در سرور مصرف می‌شود. اگر مصرف شده باشد باید
    // کد جدید بارگذاری شود، وگرنه تلاش بعدی کاربر همیشه با خطا مواجه می‌شود.
    if (state?.success === false && state.captchaConsumed) {
      captchaRef.current?.clear()
    }
  }, [state])

  const isPendingReview = store.store_status === 'pending'

  // تا زمانی که مدیر سایت تعیین تکلیف درخواست قبلی را مشخص نکرده، امکان ارسال
  // درخواست جدید وجود ندارد؛ بنابراین فقط وضعیت فعلی نمایش داده می‌شود.
  if (isPendingReview) {
    return (
      <div className="max-w-xs justify-self-center flex flex-col gap-3">
        <h3 className="text-sm font-bold text-gray-700 border-b border-gray-200 pb-2">فعال سازی اشتراک فروشگاه</h3>

        <div className="flex flex-col gap-2 rounded-md border border-amber-200 bg-amber-50 p-3">
          <span className="text-[10px] font-bold text-amber-800">درخواست شما در انتظار تایید مدیر سایت است</span>
          {store.activation_requested_at && (
            <span className="text-[10px] text-amber-700">
              تاریخ ارسال درخواست: {formatDate(store.activation_requested_at)}
            </span>
          )}
          {store.subscription_plan && (
            <span className="text-[10px] text-amber-700">مدت اشتراک: {SUBSCRIPTION_LABELS[store.subscription_plan]}</span>
          )}
          {store.payment_receipt && (
            <a
              href={`/storeImages/${store.payment_receipt}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-amber-700 underline"
            >
              مشاهده رسید ارسال شده
            </a>
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
      <h3 className="text-sm font-bold text-gray-700 border-b border-gray-200 pb-2">فعال سازی اشتراک فروشگاه</h3>

      <InputRow label="مدت اشتراک" error={state?.errors?.subscription_plan}>
        <div className="flex flex-col gap-2">
          {PLANS.map((plan) => (
            <label
              key={plan}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-xs has-checked:border-sky-500 has-checked:bg-sky-50"
            >
              <input type="radio" name="subscription_plan" value={plan} defaultChecked={plan === 'monthly'} />
              <span className="text-gray-700">{SUBSCRIPTION_LABELS[plan]}</span>
              <span className="mr-auto text-gray-500">{faNumber.format(SUBSCRIPTION_PRICES[plan])} تومان</span>
            </label>
          ))}
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
          فرمت‌های مجاز: jpg , jpeg , png , webp , pdf - حداکثر ۵ مگابایت
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