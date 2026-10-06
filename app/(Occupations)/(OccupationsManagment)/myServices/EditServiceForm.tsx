// app/(Occupations)/(OccupationsManagment)/myServices/EditServiceForm.tsx

'use client'

import { CaptchaHandler } from '@/app/components/(captcha)/Captcha_CMP'
import type { ServiceCategory } from '@/app/db/schema'
import { updateServiceAction, ServiceActionState, ServiceFormValues } from '../action/serviceAction'
import { serviceImageUrl } from '../lib/serviceImagesConfig'
import { useActionState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CaptchaBlock, MessageBox } from './FormFields'
import ServiceFormInputs from './ServiceFormInputs'

type EditableService = {
  id: number
  title: string
  short_desc: string
  contact1: string
  contact2: string | null
  office_address: string
  category_id: number
  banner: string | null
}

export default function EditServiceForm({
  service,
  categories,
  onDone,
}: {
  service: EditableService
  categories: ServiceCategory[]
  onDone?: () => void
}) {
  const captchaRef = useRef<CaptchaHandler>(null)
  const router = useRouter()
  const [state, formAction, isPending] = useActionState<ServiceActionState, FormData>(updateServiceAction, null)

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

  const defaultValues: ServiceFormValues = state?.values ?? {
    service_id: String(service.id),
    title: service.title,
    short_desc: service.short_desc,
    contact1: service.contact1,
    contact2: service.contact2 ?? '',
    office_address: service.office_address,
    category_id: String(service.category_id),
  }

  const bannerUrl = serviceImageUrl(service.banner)

  return (
    <form action={formAction} className="max-w-xs justify-self-center flex flex-col gap-4">
      <h3 className="text-sm font-bold text-gray-700 border-b border-gray-200 pb-2">ویرایش خدمت</h3>

      <ServiceFormInputs defaults={defaultValues} errors={state?.errors ?? {}} categories={categories} />

      {bannerUrl && (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] pr-2">بنر فعلی :</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bannerUrl} alt={service.title} className="w-full max-h-28 object-cover rounded-md border" />
        </div>
      )}

      <CaptchaBlock captchaRef={captchaRef} error={state?.errors?.userCaptcha} />

      <MessageBox message={state?.errors?.message} />

      {state?.success === true && <span className="text-[10px] text-green-600">تغییرات با موفقیت ذخیره شد</span>}

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
