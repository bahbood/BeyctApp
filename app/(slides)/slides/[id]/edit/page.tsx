import { notFound } from 'next/navigation'
import SlideForm from '../../../components/SlideForm'
import { getSlideById } from '../../../lib/slidesDb'
import { updateSlide } from '../../../actions/slidesActions'

export default async function EditSlidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const slide = await getSlideById(Number(id))

  if (!slide) notFound()

  const updateAction = updateSlide.bind(null, slide.id)

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-800 mb-6">Edit Slide: {slide.name}</h1>
      <SlideForm action={updateAction} slide={slide} />
    </div>
  )
}
