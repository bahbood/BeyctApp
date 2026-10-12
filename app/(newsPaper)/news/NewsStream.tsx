// app/(newsPaper)/news/NewsStream.tsx
// جریان پیوسته اخبار: بدون صفحه بندی، بارگذاری هنگام اسکرول و با دکمه «خبرهای بیشتر»

'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { NewsCarousel } from '@/app/components/(newsCarousel)/newsCarousel'
import LikeButton from './LikeButton'
import CommentButton from './CommentButton'
import NewsReaderButton from './NewsReaderButton'
import NewsReaderProvider from './NewsReader'
import { loadNewsStreamAction, markNewsReadAction } from './action/newsStreamAction'
import type { NewsStreamCursor, PublicNewsStreamItem } from '@/app/(newsPaper)/lib/newsStreamTypes'

type Props = {
  initialItems: PublicNewsStreamItem[]
  initialHasOlder: boolean
  initialHasNewer: boolean
  isLoggedIn: boolean
}

const cursorOf = (item: PublicNewsStreamItem): NewsStreamCursor => ({
  publishedAt: item.published_at,
  id: item.id,
})

export default function NewsStream({
  initialItems,
  initialHasOlder,
  initialHasNewer,
  isLoggedIn,
}: Props) {
  const [items, setItems] = useState(initialItems)
  const [hasOlder, setHasOlder] = useState(initialHasOlder)
  const [hasNewer, setHasNewer] = useState(initialHasNewer)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [loadingNewer, setLoadingNewer] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // مراجع برای دسترسی به آخرین مقادیر داخل IntersectionObserver بدون بازسازی آن
  const itemsRef = useRef(items)
  const hasOlderRef = useRef(hasOlder)
  const hasNewerRef = useRef(hasNewer)
  const loadingOlderRef = useRef(false)
  const loadingNewerRef = useRef(false)
  const pendingScrollAdjustRef = useRef<number | null>(null)

  const topSentinelRef = useRef<HTMLDivElement | null>(null)
  const bottomSentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    itemsRef.current = items
  }, [items])
  useEffect(() => {
    hasOlderRef.current = hasOlder
  }, [hasOlder])
  useEffect(() => {
    hasNewerRef.current = hasNewer
  }, [hasNewer])

  // پس از افزودن اخبار جدیدتر در بالای لیست، موقعیت اسکرول کاربر حفظ می‌شود
  useLayoutEffect(() => {
    if (pendingScrollAdjustRef.current !== null) {
      const delta = document.documentElement.scrollHeight - pendingScrollAdjustRef.current
      if (delta !== 0) window.scrollBy(0, delta)
      pendingScrollAdjustRef.current = null
    }
  }, [items])

  const prependItems = useCallback((incoming: PublicNewsStreamItem[]) => {
    setItems((prev) => {
      const seen = new Set(prev.map((i) => i.id))
      const fresh = incoming.filter((i) => !seen.has(i.id))
      return fresh.length > 0 ? [...fresh, ...prev] : prev
    })
  }, [])

  const appendItems = useCallback((incoming: PublicNewsStreamItem[]) => {
    setItems((prev) => {
      const seen = new Set(prev.map((i) => i.id))
      const fresh = incoming.filter((i) => !seen.has(i.id))
      return fresh.length > 0 ? [...prev, ...fresh] : prev
    })
  }, [])

  /** بارگذاری اخبار قدیمی‌تر (پایین جریان) — خوانده‌نشده‌ها ابتدا */
  const loadOlder = useCallback(async () => {
    if (loadingOlderRef.current || !hasOlderRef.current) return
    const list = itemsRef.current
    if (list.length === 0) return

    loadingOlderRef.current = true
    setLoadingOlder(true)
    setError(null)
    try {
      const result = await loadNewsStreamAction('older', cursorOf(list[list.length - 1]))
      appendItems(result.items)
      hasOlderRef.current = result.hasMore
      setHasOlder(result.hasMore)
    } catch {
      setError('بارگذاری اخبار بیشتر ناموفق بود')
    } finally {
      loadingOlderRef.current = false
      setLoadingOlder(false)
    }
  }, [appendItems])

  /** بارگذاری اخبار جدیدتر (بالای جریان) — معمولا خبرهای خوانده‌شده قبلی */
  const loadNewer = useCallback(async () => {
    if (loadingNewerRef.current || !hasNewerRef.current) return
    const list = itemsRef.current
    if (list.length === 0) return

    loadingNewerRef.current = true
    setLoadingNewer(true)
    setError(null)
    try {
      const result = await loadNewsStreamAction('newer', cursorOf(list[0]))
      if (result.items.length > 0) {
        // ارتفاع پیش از افزودن اندازه‌گیری می‌شود تا موقعیت اسکرول حفظ شود
        pendingScrollAdjustRef.current = document.documentElement.scrollHeight
      }
      prependItems(result.items)
      hasNewerRef.current = result.hasMore
      setHasNewer(result.hasMore)
    } catch {
      pendingScrollAdjustRef.current = null
      setError('بارگذاری اخبار قبلی ناموفق بود')
    } finally {
      loadingNewerRef.current = false
      setLoadingNewer(false)
    }
  }, [prependItems])

  // بارگذاری خودکار: پایین برای قدیمی‌ترها، بالا برای خوانده‌شده‌های قبلی
  useEffect(() => {
    const top = topSentinelRef.current
    const bottom = bottomSentinelRef.current
    if (!top || !bottom) return

    const wasVisible: Record<string, boolean | undefined> = {}

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const key = entry.target === top ? 'top' : 'bottom'
          const previouslyVisible = wasVisible[key]
          wasVisible[key] = entry.isIntersecting

          if (!entry.isIntersecting || previouslyVisible === true) continue
          // در اولین تماس، بالای لیست به صورت خودکار بارگذاری نمی‌شود
          // تا فقط اخبار خوانده‌نشده اولیه نمایش داده شوند
          if (key === 'top' && previouslyVisible === undefined) continue

          if (key === 'top') void loadNewer()
          else void loadOlder()
        }
      },
      { rootMargin: '300px 0px' },
    )

    observer.observe(top)
    observer.observe(bottom)
    return () => observer.disconnect()
  }, [loadNewer, loadOlder])

  /** با باز کردن هر خبر، آن را خوانده‌شده علامت می‌زنیم */
  const handleOpenItem = useCallback(
    (id: number) => {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, is_read: true } : item)))
      if (isLoggedIn) void markNewsReadAction(id)
    },
    [isLoggedIn],
  )

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-sm text-gray-500">
        در حال حاضر خبری منتشر نشده است
      </div>
    )
  }

  return (
    <NewsReaderProvider items={items} isLoggedIn={isLoggedIn} onItemOpen={handleOpenItem}>
      <div className="flex flex-col gap-4">
        <div ref={topSentinelRef} aria-hidden className="h-px w-full" />

        {loadingNewer && (
          <div className="text-center text-[11px] text-gray-400 py-1">در حال بارگذاری اخبار قبلی...</div>
        )}

        {items.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}

        {hasOlder ? (
          <button
            type="button"
            onClick={() => void loadOlder()}
            disabled={loadingOlder}
            className="mx-auto my-2 px-6 py-2 text-xs font-semibold rounded-sm bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loadingOlder ? 'در حال بارگذاری...' : 'خبرهای بیشتر'}
          </button>
        ) : (
          <div className="text-center text-[11px] text-gray-400 py-3">به پایان اخبار رسیدید</div>
        )}

        {error && <div className="text-center text-[11px] text-red-600">{error}</div>}

        <div ref={bottomSentinelRef} aria-hidden className="h-px w-full" />
      </div>
    </NewsReaderProvider>
  )
}

/** کارت یک خبر در جریان — هم‌ارز کارت لیست قبلی */
function NewsCard({ item }: { item: PublicNewsStreamItem }) {
  return (
    <div
      id="newsContainer"
      className="flex bg-gray-50 landscape:border portrait:border-y border-gray-50
        landscape:flex-row landscape:h-full landscape:aspect-[9/3] landscape:gap-1 landscape:shadow-sm pb-0
        portrait:flex-col portrait:w-full portrait:overflow-hidden portrait:gap-0 portrait:border-gray-200 portrait:pb-3"
    >
      <div id="IMG" className="flex flex-col flex-wrap items-start gap-3 landscape:h-full landscape:aspect-square portrait:w-full">
        <NewsCarousel
          key={item.image_names.length}
          images={item.image_names}
          className="w-full aspect-square mx-auto overflow-hidden"
        />
      </div>

      <div className="flex flex-col landscape:justify-between flex-1 min-w-0 landscape:px-2 landscape:pt-2 landscape:pb-1 portrait:px-2 portrait:py-1 overflow-hidden">
        <div className="flex flex-col basis-7/8 landscape:order-1 portrait:order-2 overflow-hidden gap-1">
          <div id="content" className="w-full basis-6/7 flex flex-col gap-1 overflow-hidden">
            {!item.is_read && (
              <span className="self-start text-[9px] font-bold text-white bg-sky-600 rounded-full px-2 py-0.5">
                جدید
              </span>
            )}
            <span className="text-xs/5 xs:text-sm/6 font-semibold text-gray-800 hover:text-sky-700">{item.headline}</span>
            {item.sub_headline && (
              <span className="text-xs/5 xs:text-sm/6 text-justify indent-4 text-gray-600">{item.sub_headline}</span>
            )}
            <hr className="text-gray-200" />
            {item.body && (
              <span className="h-20 text-xs/5 xs:text-sm/6 text-wrap text-justify indent-4 font-bold text-gray-600">{item.body}</span>
            )}
          </div>

          <div className="w-full basis-1/7 shrink-0 pt-2">
            <NewsReaderButton newsId={item.id} className="flex landscape:hidden w-12 h-7 justify-center items-center border border-gray-300  float-left text-[10px] text-sky-600 hover:text-sky-700 
             rounded-md bg-gray-200" />
          </div>
        </div>

        <div className="flex flex-row basis-1/8 items-center landscape:order-2 portrait:order-1  ">
          <div className="flex basis-1/2 h-full items-center gap-1 ">
            <LikeButton
              className="flex h-full items-center gap-2 text-[10px] px-2 py-1 disabled:opacity-50 hover:cursor-pointer"
              newsId={item.id}
              initialLiked={item.liked}
              initialCount={item.like_count}
            />
            <CommentButton
              className="flex items-center gap-2 text-[10px] px-2 py-1 disabled:opacity-50 hover:cursor-pointer"
              newsId={item.id}
              initialLiked={item.liked}
              initialCount={item.like_count}
            />
          </div>

          <div className="flex basis-1/2 justify-end items-center gap-4 ">
            <span className="text-[10px]  text-gray-400 mt-1">
              {item.news_agency_name} • {item.published_label}
            </span>
            <NewsReaderButton newsId={item.id} className="flex portrait:hidden  w-12 h-7 justify-center items-center border border-gray-300 text-[10px] text-sky-600 hover:text-sky-700 float-end
            rounded-md bg-gray-200 " />
          </div>
        </div>
      </div>
    </div>
  )
}
