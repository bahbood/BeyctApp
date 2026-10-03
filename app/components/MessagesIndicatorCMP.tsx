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
      className="relative flex items-center justify-center p-1 rounded-sm group select-none hover:bg-gray-500/10"
    >
    {/* <svg  xmlns="http://www.w3.org/2000/svg" width="20mm" height="20mm" viewBox="0 0 20 20"
    className="size-6 fill-gray-900 stroke-0 hover:fill-orange-500 transition-colors duration-300 me-3 cursor-pointer " > */}
        {/* <svg
        xmlns="http://www.w3.org/2000/svg" 
        fill="none"
        viewBox="0 0 24 24" width="20mm" height="20mm"
       
        className={`size-6 group-hover:fill-orange-600 fill-sky-600 transition-colors duration-300 stroke-0 mx-1 ${
          isActive ? 'stroke-gray-500' : 'stroke-gray-400'
        }`}
      >
  <path className="fil0" d="M1677.94 1503.3c0,-49.94 0,-199.89 0,-249.83l-110.36 -59.42 -70.88 -560.75c0,-262.79 -202.74,-478.21 -460.34,-498.43l0 231.33c130.37,19.16 230.34,131.38 230.34,267.1l0 14.48 82.11 649.62c-67.06,1.4 -133.41,1.33 -195.36,1.38l-156.75 0.12 -156.75 -0.12c-61.95,-0.05 -128.3,0.02 -195.36,-1.38l82.11 -649.62 0 -14.48c0,-134.27 97.87,-245.54 226.2,-266.45l0 -231.62c-255.62,22.19 -456.2,236.69 -456.2,498.07l-70.88 560.75 -110.36 59.42c0,49.94 0,199.89 0,249.83 143.25,21.91 381.56,34.02 627.19,35.65l0 14.79c-59.75,22.01 -102.38,79.45 -102.38,146.84 0,86.39 70.04,156.43 156.43,156.43 86.39,0 156.43,-70.04 156.43,-156.43 0,-67.79 -43.14,-125.5 -103.45,-147.22l0 -14.36c242.87,-1.39 480.46,-13.09 628.26,-35.7z"/>
     </svg> */}



            <svg xmlns="http://www.w3.org/2000/svg" width="20mm" height="20mm" version="1.1"  
            className="size-7 group-hover:fill-orange-600 fill-sky-600 transition-colors duration-300 stroke-0 mx-0 "
viewBox="0 0 2000 2000" >
  <path  d="M1677.94 1503.3c0,-49.94 0,-199.89 0,-249.83l-110.36 -59.42 -70.88 -560.75c0,-262.79 -202.74,-478.21 -460.34,-498.43l0 231.33c130.37,19.16 230.34,131.38 230.34,267.1l0 14.48 82.11 649.62c-67.06,1.4 -133.41,1.33 -195.36,1.38l-156.75 0.12 -156.75 -0.12c-61.95,-0.05 -128.3,0.02 -195.36,-1.38l82.11 -649.62 0 -14.48c0,-134.27 97.87,-245.54 226.2,-266.45l0 -231.62c-255.62,22.19 -456.2,236.69 -456.2,498.07l-70.88 560.75 -110.36 59.42c0,49.94 0,199.89 0,249.83 109.08,16.69 273.28,27.68 453.86,32.7 -3.19,15.33 -4.87,31.21 -4.87,47.48 0,128.27 103.98,232.25 232.25,232.25 128.27,0 232.25,-103.98 232.25,-232.25 0,-16.22 -1.67,-32.04 -4.83,-47.32 178.31,-4.86 341.85,-15.72 453.82,-32.86zm-808.34 34.85c84.04,1.28 169.99,1.32 254.24,0.09 5.03,14.15 7.78,29.37 7.78,45.24 0,74.52 -60.4,134.92 -134.92,134.92 -74.52,0 -134.92,-60.4 -134.92,-134.92 0,-15.91 2.76,-31.16 7.82,-45.33z"/>
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
