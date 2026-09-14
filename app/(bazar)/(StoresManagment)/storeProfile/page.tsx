import {  getUserFromSession } from '@/app/(Auth)/lib/session'
import StoreProfileForm from './StoreProfileForm'



export default async function StoreProfilePage() {
 
const userInfo= await getUserFromSession()
  const store = userInfo?.store_active ? userInfo.id : undefined

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-700">خانه</a>
          <h2 className="text-sm font-bold text-gray-700">پروفایل فروشگاه</h2>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-6">
        {!store ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 flex flex-col items-center gap-3 text-gray-500">
            <span className="text-4xl">🏪</span>
            <p className="text-sm">شما فروشگاه ثبت شده‌ای ندارید</p>
            <p className="text-xs text-gray-400">برای استفاده از این بخش باید ابتدا فروشگاه خود را ثبت کنید</p>
          </div>
        ) : (
          <StoreProfileForm store={store} />
        )}
      </main>
    </div>
  )
}
