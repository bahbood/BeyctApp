// app/(newsPaper)/(AgenciesManagement)/newsAgencyProfile/page.tsx

import Link from 'next/link'
import { requireNewsAgencyAccess } from '@/app/(newsPaper)/lib/newsAgencyAccess'
import NewsAgencyProfileForm from './NewsAgencyProfileForm'

export const dynamic = 'force-dynamic'

export default async function NewsAgencyProfilePage() {
  const { agency } = await requireNewsAgencyAccess()

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="w-full mx-auto px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-700">پروفایل خبرگزاری</h2>
          <div className="flex items-center gap-2">
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
          <NewsAgencyProfileForm agency={agency} />
        </div>
      </main>
    </div>
  )
}