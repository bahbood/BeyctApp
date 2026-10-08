// app/(newsPaper)/news/[id]/page.tsx

import { getPublicNewsById, getLikeCounts, getLikedNewsIds, incrementNewsViewCount } from '@/app/(newsPaper)/lib/publicNewsDb'
import { getUserFromSession } from '@/app/(Auth)/lib/session'
import { newsImageUrl } from '@/app/(newsPaper)/(AgenciesManagement)/lib/newsImagesDb'
import LikeButton from '../LikeButton'
import NewsHeader from '../NewsHeader'
import { toJalaaliInput } from '@/app/lib/jalaliDate'
import { after } from 'next/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const newsId = Number(id)
  if (isNaN(newsId)) return notFound()

  const [news, userinfo] = await Promise.all([getPublicNewsById(newsId), getUserFromSession()])
  if (!news) return notFound()

  // افزایش شمارنده بازدید خارج از مسیر بحرانی رندر انجام می شود تا TTFB تحت تاثیر نوشتن قرار نگیرد
  after(() => incrementNewsViewCount(newsId))

  const [likeCounts, likedIds] = await Promise.all([
    getLikeCounts([newsId]),
    userinfo?.id ? getLikedNewsIds([newsId], userinfo.id) : Promise.resolve(new Set<number>()),
  ])

  return (
    <div className="w-full">
      <NewsHeader backHref="/news" backLabel="بازگشت به لیست" />

      <main className="w-full mx-auto px-4 py-6 flex flex-col gap-4">
        <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col gap-4">
          <header className="flex flex-col gap-2">
            <h1 className="text-lg font-bold text-gray-800 leading-relaxed">{news.headline}</h1>
            {news.sub_headline && <p className="text-sm text-gray-600 leading-relaxed">{news.sub_headline}</p>}
            <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-400">
              <span>{news.news_agency_name}</span>
              <span>تاریخ انتشار: {toJalaaliInput(news.published_at)}</span>
              {news.reporter && <span>خبرنگار: {news.reporter}</span>}
              {news.news_source && <span>منبع: {news.news_source}</span>}
              {news.news_category && <span>دسته‌بندی: {news.news_category}</span>}
              <span>بازدید: {news.view_count + 1}</span>
            </div>
          </header>

          {news.images.length > 0 && (
            <div className="flex flex-col gap-3">
              {news.images.map((img) => (
                <img
                  key={img.id}
                  src={newsImageUrl(img.image_name)}
                  alt={news.headline}
                  loading="lazy"
                  decoding="async"
                  className="w-full rounded border border-gray-200"
                />
              ))}
            </div>
          )}

          <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap">
            {news.body}
          </div>

          <footer className="flex items-center justify-between pt-2 border-t border-gray-100">
            <LikeButton className=''
              newsId={newsId}
              initialLiked={likedIds.has(newsId)}
              initialCount={likeCounts.get(newsId) ?? 0}
            />
            <Link href="/news" className="text-[10px] text-sky-600 hover:text-sky-700">
              بازگشت به لیست
            </Link>
          </footer>
        </article>
      </main>
    </div>
  )
}
