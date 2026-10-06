// app/(Occupations)/(OccupationsManagment)/myServices/ServiceFormInputs.tsx
// فیلدهای مشترک فرم ثبت و ویرایش خدمت

'use client'

import type { ServiceCategory } from '@/app/db/schema'
import type { ServiceFormValues } from '../action/serviceAction'
import { fieldClass, InputRow } from './FormFields'

type Props = {
  defaults: ServiceFormValues
  errors: {
    title?: string
    short_desc?: string
    contact1?: string
    contact2?: string
    office_address?: string
    category_id?: string
    banner?: string
  }
  categories: ServiceCategory[]
}

export const emptyServiceValues: ServiceFormValues = {
  service_id: '',
  title: '',
  short_desc: '',
  contact1: '',
  contact2: '',
  office_address: '',
  category_id: '',
}

export default function ServiceFormInputs({ defaults, errors, categories }: Props) {
  return (
    <>
      <input type="hidden" name="service_id" value={defaults.service_id} readOnly />

      <InputRow label="عنوان خدمت" error={errors.title}>
        <input
          id="title"
          name="title"
          type="text"
          placeholder="عنوان خدمت"
          dir="rtl"
          required
          maxLength={100}
          defaultValue={defaults.title}
          className={fieldClass}
        />
      </InputRow>

      <InputRow label="توضیح کوتاه" error={errors.short_desc}>
        <textarea
          id="short_desc"
          name="short_desc"
          rows={3}
          placeholder="توضیح کوتاه درباره خدمت"
          dir="rtl"
          required
          maxLength={200}
          defaultValue={defaults.short_desc}
          className={`${fieldClass} resize-none`}
        />
      </InputRow>

      <InputRow label="شماره تماس ۱" error={errors.contact1}>
        <input
          id="contact1"
          name="contact1"
          type="text"
          inputMode="numeric"
          placeholder="09123456789"
          dir="ltr"
          required
          maxLength={11}
          defaultValue={defaults.contact1}
          className={fieldClass}
        />
      </InputRow>

      <InputRow label="شماره تماس ۲ (اختیاری)" error={errors.contact2}>
        <input
          id="contact2"
          name="contact2"
          type="text"
          inputMode="numeric"
          placeholder="02112345678"
          dir="ltr"
          maxLength={11}
          defaultValue={defaults.contact2}
          className={fieldClass}
        />
      </InputRow>

      <InputRow label="آدرس دفتر" error={errors.office_address}>
        <textarea
          id="office_address"
          name="office_address"
          rows={2}
          placeholder="آدرس دفتر یا محل ارائه خدمت"
          dir="rtl"
          required
          maxLength={250}
          defaultValue={defaults.office_address}
          className={`${fieldClass} resize-none`}
        />
      </InputRow>

      <InputRow label="دسته بندی خدمت" error={errors.category_id}>
        <select
          id="category_id"
          name="category_id"
          required
          defaultValue={defaults.category_id}
          className={fieldClass}
        >
          <option value="">انتخاب دسته بندی</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </InputRow>

      <InputRow label="بنر خدمت (اختیاری)" error={errors.banner}>
        <input
          id="banner"
          name="banner"
          type="file"
          accept=".jpg,.jpeg,.png,.gif,.webp"
          className={`${fieldClass} py-2 file:ml-2 file:rounded-sm file:border-0 file:bg-gray-200 file:px-2 file:py-1 file:text-[10px]`}
        />
        <span className="text-[10px] text-gray-400">
          فرمت‌های مجاز: jpg , jpeg , png , gif , webp - حداکثر ۱ مگابایت
        </span>
      </InputRow>
    </>
  )
}
