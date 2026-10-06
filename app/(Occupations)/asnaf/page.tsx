// app/(Occupations)/asnaf/page.tsx
// صفحه عمومی بانک مشاغل : نمایش خدمات فعال به همراه جستجو و فیلتر دسته بندی
// asnaf === Occupations

import Link from 'next/link'
import { db } from '@/app/db'
import { serviceCategories, services, users } from '@/app/db/schema'
import { and, asc, eq, gt, ilike, or, type SQL } from 'drizzle-orm'
import { serviceImageUrl } from '../(OccupationsManagment)/lib/serviceImagesConfig'

export const dynamic = 'force-dynamic'

type AsnafSearchParams = {
  q?: string
  category?: string
}

/** جستجوی سمت سرور : عنوان، توضیح کوتاه، آدرس، نام دسته بندی و نام ثبت کننده */
function buildSearchCondition(term: string): SQL | undefined {
  return or(
    ilike(services.title, `%${term}%`),
    ilike(services.short_desc, `%${term}%`),
    ilike(services.office_address, `%${term}%`),
    ilike(serviceCategories.name, `%${term}%`),
    ilike(users.family, `%${term}%`),
    ilike(users.name, `%${term}%`),
  )
}

async function getPublicServices(term: string, categoryId: number | null) {
  const conditions: SQL[] = [
    // فقط خدمات تایید شده، روشن و دارای اشتراک سالانه معتبر
    eq(services.service_status, 'active'),
    eq(services.on_air, true),
    eq(services.is_outofaccess, false),
    gt(services.expired_at, new Date()),
  ]

  if (categoryId) {
    conditions.push(eq(services.category_id, categoryId))
  }

  if (term) {
    conditions.push(buildSearchCondition(term) as SQL)
  }

  return db
    .select({
      id: services.id,
      title: services.title,
      short_desc: services.short_desc,
      contact1: services.contact1,
      contact2: services.contact2,
      office_address: services.office_address,
      banner: services.banner,
      expired_at: services.expired_at,
      category_name: serviceCategories.name,
      owner_name: users.name,
      owner_family: users.family,
    })
    .from(services)
    .innerJoin(serviceCategories, eq(services.category_id, serviceCategories.id))
    .innerJoin(users, eq(services.user_id, users.id))
    .where(and(...conditions))
    .orderBy(asc(services.title))
}

export default async function AsnafPage({ searchParams }: { searchParams: Promise<AsnafSearchParams> }) {
  const { q, category } = await searchParams

  const term = (q ?? '').trim()
  const parsedCategoryId = Number(category)
  const categoryId = Number.isInteger(parsedCategoryId) && parsedCategoryId > 0 ? parsedCategoryId : null

  const [serviceList, categories] = await Promise.all([
    getPublicServices(term, categoryId),
    db.select().from(serviceCategories).where(eq(serviceCategories.is_active, true)).orderBy(asc(serviceCategories.name)),
  ])

  const hasFilter = term.length > 0 || categoryId !== null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">بانک مشاغل و خدمات</h1>
        <span className="text-sm text-gray-500">{serviceList.length} خدمت</span>
      </div>

      {/* جستجو و فیلتر دسته بندی - با GET ارسال می شود تا بدون جاوااسکریپت هم کار کند */}
      <form method="get" action="/asnaf" className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-1 flex-1">
          <label htmlFor="q" className="text-[10px] text-gray-500 pr-1">
            جستجو :
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={term}
            placeholder="عنوان خدمت، دسته بندی، آدرس یا نام مسئول"
            className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300 focus:outline-sky-600"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="category" className="text-[10px] text-gray-500 pr-1">
            دسته بندی :
          </label>
          <select
            id="category"
            name="category"
            defaultValue={categoryId ? String(categoryId) : ''}
            className="rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300 focus:outline-sky-600 min-w-40"
          >
            <option value="">همه دسته بندی ها</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="bg-sky-600 hover:bg-sky-700 text-white text-xs rounded-md px-4 py-2 outline-0 cursor-pointer"
          >
            جستجو
          </button>
          {hasFilter && (
            <Link
              href="/asnaf"
              className="text-xs text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-md px-4 py-2"
            >
              حذف فیلتر
            </Link>
          )}
        </div>
      </form>

      {serviceList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <svg className="size-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
            />
          </svg>
          <span className="text-sm">
            {hasFilter ? 'خدمتی مطابق جستجوی شما پیدا نشد' : 'در حال حاضر خدمتی برای نمایش وجود ندارد'}
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {serviceList.map((service) => {
            const bannerUrl = serviceImageUrl(service.banner)

            return (
              <article
                key={service.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="aspect-[16/9] bg-gray-100 flex items-center justify-center overflow-hidden">
                  {bannerUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={bannerUrl} alt={service.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-4xl">🛠️</span>
                  )}
                </div>

                <div className="p-3 flex flex-col gap-2 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-gray-800 line-clamp-1">{service.title}</h3>
                    <span className="text-[10px] text-orange-600 bg-orange-50 border border-orange-200 rounded px-1.5 py-0.5 shrink-0">
                      {service.category_name}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{service.short_desc}</p>

                  <div className="flex flex-col gap-1 text-[11px] text-gray-600 mt-auto">
                    <a href={`tel:${service.contact1}`} dir="ltr" className="hover:text-sky-600 text-right">
                      {service.contact1}
                    </a>
                    {service.contact2 && (
                      <a href={`tel:${service.contact2}`} dir="ltr" className="hover:text-sky-600 text-right">
                        {service.contact2}
                      </a>
                    )}
                    <span className="text-gray-500 leading-relaxed">{service.office_address}</span>
                  </div>

                  {(service.owner_name || service.owner_family) && (
                    <span className="text-[10px] text-gray-400 border-t border-gray-100 pt-2">
                      مسئول: {service.owner_name} {service.owner_family}
                    </span>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
