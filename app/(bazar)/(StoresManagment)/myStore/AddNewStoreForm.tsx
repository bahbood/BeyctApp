// app/(bazar)/(StoresManagment)/myStore/AddNewStoreForm.tsx

'use client'

import { CaptchaHandler } from '@/app/components/(captcha)/Captcha_CMP'
import { createStoreAction, StoreActionState } from '../action/storeAction'
import { useActionState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CaptchaBlock, fieldClass, InputRow, MessageBox } from './FormFields'

export default function AddNewStoreForm() {
  const captchaRef = useRef<CaptchaHandler>(null)
  const router = useRouter()
  const [state, formAction, isPending] = useActionState<StoreActionState, FormData>(createStoreAction, null)

  useEffect(() => {
    if (state?.success === true) {
      router.refresh()
    }
  }, [state, router])

  useEffect(() => {
    // کد امنیتی فقط در صورت صحت در سرور مصرف می‌شود. اگر مصرف شده باشد باید
    // کد جدید بارگذاری شود، وگرنه تلاش بعدی کاربر همیشه با خطا مواجه می‌شود.
    if (state?.success === false && state.captchaConsumed) {
      captchaRef.current?.clear()
    }
  }, [state])

  return (
    <form action={formAction} className="max-w-xs justify-self-center flex flex-col gap-4">
      <h3 className="text-sm font-bold text-gray-700 border-b border-gray-200 pb-2">درخواست تاسیس فروشگاه</h3>
      <p className="text-[10px] text-gray-500 leading-relaxed">
        فروشگاه شما پس از ثبت درخواست غیرفعال خواهد بود. برای فعالسازی و نمایش در بازار، باید اشتراک خریداری کنید و
        رسید واریز بانکی را ثبت کنید.
      </p>

      <InputRow label="نام فروشگاه" error={state?.errors?.store_name}>
        <input
          id="store_name"
          name="store_name"
          type="text"
          placeholder="نام فروشگاه"
          dir="rtl"
          required
          maxLength={30}
          defaultValue={state?.values?.store_name ?? ''}
          className={fieldClass}
        />
      </InputRow>

      <InputRow label="نام و نام خانوادگی مدیر فروشگاه" error={state?.errors?.store_manager}>
        <input
          id="store_manager"
          name="store_manager"
          type="text"
          placeholder="مدیر فروشگاه"
          dir="rtl"
          required
          maxLength={150}
          defaultValue={state?.values?.store_manager ?? ''}
          className={fieldClass}
        />
      </InputRow>

      <InputRow label="تعریف کوتاه فروشگاه" error={state?.errors?.store_desc}>
        <textarea
          id="store_desc"
          name="store_desc"
          rows={3}
          placeholder="تعریف کوتاه فروشگاه"
          dir="rtl"
          required
          maxLength={200}
          defaultValue={state?.values?.store_desc ?? ''}
          className={`${fieldClass} resize-none`}
        />
      </InputRow>

      <CaptchaBlock captchaRef={captchaRef} error={state?.errors?.userCaptcha} />

      <MessageBox message={state?.errors?.message} />

      {state?.success === true && (
        <span className="text-[10px] text-green-600">درخواست تاسیس فروشگاه با موفقیت ثبت شد</span>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="block bg-sky-600 hover:bg-sky-700 text-white w-full rounded-md px-3 pt-2 pb-2 text-xs text-center outline-0 disabled:opacity-50 cursor-pointer"
      >
        {isPending ? 'در حال ثبت...' : 'ثبت درخواست تاسیس فروشگاه'}
      </button>
    </form>
  )
}
