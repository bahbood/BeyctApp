// app/db/schema/paymentReceipts.ts
import { customType, index, integer, pgTable, serial, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core'

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType: () => 'bytea',
})

/**
 * رسیدهای بانکی خصوصی؛ محتوای فایل در PostgreSQL نگهداری می‌شود و هرگز
 * به‌عنوان فایل استاتیک از پوشه public ارائه نمی‌شود.
 */
export const paymentReceipts = pgTable(
  'payment_receipts',
  {
    id: serial('id').primaryKey(),
    filename: varchar('filename', { length: 255 }).notNull(),
    entity_type: varchar('entity_type', { length: 32 }).notNull(),
    entity_id: integer('entity_id').notNull(),
    content_type: varchar('content_type', { length: 100 }).notNull(),
    data: bytea('data').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('payment_receipts_filename_uidx').on(table.filename),
    index('payment_receipts_entity_idx').on(table.entity_type, table.entity_id),
  ],
)

export type PaymentReceipt = typeof paymentReceipts.$inferSelect
