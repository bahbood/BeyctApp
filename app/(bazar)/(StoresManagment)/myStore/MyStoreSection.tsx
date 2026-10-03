// app/(bazar)/(StoresManagment)/myStore/MyStoreSection.tsx

'use client'

import FlyoutLayout from '@/app/components/(Flyouts)/FlyoutLayout'
import type { Store } from '@/app/db/schema'
import Link from 'next/link'
import { useState } from 'react'
import ActivationForm from './ActivationForm'
import AddNewStoreForm from './AddNewStoreForm'
import DeleteStoreForm from './DeleteStoreForm'
import EditStoreForm from './EditStoreForm'
import { formatDate, getStoreDisplayStatus } from '../lib/storeSubscription'

type Panel = 'create' | 'edit' | 'delete' | 'activation' | null

export default function MyStoreSection({ store }: { store: Store | null }) {
  const [panel, setPanel] = useState<Panel>(null)

  const closeMe = () => setPanel(null)

  if (!store) {
    return (
      <div className="flex flex-col gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col items-center gap-3 text-gray-500">
          <span className="text-4xl">🏪</span>
          <p className="text-sm">شما فروشگاه ثبت شده‌ای ندارید</p>
          <p className="text-xs text-gray-400">برای استفاده از این بخش باید ابتدا درخواست تاسیس فروشگاه ثبت کنید</p>
          <button
            type="button"
            onClick={() => setPanel('create')}
            className="mt-2 bg-sky-600 hover:bg-sky-700 text-white text-xs rounded-md px-6 py-2 outline-0 cursor-pointer"
          >
            ایجاد فروشگاه
          </button>
        </div>

        <FlyoutLayout onCloseMe={closeMe} isOpen={panel === 'create'}>
          <div className="w-full h-full overflow-y-auto bg-gray-50 p-3">
            <AddNewStoreForm />
          </div>
        </FlyoutLayout>
      </div>
    )
  }

  const status = getStoreDisplayStatus(store)

  // فروشگاه در انتظار تایید است: کاربر نباید بتواند دوباره درخواست بدهد
  const isPending = store.store_status === 'pending'
  const isSubscriptionExpired = new Date(store.expired_at) < new Date()
  const isActive = store.store_status === 'active' && !isSubscriptionExpired

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex flex-row items-center gap-3">
        <span className="text-sm font-semibold text-gray-800 truncate">{store.store_name}</span>

        <span className={`shrink-0 text-[10px] font-bold border rounded px-2 py-0.5 ${status.style}`}>
          {status.label}
        </span>

        <div className="mr-auto flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setPanel('delete')}
            className="text-[10px] text-red-600 border border-red-200 hover:bg-red-50 rounded px-2 py-1 cursor-pointer"
          >
            حذف فروشگاه
          </button>
          <button
            type="button"
            onClick={() => setPanel('edit')}
            className="text-[10px] text-sky-600 border border-sky-200 hover:bg-sky-50 rounded px-2 py-1 cursor-pointer"
          >
            ویرایش فروشگاه
          </button>
          <Link
            href="/storeProfile"
            className="text-[10px] text-gray-600 border border-gray-200 hover:bg-gray-50 rounded px-2 py-1"
          >
            پروفایل
          </Link>
        </div>
      </div>

      {store.store_status === 'active' ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">تاریخ پایان اشتراک</span>
            <span className="text-xs text-gray-800 font-medium" dir="ltr">
              {formatDate(store.expired_at)}
            </span>
          </div>
          {!isActive && (
            <button
              type="button"
              onClick={() => setPanel('activation')}
              className="mt-2 bg-green-600 hover:bg-green-700 text-white text-xs rounded-md px-3 py-2 outline-0 cursor-pointer"
            >
              تمدید اشتراک فروشگاه
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col gap-2">
          {isPending ? (
            <>
              <p className="text-xs text-amber-700 leading-relaxed">
                درخواست فعالسازی فروشگاه شما ثبت شده و جهت بررسی به مدیر سایت ارسال شده است. پس از تایید، فروشگاه شما
                فعال می‌شود.
              </p>
              {store.activation_requested_at && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">تاریخ ثبت درخواست</span>
                  <span className="text-xs text-gray-800 font-medium" dir="ltr">
                    {formatDate(store.activation_requested_at)}
                  </span>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-xs text-gray-600 leading-relaxed">
                فروشگاه شما ثبت شده ولی هنوز فعال نیست. برای فعالسازی و نمایش در بازار، اشتراک مورد نظر را انتخاب کنید و
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

      <FlyoutLayout onCloseMe={closeMe} isOpen={panel === 'edit'}>
        <div className="w-full h-full overflow-y-auto bg-gray-50 p-3">
          <EditStoreForm store={store} onDone={closeMe} />
        </div>
      </FlyoutLayout>

      <FlyoutLayout onCloseMe={closeMe} isOpen={panel === 'delete'}>
        <div className="w-full h-full overflow-y-auto bg-gray-50 p-3">
          <DeleteStoreForm onDone={closeMe} />
        </div>
      </FlyoutLayout>

      <FlyoutLayout onCloseMe={closeMe} isOpen={panel === 'activation'}>
        <div className="w-full h-full overflow-y-auto bg-gray-50 p-3">
          <ActivationForm store={store} onDone={closeMe} />
        </div>
      </FlyoutLayout>
    </div>
  )
}