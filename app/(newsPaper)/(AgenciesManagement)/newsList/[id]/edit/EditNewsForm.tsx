// app/(newsPaper)/(AgenciesManagement)/newsList/[id]/edit/EditNewsForm.tsx

'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PersianDateCMP } from '@/app/components/persianDateCMP'
import { toJalaaliInput } from '@/app/lib/jalaliDate'
import { editNewsAction, type NewsFormState } from '../../../action/newsAction'
import { InputRow, MessageBox, fieldClass } from '../../../myNewsAgency/FormFields'
import { MAX_IMAGES_PER_NEWS } from '../../../lib/newsImagesConfig'
import { newsImageUrl } from '../../../lib/newsImagesDb'

type ExistingImage = {
  id: number
  image_name: string
  position: number
}

export type EditNewsInitialData = {
  id: number
  headline: string
  sub_headline: string
  body: string
  news_category: string
  news_source: string
  reporter: string
  published_at: string
  archive_at: string
  on_air: boolean
  is_breaking: boolean
  comments_enabled: boolean
  images: ExistingImage[]
}

export default function EditNewsForm({ initialData, canPublish }: {
  initialData: EditNewsInitialData
  canPublish: boolean
}) {
  const action = editNewsAction.bind(null, initialData.id)
  const [state, formAction, isPending] = useActionState<NewsFormState, FormData>(action, null)
  const router = useRouter()
  const [publishedAt, setPublishedAt] = useState(initialData.published_at)
  const [archiveAt, setArchiveAt] = useState(initialData.archive_at)

  useEffect(() => {
    if (state?.success) router.push('/newsList')
  }, [state, router])

  const removedCount = typeof document === 'undefined'
    ? 0
    : document.querySelectorAll('input[name="remove_image_ids"]:checked').length

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <h2 className="text-sm font-bold text-gray-800">ویرایش خبر</h2>

      {!canPublish && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg p-3 leading-relaxed">
          وضعیت انتشار خبر قابل فعال‌سازی نیست؛ می‌توانید متن و سایر مشخصات خبر را ویرایش کنید.
        </div>
      )}

      <InputRow label="تیتر خبر" error={state?.errors?.headline}>
        <input name="headline" type="text" maxLength={200} className={fieldClass} required defaultValue={state?.values?.headline ?? initialData.headline} />
      </InputRow>

      <InputRow label="زیرتیتر خبر" error={state?.errors?.sub_headline}>
        <input name="sub_headline" type="text" maxLength={200} className={fieldClass} defaultValue={state?.values?.sub_headline ?? initialData.sub_headline} />
      </InputRow>

      <InputRow label="متن خبر" error={state?.errors?.body}>
        <textarea name="body" rows={10} className={fieldClass} required defaultValue={state?.values?.body ?? initialData.body} />
      </InputRow>

      <div className="grid gap-3 sm:grid-cols-2">
        <InputRow label="دسته‌بندی" error={state?.errors?.news_category}>
          <input name="news_category" type="text" maxLength={50} className={fieldClass} defaultValue={state?.values?.news_category ?? initialData.news_category} />
        </InputRow>
        <InputRow label="منبع خبر" error={state?.errors?.news_source}>
          <input name="news_source" type="text" maxLength={100} className={fieldClass} defaultValue={state?.values?.news_source ?? initialData.news_source} />
        </InputRow>
        <InputRow label="خبرنگار" error={state?.errors?.reporter}>
          <input name="reporter" type="text" maxLength={150} className={fieldClass} defaultValue={state?.values?.reporter ?? initialData.reporter} />
        </InputRow>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <InputRow label="تاریخ انتشار (شمسی)" error={state?.errors?.published_at}>
          <PersianDateCMP name="published_at" value={publishedAt} onChange={setPublishedAt} className={fieldClass} />
        </InputRow>
        <InputRow label="تاریخ بایگانی (شمسی)" error={state?.errors?.archive_at}>
          <PersianDateCMP name="archive_at" value={archiveAt} onChange={setArchiveAt} className={fieldClass} />
        </InputRow>
      </div>

      <div className="grid gap-2 sm:grid-cols-3 text-xs">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="on_air" defaultChecked={initialData.on_air} />
          <span>نمایش در سایت</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_breaking" defaultChecked={initialData.is_breaking} />
          <span>خبر فوری</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="comments_enabled" defaultChecked={initialData.comments_enabled} />
          <span>فعال بودن دیدگاه‌ها</span>
        </label>
      </div>

      {initialData.images.length > 0 && (
        <InputRow label="تصاویر فعلی — برای حذف، تیک تصویر را بزنید" error={state?.errors?.images}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {initialData.images.map((image) => (
              <label key={image.id} className="flex flex-col gap-2 rounded border border-gray-200 p-2 text-[10px]">
                <img src={newsImageUrl(image.image_name)} alt="تصویر فعلی خبر" className="h-24 w-full rounded object-cover" />
                <span className="flex items-center gap-2">
                  <input type="checkbox" name="remove_image_ids" value={image.id} />
                  حذف تصویر
                </span>
              </label>
            ))}
          </div>
          <p className="text-[10px] text-gray-500">تصاویر انتخاب‌نشده حفظ می‌شوند. مجموع تصاویر پس از ویرایش حداکثر {MAX_IMAGES_PER_NEWS} عدد است.</p>
        </InputRow>
      )}

      <InputRow label={`افزودن تصویر (حداکثر ${MAX_IMAGES_PER_NEWS} تصویر در مجموع، هر کدام حداکثر ۲۰۰ KB)`} error={state?.errors?.images}>
        {Array.from({ length: MAX_IMAGES_PER_NEWS }).map((_, index) => (
          <input key={index} type="file" name={`images_${index}`} accept="image/jpeg,image/png,image/jpg,image/webp,image/gif" className={fieldClass} />
        ))}
        <p className="text-[10px] text-gray-500">فرمت‌های مجاز: JPG, PNG, WEBP, GIF — تصاویر قبلی تا زمانی که حذفشان را انتخاب نکنید حفظ می‌شوند.</p>
      </InputRow>

      <MessageBox message={state?.errors?.message} />

      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={isPending} className="mt-2 rounded-md bg-sky-600 px-6 py-2 text-xs text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50">
          {isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
        </button>
        <button type="button" onClick={() => router.push('/newsList')} className="mt-2 rounded-md border border-gray-300 px-6 py-2 text-xs text-gray-700 hover:bg-gray-50">
          انصراف
        </button>
      </div>
    </form>
  )
}
