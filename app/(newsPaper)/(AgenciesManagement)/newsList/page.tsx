// app/(newsPaper)/(AgenciesManagement)/newsList/page.tsx

import { requireNewsAgencyAccess } from '@/app/(newsPaper)/lib/newsAgencyAccess'
import {
  getNewsListByAgencyId,
  AGENCY_NEWS_PAGE_SIZE,
} from '../lib/newsDb'
import {
  getNewsAgencyDisplayStatus,
  isNewsAgencyPublishable,
} from '../lib/newsAgencySubscription'
import { toJalaaliInput } from '@/app/lib/jalaliDate'
import { ToggleField, DeleteNewsButton } from './ToggleButton'
import { newsImageUrl } from '../lib/newsImagesDb'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function NewsListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { agency } = await requireNewsAgencyAccess()

  const { page: pageStr } = await searchParams
  const page = Math.max(1, Number(pageStr) || 1)

  const canPublish = isNewsAgencyPublishable(agency)
  const status = getNewsAgencyDisplayStatus(agency)

  const { rows, total } = await getNewsListByAgencyId(agency.id, { page })
  const totalPages = Math.max(1, Math.ceil(total / AGENCY_NEWS_PAGE_SIZE))

  function pageUrl(p: number) {
    return p > 1 ? `/newsList?page=${p}` : '/newsList'
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="w-full mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-gray-700">مدیریت اخبار</h2>
            <span className={`text-[10px] font-bold border rounded px-2 py-0.5 ${status.style}`}>
              {status.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/addNews" className="text-sm text-sky-600 hover:text-sky-700">
              ثبت خبر جدید
            </Link>
            <Link href="/myNewsAgency" className="text-sm text-gray-500 hover:text-gray-700">
              خبرگزاری من
            </Link>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              خانه
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full mx-auto px-4 py-6 flex flex-col gap-4">
        {!canPublish && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg p-3 leading-relaxed">
            خبرگزاری شما در وضعیت انتشار مجاز نیست ({status.label}). تا زمان تمدید اشتراک، امکان ثبت خبر جدید یا
            روشن کردن انتشار وجود ندارد.
            {' '}
            <Link href="/myNewsAgency" className="underline hover:text-amber-900">
              مدیریت اشتراک
            </Link>
          </div>
        )}

        {rows.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-sm text-gray-500">
            {page > 1 ? 'این صفحه خبری ندارد' : 'تاکنون خبری ثبت نشده است'}
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map((item) => (
              <li
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col gap-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-gray-800">{item.headline}</span>
                    {item.sub_headline && (
                      <span className="text-xs text-gray-600">{item.sub_headline}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <DeleteNewsButton newsId={item.id} />
                  </div>
                </div>

                <div className="grid gap-2 text-[10px] text-gray-600 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="flex items-center justify-between gap-2 sm:justify-start">
                    <span className="text-gray-400">وضعیت انتشار:</span>
                    <ToggleField
                      newsId={item.id}
                      field="on_air"
                      current={!!item.on_air}
                      disabled={!canPublish && !item.on_air}
                      disabledTitle="خبرگزاری شما مجاز به انتشار خبر نیست"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 sm:justify-start">
                    <span className="text-gray-400">خبر فوری:</span>
                    <ToggleField newsId={item.id} field="is_breaking" current={!!item.is_breaking} />
                  </div>
                  <div className="flex items-center justify-between gap-2 sm:justify-start">
                    <span className="text-gray-400">امکان ارسال دیدگاه:</span>
                    <ToggleField newsId={item.id} field="comments_enabled" current={!!item.comments_enabled} />
                  </div>
                  <div className="flex items-center justify-between gap-2 sm:justify-start">
                    <span className="text-gray-400">تاریخ انتشار:</span>
                    <span>{toJalaaliInput(item.published_at)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 sm:justify-start">
                    <span className="text-gray-400">تاریخ بایگانی:</span>
                    <span>{item.archive_at ? toJalaaliInput(item.archive_at) : '-'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 sm:justify-start">
                    <span className="text-gray-400">تعداد تصاویر:</span>
                    <span>{item.images.length} / ۵</span>
                  </div>
                </div>

                {item.images.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.images.map((img) => (
                      <img
                        key={img.id}
                        src={newsImageUrl(img.image_name)}
                        alt="تصویر خبر"
                        loading="lazy"
                        decoding="async"
                        className="w-16 h-16 object-cover rounded border border-gray-200"
                      />
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <nav className="flex items-center justify-center gap-1" aria-label="صفحه بندی اخبار">
            {page > 1 && (
              <Link href={pageUrl(page - 1)} className="px-2.5 py-1 text-xs rounded border border-gray-300 bg-white hover:bg-gray-100">
                قبلی
              </Link>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .reduce<(number | 'dots')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('dots')
                acc.push(p)
                return acc
              }, [])
              .map((item, idx) =>
                item === 'dots' ? (
                  <span key={`dots-${idx}`} className="px-1 text-xs text-gray-400">...</span>
                ) : (
                  <Link
                    key={item}
                    href={pageUrl(item)}
                    className={`px-2.5 py-1 text-xs rounded border ${
                      item === page ? 'bg-sky-600 text-white border-sky-600' : 'bg-white border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {item}
                  </Link>
                )
              )}

            {page < totalPages && (
              <Link href={pageUrl(page + 1)} className="px-2.5 py-1 text-xs rounded border border-gray-300 bg-white hover:bg-gray-100">
                بعدی
              </Link>
            )}
          </nav>
        )}
      </main>
    </div>
  )
}
