// app/(newsPaper)/(AgenciesManagement)/myNewsAgency/MyNewsAgencySection.tsx

'use client'

import FlyoutLayout from '@/app/components/(Flyouts)/FlyoutLayout'
import type { NewsAgency } from '@/app/db/schema'
import Link from 'next/link'
import { useState } from 'react'
import AddNewsAgencyForm from './AddNewsAgencyForm'
import ActivationForm from './ActivationForm'
import { formatNewsAgencyDate, getNewsAgencyDisplayStatus } from '../lib/newsAgencySubscription'

type Panel = 'create' | 'activation' | null

export default function MyNewsAgencySection({ agency }: { agency: NewsAgency | null }) {
  const [panel, setPanel] = useState<Panel>(null)

  const closeMe = () => setPanel(null)

  if (!agency) {
    return (
      <div className="flex flex-col gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col items-center gap-3 text-gray-500">
          <span className="text-4xl">📰</span>
          <p className="text-sm">شما خبرگزاری ثبت شده‌ای ندارید</p>
          <p className="text-xs text-gray-400">برای استفاده از این بخش باید ابتدا درخواست تاسیس خبرگزاری ثبت کنید</p>
          <button
            type="button"
            onClick={() => setPanel('create')}
            className="mt-2 bg-sky-600 hover:bg-sky-700 text-white text-xs rounded-md px-6 py-2 outline-0 cursor-pointer"
          >
            ایجاد خبرگزاری
          </button>
        </div>

        <FlyoutLayout onCloseMe={closeMe} isOpen={panel === 'create'}>
          <div className="w-full h-full overflow-y-auto bg-gray-50 p-3">
            <AddNewsAgencyForm />
          </div>
        </FlyoutLayout>
      </div>
    )
  }

  const status = getNewsAgencyDisplayStatus(agency)
  const isPending = agency.news_agency_status === 'pending'
  const isSubscriptionExpired = new Date(agency.expired_at) < new Date()
  const isActive = agency.news_agency_status === 'active' && !isSubscriptionExpired

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex flex-row items-center gap-3">
        <span className="text-sm font-semibold text-gray-800 truncate">{agency.news_agency_name}</span>

        <span className={`shrink-0 text-[10px] font-bold border rounded px-2 py-0.5 ${status.style}`}>
          {status.label}
        </span>

        <div className="mr-auto flex items-center gap-2 shrink-0">
          <Link
            href="/newsAgencyProfile"
            className="text-[10px] text-gray-600 border border-gray-200 hover:bg-gray-50 rounded px-2 py-1"
          >
            پروفایل
          </Link>
          <Link
            href="/newsList"
            className="text-[10px] text-sky-600 border border-sky-200 hover:bg-sky-50 rounded px-2 py-1"
          >
            مدیریت اخبار
          </Link>
        </div>
      </div>

      {agency.news_agency_status === 'active' ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">تاریخ پایان اشتراک</span>
            <span className="text-xs text-gray-800 font-medium" dir="ltr">
              {formatNewsAgencyDate(agency.expired_at)}
            </span>
          </div>
          {!isActive && (
            <button
              type="button"
              onClick={() => setPanel('activation')}
              className="mt-2 bg-green-600 hover:bg-green-700 text-white text-xs rounded-md px-3 py-2 outline-0 cursor-pointer"
            >
              تمدید اشتراک خبرگزاری
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col gap-2">
          {isPending ? (
            <>
              <p className="text-xs text-amber-700 leading-relaxed">
                درخواست فعالسازی خبرگزاری شما ثبت شده و جهت بررسی به مدیر سایت ارسال شده است. پس از تایید، خبرگزاری شما
                فعال می‌شود.
              </p>
              {agency.activation_requested_at && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">تاریخ ثبت درخواست</span>
                  <span className="text-xs text-gray-800 font-medium" dir="ltr">
                    {formatNewsAgencyDate(agency.activation_requested_at)}
                  </span>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-xs text-gray-600 leading-relaxed">
                خبرگزاری شما ثبت شده ولی هنوز فعال نیست. برای فعالسازی و استفاده از بخش خبرنامه، اشتراک مورد نظر را انتخاب کنید و
                رسید واریز بانکی را ثبت کنید.
              </p>
              <button
                type="button"
                onClick={() => setPanel('activation')}
                className="mt-2 bg-green-600 hover:bg-green-700 text-white text-xs rounded-md px-3 py-2 outline-0 cursor-pointer"
              >
                ارسال درخواست فعالسازی به مدیر
              </button>
            </>
          )}
        </div>
      )}

      <FlyoutLayout onCloseMe={closeMe} isOpen={panel === 'activation'}>
        <div className="w-full h-full overflow-y-auto bg-gray-50 p-3">
          <ActivationForm onDone={closeMe} />
        </div>
      </FlyoutLayout>
    </div>
  )
}