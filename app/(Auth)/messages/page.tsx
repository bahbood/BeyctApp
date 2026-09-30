// app/(Auth)/messages/page.tsx
// نمایش پیام های کاربر - صندوق ورودی و صندوق ارسال

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUserFromSession } from '@/app/(Auth)/lib/session'
import {
  MESSAGES_PAGE_SIZE,
  displayName,
  getMessagesList,
  getUnreadMessagesCount,
  type MessageBox,
} from './lib/messagesDb'
import { MarkAllAsReadButton, MarkAsReadButton } from './MessageListButtons'

export const dynamic = 'force-dynamic'



function formatDate(date: Date) {
  return new Date(date).toLocaleString('fa-IR')
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ box?: string; search?: string; page?: string }>
}) {
  const sessionUser = await getUserFromSession()
  if (!sessionUser?.id) redirect('/')

  const { box: boxStr, search, page: pageStr } = await searchParams
  const box: MessageBox = boxStr === 'sent' ? 'sent' : 'inbox'
  const searchTerm = search?.trim() || ''
  const currentPage = Math.max(1, Number(pageStr) || 1)

  const { rows, total } = await getMessagesList(sessionUser.id, {
    box,
    search: searchTerm,
    page: currentPage,
  })

  const totalPages = Math.max(1, Math.ceil(total / MESSAGES_PAGE_SIZE))
  const unreadTotal = box === 'inbox' ? await getUnreadMessagesCount(sessionUser.id) : 0

  const baseUrl = '/messages'

  function pageUrl(p: number) {
    const params = new URLSearchParams()
    if (box !== 'inbox') params.set('box', box)
    if (searchTerm) params.set('search', searchTerm)
    if (p > 1) params.set('page', String(p))
    const qs = params.toString()
    return qs ? `${baseUrl}?${qs}` : baseUrl
  }

  return (
    <div className="flex flex-col w-full gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800">پیام ها</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{total} پیام</span>
          {box === 'inbox' && unreadTotal > 0 && (
            <MarkAllAsReadButton unreadTotal={unreadTotal} />
          )}
          <Link
            href="/messages/new"
            className="bg-sky-600 text-white rounded-md px-3 py-1.5 text-xs hover:bg-sky-500"
          >
            + ارسال پیام جدید
          </Link>
        </div>
      </div>

      {/* تب های صندوق ورودی و صندوق ارسال */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <Link
          href={baseUrl}
          className={`px-3 py-1.5 text-xs rounded-t-md border ${
            box === 'inbox'
              ? 'bg-sky-600 text-white border-sky-600'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
          }`}
        >
          پیام های دریافتی
        </Link>
        <Link
          href={`${baseUrl}?box=sent`}
          className={`px-3 py-1.5 text-xs rounded-t-md border ${
            box === 'sent'
              ? 'bg-sky-600 text-white border-sky-600'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
          }`}
        >
          پیام های ارسالی
        </Link>
      </div>

      {/* جستجو */}
      <form action={baseUrl} method="get" className="flex items-center gap-2">
        {box !== 'inbox' && <input type="hidden" name="box" value={box} />}
        <input
          type="text"
          name="search"
          defaultValue={searchTerm}
          placeholder="جستجو در موضوع، متن پیام یا نام فرستنده/گیرنده..."
          className="flex-1 max-w-md rounded-md border border-gray-300 px-3 py-1.5 text-xs outline-none focus:border-sky-500"
        />
        <button
          type="submit"
          className="bg-gray-200 text-gray-700 rounded-md px-3 py-1.5 text-xs hover:bg-gray-300 cursor-pointer"
        >
          جستجو
        </button>
        {searchTerm && (
          <Link href={box === 'inbox' ? baseUrl : `${baseUrl}?box=sent`} className="text-xs text-red-500 hover:text-red-400 px-2 py-1.5">
            پاک کردن
          </Link>
        )}
      </form>

      {rows.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          {searchTerm ? 'نتیجه‌ای یافت نشد.' : box === 'inbox' ? 'پیامی دریافت نکرده اید.' : 'پیامی ارسال نکرده اید.'}
        </p>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-right">
                  <th className="px-3 py-2.5 font-medium text-gray-600">ردیف</th>
                  <th className="px-3 py-2.5 font-medium text-gray-600">وضعیت</th>
                  <th className="px-3 py-2.5 font-medium text-gray-600">موضوع</th>
                  <th className="px-3 py-2.5 font-medium text-gray-600">فرستنده</th>
                  <th className="px-3 py-2.5 font-medium text-gray-600">گیرنده</th>
                  <th className="px-3 py-2.5 font-medium text-gray-600">تاریخ</th>
                  <th className="px-3 py-2.5 font-medium text-gray-600">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((message, index) => {
                  const offset = (currentPage - 1) * MESSAGES_PAGE_SIZE
                  const isUnread = box === 'inbox' && !message.is_read

                  return (
                    <tr
                      key={message.id}
                      className={`border-t border-gray-100 ${isUnread ? 'bg-sky-50/60' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-3 py-2 text-gray-500">{offset + index + 1}</td>
                      <td className="px-3 py-2">
                        {isUnread ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-sky-700">
                            <span className="w-2 h-2 rounded-full bg-sky-500" />
                            خوانده نشده
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400">خوانده شده</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <Link
                          href={`/messages/${message.id}`}
                          className={`hover:text-sky-600 ${isUnread ? 'font-semibold text-gray-800' : 'text-gray-700'}`}
                        >
                          {message.subject?.trim() || '(بدون موضوع)'}
                        </Link>
                        <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{message.body}</p>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-xs">
                          {displayName({
                            name: message.sender_name,
                            family: message.sender_family,
                            user_name: message.sender_user_name,
                          })}
                        </span>
                        {message.sender_role === 'admin' && (
                          <span className="inline-block mr-1 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-700">
                            مدیر
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-xs">
                          {displayName({
                            name: message.receiver_name,
                            family: message.receiver_family,
                            user_name: message.receiver_user_name,
                          })}
                        </span>
                        {message.receiver_role === 'admin' && (
                          <span className="inline-block mr-1 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-700">
                            مدیر
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">{formatDate(message.created_at)}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/messages/${message.id}`}
                            className="text-sky-600 hover:text-sky-400 text-xs px-2 py-1 rounded hover:bg-sky-50"
                          >
                            مشاهده
                          </Link>
                          {isUnread && <MarkAsReadButton messageId={message.id} />}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* صفحه بندی */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-2">
          {currentPage > 1 && (
            <Link href={pageUrl(currentPage - 1)} className="px-2.5 py-1 text-xs rounded border border-gray-300 hover:bg-gray-100">
              قبلی
            </Link>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
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
                    item === currentPage
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {item}
                </Link>
              )
            )}

          {currentPage < totalPages && (
            <Link href={pageUrl(currentPage + 1)} className="px-2.5 py-1 text-xs rounded border border-gray-300 hover:bg-gray-100">
              بعدی
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
