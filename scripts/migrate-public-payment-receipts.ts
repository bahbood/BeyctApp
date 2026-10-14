// scripts/migrate-public-payment-receipts.ts
// Run this BEFORE deploying the private-receipt change if legacy receipt files
// still exist on the same server as the database:
//   npx tsx scripts/migrate-public-payment-receipts.ts
import 'dotenv/config'
import { access, readFile, unlink } from 'node:fs/promises'
import path from 'node:path'
import { and, eq } from 'drizzle-orm'
import { db } from '../app/db'
import { newsAgencies, stores, services, paymentReceipts } from '../app/db/schema'

const roots = {
  'news-agency': path.join(process.cwd(), 'public', 'newsAgencyImages'),
  store: path.join(process.cwd(), 'public', 'storeImages'),
  service: path.join(process.cwd(), 'public', 'serviceImages'),
} as const

function contentType(filename: string) {
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

async function exists(filename: string) {
  try { await access(filename); return true } catch { return false }
}

async function migrate(
  entityType: keyof typeof roots,
  rows: Array<{ id: number; payment_receipt: string | null }>,
) {
  for (const row of rows) {
    const filename = row.payment_receipt
    if (!filename || path.basename(filename) !== filename) continue

    const [alreadyStored] = await db.select({ id: paymentReceipts.id })
      .from(paymentReceipts).where(eq(paymentReceipts.filename, filename)).limit(1)
    if (alreadyStored) continue

    const legacyPath = path.join(roots[entityType], filename)
    if (!(await exists(legacyPath))) {
      console.warn(`Missing legacy file: ${entityType} #${row.id} / ${filename}`)
      continue
    }

    const data = await readFile(legacyPath)
    await db.insert(paymentReceipts).values({
      filename,
      entity_type: entityType,
      entity_id: row.id,
      content_type: contentType(filename),
      data,
    })
    await unlink(legacyPath)
    console.info(`Migrated ${entityType} receipt for #${row.id}`)
  }
}

async function main() {
  const [agencyRows, storeRows, serviceRows] = await Promise.all([
    db.select({ id: newsAgencies.id, payment_receipt: newsAgencies.payment_receipt }).from(newsAgencies),
    db.select({ id: stores.id, payment_receipt: stores.payment_receipt }).from(stores),
    db.select({ id: services.id, payment_receipt: services.payment_receipt }).from(services),
  ])
  await migrate('news-agency', agencyRows)
  await migrate('store', storeRows)
  await migrate('service', serviceRows)
}

main().catch((error) => {
  console.error('Receipt migration failed:', error)
  process.exitCode = 1
})
