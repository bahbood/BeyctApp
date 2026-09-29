// app/(Auth)/messages/[id]/page.tsx
// نمایش جزئیات یک پیام

import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getUserFromSession } from '@/app/(Auth)/lib/session'
import { displayName, getMessageForUser } from '../lib/messagesDb'
import { MarkAsReadOnOpen } from './MarkAsReadOnOpen'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'مشاهده پیام',
}

export default async function MessageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const sessionUser = await getUserFromSession()
  if (!sessionUser?.id) redirect('/')

  const { id } = await params
  const messageId = Number(id)
  if (!Number.isInteger(messageId) || messageId <= 0) notFound()

  // کاربر فقط می تواند پیام هایی را ببیند که خودش فرستاده یا دریافت کرده است
  const message = await getMessageForUser(messageId, sessionUser.id)
  if (!message) notFound()

  const isReceiver = message.receiver_id === sessionUser.id
  const isUnread = isReceiver && !message.is_read

  return (
    <div className="flex flex-col w-full gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800">مشاهده پیام</h1>
        <Link href="/messages" className="text-xs text-sky-600 hover:text-sky-400 px-2 py-1.5 rounded hover:bg-sky-50">
          بازگشت به لیست پیام ها
        </Link>
      </div>

      {isUnread && <MarkAsReadOnOpen messageId={message.id} />}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 border-b border-gray-100 pb-3">
          <span className="text-gray-400">موضوع:</span>
          <span className="font-semibold text-gray-800">
            {message.subject?.trim() || '(بدون موضوع)'}
          </span>
          {isUnread && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] bg-sky-100 text-sky-700">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              خوانده نشده
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
          <span>
            <span className="text-gray-400">فرستنده:</span>{' '}
            <span className="text-gray-700">
              {displayName({
                name: message.sender_name,
                family: message.sender_family,
                user_name: message.sender_user_name,
              })}
            </span>
          </span>
          <span>
            <span className="text-gray-400">گیرنده:</span>{' '}
            <span className="text-gray-700">
              {displayName({
                name: message.receiver_name,
                family: message.receiver_family,
                user_name: message.receiver_user_name,
              })}
            </span>
          </span>
          <span>
            <span className="text-gray-400">تاریخ ارسال:</span>{' '}
            <span className="text-gray-700 whitespace-nowrap">
              {new Date(message.created_at).toLocaleString('fa-IR')}
            </span>
          </span>
          {message.read_at && (
            <span>
              <span className="text-gray-400">تاریخ خواندن:</span>{' '}
              <span className="text-gray-700 whitespace-nowrap">
                {new Date(message.read_at).toLocaleString('fa-IR')}
              </span>
            </span>
          )}
        </div>

        <p className="text-sm text-gray-800 leading-7 whitespace-pre-wrap text-justify">{message.body}</p>
      </div>
    </div>
  )
}
