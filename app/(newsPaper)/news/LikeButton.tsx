// app/(newsPaper)/news/LikeButton.tsx

'use client'

import { useState, useTransition } from 'react'
import { toggleNewsLikeAction } from '@/app/(newsPaper)/(AgenciesManagement)/action/newsAction'

type Props = {
  newsId: number
  initialLiked: boolean
  initialCount: number
}

export default function LikeButton({ newsId, initialLiked, initialCount }: Props) {
  const [isPending, startTransition] = useTransition()
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)

  function handleClick() {
    if (isPending) return

    // بازخورد فوری؛ پایان ترانزیشن با وضعیت قطعی سرور هماهنگ می شود
    const optimisticLiked = !liked
    const optimisticCount = liked ? Math.max(0, count - 1) : count + 1
    setLiked(optimisticLiked)
    setCount(optimisticCount)

    startTransition(async () => {
      const result = await toggleNewsLikeAction(newsId)

      if (result?.success) {
        setLiked(result.liked ?? optimisticLiked)
        if (typeof result.likeCount === 'number') setCount(result.likeCount)
      } else {
        // شکست عملیات → بازگشت به آخرین مقداری که سرور رندر کرده است
        setLiked(initialLiked)
        setCount(initialCount)
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`text-[10px] px-2 py-1 rounded border ${
        liked ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-gray-50 border-gray-200 text-gray-600'
      } disabled:opacity-50`}
    >
      {liked ? 'پسندیده شده' : 'پسندیدن'} ({count})
    </button>
  )
}
