'use server'

import { revalidatePath } from 'next/cache'
import { saveSlideImage, deleteSlideImage, renameSlideImage, findSlidesUsingImage } from '../lib/slideImagesDb'

export type SlideImageActionState = {
  success: boolean
  message?: string
  referencedBy?: { id: number; name: string }[]
} | null

export async function uploadSlideImage(prevState: SlideImageActionState, formData: FormData): Promise<SlideImageActionState> {
  const file = formData.get('image') as File | null
  if (!file || file.size === 0) {
    return { success: false, message: 'No file selected' }
  }

  try {
    await saveSlideImage(file)
    revalidatePath('/slides/ImageManager')
    return { success: true, message: 'Image uploaded successfully' }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to upload image',
    }
  }
}

export async function deleteSlideImageAction(prevState: SlideImageActionState, formData: FormData): Promise<SlideImageActionState> {
  const filename = formData.get('filename') as string
  if (!filename) return { success: false, message: 'No filename provided' }

  const confirmed = formData.get('confirmed') === 'true'

  if (!confirmed) {
    const refs = await findSlidesUsingImage(filename)
    if (refs.length > 0) {
      return { success: false, message: 'This image is used by slides', referencedBy: refs }
    }
  }

  try {
    await deleteSlideImage(filename)
    revalidatePath('/slides/ImageManager')
    return { success: true, message: 'Image deleted' }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete image',
    }
  }
}

export async function renameSlideImageAction(prevState: SlideImageActionState, formData: FormData): Promise<SlideImageActionState> {
  const oldName = formData.get('oldName') as string
  const newName = formData.get('newName') as string

  if (!oldName || !newName) {
    return { success: false, message: 'Both old and new filenames are required' }
  }
  if (oldName === newName) {
    return { success: false, message: 'New name must be different' }
  }

  try {
    await renameSlideImage(oldName, newName)
    revalidatePath('/slides/ImageManager')
    return { success: true, message: 'Image renamed' }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to rename image',
    }
  }
}
