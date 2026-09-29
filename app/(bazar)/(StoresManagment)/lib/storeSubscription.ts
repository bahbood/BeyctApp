// app/(bazar)/(StoresManagment)/lib/storeSubscription.ts

import { storeStatuses, storeSubscriptionPlans } from '@/app/db/schema'

export type StoreStatus = (typeof storeStatuses.enumValues)[number]
export type SubscriptionPlan = (typeof storeSubscriptionPlans.enumValues)[number]

export const SUBSCRIPTION_PRICES: Record<SubscriptionPlan, number> = {
  monthly: 250_000,
  yearly: 2_500_000,
}

export const SUBSCRIPTION_LABELS: Record<SubscriptionPlan, string> = {
  monthly: 'اشتراک یک ماهه',
  yearly: 'اشتراک یک ساله',
}

export const STORE_STATUS_LABELS: Record<StoreStatus, string> = {
  inactive: 'غیرفعال',
  pending: 'در انتظار تایید',
  active: 'فعال',
}

export const STORE_STATUS_STYLES: Record<StoreStatus, string> = {
  inactive: 'text-red-600 bg-red-50 border-red-200',
  pending: 'text-amber-700 bg-amber-50 border-amber-200',
  active: 'text-green-700 bg-green-50 border-green-200',
}

export function isSubscriptionPlan(value: unknown): value is SubscriptionPlan {
  return value === 'monthly' || value === 'yearly'
}

/** تاریخ پایان اشتراک بر اساس مدت خریداری شده و تاریخ شروع */
export function calculateExpiredAt(plan: SubscriptionPlan, from: Date = new Date()): Date {
  const expiresAt = new Date(from)

  if (plan === 'monthly') {
    expiresAt.setMonth(expiresAt.getMonth() + 1)
  } else {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)
  }

  return expiresAt
}

/** وضعیت نمایشی فروشگاه با در نظر گرفتن انقضای اشتراک و دسترسی مدیر سایت */
export function getStoreDisplayStatus(store: {
  store_status: StoreStatus
  expired_at: Date
  is_outofaccess: boolean | null
}): { label: string; style: string } {
  if (store.is_outofaccess) {
    return { label: 'خارج از دسترس', style: 'text-gray-700 bg-gray-100 border-gray-300' }
  }

  if (store.store_status === 'active') {
    if (new Date(store.expired_at) < new Date()) {
      return { label: 'اشتراک منقضی شده', style: 'text-red-600 bg-red-50 border-red-200' }
    }
    return { label: STORE_STATUS_LABELS.active, style: STORE_STATUS_STYLES.active }
  }

  return { label: STORE_STATUS_LABELS[store.store_status], style: STORE_STATUS_STYLES[store.store_status] }
}

const faDate = new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' })

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return '-'
  return faDate.format(new Date(value))
}
