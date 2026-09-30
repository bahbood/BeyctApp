import Link from 'next/link'

export default function bazarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-gray-50">
      
      <main className="w-full mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
