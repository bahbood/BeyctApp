// app/(Occupations)/asnaf/layout.tsx
import Link from 'next/link'

export const metadata = {
  title: 'بانک مشاغل',
}

export default function asnafLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            خانه
          </Link>
          <h2 className="text-sm font-bold text-gray-700">بانک مشاغل</h2>
          <Link href="/bazar" className="text-sm text-gray-500 hover:text-gray-700">
            بازارچه
          </Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
