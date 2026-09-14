import SlideForm from '../../components/SlideForm'
import { createSlide } from '../../actions/slidesActions'
export const dynamic = 'force-dynamic'

export default function NewSlidePage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-800 mb-6">Add New Slide</h1>
      <SlideForm action={createSlide} />
    </div>
  )
}
