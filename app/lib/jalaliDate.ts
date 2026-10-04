// app/lib/jalaliDate.ts
// کمک‌کننده‌های تاریخ شمسی برای ورودی‌های فرم و نام‌گذاری فایل‌ها

import { toGregorian, toJalaali } from 'jalaali-js'

const pad = (value: number, length = 2) => String(value).padStart(length, '0')

/** مهر زمانی شمسی به شکل YYYYMMDD — مثال: 14050331 */
export function jalaaliStamp(date: Date = new Date()): string {
  const { jy, jm, jd } = toJalaali(date)
  return `${jy}${pad(jm)}${pad(jd)}`
}

/** تاریخ شمسی به شکل YYYY/MM/DD — مثال: 1405/03/31 (ورودی خالی یا نامعتبر → رشته خالی) */
export function toJalaaliInput(date: Date | string | null | undefined): string {
  if (!date) return ''

  const parsed = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(parsed.getTime())) return ''

  const { jy, jm, jd } = toJalaali(parsed)
  return `${jy}/${pad(jm)}/${pad(jd)}`
}

/**
 * تبدیل ورودی شمسی فرم (YYYY/MM/DD) به Date میلادی.
 * در صورت نامعتبر بودن ورودی، null برمی‌گرداند.
 */
export function jalaaliInputToDate(value: string): Date | null {
  const match = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/.exec(value.trim())
  if (!match) return null

  const jy = Number(match[1])
  const jm = Number(match[2])
  const jd = Number(match[3])

  if (jm < 1 || jm > 12 || jd < 1 || jd > 31) return null

  const { gy, gm, gd } = toGregorian(jy, jm, jd)
  const date = new Date(gy, gm - 1, gd)

  if (Number.isNaN(date.getTime())) return null

  // بررسی round trip — مثال 1405/12/30 نامعتبر است و به 1406/01/01 تبدیل می‌شود
  const roundTrip = toJalaali(date)
  if (roundTrip.jy !== jy || roundTrip.jm !== jm || roundTrip.jd !== jd) return null

  return date
}
