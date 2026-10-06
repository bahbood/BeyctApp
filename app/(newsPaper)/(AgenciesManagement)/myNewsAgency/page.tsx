// app/(newsPaper)/(AgenciesManagement)/myNewsAgency/page.tsx

import Link from 'next/link'
import { requireNewsSession } from '@/app/(newsPaper)/lib/newsAgencyAccess'
import { getNewsAgencyByUserId } from '@/app/(newsPaper)/lib/getNewsAgencyByUserId'
import MyNewsAgencySection from './MyNewsAgencySection'

export const dynamic = 'force-dynamic'

export default async function MyNewsAgencyPage() {
  const userId = await requireNewsSession()

  const agency = await getNewsAgencyByUserId(userId)

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="w-full mx-auto px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-700">خبرگزاری من</h2>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            خانه
          </Link>
        </div>
      </header>

      <main className="w-full mx-auto px-4 py-6">
        <MyNewsAgencySection agency={agency} />
      </main>
    </div>
  )
}