// app/db/schema/productImages.ts
import { sql } from 'drizzle-orm';
import { check, integer, pgTable, serial, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import { products } from './products';

export const productImages = pgTable(
  'product_images',
  {
    id: serial('id').primaryKey(),

    image_name: varchar('image_name', { length: 120 }).notNull(),

    // ترتیب نمایش تصویر در کارت محصول
    position: integer('position').default(0).notNull(),

    created_at: timestamp('created_at').defaultNow().notNull(),

    product_id: integer('product_id')
      .references(() => products.id, {
        onDelete: 'cascade', // با حذف محصول، تصاویر نیز حذف شوند
        onUpdate: 'cascade',
      })
      .notNull(),
  },
  (table) => [
    // هر محصول در هر پوزیشن فقط یک تصویر دارد
    uniqueIndex('product_images_product_id_position_unique').on(table.product_id, table.position),

    // سقف ۳ تصویر برای هر محصول
    check(
      'product_images_position_range',
      sql`${table.position} >= 0 AND ${table.position} < 3`
    ),
  ],
);
