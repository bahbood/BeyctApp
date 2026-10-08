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
import { div } from 'framer-motion/client'
import CommentButton from './CommentButton'

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
      

      <main className="w-full mx-auto landscape:px-4 landscape:py-6 flex flex-col gap-4">
        {rows.length === 0 ? (
          <div className="bg-white rounded-lg  border border-gray-200 p-8 text-center text-sm text-gray-500">
            {page > 1 ? 'این صفحه خبری ندارد' : 'در حال حاضر خبری منتشر نشده است'}
          </div>
        ) : (
         
           rows.map((item) => {
              const images = imagesMap.get(item.id) ?? []
              const thumb = images.length > 0 ? newsImageUrl(images[0].image_name) : ''
              return (
                <div id="newsContainer" key={item.id}  className="flex   bg-gray-50 landscape:border  portrait:border-y  border-gray-50 landscape:shadow-sm
                      landscape:flex-row landscape:h-full landscape:aspect-[9/3]  landscape:gap-1  pb-0
                      portrait:flex-col portrait:w-full portrait:overflow-hidden     portrait:gap-1  portrait:pb-3 " 
                >
                  
                  <div id="IMG"  className="flex flex-wrap   items-start gap-3 landscape:h-full aspect-square portrait:w-full  ">
                    {thumb && (
                      <Image src={thumb} alt={item.headline} width={300} height={300} className="h-full w-full aspect-square   " />
                     )}
                  </div>

                  <div id="content" className="flex flex-col landscape:justify-between  flex-1 min-w-0 px-2 py-3">

                     <div className="flex flex-col gap-1  landscape:order-1  portrait:order-2   ">
                        <Link href={`/news/${item.id}`} className="text-sm font-semibold text-gray-800 hover:text-sky-700">
                          {item.headline}
                        </Link>
                        {item.sub_headline && <span className="text-xs text-gray-600">{item.sub_headline}</span>}

                        <div className=' w-full  '>
                         <Link id="morePortrait" href={`/news/${item.id}`} className="landscape:hidden float-left text-[10px] text-sky-600 hover:text-sky-700 ">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"  className="size-6 stroke-2 stroke-gray-600">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                              </svg>
                          </Link>
                        </div>


                     </div>
                   
                   
                    <div className="flex flex-row items-center  landscape:order-2 portrait:order-1  ">
                    
                      <div className='flex basis-1/2 gap-1'>
                        <LikeButton className='flex  items-center gap-2 text-[10px] px-2 py-1   disabled:opacity-50 hover:cursor-pointer '
                            newsId={item.id}
                            initialLiked={likedIds.has(item.id)}
                            initialCount={likeCounts.get(item.id) ?? 0}
                          />
                          <CommentButton className='flex  items-center gap-2 text-[10px] px-2 py-1   disabled:opacity-50 hover:cursor-pointer'
                            newsId={item.id}
                            initialLiked={likedIds.has(item.id)}
                            initialCount={likeCounts.get(item.id) ?? 0}
                          />
                      </div>

                       <div className='flex basis-1/2 justify-end gap-4'>

                          <span className="text-[10px] text-gray-400 mt-1">
                              {item.news_agency_name} • {toJalaaliInput(item.published_at)}
                          </span>
                          <Link id="moreLandscape" href={`/news/${item.id}`} className="portrait:hidden text-[10px] text-sky-600 hover:text-sky-700 float-end">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                              </svg>
                          </Link>
                            
                      </div>
                       
                       
                    </div>



                    </div>

                 
                </div>
              )
            })
         
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
