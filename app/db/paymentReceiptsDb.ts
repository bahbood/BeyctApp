// app/db/paymentReceiptsDb.ts
import 'server-only'

import { db } from '@/app/db'
import { paymentReceipts } from '@/app/db/schema/paymentReceipts'
import { eq } from 'drizzle-orm'
import path from 'path'

export type PaymentReceiptEntity = 'news-agency' | 'store' | 'service'

function contentTypeFor(filename: string): string {
  switch (path.extname(filename).toLowerCase()) {
    case '.pdf': return 'application/pdf'
    case '.png': return 'image/png'
    case '.webp': return 'image/webp'
    case '.gif': return 'image/gif'
    case '.jpg':
    case '.jpeg': return 'image/jpeg'
    default: return 'application/octet-stream'
  }
}

export async function savePrivatePaymentReceipt(
  file: File,
  filename: string,
  entityType: PaymentReceiptEntity,
  entityId: number,
): Promise<void> {
  const data = Buffer.from(await file.arrayBuffer())
  await db.insert(paymentReceipts).values({
    filename,
    entity_type: entityType,
    entity_id: entityId,
    content_type: contentTypeFor(filename),
    data,
  })
}

export async function deletePrivatePaymentReceipt(filename: string | null | undefined): Promise<void> {
  if (!filename) return
  await db.delete(paymentReceipts).where(eq(paymentReceipts.filename, path.basename(filename)))
}

export async function getPrivatePaymentReceipt(filename: string) {
  const [receipt] = await db
    .select({
      filename: paymentReceipts.filename,
      entity_type: paymentReceipts.entity_type,
      entity_id: paymentReceipts.entity_id,
      content_type: paymentReceipts.content_type,
      data: paymentReceipts.data,
    })
    .from(paymentReceipts)
    .where(eq(paymentReceipts.filename, path.basename(filename)))
    .limit(1)
  return receipt ?? null
}
