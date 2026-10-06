// app/(newsPaper)/news/NewsHeader.tsx

import Link from 'next/link'

type Props = {
  title?: string
  backHref?: string
  backLabel?: string
}

/** هدر مشترک بخش خبرنامه — به جای تکرار هدر در هر صفحه */
export default function NewsHeader({ title = 'خبرنامه', backHref, backLabel }: Props) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="w-full mx-auto px-4 py-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-700">{title}</h2>
        <div className="flex items-center gap-2">
          {backHref && (
            <Link href={backHref} className="text-sm text-gray-500 hover:text-gray-700">
              {backLabel}
            </Link>
          )}
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            خانه
          </Link>
        </div>
      </div>
    </header>
  )
}
