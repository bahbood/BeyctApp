// app/(bazar)/(StoresManagment)/storeProfile/StoreProfileForm.tsx

'use client'

import { CaptchaHandler } from '@/app/components/(captcha)/Captcha_CMP'
import type { Store } from '@/app/db/schema'
import { deleteStoreImageAction, storeProfileAction, StoreProfileState } from '../action/storeProfileAction'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useRef, useState, useTransition } from 'react'
import { CaptchaBlock, fieldClass, InputRow, MessageBox } from '../myStore/FormFields'

export default function StoreProfileForm({ store }: { store: Store }) {
  const captchaRef = useRef<CaptchaHandler>(null)
  const router = useRouter()
  const [state, formAction, isPending] = useActionState<StoreProfileState, FormData>(storeProfileAction, null)
  const [isDeleting, startDelete] = useTransition()

  const [logoPreview, setLogoPreview] = useState<string | null>(
    store.store_logo ? `/storeImages/${store.store_logo}` : null
  )
  const [bannerPreview, setBannerPreview] = useState<string | null>(
    store.store_header_banner ? `/storeImages/${store.store_header_banner}` : null
  )

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

  const handleImageChange = (kind: 'logo' | 'banner') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    if (kind === 'logo') setLogoPreview(url)
    else setBannerPreview(url)
  }

  const handleDeleteImage = (kind: 'logo' | 'banner') => {
    startDelete(async () => {
      const result = await deleteStoreImageAction(kind)
      if (result.success) {
        if (kind === 'logo') setLogoPreview(null)
        else setBannerPreview(null)
        router.refresh()
      }
    })
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col gap-4">
        <h3 className="text-sm font-bold text-gray-700 border-b border-gray-200 pb-2">تصاویر فروشگاه</h3>

        <ImageField
          label="لوگوی فروشگاه"
          name="store_logo"
          error={state?.errors?.store_logo}
          preview={logoPreview}
          previewClassName="size-20 rounded-md object-cover border border-gray-300"
          onChange={handleImageChange('logo')}
          onDelete={() => handleDeleteImage('logo')}
          isDeleting={isDeleting}
          hint="فرمت‌های مجاز: jpg , jpeg , png , webp - حداکثر ۲ مگابایت"
        />

        <ImageField
          label="بنر سربرگ فروشگاه"
          name="store_header_banner"
          error={state?.errors?.store_header_banner}
          preview={bannerPreview}
          previewClassName="w-full h-32 rounded-md object-cover border border-gray-300"
          onChange={handleImageChange('banner')}
          onDelete={() => handleDeleteImage('banner')}
          isDeleting={isDeleting}
          hint="فرمت‌های مجاز: jpg , jpeg , png , webp - حداکثر ۲ مگابایت"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col gap-4">
        <h3 className="text-sm font-bold text-gray-700 border-b border-gray-200 pb-2">اطلاعات فروشگاه</h3>

        <InputRow label="نام فروشگاه">
          <input
            name="store_name_display"
            type="text"
            readOnly
            value={store.store_name}
            className={`${fieldClass} bg-gray-100 text-gray-500`}
          />
          <span className="text-[10px] text-gray-400">برای تغییر نام فروشگاه از بخش «ویرایش» در صفحه فروشگاه من استفاده کنید</span>
        </InputRow>

        <InputRow label="تعریف کوتاه" error={state?.errors?.store_desc}>
          <textarea
            name="store_desc"
            rows={2}
            required
            maxLength={200}
            defaultValue={state?.values?.store_desc ?? store.store_desc}
            className={`${fieldClass} resize-none`}
          />
        </InputRow>

        <InputRow label="درباره فروشگاه" error={state?.errors?.store_about}>
          <textarea
            name="store_about"
            rows={5}
            maxLength={2000}
            defaultValue={state?.values?.store_about ?? store.store_about ?? ''}
            className={`${fieldClass} resize-none`}
          />
        </InputRow>

        <InputRow label="آدرس" error={state?.errors?.store_address}>
          <textarea
            name="store_address"
            rows={2}
            maxLength={250}
            defaultValue={state?.values?.store_address ?? store.store_address ?? ''}
            className={`${fieldClass} resize-none`}
          />
        </InputRow>

        <div className="grid grid-cols-2 gap-3">
          <InputRow label="تلفن فروشگاه" error={state?.errors?.store_tell}>
            <input
              name="store_tell"
              type="tel"
              dir="ltr"
              inputMode="numeric"
              maxLength={11}
              defaultValue={state?.values?.store_tell ?? store.store_tell ?? ''}
              className={`${fieldClass} text-right`}
            />
          </InputRow>

          <InputRow label="موبایل مدیر فروشگاه" error={state?.errors?.store_mobile}>
            <input
              name="store_mobile"
              type="tel"
              dir="ltr"
              inputMode="numeric"
              maxLength={11}
              defaultValue={state?.values?.store_mobile ?? store.store_mobile ?? ''}
              className={`${fieldClass} text-right`}
            />
          </InputRow>
        </div>

        <InputRow label="شماره شبا" error={state?.errors?.store_shaba_number}>
          <input
            name="store_shaba_number"
            type="text"
            dir="ltr"
            inputMode="numeric"
            maxLength={22}
            defaultValue={state?.values?.store_shaba_number ?? store.store_shaba_number ?? ''}
            className={`${fieldClass} text-right`}
          />
        </InputRow>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-gray-700 border-b border-gray-200 pb-2">کد امنیتی</h3>
        <CaptchaBlock captchaRef={captchaRef} error={state?.errors?.userCaptcha} />
      </div>

      <MessageBox message={state?.errors?.message} />

      {state?.success === true && <span className="text-[10px] text-green-600">پروفایل فروشگاه ذخیره شد</span>}

      <button
        type="submit"
        disabled={isPending}
        className="block bg-sky-600 hover:bg-sky-700 text-white w-full rounded-md px-3 pt-2 pb-2 text-xs text-center outline-0 disabled:opacity-50 cursor-pointer"
      >
        {isPending ? 'در حال ذخیره...' : 'ذخیره'}
      </button>
    </form>
  )
}

function ImageField({
  label,
  name,
  preview,
  previewClassName,
  hint,
  error,
  isDeleting,
  onChange,
  onDelete,
}: {
  label: string
  name: string
  preview: string | null
  previewClassName: string
  hint: string
  error?: string
  isDeleting: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDelete: () => void
}) {
  return (
    <InputRow label={label} error={error}>
      <div className="flex items-center gap-3">
        {preview ? (
          <Image src={preview} alt={label} width={200} height={200} unoptimized className={previewClassName} />
        ) : (
          <div className={`${previewClassName} flex items-center justify-center bg-gray-100 text-gray-400 text-[10px]`}>
            بدون تصویر
          </div>
        )}

        <div className="flex flex-1 flex-col gap-1">
          <input
            id={name}
            name={name}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={onChange}
            className="block w-full rounded-md px-3 py-2 text-[10px] outline-1 outline-gray-300 file:ml-2 file:rounded-sm file:border-0 file:bg-gray-200 file:px-2 file:py-1 file:text-[10px]"
          />
          <span className="text-[10px] text-gray-400">{hint}</span>
        </div>

        {preview && (
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="self-end shrink-0 text-[10px] text-red-600 border border-red-200 hover:bg-red-50 rounded px-2 py-1 cursor-pointer disabled:opacity-50"
          >
            حذف
          </button>
        )}
      </div>
    </InputRow>
  )
}
