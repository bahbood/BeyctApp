import SlideImageManager from '../../components/SlideImageManager'
import { getAllSlideImages } from '../../lib/slideImagesDb'
export const dynamic = 'force-dynamic'

export default async function SlideImageManagerPage() {
  const images = await getAllSlideImages()

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-800 mb-6">Slide Image Manager</h1>
      <SlideImageManager images={images} />
    </div>
  )
}
