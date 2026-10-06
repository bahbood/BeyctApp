// app/(Occupations)/(OccupationsManagment)/lib/serviceSubscription.ts
// ثابت‌ها و توابع اشتراک سالانه خدمات - بدون وابستگی به سرور تا در کامپوننت کلاینت هم قابل استفاده باشد

import { serviceStatuses } from '@/app/db/schema'

export type ServiceStatus = (typeof serviceStatuses.enumValues)[number]

/** تنها بازه اشتراک خدمات : اشتراک سالانه */
export const SERVICE_YEARLY_PRICE = 2_000_000
export const SERVICE_SUBSCRIPTION_LABEL = 'اشتراک یک ساله'

export const SERVICE_STATUS_LABELS: Record<ServiceStatus, string> = {
  inactive: 'غیرفعال',
  pending: 'در انتظار تایید',
  active: 'فعال',
}

export const SERVICE_STATUS_STYLES: Record<ServiceStatus, string> = {
  inactive: 'text-red-600 bg-red-50 border-red-200',
  pending: 'text-amber-700 bg-amber-50 border-amber-200',
  active: 'text-green-700 bg-green-50 border-green-200',
}

/** تاریخ پایان اشتراک : یک سال پس از تایید مدیر سایت */
export function calculateYearlyExpiredAt(from: Date = new Date()): Date {
  const expiresAt = new Date(from)
  expiresAt.setFullYear(expiresAt.getFullYear() + 1)
  return expiresAt
}

/**
 * وضعیت نمایشی خدمت با در نظر گرفتن انقضای اشتراک و محدودیت اعمال شده توسط مدیر سایت.
 * همچنین خدمت تایید نشده نیز فعال محسوب نمی شود.
 */
export function getServiceDisplayStatus(service: {
  service_status: ServiceStatus
  expired_at: Date
  is_outofaccess: boolean | null
}): { label: string; style: string } {
  if (service.is_outofaccess) {
    return { label: 'خارج از دسترس', style: 'text-gray-700 bg-gray-100 border-gray-300' }
  }

  if (service.service_status === 'active') {
    if (new Date(service.expired_at) < new Date()) {
      return { label: 'اشتراک منقضی شده', style: 'text-red-600 bg-red-50 border-red-200' }
    }
    return { label: SERVICE_STATUS_LABELS.active, style: SERVICE_STATUS_STYLES.active }
  }

  return {
    label: SERVICE_STATUS_LABELS[service.service_status],
    style: SERVICE_STATUS_STYLES[service.service_status],
  }
}

/**
 * آیا خدمت اجازه نمایش در بانک مشاغل را دارد؟
 * تایید مدیر سایت، فعال بودن اشتراک سالانه، عدم محدودیت دسترسی و روشن بودن on_air
 */
export function isServicePublishable(service: {
  service_status: ServiceStatus
  expired_at: Date
  is_outofaccess: boolean | null
  on_air: boolean | null
}): boolean {
  return (
    service.service_status === 'active' &&
    new Date(service.expired_at) >= new Date() &&
    !service.is_outofaccess &&
    service.on_air === true
  )
}

const faDate = new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' })

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return '-'
  return faDate.format(new Date(value))
}
