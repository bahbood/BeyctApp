import { db } from '@/app/db'
import { stores } from '@/app/db/schema'
import { eq } from 'drizzle-orm'
import {  getUserFromSession } from '@/app/(Auth)/lib/session'
import ActivationForm from './ActivationForm'
export const dynamic = 'force-dynamic'


async function getStoreByUserId(userId: number) {
  const result = await db
    .select()
    .from(stores)
    .where(eq(stores.user_id, userId))
    .limit(1)
  return result[0] || null
}

export default async function StoreActivationPage() {
  const userinfo=await getUserFromSession()
  
    const userId = userinfo?.id
  
    if( !userId )
    {
      return <div></div>
    }

  const store = await getStoreByUserId(userId)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-700">خانه</a>
          <h2 className="text-sm font-bold text-gray-700">فعالسازی فروشگاه</h2>
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-700 border-b pb-2">وضعیت اشتراک</h3>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">وضعیت فروشگاه</span>
              <span className={`text-sm font-bold ${store.on_air ? 'text-green-600' : 'text-red-600'}`}>
                {store.on_air ? 'فعال' : 'غیرفعال'}
              </span>
            </div>

            {store.expired_at && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">تاریخ انقضا</span>
                <span className="text-sm text-gray-800 font-medium" dir="ltr">
                  {new Date(store.expired_at).toLocaleDateString('fa-IR')}
                </span>
              </div>
            )}

            <hr className="text-gray-200" />

            <p className="text-xs text-gray-500 leading-relaxed">
              با خرید اشتراک یکساله، فروشگاه شما به همراه تمام محصولات در بازار قابل مشاهده خواهد بود.
            </p>

            <ActivationForm storeId={store.id} />
          </div>
        )}
      </main>
    </div>
  )
}
