'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleProductOnAirAction } from '../action/productAction'

export default function ToggleButton({ productId, isOnAir }: { productId: number; isOnAir: boolean }) {
  const router = useRouter()
  const [onAir, setOnAir] = useState(isOnAir)
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    const next = !onAir

    startTransition(async () => {
      const result = await toggleProductOnAirAction(productId)
      if (result?.success) {
        setOnAir(next)
        router.refresh()
      }
    })
  }

  return (
    <button type="button" onClick={handleToggle} disabled={isPending}
      className={`text-[10px] border rounded px-2 py-1 cursor-pointer disabled:opacity-50 ${
        onAir
          ? 'text-orange-600 border-orange-200 hover:bg-orange-50'
          : 'text-green-600 border-green-200 hover:bg-green-50'
      }`}>
      {isPending ? '...' : onAir ? 'غیرفعال' : 'فعال'}
    </button>
  )
}
