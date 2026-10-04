'use client'

import { useActionState, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { addProductAction, ProductActionState } from '../../action/productAction'
import { PersianDateCMP } from '@/app/components/persianDateCMP'

const MAX_IMAGES = 3

export default function AddProductForm({ defaultRegisteredAt }: { defaultRegisteredAt: string }) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState<ProductActionState, FormData>(addProductAction, null)

  const [registeredAt, setRegisteredAt] = useState(state?.values?.registered_at || defaultRegisteredAt)
  const [archiveAt, setArchiveAt] = useState(state?.values?.archive_at || '')
  const [onAir, setOnAir] = useState(state?.values?.on_air ?? false)
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state?.success === true) {
      router.push('/productsList')
      router.refresh()
    }
  }, [state, router])

  // بازگرداندن مقادیر فرم پس از خطای اعتبارسنجی (الگوی پیشنهادی React برای تنظیم state در رندر)
  const [lastState, setLastState] = useState(state)
  if (state !== lastState) {
    setLastState(state)
    if (state?.values) {
      setRegisteredAt(state.values.registered_at || defaultRegisteredAt)
      setArchiveAt(state.values.archive_at)
      setOnAir(state.values.on_air)
    }
  }

  // همگام‌سازی فایل‌های انتخاب‌شده با input تا همراه فرم ارسال شوند
  useEffect(() => {
    const transfer = new DataTransfer()
    files.forEach((file) => transfer.items.add(file))
    if (fileInputRef.current) fileInputRef.current.files = transfer.files
  }, [files])

  const previews = useMemo(
    () => files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })),
    [files]
  )

  useEffect(() => {
    return () => previews.forEach((preview) => URL.revokeObjectURL(preview.url))
  }, [previews])

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return
    setFiles((prev) => [...prev, ...Array.from(fileList)].slice(0, MAX_IMAGES))
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <form action={formAction} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col gap-4">
      <h3 className="text-sm font-bold text-gray-700 border-b pb-2">اطلاعات محصول</h3>

      <InputRow label="نام محصول" error={state?.errors?.product_name}>
        <input name="product_name" type="text" required defaultValue={state?.values?.product_name ?? ''}
          className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300" />
      </InputRow>

      <InputRow label="توضیح کوتاه">
        <input name="product_shortdesc" type="text" defaultValue={state?.values?.product_shortdesc ?? ''}
          className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300" />
      </InputRow>

      <InputRow label="توضیحات">
        <textarea name="product_desc" rows={4} defaultValue={state?.values?.product_desc ?? ''}
          className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300 resize-none" />
      </InputRow>

      <div className="grid grid-cols-3 gap-3">
        <InputRow label="قیمت" error={state?.errors?.price}>
          <input name="price" type="number" required defaultValue={state?.values?.price ?? ''}
            className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300" />
        </InputRow>

        <InputRow label="تخفیف %" error={state?.errors?.off_percent}>
          <input name="off_percent" type="number" defaultValue={state?.values?.off_percent ?? '0'}
            className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300" />
        </InputRow>

        <InputRow label="موجودی" error={state?.errors?.inventory}>
          <input name="inventory" type="number" defaultValue={state?.values?.inventory ?? '0'}
            className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300" />
        </InputRow>
      </div>

      <h3 className="text-sm font-bold text-gray-700 border-b pb-2">تاریخ و نمایش</h3>

      <InputRow label="تاریخ ثبت محصول" error={state?.errors?.registered_at}>
        <PersianDateCMP
          name="registered_at"
          value={registeredAt}
          onChange={setRegisteredAt}
          pastYears={5}
          futureYears={5}
        />
      </InputRow>

      <InputRow label="تاریخ انقضا (آرشیو)" error={state?.errors?.archive_at}>
        <PersianDateCMP
          name="archive_at"
          value={archiveAt}
          onChange={setArchiveAt}
          pastYears={0}
          futureYears={5}
        />
        <p className="text-[10px] text-gray-400">خالی بگذارید تا محصول تاریخ انقضا نداشته باشد</p>
      </InputRow>

      <InputRow label="نمایش برای کاربران سایت">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" name="on_air" checked={onAir} onChange={(e) => setOnAir(e.target.checked)}
            className="size-4 accent-sky-600 cursor-pointer" />
          <span className="text-[10px] text-gray-600">
            {onAir ? 'محصول برای بازدیدکنندگان سایت نمایش داده می‌شود' : 'محصول برای بازدیدکنندگان سایت پنهان است'}
          </span>
        </label>
      </InputRow>

      <h3 className="text-sm font-bold text-gray-700 border-b pb-2">تصاویر محصول</h3>

      <InputRow label={`تصاویر (حداکثر ${MAX_IMAGES} تصویر)`} error={state?.errors?.images}>
        <input ref={fileInputRef} type="file" name="images" multiple accept=".jpg,.jpeg,.png,.gif,.webp"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={files.length >= MAX_IMAGES}
          className="block w-full text-xs text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 disabled:opacity-50" />
        <p className="text-[10px] text-gray-400">JPG, PNG, GIF, WebP — حداکثر حجم هر تصویر 300 کیلوبایت </p>
        <p className="text-[10px] text-gray-400">نسبت عرض به طول تصاویر برای تطابق کامل با قالب 3 به 4 باشد . </p>
      </InputRow>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((preview, index) => (
            <div key={preview.url} className="relative aspect-square bg-gray-100 rounded border border-gray-200 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview.url} alt={preview.name} className="w-full h-full object-cover" />
              {index === 0 && (
                <span className="absolute top-1 right-1 bg-sky-600 text-white text-[9px] rounded px-1">تصویر اصلی</span>
              )}
              <button type="button" onClick={() => removeFile(index)}
                className="absolute bottom-1 left-1 bg-red-600 text-white text-[9px] rounded px-1.5 py-0.5 cursor-pointer">
                حذف
              </button>
            </div>
          ))}
        </div>
      )}

      {state?.errors?.message && (
        <pre className="text-red-700 text-[10px] text-right">{state.errors.message}</pre>
      )}

      <button type="submit" disabled={isPending}
        className="block bg-sky-600 text-white w-full rounded-md px-3 pt-2 pb-2 text-center outline-0 disabled:opacity-50 cursor-pointer">
        {isPending ? 'در حال ذخیره...' : 'افزودن محصول'}
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
