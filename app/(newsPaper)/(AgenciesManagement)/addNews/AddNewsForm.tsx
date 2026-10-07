// app/(newsPaper)/(AgenciesManagement)/addNews/AddNewsForm.tsx

'use client'

import { useEffect, useState, useActionState } from 'react'
import { createNewsAction, type NewsFormState } from '../action/newsAction'
import { InputRow, MessageBox, fieldClass } from '../myNewsAgency/FormFields'
import { PersianDateCMP } from '@/app/components/persianDateCMP'
import { toJalaaliInput } from '@/app/lib/jalaliDate'
import { MAX_IMAGES_PER_NEWS } from '../lib/newsImagesConfig'
import { useRouter } from 'next/navigation'

export default function AddNewsForm({ canPublish = true }: { canPublish?: boolean }) {
  const [state, formAction, isPending] = useActionState<NewsFormState, FormData>(createNewsAction, null)
  const router = useRouter()

  // PersianDateCMP یک کامپوننت کنترل شده است → مقدار باید در state نگهداری شود
  // این state بین ارسال‌های فرم حفظ می شود (فرم بعد از ارسال ریست می شود ولی این مقدار باقی می ماند)
  const [publishedAt, setPublishedAt] = useState(toJalaaliInput(new Date()))
  const [archiveAt, setArchiveAt] = useState(toJalaaliInput(new Date()))

  useEffect(() => {
    if (state?.success) {
      router.push('/newsList')
    }
  }, [state, router])

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <h2 className="text-sm font-bold text-gray-800">ثبت خبر جدید</h2>

      {!canPublish && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg p-3 leading-relaxed">
          خبرگزاری شما در وضعیت انتشار مجاز نیست. تا زمان تایید و فعال بودن اشتراک، امکان ثبت خبر وجود ندارد.
        </div>
      )}

      <InputRow label="تیتر خبر" error={state?.errors?.headline}>
        <input
          name="headline"
          type="text"
          maxLength={200}
          className={fieldClass}
          required
          defaultValue={state?.values?.headline ?? ''}
        />
      </InputRow>

      <InputRow label="زیرتیتر خبر" error={state?.errors?.sub_headline}>
        <input
          name="sub_headline"
          type="text"
          maxLength={200}
          className={fieldClass}
          defaultValue={state?.values?.sub_headline ?? ''}
        />
      </InputRow>

      <InputRow label="متن خبر" error={state?.errors?.body}>
        <textarea
          name="body"
          rows={8}
          className={fieldClass}
          required
          defaultValue={state?.values?.body ?? ''}
        />
      </InputRow>

      <div className="grid gap-3 sm:grid-cols-2">
        <InputRow label="دسته‌بندی" error={state?.errors?.news_category}>
          <input
            name="news_category"
            type="text"
            maxLength={50}
            className={fieldClass}
            defaultValue={state?.values?.news_category ?? ''}
          />
        </InputRow>

        <InputRow label="منبع خبر" error={state?.errors?.news_source}>
          <input
            name="news_source"
            type="text"
            maxLength={100}
            className={fieldClass}
            defaultValue={state?.values?.news_source ?? ''}
          />
        </InputRow>

        <InputRow label="خبرنگار" error={state?.errors?.reporter}>
          <input
            name="reporter"
            type="text"
            maxLength={150}
            className={fieldClass}
            defaultValue={state?.values?.reporter ?? ''}
          />
        </InputRow>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <InputRow label="تاریخ انتشار (شمسی)" error={state?.errors?.published_at}>
          <PersianDateCMP
            name="published_at"
            value={publishedAt}
            onChange={setPublishedAt}
            className={fieldClass}
          />
        </InputRow>

        <InputRow label="تاریخ بایگانی (شمسی)" error={state?.errors?.archive_at}>
          <PersianDateCMP
            name="archive_at"
            value={archiveAt}
            onChange={setArchiveAt}
            className={fieldClass}
          />
        </InputRow>
      </div>

      <div className="grid gap-2 sm:grid-cols-3 text-xs">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="on_air" defaultChecked />
          <span>نمایش در سایت</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_breaking" />
          <span>خبر فوری</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="comments_enabled" defaultChecked />
          <span>فعال بودن دیدگاه‌ها</span>
        </label>
      </div>

      <InputRow label={`تصاویر (حداکثر ${MAX_IMAGES_PER_NEWS} تصویر، هر کدام حداکثر ۲۰۰ KB)`} error={state?.errors?.images}>
        {Array.from({ length: MAX_IMAGES_PER_NEWS }).map((_, i) => (
          <input
            key={i}
            type="file"
            name={`images_${i}`}
            accept="image/jpeg,image/png,image/jpg,image/webp,image/gif"
            className={fieldClass}
          />
        ))}
        <p className="text-[10px] text-gray-500">فرمت‌های مجاز : JPG, PNG, WEBP, GIF — هر تصویر حداکثر ۲۰۰ KB</p>
      </InputRow>

      <MessageBox message={state?.errors?.message} />

      <button
        type="submit"
        disabled={isPending || !canPublish}
        className="mt-2 bg-sky-600 hover:bg-sky-700 text-white text-xs rounded-md px-6 py-2 outline-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'در حال ثبت...' : 'ثبت خبر'}
      </button>
    </form>
  )
}
