// app/(Auth)/admin/stores/StoreActivationActions.tsx

'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { approveStoreActivationAction, rejectStoreActivationAction } from '@/app/(bazar)/(StoresManagment)/action/storeActivationAction'

/**
 * دکمه‌های تایید/رد درخواست فعالسازی برای مدیر سایت.
 * رد کردن درخواست نیاز به دلیل دارد، پس دلیل به صورت inline پرسیده می‌شود.
 */
export default function StoreActivationActions({ storeId }: { storeId: number }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isRejecting, setIsRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)

  function approve() {
    startTransition(async () => {
      const result = await approveStoreActivationAction(storeId)
      setFeedback({ ok: result.success, text: result.message ?? 'فروشگاه با موفقیت فعال شد' })

      if (result.success) {
        router.refresh()
      }
    })
  }

  function reject() {
    startTransition(async () => {
      const result = await rejectStoreActivationAction(storeId, reason)
      setFeedback({ ok: result.success, text: result.message ?? 'درخواست رد شد' })

      if (result.success) {
        setIsRejecting(false)
        setReason('')
        router.refresh()
      }
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={approve}
          disabled={isPending}
          className="bg-green-600 hover:bg-green-700 text-white text-[10px] rounded px-3 py-1.5 cursor-pointer disabled:opacity-50"
        >
          تایید و فعال سازی
        </button>

        <button
          type="button"
          onClick={() => setIsRejecting((v) => !v)}
          disabled={isPending}
          className="bg-red-600 hover:bg-red-700 text-white text-[10px] rounded px-3 py-1.5 cursor-pointer disabled:opacity-50"
        >
          رد درخواست
        </button>
      </div>

      {isRejecting && (
        <div className="flex flex-col gap-2 rounded-md border border-red-200 bg-red-50 p-2">
          <label className="text-[10px] text-red-800" htmlFor={`reject-reason-${storeId}`}>
            دلیل رد درخواست (برای کاربر ارسال می‌شود)
          </label>
          <textarea
            id={`reject-reason-${storeId}`}
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
            placeholder="مثال: رسید واریز قابل مشاهده نیست، لطفاً دوباره ارسال کنید."
            className="w-full rounded-md border border-red-200 px-2 py-1 text-[10px] outline-1 outline-red-200 resize-none"
          />
          <button
            type="button"
            onClick={reject}
            disabled={isPending}
            className="self-end bg-red-600 hover:bg-red-700 text-white text-[10px] rounded px-3 py-1.5 cursor-pointer disabled:opacity-50"
          >
            {isPending ? 'در حال ثبت...' : 'تایید رد درخواست'}
          </button>
        </div>
      )}

      {feedback && (
        <span className={`text-[10px] ${feedback.ok ? 'text-green-700' : 'text-red-600'}`}>{feedback.text}</span>
      )}
    </div>
  )
}