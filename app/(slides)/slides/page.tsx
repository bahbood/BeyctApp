
import Link from 'next/link'
import { getAllSlides } from '../lib/slidesDb'
import SlideRow from '../components/SlideRow'




export default async function SlidesListPage() {
  const allSlides = await getAllSlides()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Slides</h1>
        <Link
          href="/slides/new"
          className="bg-sky-600 text-white rounded-md px-4 py-2 text-sm hover:bg-sky-500"
        >
          + Add New Slide
        </Link>
      </div>

      {allSlides.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No slides found. Create one!</p>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Filename_L</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Filename_P</th>
                
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Start</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">End</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">order</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allSlides.map((slide) => (
                <SlideRow key={slide.id} slide={slide} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
