// app/db/schema/newsReads.ts
// ثبت خوانده شدن خبر توسط هر کاربر (برای جریان اخبار: خوانده‌نشده‌ها اول)
import { index, integer, pgTable, serial, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { news } from './news';
import { users } from './users';

export const newsReads = pgTable(
  'news_reads',
  {
    id: serial('id').primaryKey(),

    news_id: integer('news_id')
      .references(() => news.id, {
        onDelete: 'cascade', // با حذف خبر، رکوردهای خوانده شدن آن نیز حذف شوند
        onUpdate: 'cascade',
      })
      .notNull(),

    user_id: integer('user_id')
      .references(() => users.id, {
        onDelete: 'cascade', // با حذف کاربر، رکوردهای او نیز حذف شوند
        onUpdate: 'cascade',
      })
      .notNull(),

    read_at: timestamp('read_at').defaultNow().notNull(),
  },
  (table) => [
    // هر کاربر برای هر خبر تنها یک رکورد خوانده شدن دارد
    uniqueIndex('news_reads_news_id_user_id_unique').on(table.news_id, table.user_id),
    // یافتن سریع خبرهای خوانده‌شده یک کاربر
    index('news_reads_user_id_read_at_idx').on(table.user_id, table.read_at),
  ],
);

export type NewsRead = typeof newsReads.$inferSelect;
export type NewNewsRead = typeof newsReads.$inferInsert;
