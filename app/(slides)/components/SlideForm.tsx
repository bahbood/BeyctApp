// app/(slides)/components/SlideForm.tsx
'use client'

import { useActionState, useState } from 'react'
import type { SlideFormState } from '../actions/slidesActions'
import type { Slide } from '@/app/db/schema'
import { PersianDateCMP } from '@/app/components/persianDateCMP'
import { toJalaali } from 'jalaali-js'

type SlideFormAction = (
  prevState: SlideFormState,
  formData: FormData
) => Promise<SlideFormState>


function gregorianToJalaliStr(date: Date): string {
  const { jy, jm, jd } = toJalaali(date)
  const mm = String(jm).padStart(2, '0')
  const dd = String(jd).padStart(2, '0')
  return `${jy}/${mm}/${dd}`
}

function defaultDateStr(date: Date | null | undefined, fallback: string): string {
  if (!date) return fallback
  try {
    return gregorianToJalaliStr(new Date(date))
  } catch {
    return fallback
  }
}

export default function SlideForm({
  action,
  slide,
}: {
  action: SlideFormAction
  slide?: Slide
}) {
  const [state, formAction, isPending] = useActionState<SlideFormState, FormData>(action, null)
  const [startDate, setStartDate] = useState(defaultDateStr(slide?.show_startDate, "1403/07/01"));
  const [endDate, setEndDate] = useState(defaultDateStr(slide?.show_endDate, "1405/05/01"));

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-md">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-right text-sm pr-1"> نام ( عنوان )</label>
        <input
          id="name" name="name" type="text" required
          defaultValue={slide?.name || ''}
          className="block w-full rounded-md px-3 py-2 text-sm outline-1 outline-gray-300"
        />
        {state?.errors?.name && <p className="text-red-600 text-xs">{state.errors.name}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="image_L" className="text- text-sm pr-1">تصویر افقی - ( landscape ) </label>
        <input
          id="image_L" name="image_L" type="text" required
          defaultValue={slide?.image_L || ''}
          className="block w-full rounded-md px-3 py-2 text-sm outline-1 outline-gray-300 text-left"
        />
        {state?.errors?.image_L && <p className="text-red-600 text-xs">{state.errors.image_L}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="image_P" className="text-right text-sm pr-1">تصویر عمودی - ( portrait ) </label>
        <input
          id="image_P" name="image_P" type="text" required
          defaultValue={slide?.image_P || ''}
          className="block w-full rounded-md px-3 py-2 text-sm outline-1 outline-gray-300 text-left"
        />
        {state?.errors?.image_P && <p className="text-red-600 text-xs">{state.errors.image_P}</p>}
      </div>

    
<div className="flex flex-col gap-1">
        <label htmlFor="show_startDate" className="text-right text-sm pr-1">تاریخ آغاز نمایش : </label>
      
        <PersianDateCMP
        value={startDate}
        onChange={setStartDate}
        required
        name="show_startDate"
        className='w-full h-full border border-gray-300 rounded-sm p-1'
      />
        {state?.errors?.show_startDate && <p className="text-red-600 text-xs">{state.errors.show_startDate}</p>}
      </div>
       <div className="flex flex-col gap-1">
        <label htmlFor="show_endDate" className="text-right text-sm pr-1">تاریخ پایان نمایش : </label>
       
        <PersianDateCMP
        value={endDate}
        onChange={setEndDate}
        required
        name="show_endDate"
        className='w-full h-full border border-gray-300 rounded-sm p-1'
      />
        {state?.errors?.show_endDate && <p className="text-red-600 text-xs">{state.errors.show_endDate}</p>}
      </div>

       <div className="flex flex-col gap-1">
        <label htmlFor="order" className="text-right text-sm pr-1">order </label>
        <input
          id="order" name="order" type="number" required
          defaultValue={0}
          className="block w-full rounded-md px-3 py-2 text-sm outline-1 outline-gray-300"
        />
        {state?.errors?.order && <p className="text-red-600 text-xs">{state.errors.order}</p>}
      </div>

      <div className="flex items-center gap-2">
        <input
          id="isActive" name="isActive" type="checkbox"
          defaultChecked={slide?.isActive ?? true}
          className="w-4 h-4"
        />
        <label htmlFor="isActive" className="text-sm">Active</label>
      </div>

      {state?.message && (
        <p className="text-red-600 text-sm">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="bg-sky-600 text-white w-full rounded-md px-3 py-2 text-sm text-center disabled:opacity-50 cursor-pointer"
      >
        {isPending ? 'Saving...' : slide ? 'Update Slide' : 'Create Slide'}
      </button>
    </form>
  )
}
