// app/(newsPaper)/(AgenciesManagement)/newsList/ToggleButton.tsx

'use client'

import { useState, useTransition } from 'react'
import {
  toggleNewsOnAirAction,
  toggleNewsBreakingAction,
  toggleNewsCommentsAction,
  deleteNewsAction,
} from '../action/newsAction'

type Props = {
  newsId: number
  field: 'on_air' | 'is_breaking' | 'comments_enabled'
  current: boolean
  disabled?: boolean
  disabledTitle?: string
}

export function ToggleField({ newsId, field, current, disabled = false, disabledTitle }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleClick() {
    setError(null)
    startTransition(async () => {
      const result =
        field === 'on_air'
          ? await toggleNewsOnAirAction(newsId)
          : field === 'is_breaking'
            ? await toggleNewsBreakingAction(newsId)
            : await toggleNewsCommentsAction(newsId)

      if (!result?.success && result?.message) {
        setError(result.message)
      }
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending || disabled}
        title={disabled ? disabledTitle : undefined}
        className={`text-[10px] rounded px-2 py-1 border ${
          current ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {current ? 'فعال' : 'غیرفعال'}
      </button>
      {error && <span className="text-[9px] text-red-500">{error}</span>}
    </div>
  )
}

export function DeleteNewsButton({ newsId }: { newsId: number }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleClick() {
    if (!confirm('آیا از حذف این خبر اطمینان دارید؟')) return
    setError(null)
    startTransition(async () => {
      const result = await deleteNewsAction(newsId)
      if (result && !result.success && result.errors?.message) {
        setError(result.errors.message)
      }
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="text-[10px] text-red-600 border border-red-200 hover:bg-red-50 rounded px-2 py-1 disabled:opacity-50"
      >
        {isPending ? 'در حال حذف...' : 'حذف'}
      </button>
      {error && <span className="text-[9px] text-red-500">{error}</span>}
    </div>
  )
}
