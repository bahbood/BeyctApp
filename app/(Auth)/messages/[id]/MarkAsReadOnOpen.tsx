// app/(Auth)/messages/[id]/MarkAsReadOnOpen.tsx
// با باز شدن پیام، به صورت خودکار خوانده شده علامت می خورد
'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { markMessageAsRead } from '../actions/messagesActions'

export function MarkAsReadOnOpen({ messageId }: { messageId: number }) {
  const router = useRouter()
  const markedRef = useRef(false)

  useEffect(() => {
    if (markedRef.current) return
    markedRef.current = true

    void (async () => {
      const result = await markMessageAsRead(messageId)
      if (result.success) router.refresh()
    })()
  }, [messageId, router])

  return null
}
