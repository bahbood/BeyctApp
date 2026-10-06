// app/(newsPaper)/(AgenciesManagement)/addNews/page.tsx

import Link from 'next/link'
import { requireNewsAgencyAccess } from '@/app/(newsPaper)/lib/newsAgencyAccess'
import { isNewsAgencyPublishable } from '../lib/newsAgencySubscription'
import AddNewsForm from './AddNewsForm'

export const dynamic = 'force-dynamic'

export default async function AddNewsPage() {
  const { agency } = await requireNewsAgencyAccess()
  const canPublish = isNewsAgencyPublishable(agency)

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="w-full mx-auto px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-700">ثبت خبر جدید</h2>
          <div className="flex items-center gap-2">
            <Link href="/newsList" className="text-sm text-gray-500 hover:text-gray-700">
              مدیریت اخبار
            </Link>
            <Link href="/myNewsAgency" className="text-sm text-gray-500 hover:text-gray-700">
              خبرگزاری من
            </Link>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              خانه
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <AddNewsForm canPublish={canPublish} />
        </div>
      </main>
    </div>
  )
}