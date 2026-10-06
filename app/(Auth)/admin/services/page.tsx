// app/(Auth)/admin/services/page.tsx

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { desc, eq } from 'drizzle-orm'
import { getUserFromSession } from '@/app/(Auth)/lib/session'
import { db } from '@/app/db'
import { serviceCategories, services, users } from '@/app/db/schema'
import {
  formatDate,
  getServiceDisplayStatus,
  SERVICE_YEARLY_PRICE,
} from '@/app/(Occupations)/(OccupationsManagment)/lib/serviceSubscription'
import { serviceImageUrl } from '@/app/(Occupations)/(OccupationsManagment)/lib/serviceImagesConfig'
import ServiceActivationActions from './ServiceActivationActions'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'مدیریت خدمات',
}

export default async function AdminServicesPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const sessionUser = await getUserFromSession()

  if (!sessionUser?.id) redirect('/')
  if (sessionUser.role !== 'admin') redirect('/')

  const { filter } = await searchParams
  const showAll = filter === 'all'

  const rows = await db
    .select({
      id: services.id,
      title: services.title,
      short_desc: services.short_desc,
      contact1: services.contact1,
      contact2: services.contact2,
      office_address: services.office_address,
      banner: services.banner,
      service_status: services.service_status,
      payment_receipt: services.payment_receipt,
      activation_requested_at: services.activation_requested_at,
      activated_at: services.activated_at,
      expired_at: services.expired_at,
      is_outofaccess: services.is_outofaccess,
      created_at: services.created_at,
      category_name: serviceCategories.name,
      owner_name: users.name,
      owner_family: users.family,
      owner_mobile: users.mobile_number,
      owner_user_name: users.user_name,
    })
    .from(services)
    .innerJoin(users, eq(services.user_id, users.id))
    .innerJoin(serviceCategories, eq(services.category_id, serviceCategories.id))
    .orderBy(desc(services.created_at))

  const visible = showAll ? rows : rows.filter((row) => row.service_status === 'pending')
  const pendingCount = rows.filter((row) => row.service_status === 'pending').length

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="w-full mx-auto px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-700">مدیریت خدمات (بانک مشاغل)</h2>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            خانه
          </Link>
        </div>
      </header>

      <main className="w-full mx-auto px-4 py-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/admin/services"
            className={`rounded px-3 py-1.5 border ${
              !showAll ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            درخواست‌های در انتظار ({pendingCount})
          </Link>
          <Link
            href="/admin/services?filter=all"
            className={`rounded px-3 py-1.5 border ${
              showAll ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            همه خدمات ({rows.length})
          </Link>
        </div>

        {visible.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-sm text-gray-500">
            {showAll ? 'هیچ خدمتی ثبت نشده است' : 'در حال حاضر درخواست فعالسازی در انتظار بررسی وجود ندارد'}
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {visible.map((service) => {
              const status = getServiceDisplayStatus(service)

              return (
                <li
                  key={service.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col gap-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">{service.title}</span>
                    <span className={`text-[10px] font-bold border rounded px-2 py-0.5 ${status.style}`}>
                      {status.label}
                    </span>
                    <span className="text-[10px] text-sky-700 bg-sky-50 border border-sky-200 rounded px-2 py-0.5">
                      {service.category_name}
                    </span>
                    <span className="text-[10px] text-gray-400" dir="ltr">
                      #{service.id}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-600 leading-relaxed">{service.short_desc}</p>

                  <div className="grid gap-2 text-[10px] text-gray-600 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="flex items-center justify-between gap-2 sm:justify-start">
                      <span className="text-gray-400">ثبت کننده:</span>
                      <span>
                        {service.owner_name} {service.owner_family} ({service.owner_user_name})
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 sm:justify-start">
                      <span className="text-gray-400">موبایل مالک:</span>
                      <span dir="ltr">{service.owner_mobile || '-'}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 sm:justify-start">
                      <span className="text-gray-400">شماره تماس:</span>
                      <span dir="ltr">
                        {service.contact1}
                        {service.contact2 ? ` / ${service.contact2}` : ''}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-2 sm:justify-start">
                      <span className="text-gray-400 shrink-0">آدرس دفتر:</span>
                      <span>{service.office_address}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 sm:justify-start">
                      <span className="text-gray-400">مبلغ اشتراک سالانه:</span>
                      <span>{SERVICE_YEARLY_PRICE.toLocaleString('fa-IR')} تومان</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 sm:justify-start">
                      <span className="text-gray-400">تاریخ ثبت درخواست:</span>
                      <span>{formatDate(service.activation_requested_at)}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 sm:justify-start">
                      <span className="text-gray-400">تاریخ فعال سازی:</span>
                      <span>{formatDate(service.activated_at)}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 sm:justify-start">
                      <span className="text-gray-400">تاریخ پایان اشتراک:</span>
                      <span>
                        {service.service_status === 'active' ? formatDate(service.expired_at) : '-'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {service.banner && (
                      <a
                        href={serviceImageUrl(service.banner)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-sky-700 underline"
                      >
                        مشاهده بنر
                      </a>
                    )}

                    {service.payment_receipt ? (
                      <a
                        href={serviceImageUrl(service.payment_receipt)}
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

                  {service.service_status === 'pending' && <ServiceActivationActions serviceId={service.id} />}
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </div>
  )
}
