// app/(newsPaper)/(AgenciesManagement)/newsAgencyProfile/NewsAgencyProfileForm.tsx

'use client'

import { useActionState, useEffect, useState } from 'react'
import type { NewsAgency } from '@/app/db/schema'
import { saveNewsAgencyProfileAction } from '../action/newsAgencyProfileAction'
import { InputRow, MessageBox, fieldClass } from '../myNewsAgency/FormFields'
import { newsAgencyImageUrl } from '../lib/newsAgencyImagesConfig'

export default function NewsAgencyProfileForm({ agency, onDone }: { agency: NewsAgency; onDone?: () => void }) {
  const [state, formAction, isPending] = useActionState(saveNewsAgencyProfileAction, null)
  const [logoPreview, setLogoPreview] = useState<string>(newsAgencyImageUrl(agency.news_agency_logo))
  const [bannerPreview, setBannerPreview] = useState<string>(newsAgencyImageUrl(agency.news_agency_header_banner))
  const [removeLogo, setRemoveLogo] = useState(false)
  const [removeBanner, setRemoveBanner] = useState(false)

  useEffect(() => {
    if (state?.success) {
      onDone?.()
    }
  }, [state, onDone])

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (logoPreview && logoPreview.startsWith('blob:')) URL.revokeObjectURL(logoPreview)
    if (file) {
      setLogoPreview(URL.createObjectURL(file))
      setRemoveLogo(false)
    }
  }

  function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (bannerPreview && bannerPreview.startsWith('blob:')) URL.revokeObjectURL(bannerPreview)
    if (file) {
      setBannerPreview(URL.createObjectURL(file))
      setRemoveBanner(false)
    }
  }

  useEffect(() => {
    return () => {
      if (logoPreview && logoPreview.startsWith('blob:')) URL.revokeObjectURL(logoPreview)
      if (bannerPreview && bannerPreview.startsWith('blob:')) URL.revokeObjectURL(bannerPreview)
    }
  }, [logoPreview, bannerPreview])

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <h2 className="text-sm font-bold text-gray-800">پروفایل خبرگزاری</h2>

      <InputRow label="درباره خبرگزاری" error={state?.errors?.news_agency_about}>
        <textarea
          name="news_agency_about"
          rows={4}
          maxLength={5000}
          className={fieldClass}
          defaultValue={state?.values?.news_agency_about ?? agency.news_agency_about ?? ''}
          placeholder="توضیحات کامل در مورد خبرگزاری"
        />
      </InputRow>

      <InputRow label="آدرس" error={state?.errors?.news_agency_address}>
        <input
          name="news_agency_address"
          type="text"
          maxLength={250}
          className={fieldClass}
          defaultValue={state?.values?.news_agency_address ?? agency.news_agency_address ?? ''}
        />
      </InputRow>

      <div className="grid gap-3 sm:grid-cols-2">
        <InputRow label="شماره تلفن" error={state?.errors?.news_agency_tell}>
          <input
            name="news_agency_tell"
            type="text"
            maxLength={11}
            className={fieldClass}
            placeholder="09123456789"
            dir="ltr"
            defaultValue={state?.values?.news_agency_tell ?? agency.news_agency_tell ?? ''}
          />
        </InputRow>

        <InputRow label="شماره موبایل" error={state?.errors?.news_agency_mobile}>
          <input
            name="news_agency_mobile"
            type="text"
            maxLength={11}
            className={fieldClass}
            placeholder="09123456789"
            dir="ltr"
            defaultValue={state?.values?.news_agency_mobile ?? agency.news_agency_mobile ?? ''}
          />
        </InputRow>
      </div>

      <InputRow label="ایمیل" error={state?.errors?.news_agency_email}>
        <input
          name="news_agency_email"
          type="email"
          maxLength={100}
          className={fieldClass}
          dir="ltr"
          defaultValue={state?.values?.news_agency_email ?? agency.news_agency_email ?? ''}
        />
      </InputRow>

      <InputRow label="لوگو (۱:۱ ، حداکثر ۱۵۰ KB)" error={state?.errors?.news_agency_logo}>
        <input
          type="file"
          name="news_agency_logo"
          accept="image/jpeg,image/png,image/jpg,image/webp,image/gif"
          onChange={handleLogoChange}
          className={fieldClass}
        />
        {(logoPreview || agency.news_agency_logo) && !removeLogo && (
          <div className="mt-2 flex flex-col items-start gap-2 rounded-md border border-gray-200 bg-white p-2">
            <img src={logoPreview} alt="پیش‌نمایش لوگو" className="w-24 h-24 object-cover rounded" />
            <label className="flex items-center gap-2 text-[10px] text-gray-600">
              <input type="checkbox" name="remove_news_agency_logo" checked={removeLogo} onChange={(e) => setRemoveLogo(e.target.checked)} />
              حذف لوگو
            </label>
          </div>
        )}
        <p className="text-[10px] text-gray-500">فرمت‌های مجاز : JPG, PNG, WEBP, GIF — حداکثر ۱۵۰ KB</p>
      </InputRow>

      <InputRow label="بنر هدر (حداکثر ۲۰۰ KB)" error={state?.errors?.news_agency_header_banner}>
        <input
          type="file"
          name="news_agency_header_banner"
          accept="image/jpeg,image/png,image/jpg,image/webp,image/gif"
          onChange={handleBannerChange}
          className={fieldClass}
        />
        {(bannerPreview || agency.news_agency_header_banner) && !removeBanner && (
          <div className="mt-2 flex flex-col items-start gap-2 rounded-md border border-gray-200 bg-white p-2">
            <img src={bannerPreview} alt="پیش‌نمایش بنر" className="w-full max-w-xs rounded" />
            <label className="flex items-center gap-2 text-[10px] text-gray-600">
              <input type="checkbox" name="remove_news_agency_header_banner" checked={removeBanner} onChange={(e) => setRemoveBanner(e.target.checked)} />
              حذف بنر
            </label>
          </div>
        )}
        <p className="text-[10px] text-gray-500">فرمت‌های مجاز : JPG, PNG, WEBP, GIF — حداکثر ۲۰۰ KB</p>
      </InputRow>

      <MessageBox message={state?.errors?.message} />

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 bg-sky-600 hover:bg-sky-700 text-white text-xs rounded-md px-6 py-2 outline-0 cursor-pointer disabled:opacity-50"
      >
        {isPending ? 'در حال ذخیره...' : 'ذخیره پروفایل'}
      </button>
    </form>
  )
}