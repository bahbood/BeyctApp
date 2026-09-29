// app/components/MessagesIndicatorCMP.tsx
// نشانگر پیام های خوانده نشده در هدر سایت به همراه لینک به صفحه پیام ها
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function MessagesIndicatorCMP({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname()
  const isActive = pathname === '/messages' || pathname.startsWith('/messages/')

  return (
    <Link
      href="/messages"
      title={unreadCount > 0 ? `${unreadCount} پیام خوانده نشده` : 'پیام ها'}
      className="relative flex items-center justify-center p-2 rounded-sm group select-none hover:bg-gray-500/10"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
        className={`size-5 transition duration-300 group-hover:stroke-orange-500 ${
          isActive ? 'stroke-gray-500' : 'stroke-gray-400'
        }`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
        />
      </svg>

      {unreadCount > 0 && (
        <span
          className="absolute -top-0.5 -left-0.5 min-w-4 h-4 px-1 flex items-center justify-center
                     rounded-full bg-red-500 text-white text-[9px] font-bold"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  )
}
