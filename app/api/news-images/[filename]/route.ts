// app/api/news-images/[filename]/route.ts
import { getNewsObject } from '@/app/(newsPaper)/(AgenciesManagement)/lib/newsObjectStorage'
import { isSafeNewsImageName } from '@/app/(newsPaper)/(AgenciesManagement)/lib/newsImagesConfig'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const contentTypes: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ filename: string }> },
) {
  const { filename } = await context.params

  // Only allow a simple image filename; never accept an object path from the URL.
  if (!isSafeNewsImageName(filename)) {
    return new Response('Not found', { status: 404 })
  }

  try {
    const object = await getNewsObject(filename)
    if (!object?.body) return new Response('Not found', { status: 404 })

    const extension = filename.slice(filename.lastIndexOf('.')).toLowerCase()
    return new Response(object.body, {
      status: 200,
      headers: {
        'Content-Type': object.headers.get('content-type') || contentTypes[extension] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('News image storage read error:', error)
    return new Response('Image storage is temporarily unavailable', { status: 503 })
  }
}
