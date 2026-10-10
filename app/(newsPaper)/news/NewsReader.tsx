// app/(newsPaper)/news/NewsReader.tsx

'use client'

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import FlyoutNewsLayout from './FlyoutNewsLayout'
import LikeButton from './LikeButton'
import { NewsCarousel } from '@/app/components/(newsCarousel)/newsCarousel'
import { toJalaaliInput } from '@/app/lib/jalaliDate'
import { useFlyoutPage } from '@/app/components/(Flyouts)/(Provider)/FlyoutPageContextProvider'
import {
  createNewsCommentAction,
  fetchNewsCommentsAction,
} from './action/newsCommentAction'
import { MAX_COMMENT_LENGTH, type NewsCommentView } from '@/app/(newsPaper)/lib/newsCommentTypes'

export type NewsReaderItem = {
  id: number
  headline: string
  sub_headline: string | null
  body: string
  news_category: string | null
  news_source: string | null
  reporter: string | null
  view_count: number
  comments_enabled: boolean
  comment_count: number
  published_label: string
  news_agency_name: string
  image_names: string[]
  liked: boolean
  like_count: number
}

const NewsReaderContext = createContext<(id: number) => void>(() => {})

export function useNewsReader() {
  return useContext(NewsReaderContext)
}

export default function NewsReaderProvider({
  items,
  isLoggedIn,
  children,
}: {
  items: NewsReaderItem[]
  isLoggedIn: boolean
  children: ReactNode
}) {
  const [activeId, setActiveId] = useState<number | null>(null)
  const active = items.find((n) => n.id === activeId) ?? null
  const { logInPage_toggleShow } = useFlyoutPage()

  return (
    <NewsReaderContext.Provider value={setActiveId}>
      {children}

      <FlyoutNewsLayout isOpen={active !== null} onCloseMe={() => setActiveId(null)}>
        {active && (
          <div
            dir="rtl"
            className="w-full h-full overflow-y-auto overscroll-contain flex flex-col gap-3 px-4 py-3"
          >
            <header className="flex flex-col gap-1">
              <h1 className="text-sm xs:text-base font-bold text-gray-800 leading-relaxed">
                {active.headline}
              </h1>
              {active.sub_headline && (
                <p className="text-xs xs:text-sm text-gray-600 leading-relaxed">{active.sub_headline}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-400">
                <span>{active.news_agency_name}</span>
                <span>تاریخ انتشار: {active.published_label}</span>
                {active.reporter && <span>خبرنگار: {active.reporter}</span>}
                {active.news_source && <span>منبع: {active.news_source}</span>}
                {active.news_category && <span>دسته‌بندی: {active.news_category}</span>}
                <span>بازدید: {active.view_count}</span>
              </div>
            </header>

            {active.image_names.length > 0 && (
              <div className="flex flex-col gap-3">
                <NewsCarousel
                  key={active.image_names.length}
                  className=" w-full mx-auto"
                  images={active.image_names}
                />
              </div>
            )}

            <div className="text-xs xs:text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {active.body}
            </div>

            <footer className="flex items-center justify-between pt-2 border-t border-gray-100">
              <LikeButton
                className="flex items-center gap-2 text-[10px] px-2 py-1 disabled:opacity-50 hover:cursor-pointer"
                newsId={active.id}
                initialLiked={active.liked}
                initialCount={active.like_count}
              />
            </footer>

            <NewsComments
              key={active.id}
              newsId={active.id}
              commentsEnabled={active.comments_enabled}
              isLoggedIn={isLoggedIn}
              initialCount={active.comment_count}
              onRequestLogin={() => {
                setActiveId(null)
                logInPage_toggleShow()
              }}
            />
          </div>
        )}
      </FlyoutNewsLayout>
    </NewsReaderContext.Provider>
  )
}

function NewsComments({
  newsId,
  commentsEnabled,
  isLoggedIn,
  initialCount,
  onRequestLogin,
}: {
  newsId: number
  commentsEnabled: boolean
  isLoggedIn: boolean
  initialCount: number
  onRequestLogin: () => void
}) {
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [comments, setComments] = useState<NewsCommentView[]>([])
  const [count, setCount] = useState(initialCount)
  const [text, setText] = useState('')
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sectionRef = useRef<HTMLDivElement>(null)

  // پس از باز شدن، بخش دیدگاه‌ها در دید کاربر قرار می‌گیرد
  useEffect(() => {
    if (open) sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [open])

  async function handleToggle() {
    const next = !open
    setOpen(next)

    if (next && !loaded && !loading) {
      setLoading(true)
      try {
        const rows = await fetchNewsCommentsAction(newsId)
        setComments(rows)
        setCount(rows.length)
        setLoaded(true)
      } finally {
        setLoading(false)
      }
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (posting) return

    setError(null)
    setPosting(true)
    try {
      const result = await createNewsCommentAction(newsId, text)
      if (result.success) {
        setComments((prev) => [...prev, result.comment])
        setCount((value) => value + 1)
        setText('')
      } else {
        setError(result.errors.message)
      }
    } finally {
      setPosting(false)
    }
  }

  const authorName = (comment: NewsCommentView) =>
    [comment.user_name, comment.user_family].filter(Boolean).join(' ')

  return (
    <section className="flex flex-col gap-2 pt-3 mt-1 border-t border-gray-200">
      <button
        type="button"
        onClick={handleToggle}
        className="self-start flex items-center gap-1 text-[11px] font-semibold text-sky-700 hover:text-orange-600 transition-colors cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
        </svg>
        {open ? 'بستن دیدگاه‌ها' : `مشاهده دیدگاه‌ها${count > 0 ? ` (${count})` : ''}`}
      </button>

      {open && (
        <div id="userComments" ref={sectionRef} className="flex flex-col gap-3 scroll-mt-2">
          {commentsEnabled && isLoggedIn && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                rows={3}
                maxLength={MAX_COMMENT_LENGTH}
                placeholder="دیدگاه خود را بنویسید..."
                className="w-full text-xs text-gray-800 bg-white border border-gray-300 rounded-sm p-2 resize-y outline-none focus:border-sky-500"
              />
              {error && <span className="text-[10px] text-red-600">{error}</span>}
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400">
                  {text.length}/{MAX_COMMENT_LENGTH}
                </span>
                <button
                  type="submit"
                  disabled={posting || text.trim().length === 0}
                  className="text-[11px] px-3 py-1 rounded-sm bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {posting ? 'در حال ثبت...' : 'ثبت دیدگاه'}
                </button>
              </div>
            </form>
          )}

          {commentsEnabled && !isLoggedIn && (
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-600 bg-gray-50 border border-gray-200 rounded-sm p-2">
              <span>برای ثبت دیدگاه باید وارد سایت شوید.</span>
              <button
                type="button"
                onClick={onRequestLogin}
                className="text-sky-700 hover:text-orange-600 font-semibold cursor-pointer"
              >
                ورود به سایت
              </button>
            </div>
          )}

          {!commentsEnabled && (
            <p className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded-sm p-2">
              امکان ثبت دیدگاه برای این خبر غیرفعال است.
            </p>
          )}

          {loading ? (
            <p className="text-[11px] text-gray-400">در حال بارگذاری دیدگاه‌ها...</p>
          ) : comments.length === 0 ? (
            <p className="text-[11px] text-gray-400">هنوز دیدگاهی ثبت نشده است.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {comments.map((comment) => (
                <li key={comment.id} className="flex flex-col gap-1 bg-gray-50 border border-gray-200 rounded-sm p-2">
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span className="font-semibold text-gray-600">{authorName(comment)}</span>
                    <span>{toJalaaliInput(comment.created_at)}</span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{comment.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}
