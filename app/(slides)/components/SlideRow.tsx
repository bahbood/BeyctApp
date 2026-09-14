'use client'

import Link from 'next/link'
import { deleteSlide } from '../actions/slidesActions'
import type { Slide } from '@/app/db/schema'

export default function SlideRow({ slide }: { slide: Slide }) {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-4 py-3 text-sm">{slide.name}</td>
      <td className="px-4 py-3 text-sm">{slide.image_L}</td>
      <td className="px-4 py-3 text-sm">{slide.image_P}</td>
      
      <td className="px-4 py-3 text-sm">{slide.show_startDate?.toLocaleDateString('fa-IR')}</td>
      <td className="px-4 py-3 text-sm">{slide.show_endDate?.toLocaleDateString('fa-IR')}</td>
      <td className="px-4 py-3 text-sm">{slide.order}</td>
      <td className="px-4 py-3 text-sm">
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${slide.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {slide.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-4 py-3 text-sm flex gap-2">
        <Link
          href={`/slides/${slide.id}/edit`}
          className="text-sky-600 hover:text-sky-400 text-sm"
        >
          Edit
        </Link>
        <form action={deleteSlide}>
          <input type="hidden" name="id" value={slide.id} />
          <button
            type="submit"
            className="text-red-600 hover:text-red-400 text-sm cursor-pointer"
             onClick={(e) => { if (!confirm('Delete this slide?')) e.preventDefault() }}
          >
            Delete
          </button>
        </form>
      </td>
    </tr>
  )
}