// app/(Auth)/admin/newsAgencies/page.tsx

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { desc, eq } from 'drizzle-orm'
import { getUserFromSession } from '@/app/(Auth)/lib/session'
import { db } from '@/app/db'
import { newsAgencies, users, userRoles } from '@/app/db/schema'
import {
  formatNewsAgencyDate,
  getNewsAgencyDisplayStatus,
  NEWS_AGENCY_SUBSCRIPTION_LABELS,
  NEWS_AGENCY_SUBSCRIPTION_PRICES,
} from '@/app/(newsPaper)/(AgenciesManagement)/lib/newsAgencySubscription'
import NewsAgencyActivationActions from './NewsAgencyActivationActions'
import { newsAgencyImageUrl } from '@/app/(newsPaper)/(AgenciesManagement)/lib/newsAgencyImagesDb'

export const dynamic = 'force-dynamic'

export default async function AdminNewsAgenciesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const sessionUser = await getUserFromSession()

  if (!sessionUser?.id) redirect('/')
  if (sessionUser.role !== userRoles.enumValues[0]) redirect('/')

  const { filter } = await searchParams
  const showAll = filter === 'all'

  const rows = await db
    .select({
      id: newsAgencies.id,
      news_agency_name: newsAgencies.news_agency_name,
      news_agency_manager: newsAgencies.news_agency_manager,
      news_agency_desc: newsAgencies.news_agency_desc,
      news_agency_status: newsAgencies.news_agency_status,
      subscription_plan: newsAgencies.subscription_plan,
      payment_receipt: newsAgencies.payment_receipt,
      activation_requested_at: newsAgencies.activation_requested_at,
      activated_at: newsAgencies.activated_at,
      expired_at: newsAgencies.expired_at,
      is_outofaccess: newsAgencies.is_outofaccess,
      created_at: newsAgencies.created_at,
      owner_name: users.name,
      owner_family: users.family,
      owner_mobile: users.mobile_number,
      owner_user_name: users.user_name,
      news_agency_logo: newsAgencies.news_agency_logo,
      news_agency_header_banner: newsAgencies.news_agency_header_banner,
    })
    .from(newsAgencies)
    .innerJoin(users, eq(newsAgencies.user_id, users.id))
    .orderBy(desc(newsAgencies.created_at))

  const visible = showAll ? rows : rows.filter((row) => row.news_agency_status === 'pending')
  const pendingCount = rows.filter((row) => row.news_agency_status === 'pending').length

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="w-full mx-auto px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-700">مدیریت خبرگزاری‌ها</h2>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            خانه
          </Link>
        </div>
      </header>

      <main className="w-full mx-auto px-4 py-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/admin/newsAgencies"
            className={`rounded px-3 py-1.5 border ${
              !showAll ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            درخواست‌های در انتظار ({pendingCount})
          </Link>
          <Link
            href="/admin/newsAgencies?filter=all"
            className={`rounded px-3 py-1.5 border ${
              showAll ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            همه خبرگزاری‌ها ({rows.length})
          </Link>
        </div>

        {visible.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-sm text-gray-500">
            {showAll ? 'هیچ خبرگزاری ثبت نشده است' : 'در حال حاضر درخواست فعالسازی در انتظار بررسی وجود ندارد'}
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {visible.map((agency) => {
              const status = getNewsAgencyDisplayStatus(agency)

              return (
                <li
                  key={agency.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col gap-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">{agency.news_agency_name}</span>
                    <span className={`text-[10px] font-bold border rounded px-2 py-0.5 ${status.style}`}>
                      {status.label}
                    </span>
                    <span className="text-[10px] text-gray-400" dir="ltr">
                      #{agency.id}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-600 leading-relaxed">{agency.news_agency_desc}</p>

                  <div className="grid gap-2 text-[10px] text-gray-600 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="flex items-center justify-between gap-2 sm:justify-start">
                      <span className="text-gray-400">مدیر خبرگزاری:</span>
                      <span>
                        {agency.news_agency_manager} ({agency.owner_name} {agency.owner_family})
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 sm:justify-start">
                      <span className="text-gray-400">موبایل مالک:</span>
                      <span dir="ltr">{agency.owner_mobile || '-'}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 sm:justify-start">
                      <span className="text-gray-400">اشتراک درخواستی:</span>
                      <span>
                        {agency.subscription_plan
                          ? `${NEWS_AGENCY_SUBSCRIPTION_LABELS[agency.subscription_plan]} (${NEWS_AGENCY_SUBSCRIPTION_PRICES[
                              agency.subscription_plan
                            ].toLocaleString('fa-IR')} تومان)`
                          : '-'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 sm:justify-start">
                      <span className="text-gray-400">تاریخ ثبت درخواست:</span>
                      <span>{formatNewsAgencyDate(agency.activation_requested_at)}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 sm:justify-start">
                      <span className="text-gray-400">تاریخ فعال سازی:</span>
                      <span>{formatNewsAgencyDate(agency.activated_at)}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 sm:justify-start">
                      <span className="text-gray-400">تاریخ پایان اشتراک:</span>
                      <span>{agency.news_agency_status === 'active' ? formatNewsAgencyDate(agency.expired_at) : '-'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {agency.news_agency_logo && (
                      <a
                        href={newsAgencyImageUrl(agency.news_agency_logo)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-sky-700 underline"
                      >
                        مشاهده لوگو
                      </a>
                    )}

                    {agency.payment_receipt ? (
                      <a
                        href={newsAgencyImageUrl(agency.payment_receipt)}
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

                  {agency.news_agency_status === 'pending' && <NewsAgencyActivationActions newsAgencyId={agency.id} />}
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </div>
  )
}