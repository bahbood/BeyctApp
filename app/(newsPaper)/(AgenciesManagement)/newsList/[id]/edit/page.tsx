// app/(newsPaper)/(AgenciesManagement)/newsList/[id]/edit/page.tsx

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { and, asc, eq } from 'drizzle-orm'
import { db } from '@/app/db'
import { news, newsImages } from '@/app/db/schema'
import { requireNewsAgencyAccess } from '@/app/(newsPaper)/lib/newsAgencyAccess'
import { isNewsAgencyPublishable } from '../../../lib/newsAgencySubscription'
import { toJalaaliInput } from '@/app/lib/jalaliDate'
import EditNewsForm from './EditNewsForm'

export const dynamic = 'force-dynamic'

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { agency } = await requireNewsAgencyAccess()
  const { id: idParam } = await params
  const id = Number(idParam)

  if (!Number.isSafeInteger(id) || id <= 0) notFound()

  const [item] = await db
    .select()
    .from(news)
    .where(and(eq(news.id, id), eq(news.news_agency_id, agency.id)))
    .limit(1)

  if (!item) notFound()

  const images = await db
    .select({
      id: newsImages.id,
      image_name: newsImages.image_name,
      position: newsImages.position,
    })
    .from(newsImages)
    .where(eq(newsImages.news_id, item.id))
    .orderBy(asc(newsImages.position))

  const canPublish = isNewsAgencyPublishable(agency)

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex w-full items-center justify-between px-4 py-3">
          <h1 className="text-sm font-bold text-gray-700">ویرایش خبر</h1>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/newsList" className="text-sky-600 hover:text-sky-700">مدیریت اخبار</Link>
            <Link href="/addNews" className="text-gray-500 hover:text-gray-700">ثبت خبر جدید</Link>
            <Link href="/" className="text-gray-500 hover:text-gray-700">خانه</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full px-4 py-6">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <EditNewsForm
            canPublish={canPublish}
            initialData={{
              id: item.id,
              updated_at: item.updated_at.toISOString(),
              headline: item.headline,
              sub_headline: item.sub_headline ?? '',
              body: item.body,
              news_category: item.news_category ?? '',
              news_source: item.news_source ?? '',
              reporter: item.reporter ?? '',
              published_at: toJalaaliInput(item.published_at),
              archive_at: toJalaaliInput(item.archive_at),
              on_air: !!item.on_air,
              is_breaking: !!item.is_breaking,
              comments_enabled: item.comments_enabled,
              images,
            }}
          />
        </div>
      </main>
    </div>
  )
}
