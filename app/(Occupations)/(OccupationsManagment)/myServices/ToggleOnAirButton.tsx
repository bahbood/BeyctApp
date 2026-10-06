// app/(Occupations)/(OccupationsManagment)/myServices/ToggleOnAirButton.tsx
// نمایش/پنهان کردن خدمت فعال در بانک مشاغل توسط صاحب خدمت

'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleServiceOnAirAction } from '../action/serviceAction'

export default function ToggleOnAirButton({ serviceId, isOnAir }: { serviceId: number; isOnAir: boolean }) {
  const router = useRouter()
  const [onAir, setOnAir] = useState(isOnAir)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleToggle = () => {
    const next = !onAir

    startTransition(async () => {
      const result = await toggleServiceOnAirAction(serviceId)
      if (result.success) {
        setOnAir(next)
        setError(null)
        router.refresh()
      } else {
        setError(result.message ?? 'خطا در تغییر وضعیت')
      }
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        className={`text-[10px] border rounded px-2 py-1 cursor-pointer disabled:opacity-50 ${
          onAir
            ? 'text-orange-600 border-orange-200 hover:bg-orange-50'
            : 'text-green-600 border-green-200 hover:bg-green-50'
        }`}
      >
        {isPending ? '...' : onAir ? 'نمایش در بانک مشاغل : روشن' : 'نمایش در بانک مشاغل : خاموش'}
      </button>
      {error && <span className="text-[9px] text-red-600">{error}</span>}
    </div>
  )
}
