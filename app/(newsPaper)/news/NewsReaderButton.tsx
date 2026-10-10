// app/(newsPaper)/news/ShowLandscapeButton.tsx

'use client'

import { useNewsReader } from './NewsReader'

export default function NewsReaderButton({
  newsId,
  className,
}: {
  newsId: number
  className?: string
}) {
  const openNewsReader = useNewsReader()

  return (
    <button id="show_Landscape" type="button" className={className} onClick={() => openNewsReader(newsId)}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
      </svg>
    </button>
  )
}
