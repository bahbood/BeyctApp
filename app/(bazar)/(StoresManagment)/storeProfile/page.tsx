// app/(bazar)/(StoresManagment)/storeProfile/page.tsx

import { getUserFromSession } from '@/app/(Auth)/lib/session'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getStoreByUserId } from '../../lib/getStoreByUserId'
import { formatDate, getStoreDisplayStatus } from '../lib/storeSubscription'
import StoreProfileForm from './StoreProfileForm'

export const dynamic = 'force-dynamic'

export default async function StoreProfilePage() {
  const userinfo = await getUserFromSession()

  if (!userinfo?.id) {
    redirect('/')
  }

  const store = await getStoreByUserId(userinfo.id)

  if (!store) {
    return (
      <div className="w-full min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="w-full mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              خانه
            </Link>
            <h2 className="text-sm font-bold text-gray-700">پروفایل فروشگاه</h2>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 flex flex-col items-center gap-3 text-gray-500">
            <span className="text-4xl">🏪</span>
            <p className="text-sm">شما فروشگاه ثبت شده‌ای ندارید</p>
            <p className="text-xs text-gray-400">برای استفاده از این بخش باید ابتدا فروشگاه خود را ثبت کنید</p>
            <Link
              href="/myStore"
              className="mt-2 bg-sky-600 hover:bg-sky-700 text-white text-xs rounded-md px-6 py-2 outline-0"
            >
              فروشگاه من
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const status = getStoreDisplayStatus(store)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="w-full mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/myStore" className="text-sm text-gray-500 hover:text-gray-700">
            فروشگاه من
          </Link>
          <h2 className="text-sm font-bold text-gray-700">پروفایل فروشگاه</h2>
        </div>
      </header>

      <main className="w-full mx-auto px-4 py-6 flex flex-col items-center gap-4">
        <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex flex-row items-center gap-3">
          <span className="text-sm font-semibold text-gray-800">{store.store_name}</span>
          <span className={`text-[10px] font-bold border rounded px-2 py-0.5 ${status.style}`}>{status.label}</span>
          <span className="mr-auto text-[10px] text-gray-500" dir="ltr">
            پایان اشتراک: {formatDate(store.expired_at)}
          </span>
        </div>

        <StoreProfileForm store={store} />
      </main>
    </div>
  )
}
