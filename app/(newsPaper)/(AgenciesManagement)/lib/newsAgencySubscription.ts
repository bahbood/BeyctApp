// app/(newsPaper)/(AgenciesManagement)/lib/newsAgencySubscription.ts

import { newsAgencyStatuses, newsAgencySubscriptionPlans } from '@/app/db/schema'

export type NewsAgencyStatus = (typeof newsAgencyStatuses.enumValues)[number]
export type NewsAgencyPlan = (typeof newsAgencySubscriptionPlans.enumValues)[number]

export const NEWS_AGENCY_SUBSCRIPTION_PRICES: Record<NewsAgencyPlan, number> = {
  monthly: 500_000,
  yearly: 5_000_000,
}

export const NEWS_AGENCY_SUBSCRIPTION_LABELS: Record<NewsAgencyPlan, string> = {
  monthly: 'اشتراک یک ماهه',
  yearly: 'اشتراک یک ساله',
}

export const NEWS_AGENCY_STATUS_LABELS: Record<NewsAgencyStatus, string> = {
  inactive: 'غیرفعال',
  pending: 'در انتظار تایید',
  active: 'فعال',
}

export const NEWS_AGENCY_STATUS_STYLES: Record<NewsAgencyStatus, string> = {
  inactive: 'text-red-600 bg-red-50 border-red-200',
  pending: 'text-amber-700 bg-amber-50 border-amber-200',
  active: 'text-green-700 bg-green-50 border-green-200',
}

export function isNewsAgencySubscriptionPlan(value: unknown): value is NewsAgencyPlan {
  return value === 'monthly' || value === 'yearly'
}

/** تاریخ پایان اشتراک بر اساس مدت خریداری شده و تاریخ شروع */
export function calculateNewsAgencyExpiredAt(plan: NewsAgencyPlan, from: Date = new Date()): Date {
  const expiresAt = new Date(from)

  if (plan === 'monthly') {
    expiresAt.setMonth(expiresAt.getMonth() + 1)
  } else {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)
  }

  return expiresAt
}

/**
 * وضعیت نمایشی خبرگزاری با در نظر گرفتن انقضای اشتراک و محدودیت اعمال شده توسط مدیر سایت.
 * همچنین خبرگزاری تایید نشده نیز فعال محسوب نمی شود.
 */
export function getNewsAgencyDisplayStatus(agency: {
  news_agency_status: NewsAgencyStatus
  expired_at: Date
  is_outofaccess: boolean | null
}): { label: string; style: string } {
  if (agency.is_outofaccess) {
    return { label: 'خارج از دسترس', style: 'text-gray-700 bg-gray-100 border-gray-300' }
  }

  if (agency.news_agency_status === 'active') {
    if (new Date(agency.expired_at) < new Date()) {
      return { label: 'اشتراک منقضی شده', style: 'text-red-600 bg-red-50 border-red-200' }
    }
    return { label: NEWS_AGENCY_STATUS_LABELS.active, style: NEWS_AGENCY_STATUS_STYLES.active }
  }

  return {
    label: NEWS_AGENCY_STATUS_LABELS[agency.news_agency_status],
    style: NEWS_AGENCY_STATUS_STYLES[agency.news_agency_status],
  }
}

/**
 * آیا خبرگزاری اجازه انتشار خبر دارد؟
 * تایید مدیر سایت، فعال بودن اشتراک، عدم محدودیت دسترسی و روشن بودن on_air
 */
export function isNewsAgencyPublishable(agency: {
  news_agency_status: NewsAgencyStatus
  expired_at: Date
  is_outofaccess: boolean | null
  on_air: boolean | null
}): boolean {
  return (
    agency.news_agency_status === 'active' &&
    new Date(agency.expired_at) >= new Date() &&
    !agency.is_outofaccess &&
    agency.on_air === true
  )
}

const faDate = new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' })

export function formatNewsAgencyDate(value: Date | string | null | undefined): string {
  if (!value) return '-'
  return faDate.format(new Date(value))
}