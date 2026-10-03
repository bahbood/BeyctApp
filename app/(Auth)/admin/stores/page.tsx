// app/(Auth)/admin/stores/page.tsx
// مدیریت درخواست‌های فعالسازی فروشگاه توسط مدیر سایت

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { desc, eq } from 'drizzle-orm'
import { getUserFromSession } from '@/app/(Auth)/lib/session'
import { db } from '@/app/db'
import { stores, users, userRoles } from '@/app/db/schema'
import { formatDate, getStoreDisplayStatus, SUBSCRIPTION_LABELS, SUBSCRIPTION_PRICES } from '@/app/(bazar)/(StoresManagment)/lib/storeSubscription'
import StoreActivationActions from './StoreActivationActions'

export const dynamic = 'force-dynamic'

export default async function AdminStoresPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const sessionUser = await getUserFromSession()

  // لایه دفاعی سمت سرور : حتی اگر پروکسی دور زده شود، دسترسی رد می‌شود
  if (!sessionUser?.id) redirect('/')
  if (sessionUser.role !== userRoles.enumValues[0]) redirect('/')

  const { filter } = await searchParams
  const showAll = filter === 'all'

  const rows = await db
    .select({
      id: stores.id,
      store_name: stores.store_name,
      store_manager: stores.store_manager,
      store_desc: stores.store_desc,
      store_status: stores.store_status,
      subscription_plan: stores.subscription_plan,
      payment_receipt: stores.payment_receipt,
      activation_requested_at: stores.activation_requested_at,
      activated_at: stores.activated_at,
      expired_at: stores.expired_at,
      is_outofaccess: stores.is_outofaccess,
      created_at: stores.created_at,
      owner_name: users.name,
      owner_family: users.family,
      owner_mobile: users.mobile_number,
      owner_user_name: users.user_name,
      store_logo: stores.store_logo,
      store_header_banner: stores.store_header_banner,
    })
    .from(stores)
    .innerJoin(users, eq(stores.user_id, users.id))
    .orderBy(desc(stores.created_at))

  const visible = showAll ? rows : rows.filter((row) => row.store_status === 'pending')
  const pendingCount = rows.filter((row) => row.store_status === 'pending').length

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="w-full mx-auto px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-700">مدیریت فروشگاه‌ها</h2>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            خانه
          </Link>
        </div>
      </header>

      <main className="w-full mx-auto px-4 py-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/admin/stores"
            className={`rounded px-3 py-1.5 border ${
              !showAll ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            درخواست‌های در انتظار ({pendingCount})
          </Link>
          <Link
            href="/admin/stores?filter=all"
            className={`rounded px-3 py-1.5 border ${
              showAll ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            همه فروشگاه‌ها ({rows.length})
          </Link>
        </div>

        {visible.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-sm text-gray-500">
            {showAll ? 'هیچ فروشگاهی ثبت نشده است' : 'در حال حاضر درخواست فعالسازی در انتظار بررسی وجود ندارد'}
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {visible.map((store) => {
              const status = getStoreDisplayStatus(store)

              return (
                <li
                  key={store.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col gap-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">{store.store_name}</span>
                    <span className={`text-[10px] font-bold border rounded px-2 py-0.5 ${status.style}`}>
                      {status.label}
                    </span>
                    <span className="text-[10px] text-gray-400" dir="ltr">
                      #{store.id}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-600 leading-relaxed">{store.store_desc}</p>

                  <div className="grid gap-2 text-[10px] text-gray-600 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="flex items-center justify-between gap-2 sm:justify-start">
                      <span className="text-gray-400">مدیر فروشگاه:</span>
                      <span>
                        {store.store_manager} ({store.owner_name} {store.owner_family})
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 sm:justify-start">
                      <span className="text-gray-400">موبایل مالک:</span>
                      <span dir="ltr">{store.owner_mobile || '-'}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 sm:justify-start">
                      <span className="text-gray-400">اشتراک درخواستی:</span>
                      <span>
                        {store.subscription_plan
                          ? `${SUBSCRIPTION_LABELS[store.subscription_plan]} (${SUBSCRIPTION_PRICES[
                              store.subscription_plan
                            ].toLocaleString('fa-IR')} تومان)`
                          : '-'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 sm:justify-start">
                      <span className="text-gray-400">تاریخ ثبت درخواست:</span>
                      <span>{formatDate(store.activation_requested_at)}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 sm:justify-start">
                      <span className="text-gray-400">تاریخ فعال سازی:</span>
                      <span>{formatDate(store.activated_at)}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 sm:justify-start">
                      <span className="text-gray-400">تاریخ پایان اشتراک:</span>
                      <span>{store.store_status === 'active' ? formatDate(store.expired_at) : '-'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {store.store_logo && (
                      <a
                        href={`/storeImages/${store.store_logo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-sky-700 underline"
                      >
                        مشاهده لوگو
                      </a>
                    )}

                    {store.payment_receipt ? (
                      <a
                        href={`/storeImages/${store.payment_receipt}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-sky-700 underline font-semibold"
                      >
                        مشاهده رسید واریز
                      </a>
                    ) : (
                      <span className="text-[10px] text-red-600">رسید واریز ثبت نشده است</span>
                    )}
                  </div>

                  {store.store_status === 'pending' && <StoreActivationActions storeId={store.id} />}
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </div>
  )
}