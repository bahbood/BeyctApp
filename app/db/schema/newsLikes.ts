// app/db/schema/newsLikes.ts
// پسند (لایک) اخبار توسط کاربران وارد شده به سایت
import { integer, pgTable, serial, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { news } from './news';
import { users } from './users';

export const newsLikes = pgTable(
  'news_likes',
  {
    id: serial('id').primaryKey(),

    news_id: integer('news_id')
      .references(() => news.id, {
        onDelete: 'cascade', // با حذف خبر، پسندهای آن نیز حذف شوند
        onUpdate: 'cascade',
      })
      .notNull(),

    user_id: integer('user_id')
      .references(() => users.id, {
        onDelete: 'cascade', // با حذف کاربر، پسندهای او نیز حذف شوند
        onUpdate: 'cascade',
      })
      .notNull(),

    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    // هر کاربر برای هر خبر تنها یک پسند می تواند ثبت کند
    // (ستون اول همین ایندکس، شمارش پسندهای یک خبر را هم پوشش می دهد)
    uniqueIndex('news_likes_news_id_user_id_unique').on(table.news_id, table.user_id),
  ],
);

export type NewsLike = typeof newsLikes.$inferSelect;
export type NewNewsLike = typeof newsLikes.$inferInsert;