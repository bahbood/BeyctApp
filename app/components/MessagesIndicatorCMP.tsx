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
      className="relative flex items-center justify-center p-1 rounded-sm group select-none bg-gray-400/10 hover:bg-gray-400/30"
    >
    
<svg xmlns="http://www.w3.org/2000/svg" width="20mm" height="20mm" version="1.1"  
  className="size-7 group-hover:fill-orange-600 fill-sky-600 transition-colors duration-300 stroke-0 mx-0 " viewBox="0 0 2000 2000" >
  <path  d="M996.7 310.9l0 -233.62c287.84,0 521.17,233.34 521.17,521.18l50.75 440.26 160.06 101.5 0 288.89c-243.99,22.12 -486.99,66.37 -731.98,66.37 -244.99,0 -487.99,-44.25 -731.98,-66.37l0 -288.89 160.06 -101.5 50.75 -440.26c0,-287.84 233.33,-521.18 521.17,-521.18l0 233.62c-158.89,0 -287.55,128.67 -287.55,287.56l-70.32 638.47c144.62,17.63 213.53,24.93 357.87,24.93 144.34,0 213.25,-7.3 357.87,-24.93l-70.32 -638.47c0,-158.89 -128.66,-287.56 -287.55,-287.56z"/>
  <path  d="M996.7 1412.05c99.24,0 179.69,80.45 179.69,179.69 0,99.24 -80.45,179.69 -179.69,179.69 -99.24,0 -179.69,-80.45 -179.69,-179.69 0,-99.24 80.45,-179.69 179.69,-179.69zm0 -141.93c-177.62,0 -321.62,144 -321.62,321.62 0,177.62 144,321.62 321.62,321.62 177.62,0 321.62,-144 321.62,-321.62 0,-177.62 -144,-321.62 -321.62,-321.62z"/>
</svg>


      {unreadCount > 0 && (
        <span
          className="absolute -top-0.5 -left-0.5 min-w-4 h-4 px-1 pt-1 flex items-center justify-center
                     rounded-full bg-red-500 text-white text-[9px] font-bold "
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  )
}
