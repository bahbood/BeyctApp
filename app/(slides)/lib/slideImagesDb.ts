import 'server-only'
import { readdir, stat, writeFile, unlink, rename } from 'fs/promises'
import path from 'path'
import { db } from '@/app/db'
import { slides } from '@/app/db/schema'
import { eq, or } from 'drizzle-orm'

const SLIDE_IMAGES_DIR = path.join(process.cwd(), 'public', 'slideImages')
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024

export type SlideImageInfo = {
  name: string
  size: number
  ext: string
  modifiedAt: Date
}

export async function getAllSlideImages(): Promise<SlideImageInfo[]> {
  const entries = await readdir(SLIDE_IMAGES_DIR, { withFileTypes: true })
  const files: SlideImageInfo[] = []

  for (const entry of entries) {
    if (!entry.isFile()) continue
    const ext = path.extname(entry.name).toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) continue
    const fullPath = path.join(SLIDE_IMAGES_DIR, entry.name)
    const s = await stat(fullPath)
    files.push({ name: entry.name, size: s.size, ext, modifiedAt: s.mtime })
  }

  files.sort((a, b) => a.name.localeCompare(b.name))
  return files
}

function sanitizeFilename(name: string): string {
  const ext = path.extname(name).toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error(`Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`)
  }
  const base = path.basename(name, ext)
  const sanitized = base.replace(/[^a-zA-Z0-9_\-]/g, '_')
  if (!sanitized) {
    throw new Error('Filename must contain at least one valid character')
  }
  return `${sanitized}${ext}`
}

export async function saveSlideImage(file: File): Promise<void> {
  if (!ALLOWED_EXTENSIONS.includes(path.extname(file.name).toLowerCase())) {
    throw new Error(`Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`)
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum: ${MAX_FILE_SIZE / 1024 / 1024}MB`)
  }

  const sanitized = sanitizeFilename(file.name)
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  await writeFile(path.join(SLIDE_IMAGES_DIR, sanitized), buffer)
}

export async function deleteSlideImage(filename: string): Promise<void> {
  const sanitized = sanitizeFilename(filename)
  const fullPath = path.join(SLIDE_IMAGES_DIR, sanitized)
  await unlink(fullPath)
}

export async function renameSlideImage(oldName: string, newName: string): Promise<void> {
  const sanitizedOld = sanitizeFilename(oldName)
  const sanitizedNew = sanitizeFilename(newName)

  const oldPath = path.join(SLIDE_IMAGES_DIR, sanitizedOld)
  const newPath = path.join(SLIDE_IMAGES_DIR, sanitizedNew)

  await rename(oldPath, newPath)
}

export async function findSlidesUsingImage(filename: string): Promise<{ id: number; name: string }[]> {
  const sanitized = sanitizeFilename(filename)
  return db
    .select({ id: slides.id, name: slides.name })
    .from(slides)
    .where(or(eq(slides.image_L, sanitized), eq(slides.image_P, sanitized)))
}
