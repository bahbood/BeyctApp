// app/db/schema/newsImages.ts
import { sql } from 'drizzle-orm';
import { check, integer, pgTable, serial, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import { news } from './news';

export const newsImages = pgTable(
  'news_images',
  {
    id: serial('id').primaryKey(),

    image_name: varchar('image_name', { length: 120 }).notNull(),

    // ترتیب نمایش تصویر در صفحه خبر
    position: integer('position').default(0).notNull(),

    created_at: timestamp('created_at').defaultNow().notNull(),

    news_id: integer('news_id')
      .references(() => news.id, {
        onDelete: 'cascade', // با حذف خبر، تصاویر نیز حذف شوند
        onUpdate: 'cascade',
      })
      .notNull(),
  },
  (table) => [
    // هر خبر در هر پوزیشن فقط یک تصویر دارد
    uniqueIndex('news_images_news_id_position_unique').on(table.news_id, table.position),

    // سقف ۵ تصویر برای هر خبر
    check('news_images_position_range', sql`${table.position} >= 0 AND ${table.position} < 5`),
  ],
);

export type NewsImage = typeof newsImages.$inferSelect;
export type NewNewsImage = typeof newsImages.$inferInsert;