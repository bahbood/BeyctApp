// app/(newsPaper)/news/page.tsx

import { getUserFromSession } from '@/app/(Auth)/lib/session'
import {
  getPublicNewsList,
  getNewsImagesMap,
  getLikeCounts,
  getLikedNewsIds,
  PUBLIC_NEWS_PAGE_SIZE,
} from '@/app/(newsPaper)/lib/publicNewsDb'
import { newsImageUrl } from '@/app/(newsPaper)/(AgenciesManagement)/lib/newsImagesDb'
import Image from 'next/image'
import Link from 'next/link'
import LikeButton from './LikeButton'
import NewsHeader from './NewsHeader'
import { toJalaaliInput } from '@/app/lib/jalaliDate'

export const dynamic = 'force-dynamic'

export default async function PublicNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageStr } = await searchParams
  const page = Math.max(1, Number(pageStr) || 1)

  const userinfo = await getUserFromSession()
  const { rows, total } = await getPublicNewsList({ page })

  const newsIds = rows.map((n) => n.id)
  const [imagesMap, likeCounts, likedIds] = await Promise.all([
    getNewsImagesMap(newsIds),
    getLikeCounts(newsIds),
    userinfo?.id ? getLikedNewsIds(newsIds, userinfo.id) : Promise.resolve(new Set<number>()),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PUBLIC_NEWS_PAGE_SIZE))

  function pageUrl(p: number) {
    return p > 1 ? `/news?page=${p}` : '/news'
  }

  return (
    <div className="w-full">
      <NewsHeader />

      <main className="w-full mx-auto px-4 py-6 flex flex-col gap-4">
        {rows.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-sm text-gray-500">
            {page > 1 ? 'این صفحه خبری ندارد' : 'در حال حاضر خبری منتشر نشده است'}
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map((item) => {
              const images = imagesMap.get(item.id) ?? []
              const thumb = images.length > 0 ? newsImageUrl(images[0].image_name) : ''
              return (
                <li
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col gap-3"
                >
                  <div className="flex flex-wrap items-start gap-3">
                    {thumb && (
                      <Image
                        src={thumb}
                        alt={item.headline}
                        width={96}
                        height={96}
                        className="w-24 h-24 object-cover rounded border border-gray-200 shrink-0"
                      />
                    )}
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <Link href={`/news/${item.id}`} className="text-sm font-semibold text-gray-800 hover:text-sky-700">
                        {item.headline}
                      </Link>
                      {item.sub_headline && <span className="text-xs text-gray-600">{item.sub_headline}</span>}
                      <span className="text-[10px] text-gray-400 mt-1">
                        {item.news_agency_name} • {toJalaaliInput(item.published_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <LikeButton
                      newsId={item.id}
                      initialLiked={likedIds.has(item.id)}
                      initialCount={likeCounts.get(item.id) ?? 0}
                    />
                    <Link href={`/news/${item.id}`} className="text-[10px] text-sky-600 hover:text-sky-700">
                      ادامه مطلب
                    </Link>
                  </div>
                </li>
              )
            })}
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
