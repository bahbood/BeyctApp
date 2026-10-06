// app/(Occupations)/(OccupationsManagment)/myServices/page.tsx

import Link from 'next/link'
import { requireServiceSession } from '../../lib/serviceAccess'
import { getServiceCategories } from '../../lib/getServiceCategories'
import { getServicesByUserId } from '../../lib/getServicesByUserId'
import MyServicesSection from './MyServicesSection'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'خدمات من',
}

export default async function MyServicesPage() {
  const userId = await requireServiceSession()

  const [services, categories] = await Promise.all([
    getServicesByUserId(userId),
    getServiceCategories(),
  ])

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="w-full mx-auto px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-700">مدیریت خدمات</h2>
          <div className="flex items-center gap-3">
            <Link href="/asnaf" className="text-sm text-gray-500 hover:text-gray-700">
              بانک مشاغل
            </Link>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              خانه
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full mx-auto px-4 py-6">
        <MyServicesSection services={services} categories={categories} />
      </main>
    </div>
  )
}
