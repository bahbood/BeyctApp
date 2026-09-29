// app/(Auth)/messages/new/page.tsx
// ارسال پیام جدید - کاربران عادی فقط به مدیر سایت و مدیر سایت به هر کاربری

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUserFromSession } from '@/app/(Auth)/lib/session'
import { userRoles } from '@/app/db/schema/users'
import { displayName, getAdminUser, getMessageRecipients } from '../lib/messagesDb'
import MessageForm from './MessageForm'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'ارسال پیام',
}

export default async function NewMessagePage() {
  const sessionUser = await getUserFromSession()
  if (!sessionUser?.id) redirect('/')

  const isAdmin = sessionUser.role === userRoles.enumValues[0]

  // کاربران عادی فقط می توانند به مدیر سایت پیام بدهند
  const admin = isAdmin ? null : await getAdminUser()
  const recipients = isAdmin ? await getMessageRecipients(sessionUser.id) : []

  return (
    <div className="flex flex-col w-full gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800">ارسال پیام جدید</h1>
        <Link href="/messages" className="text-xs text-sky-600 hover:text-sky-400 px-2 py-1.5 rounded hover:bg-sky-50">
          بازگشت به لیست پیام ها
        </Link>
      </div>

      {isAdmin ? (
        <MessageForm recipients={recipients.map((r) => ({ id: r.id, label: displayName(r) }))} />
      ) : admin ? (
        <MessageForm recipients={[{ id: admin.id, label: displayName(admin) }]} fixedReceiver />
      ) : (
        <p className="text-gray-500 text-center py-12">
          مدیر سایت یافت نشد و امکان ارسال پیام وجود ندارد.
        </p>
      )}
    </div>
  )
}
