// app/(bazar)/(StoresManagment)/myStore/EditStoreForm.tsx

'use client'

import { CaptchaHandler } from '@/app/components/(captcha)/Captcha_CMP'
import type { Store } from '@/app/db/schema'
import { updateStoreAction, StoreActionState } from '../action/storeAction'
import { useActionState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CaptchaBlock, fieldClass, InputRow, MessageBox } from './FormFields'

export default function EditStoreForm({ store, onDone }: { store: Store; onDone?: () => void }) {
  const captchaRef = useRef<CaptchaHandler>(null)
  const router = useRouter()
  const [state, formAction, isPending] = useActionState<StoreActionState, FormData>(updateStoreAction, null)

  useEffect(() => {
    if (state?.success === true) {
      router.refresh()
      onDone?.()
    }
  }, [state, router, onDone])

  useEffect(() => {
    if (state?.success === false && state?.errors?.userCaptcha) {
      captchaRef.current?.clear()
    }
  }, [state])

  return (
    <form action={formAction} className="max-w-xs justify-self-center flex-col gap-4">
      <h3 className="text-sm font-bold text-gray-700 border-b border-gray-200 pb-2">ویرایش اطلاعات فروشگاه</h3>

      <InputRow label="نام فروشگاه" error={state?.errors?.store_name}>
        <input
          id="store_name"
          name="store_name"
          type="text"
          dir="rtl"
          required
          maxLength={30}
          defaultValue={state?.values?.store_name ?? store.store_name}
          className={fieldClass}
        />
      </InputRow>

      <InputRow label="نام و نام خانوادگی مدیر فروشگاه" error={state?.errors?.store_manager}>
        <input
          id="store_manager"
          name="store_manager"
          type="text"
          dir="rtl"
          required
          maxLength={150}
          defaultValue={state?.values?.store_manager ?? store.store_manager}
          className={fieldClass}
        />
      </InputRow>

      <InputRow label="تعریف کوتاه فروشگاه" error={state?.errors?.store_desc}>
        <textarea
          id="store_desc"
          name="store_desc"
          rows={3}
          dir="rtl"
          required
          maxLength={200}
          defaultValue={state?.values?.store_desc ?? store.store_desc}
          className={`${fieldClass} resize-none`}
        />
      </InputRow>

      <CaptchaBlock captchaRef={captchaRef} error={state?.errors?.userCaptcha} />

      <MessageBox message={state?.errors?.message} />

      <button
        type="submit"
        disabled={isPending}
        className="block bg-sky-600 hover:bg-sky-700 text-white w-full rounded-md px-3 pt-2 pb-2 text-xs text-center outline-0 disabled:opacity-50 cursor-pointer"
      >
        {isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
      </button>
    </form>
  )
}
