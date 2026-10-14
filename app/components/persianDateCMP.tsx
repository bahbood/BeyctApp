'use client'

import { useEffect, useMemo, useState } from 'react'
import { jalaaliMonthLength, toJalaali } from 'jalaali-js'

interface PersianDateCMPProps {
  className?: string
  value?: string // YYYY/MM/DD
  onChange?: (value: string) => void
  required?: boolean
  disabled?: boolean
  name?: string
  pastYears?: number
  futureYears?: number
  allowClear?: boolean
}

const MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
]
const faNumber = new Intl.NumberFormat('fa-IR')
const pad = (value: string | number) => String(value).padStart(2, '0')

export function PersianDateCMP({
  className = '',
  value = '',
  onChange,
  required = false,
  disabled = false,
  name = 'persian-date',
  pastYears = 20,
  futureYears = 5,
  allowClear = true,
}: PersianDateCMPProps) {
  const [valueYear = '', valueMonth = '', valueDay = ''] = value.split('/')
  // نگهداری draft مستقل ضروری است: تاریخ خالی باید اجازه دهد کاربر سال، ماه و روز را جداگانه انتخاب کند.
  const [year, setYear] = useState(valueYear)
  const [month, setMonth] = useState(valueMonth)
  const [day, setDay] = useState(valueDay)

  useEffect(() => {
    setYear(valueYear)
    setMonth(valueMonth)
    setDay(valueDay)
  }, [valueYear, valueMonth, valueDay])

  const currentYear = useMemo(() => toJalaali(new Date()).jy, [])
  const years = useMemo(
    () => Array.from({ length: pastYears + futureYears + 1 }, (_, i) => currentYear - pastYears + i),
    [currentYear, pastYears, futureYears],
  )
  const maxDay = useMemo(() => {
    if (!year || !month) return 31
    return jalaaliMonthLength(Number(year), Number(month))
  }, [year, month])

  const updateParts = (nextYear: string, nextMonth: string, nextDay: string) => {
    let safeDay = nextDay
    if (nextYear && nextMonth && safeDay) {
      const max = jalaaliMonthLength(Number(nextYear), Number(nextMonth))
      if (Number(safeDay) > max) {
        // جلوگیری از باقی ماندن تاریخ قبلی در hidden input پس از تغییر ماه/سال.
        clear()
        return
      }
    }

    setYear(nextYear)
    setMonth(nextMonth)
    setDay(safeDay)

    if (!nextYear || !nextMonth || !safeDay) {
      // انتخاب ناقص فقط در draft باقی می‌ماند؛ hidden input تا تکمیل تاریخ خالی می‌ماند.
      return
    }

    onChange?.(`${nextYear}/${pad(nextMonth)}/${pad(safeDay)}`)
  }

  const clear = () => {
    setYear('')
    setMonth('')
    setDay('')
    onChange?.('')
  }

  return (
    <div className={className}>
      <input type="hidden" id={name} name={name} value={value} readOnly />
      <div className="flex items-center gap-2">
        <select
          value={day}
          disabled={disabled}
          required={required}
          aria-label="روز"
          className="min-w-0 flex-1 rounded-md border border-gray-300 px-2 py-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(event) => event.target.value ? updateParts(year, month, event.target.value) : clear()}
        >
          <option value="">روز</option>
          {Array.from({ length: maxDay }).map((_, i) => {
            const val = pad(i + 1)
            return <option key={val} value={val}>{faNumber.format(i + 1)}</option>
          })}
        </select>
        <span>/</span>
        <select
          value={month}
          disabled={disabled}
          required={required}
          aria-label="ماه"
          className="min-w-0 flex-1 rounded-md border border-gray-300 px-2 py-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(event) => event.target.value ? updateParts(year, event.target.value, day) : clear()}
        >
          <option value="">ماه</option>
          {MONTHS.map((label, index) => (
            <option key={label} value={pad(index + 1)}>{label}</option>
          ))}
        </select>
        <span>/</span>
        <select
          value={year}
          disabled={disabled}
          required={required}
          aria-label="سال"
          className="min-w-0 flex-1 rounded-md border border-gray-300 px-2 py-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(event) => event.target.value ? updateParts(event.target.value, month, day) : clear()}
        >
          <option value="">سال</option>
          {years.map((y) => <option key={y} value={String(y)}>{faNumber.format(y)}</option>)}
        </select>
        {allowClear && value && !disabled && (
          <button
            type="button"
            onClick={clear}
            className="shrink-0 rounded border border-gray-300 px-2 py-2 text-[10px] text-gray-600 hover:bg-gray-100"
            aria-label="پاک کردن تاریخ"
            title="پاک کردن تاریخ"
          >
            پاک‌کردن
          </button>
        )}
      </div>
      {allowClear && !value && (year || month || day) && !disabled && (
        <button
          type="button"
          onClick={clear}
          className="mt-1 text-[10px] text-gray-500 underline"
        >
          پاک کردن انتخاب ناقص
        </button>
      )}
    </div>
  )
}
