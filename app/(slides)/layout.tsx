import Link from 'next/link'

export default function SlidesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/slides" className="text-lg font-semibold text-gray-800">
            Slide Management
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/slides/ImageManager"
              className="text-sm text-sky-600 hover:text-sky-400"
            >
              Image Manager
            </Link>
            <Link href="/" className="text-sm text-sky-600 hover:text-sky-400">
              &larr; Back to site
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
