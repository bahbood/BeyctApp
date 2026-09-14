'use client'

import { useTransition } from 'react'
import { toggleProductOnAirAction } from '../action/productAction'

export default function ToggleButton({ productId, isOnAir }: { productId: number; isOnAir: boolean }) {
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    startTransition(async () => {
      await toggleProductOnAirAction(productId)
    })
  }

  return (
    <button type="button" onClick={handleToggle} disabled={isPending}
      className={`text-[10px] border rounded px-2 py-1 cursor-pointer disabled:opacity-50 ${
        isOnAir
          ? 'text-orange-600 border-orange-200 hover:bg-orange-50'
          : 'text-green-600 border-green-200 hover:bg-green-50'
      }`}>
      {isPending ? '...' : isOnAir ? 'غیرفعال' : 'فعال'}
    </button>
  )
}
