// app/(newsPaper)/news/page.tsx

import { getUserFromSession } from '@/app/(Auth)/lib/session'
import {
  getPublicNewsList,
  getNewsImagesMap,
  getLikeCounts,
  getLikedNewsIds,
  getNewsCommentCounts,
  PUBLIC_NEWS_PAGE_SIZE,
} from '@/app/(newsPaper)/lib/publicNewsDb'
import { newsImageUrl } from '@/app/(newsPaper)/(AgenciesManagement)/lib/newsImagesDb'
import Link from 'next/link'
import LikeButton from './LikeButton'
import { toJalaaliInput } from '@/app/lib/jalaliDate'
import CommentButton from './CommentButton'
import { NewsCarousel } from '@/app/components/(newsCarousel)/newsCarousel'
import NewsReaderProvider, { type NewsReaderItem } from './NewsReader'
import NewsReaderButton from './NewsReaderButton'

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
  const [imagesMap, likeCounts, likedIds, commentCounts] = await Promise.all([
    getNewsImagesMap(newsIds),
    getLikeCounts(newsIds),
    userinfo?.id ? getLikedNewsIds(newsIds, userinfo.id) : Promise.resolve(new Set<number>()),
    getNewsCommentCounts(newsIds),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PUBLIC_NEWS_PAGE_SIZE))

  function pageUrl(p: number) {
    return p > 1 ? `/news?page=${p}` : '/news'
  }

  const readerItems: NewsReaderItem[] = rows.map((item) => ({
    id: item.id,
    headline: item.headline,
    sub_headline: item.sub_headline,
    body: item.body,
    news_category: item.news_category,
    news_source: item.news_source,
    reporter: item.reporter,
    view_count: item.view_count,
    comments_enabled: item.comments_enabled,
    comment_count: commentCounts.get(item.id) ?? 0,
    published_label: toJalaaliInput(item.published_at),
    news_agency_name: item.news_agency_name,
    image_names: (imagesMap.get(item.id) ?? []).map((img) => img.image_name),
    liked: likedIds.has(item.id),
    like_count: likeCounts.get(item.id) ?? 0,
  }))

  return (
    <NewsReaderProvider items={readerItems} isLoggedIn={!!userinfo?.id}>
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
                <div id="newsContainer" key={item.id}  className="flex   bg-gray-50 landscape:border  portrait:border-y  border-gray-50 
                      landscape:flex-row landscape:h-full landscape:aspect-[9/3]  landscape:gap-1  landscape:shadow-sm pb-0 
                      portrait:flex-col portrait:w-full portrait:overflow-hidden     portrait:gap-0 portrait:border-gray-200  portrait:pb-3 " 
                >
                  
                  <div id="IMG"  className="flex flex-col flex-wrap   items-start gap-3 landscape:h-full landscape:aspect-square portrait:w-full  ">
<NewsCarousel key={images.length} images={(imagesMap.get(item.id) ?? []).map((img) => img.image_name)}
  className=" w-full aspect-square mx-auto overflow-hidden "
  />
          
                  </div>

                  <div  className="flex flex-col landscape:justify-between  flex-1 min-w-0 landscape:px-2 landscape:pt-2 landscape:pb-1 portrait:px-2 portrait:py-1 overflow-hidden">

                     <div className="flex flex-col basis-7/8  landscape:order-1  portrait:order-2 overflow-hidden  gap-1 ">
                        
                       <div id="content" className=' w-full basis-5/6  flex flex-col  gap-1 overflow-hidden'>
                            <span  className="text-xs/5 xs:text-sm/6 font-semibold text-gray-800 hover:text-sky-700"> {item.headline} </span>
                            {item.sub_headline && <span className="text-xs/5 xs:text-sm/6 text-justify indent-4 text-gray-600">{item.sub_headline}</span>}
                            <hr className='text-gray-200'/>
                            {item.body && <span className="h-20 text-xs/5 xs:text-sm/6  text-wrap text-justify  indent-4 font-bold text-gray-600">{item.body}</span>}
                        </div>

                        <div className=' w-full basis-1/6 shrink-0 '>
                        
                          <NewsReaderButton  newsId={item.id} className="landscape:hidden float-left text-[10px] text-sky-600 hover:text-sky-700 py-1 " />
                        </div>


                     </div>
                   
                   
                    <div className="flex flex-row basis-1/8 items-center  landscape:order-2 portrait:order-1  ">
                    
                      <div className='flex basis-1/2 gap-1'>
                        <LikeButton  className='flex  items-center gap-2 text-[10px] px-2 py-1   disabled:opacity-50 hover:cursor-pointer '
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
                          <NewsReaderButton newsId={item.id} className="portrait:hidden text-[10px] text-sky-600 hover:text-sky-700 float-end" />
                            
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
    </NewsReaderProvider>
  )
}
