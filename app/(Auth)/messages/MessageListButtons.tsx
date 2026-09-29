// app/(Auth)/messages/MessageListButtons.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { markAllMessagesAsRead, markMessageAsRead } from './actions/messagesActions'

export function MarkAsReadButton({ messageId }: { messageId: number }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      await markMessageAsRead(messageId)
      router.refresh()
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-gray-500 hover:text-gray-700 text-xs px-2 py-1 rounded hover:bg-gray-100 cursor-pointer disabled:opacity-50"
    >
      خوانده شد
    </button>
  )
}

export function MarkAllAsReadButton({ unreadTotal }: { unreadTotal: number }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirmed, setConfirmed] = useState(false)

  const handleClick = () => {
    if (!confirmed) {
      const ok = confirm('همه پیام های خوانده نشده به عنوان خوانده شده علامت بخورند؟')
      if (!ok) return
      setConfirmed(true)
    }

    startTransition(async () => {
      await markAllMessagesAsRead()
      router.refresh()
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="bg-gray-200 text-gray-700 rounded-md px-3 py-1.5 text-xs hover:bg-gray-300 cursor-pointer disabled:opacity-50"
    >
      خواندن همه ({unreadTotal})
    </button>
  )
}
