// app/db/schema/newsComments.ts
// دیدگاه‌های کاربران روی اخبار — فقط کاربران وارد شده به سایت
import { sql } from 'drizzle-orm';
import { check, index, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { news } from './news';
import { users } from './users';

export const newsComments = pgTable(
  'news_comments',
  {
    id: serial('id').primaryKey(),

    news_id: integer('news_id')
      .references(() => news.id, {
        onDelete: 'cascade', // با حذف خبر، دیدگاه‌های آن نیز حذف شوند
        onUpdate: 'cascade',
      })
      .notNull(),

    user_id: integer('user_id')
      .references(() => users.id, {
        onDelete: 'cascade', // با حذف کاربر، دیدگاه‌های او نیز حذف شوند
        onUpdate: 'cascade',
      })
      .notNull(),

    body: text('body').notNull(),

    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    // متن دیدگاه نباید خالی باشد
    check('news_comments_body_not_empty', sql`length(trim(${table.body})) > 0`),

    // ایندکس برای خواندن دیدگاه‌های یک خبر به ترتیب زمان
    index('news_comments_news_id_created_at_idx').on(table.news_id, table.created_at),
  ],
);

export type NewsComment = typeof newsComments.$inferSelect;
export type NewNewsComment = typeof newsComments.$inferInsert;
