'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { storeProfileAction, StoreProfileState } from '../action/storeProfileAction'
import CaptchaCMP, { CaptchaHandler } from '@/app/components/(captcha)/Captcha_CMP'
import Captcha_InputCMP from '@/app/components/(captcha)/captcha_Input_CMP'

const storeToValues = (store: any) => ({
  store_name: store.store_name || '',
  store_desc: store.store_desc || '',
  store_about: store.store_about || '',
  store_address: store.store_address || '',
  store_tell: store.store_tell || '',
  store_mobile: store.store_mobile || '',
  store_shaba_number: store.store_shaba_number || '',
})

export default function StoreProfileForm({ store }: { store: any }) {
  const captchaRef = useRef<CaptchaHandler>(null)
  const router = useRouter()
  const [state, formAction, isPending] = useActionState<StoreProfileState, FormData>(storeProfileAction, null)

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
    <form action={formAction} className="flex flex-col gap-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col gap-4">
        <h3 className="text-sm font-bold text-gray-700 border-b pb-2">اطلاعات فروشگاه</h3>

        <InputRow label="نام فروشگاه" error={state?.errors?.store_name}>
          <input name="store_name" type="text" required defaultValue={state?.values?.store_name ?? store.store_name}
            className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300" readOnly />
        </InputRow>

        <InputRow label="توضیح کوتاه" error={state?.errors?.store_desc}>
          <input name="store_desc" type="text" defaultValue={state?.values?.store_desc ?? store.store_desc ?? ''}
            className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300" />
        </InputRow>

        <InputRow label="درباره فروشگاه">
          <textarea name="store_about" rows={3} defaultValue={state?.values?.store_about ?? store.store_about ?? ''}
            className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300 resize-none" />
        </InputRow>

        <InputRow label="آدرس" error={state?.errors?.store_address}>
          <input name="store_address" type="text" defaultValue={state?.values?.store_address ?? store.store_address ?? ''}
            className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300" />
        </InputRow>

        <InputRow label="تلفن" error={state?.errors?.store_tell}>
          <input name="store_tell" type="text" required defaultValue={state?.values?.store_tell ?? store.store_tell}
            className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300" />
        </InputRow>

        <InputRow label="موبایل" error={state?.errors?.store_mobile}>
          <input name="store_mobile" type="text" required defaultValue={state?.values?.store_mobile ?? store.store_mobile}
            className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300" />
        </InputRow>

        <InputRow label="شماره شبا" error={state?.errors?.store_shaba_number}>
          <input name="store_shaba_number" type="text" defaultValue={state?.values?.store_shaba_number ?? store.store_shaba_number ?? ''}
            className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300" />
        </InputRow>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-gray-700 border-b pb-2">کد امنیتی</h3>
        <div className="flex flex-col gap-2">
          <CaptchaCMP className="w-full flex" name="captchaId" ref={captchaRef} />
          <Captcha_InputCMP name="userCaptchaInput" />
        </div>
        {state?.errors?.userCaptcha && (
          <span className="text-[10px] text-red-600">{state.errors.userCaptcha}</span>
        )}
      </div>

      {state?.errors?.message && (
        <pre className="text-red-700 text-[10px] text-right">{state.errors.message}</pre>
      )}

      <button type="submit" disabled={isPending}
        className="block bg-sky-600 text-white w-full rounded-md px-3 pt-2 pb-2 text-center outline-0 disabled:opacity-50 cursor-pointer">
        {isPending ? 'در حال ذخیره...' : 'ذخیره'}
      </button>
    </form>
  )
}

function InputRow({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex w-full">
        <label className="text-right text-[10px] pr-2">{label} :</label>
        {error && <label className="text-right text-[10px] pr-2 text-red-600">{error}</label>}
      </div>
      {children}
    </div>
  )
}
