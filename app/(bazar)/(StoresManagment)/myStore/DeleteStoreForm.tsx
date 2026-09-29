// app/(bazar)/(StoresManagment)/myStore/DeleteStoreForm.tsx

'use client'

import { CaptchaHandler } from '@/app/components/(captcha)/Captcha_CMP'
import { deleteStoreAction, StoreActionState } from '../action/storeAction'
import { useActionState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CaptchaBlock, MessageBox } from './FormFields'

export default function DeleteStoreForm({ onDone }: { onDone?: () => void }) {
  const captchaRef = useRef<CaptchaHandler>(null)
  const router = useRouter()
  const [state, formAction, isPending] = useActionState<StoreActionState, FormData>(deleteStoreAction, null)

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
    <form action={formAction} className="w-full flex flex-col gap-4">
      <h3 className="text-sm font-bold text-red-700 border-b border-gray-200 pb-2">حذف فروشگاه</h3>
      <p className="text-[10px] text-gray-600 leading-relaxed">
        با حذف فروشگاه، تمام محصولات ثبت شده در آن نیز حذف میشوند. این عملیات قابل بازگشت نیست.
      </p>

      <CaptchaBlock captchaRef={captchaRef} error={state?.errors?.userCaptcha} />

      <MessageBox message={state?.errors?.message} />

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="block bg-red-600 hover:bg-red-700 text-white flex-1 rounded-md px-3 pt-2 pb-2 text-xs text-center outline-0 disabled:opacity-50 cursor-pointer"
        >
          {isPending ? 'در حال حذف...' : 'تایید حذف فروشگاه'}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="block bg-gray-300 hover:bg-gray-400 text-gray-800 flex-1 rounded-md px-3 pt-2 pb-2 text-xs text-center outline-0 cursor-pointer"
        >
          انصراف
        </button>
      </div>
    </form>
  )
}
