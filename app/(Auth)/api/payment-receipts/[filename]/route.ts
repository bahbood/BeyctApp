// app/(Auth)/api/payment-receipts/[filename]/route.ts
import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { getUserFromSession } from '@/app/(Auth)/lib/session'
import { db } from '@/app/db'
import { newsAgencies, stores, services, userRoles } from '@/app/db/schema'
import { getPrivatePaymentReceipt } from '@/app/db/paymentReceiptsDb'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  _request: Request,
  context: { params: Promise<{ filename: string }> },
) {
  const user = await getUserFromSession()
  if (!user?.id) return new NextResponse('Unauthorized', { status: 401 })

  const { filename } = await context.params
  if (!filename || filename !== decodeURIComponent(filename) || filename.includes('/') || filename.includes('\\')) {
    return new NextResponse('Not found', { status: 404 })
  }

  const receipt = await getPrivatePaymentReceipt(filename)
  if (!receipt) return new NextResponse('Not found', { status: 404 })

  let isOwner = false
  if (receipt.entity_type === 'news-agency') {
    const [row] = await db.select({ id: newsAgencies.id }).from(newsAgencies)
      .where(and(eq(newsAgencies.id, receipt.entity_id), eq(newsAgencies.user_id, Number(user.id)))).limit(1)
    isOwner = Boolean(row)
  } else if (receipt.entity_type === 'store') {
    const [row] = await db.select({ id: stores.id }).from(stores)
      .where(and(eq(stores.id, receipt.entity_id), eq(stores.user_id, Number(user.id)))).limit(1)
    isOwner = Boolean(row)
  } else if (receipt.entity_type === 'service') {
    const [row] = await db.select({ id: services.id }).from(services)
      .where(and(eq(services.id, receipt.entity_id), eq(services.user_id, Number(user.id)))).limit(1)
    isOwner = Boolean(row)
  }

  const isAdmin = user.role === userRoles.enumValues[0]
  if (!isAdmin && !isOwner) return new NextResponse('Forbidden', { status: 403 })

  return new NextResponse(new Uint8Array(receipt.data), {
    status: 200,
    headers: {
      'Content-Type': receipt.content_type,
      'Content-Length': String(receipt.data.length),
      'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(receipt.filename)}`,
      'Cache-Control': 'private, no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
    },
  })
}
