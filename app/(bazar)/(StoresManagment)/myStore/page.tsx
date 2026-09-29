// app/(bazar)/(StoresManagment)/myStore/page.tsx

import { getUserFromSession } from '@/app/(Auth)/lib/session'
import { getStoreByUserId } from '../../lib/getStoreByUserId'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import MyStoreSection from './MyStoreSection'

export const dynamic = 'force-dynamic'

export default async function MyStorePage() {
  const userinfo = await getUserFromSession()

  if (!userinfo?.id) {
    redirect('/')
  }

  const store = await getStoreByUserId(userinfo.id)

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="w-full mx-auto px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-700">فروشگاه من</h2>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            خانه
          </Link>
        </div>
      </header>

      <main className="w-full mx-auto px-4 py-6">
        <MyStoreSection store={store} />
      </main>
    </div>
  )
}
