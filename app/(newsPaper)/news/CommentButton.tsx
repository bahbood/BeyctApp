// app/(newsPaper)/news/LikeButton.tsx

'use client'

import { useState, useTransition } from 'react'
import { toggleNewsLikeAction } from '@/app/(newsPaper)/(AgenciesManagement)/action/newsAction'

type Props = {
  newsId: number
  initialLiked: boolean
  initialCount: number
   className: string
}


export default function CommentButton({ newsId, initialLiked, initialCount ,className }: Props) {
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
      className={`${className}`}
    >
      {count}
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
      className={`size-5 stroke-2 ${ liked ? ' stroke-red-700 ' : 'stroke-gray-500' }  hover:stroke-orange-600 `}>
  <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
</svg>



    </button>
  )
}
