'use server'

import { db } from '@/app/db'
import { slides } from '@/app/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { toGregorian } from 'jalaali-js'

export type SlideFormState = {
  success: boolean
  message?: string
  errors?: Record<string, string>
} | null

function parseJalaliDate(str: string): Date {
  const [jy, jm, jd] = str.split('/').map(Number)
  const { gy, gm, gd } = toGregorian(jy, jm, jd)
  return new Date(gy, gm - 1, gd)
}

function validateSlidesFields(formData: FormData): Record<string, string> | null {
  const errors: Record<string, string> = {}
  const name = formData.get('name') as string
  const image_L = formData.get('image_L') as string
  const image_P = formData.get('image_P') as string
  const show_startDate = formData.get('show_startDate') as string
  const show_endDate = formData.get('show_endDate') as string

  if (!name || name.trim().length === 0) errors.name = 'Name is required'
  if (!image_L || image_L.trim().length === 0) errors.image_L = 'image_L is required'
  if (!image_P || image_P.trim().length === 0) errors.image_P = 'image_P is required'
  if (!show_startDate) errors.show_startDate = 'Start date is required'
  if (!show_endDate) errors.show_endDate = 'End date is required'
  if (show_startDate && show_endDate) {
    try {
      const start = parseJalaliDate(show_startDate)
      const end = parseJalaliDate(show_endDate)
      if (start >= end) {
        errors.show_endDate = 'End date must be after start date'
      }
    } catch {
      errors.show_endDate = 'Invalid date format'
    }
  }

  return Object.keys(errors).length > 0 ? errors : null
}

export async function createSlide(prevState: SlideFormState, formData: FormData): Promise<SlideFormState> {
  const errors = validateSlidesFields(formData)
  if (errors) return { success: false, errors }

  try {
    await db.insert(slides).values({
      name: (formData.get('name') as string).trim(),
      image_L: (formData.get('image_L') as string).trim(),
      image_P: (formData.get('image_P') as string).trim(),
      show_startDate: parseJalaliDate(formData.get('show_startDate') as string),
      show_endDate: parseJalaliDate(formData.get('show_endDate') as string),
      isActive: formData.get('isActive') === 'on',
      order: parseInt(formData.get('order') as string, 10) || 0,
    })
    revalidatePath('/slides')
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes('unique')
        ? 'A slide with this name or filename already exists'
        : 'Failed to create slide'
    return { success: false, message }
  }

  redirect('/slides')
}

export async function updateSlide(id: number, prevState: SlideFormState, formData: FormData): Promise<SlideFormState> {
  const errors = validateSlidesFields(formData)
  if (errors) return { success: false, errors }

  try {
    await db
      .update(slides)
      .set({
        name: (formData.get('name') as string).trim(),
        image_L: (formData.get('image_L') as string).trim(),
        image_P: (formData.get('image_P') as string).trim(),
        show_startDate: parseJalaliDate(formData.get('show_startDate') as string),
        show_endDate: parseJalaliDate(formData.get('show_endDate') as string),
        isActive: formData.get('isActive') === 'on',
        order: parseInt(formData.get('order') as string, 10) || 0,
      })
      .where(eq(slides.id, id))

    revalidatePath('/slides')
    revalidatePath(`/slides/${id}/edit`)
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes('unique')
        ? 'A slide with this name or filename already exists'
        : 'Failed to update slide'
    return { success: false, message }
  }

  redirect('/slides')
}

export async function deleteSlide(formData: FormData) {
  const id = Number(formData.get('id'))
  await db.delete(slides).where(eq(slides.id, id))
  revalidatePath('/slides')
}
