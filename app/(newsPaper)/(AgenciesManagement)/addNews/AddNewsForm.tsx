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
  const [archiveAt, setArchiveAt] = useState('')
  const [headlinePreview, setHeadlinePreview] = useState('')
  const [subHeadlinePreview, setSubHeadlinePreview] = useState('')
  const [bodyPreview, setBodyPreview] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (state?.success) {
      setSaved(true)
      router.push('/newsList')
    }
  }, [state, router])

  useEffect(() => {
    if (!isDirty || saved) return
    const warnBeforeLeave = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warnBeforeLeave)
    return () => window.removeEventListener('beforeunload', warnBeforeLeave)
  }, [isDirty, saved])

  return (
    <form action={formAction} onChange={() => setIsDirty(true)} className="flex flex-col gap-4">
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
          onChange={(event) => setHeadlinePreview(event.target.value)}
        />
      </InputRow>

      <InputRow label="زیرتیتر خبر" error={state?.errors?.sub_headline}>
        <input
          name="sub_headline"
          type="text"
          maxLength={200}
          className={fieldClass}
          defaultValue={state?.values?.sub_headline ?? ''}
          onChange={(event) => setSubHeadlinePreview(event.target.value)}
        />
      </InputRow>

      <InputRow label="متن خبر" error={state?.errors?.body}>
        <textarea
          name="body"
          rows={8}
          className={fieldClass}
          required
          defaultValue={state?.values?.body ?? ''}
          onChange={(event) => setBodyPreview(event.target.value)}
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
        <p className="text-[10px] text-gray-500">فرمت‌های مجاز: JPG, PNG, WEBP, GIF — هر تصویر حداکثر ۲۰۰ KB و مجموع تصاویر حداکثر ۸۰۰ KB</p>
      </InputRow>

      <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-500">
        <span>تعداد کاراکتر تیتر: {headlinePreview.length} / ۲۰۰</span>
        <span>تعداد کاراکتر متن: {bodyPreview.length}</span>
        <button type="button" onClick={() => setShowPreview((value) => !value)} className="rounded border border-gray-300 px-3 py-1 text-sky-700 hover:bg-sky-50">
          {showPreview ? 'بستن پیش‌نمایش' : 'پیش‌نمایش خبر'}
        </button>
      </div>
      {showPreview && <section className="rounded-lg border border-gray-200 bg-gray-50 p-4" aria-label="پیش‌نمایش خبر">
        <h3 className="text-base font-bold text-gray-900">{headlinePreview || 'تیتر خبر'}</h3>
        {subHeadlinePreview && <p className="mt-2 text-sm text-gray-600">{subHeadlinePreview}</p>}
        <hr className="my-3 border-gray-200" />
        <p className="whitespace-pre-wrap text-sm leading-7 text-gray-800">{bodyPreview || 'متن خبر'}</p>
      </section>}

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
