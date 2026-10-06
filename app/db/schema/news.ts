// app/db/schema/news.ts
import { sql } from 'drizzle-orm';
import { boolean, check, index, integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { newsAgencies } from './newsAgencies';

export const news = pgTable(
  'news',
  {
    id: serial('id').primaryKey(),

    // با خارج شدن خبرگزاری از دسترس، اخبار آن هم از دسترس خارج می شوند
    is_outofaccess: boolean('is_outofaccess').default(false),

    // on_air این فیلد منحصرا در اختیار مدیر خبرگزاری برای دیده شدن یا نشدن خبر است
    on_air: boolean('on_air').default(false),

    headline:     varchar('headline', { length: 200 }).notNull(),
    sub_headline: varchar('sub_headline', { length: 200 }),

    body: text('body').notNull(),

    // اطلاعات تکمیلی خبر
    news_category: varchar('news_category', { length: 50 }),
    news_source:   varchar('news_source', { length: 100 }),
    reporter:      varchar('reporter', { length: 150 }),

    // خبر فوری : در لیست اخبار با برچسب مشخص نمایش داده می شود
    is_breaking: boolean('is_breaking').default(false),

    // امکان ارسال دیدگاه برای این خبر (پیش فرض: فعال)
    comments_enabled: boolean('comments_enabled').default(true).notNull(),

    // شمارنده بازدید خبر
    view_count: integer('view_count').default(0).notNull(),

    // تاریخ انتشار خبر (قابل ویرایش توسط مدیر خبرگزاری)
    published_at: timestamp('published_at').defaultNow().notNull(),

    // اگر مقدار داشته باشد و گذشته باشد، خبر از بخش خبرنامه حذف می شود
    archive_at: timestamp('archive_at'),

    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),

    // کلید خارجی برای ارتباط با خبرگزاری
    news_agency_id: integer('news_agency_id')
      .references(() => newsAgencies.id, {
        onDelete: 'cascade', // با حذف خبرگزاری، اخبار آن نیز حذف شوند
        onUpdate: 'cascade',
      })
      .notNull(),
  },
  (table) => [
    // تیتر و متن خبر نباید خالی باشند
    check('news_headline_not_empty', sql`length(trim(${table.headline})) > 0`),
    check('news_body_not_empty', sql`length(trim(${table.body})) > 0`),
    check('news_view_count_not_negative', sql`${table.view_count} >= 0`),

    // ایندکس برای مرتب سازی و فیلتر کردن اخبار یک خبرگزاری
    index('news_agency_id_published_at_idx').on(table.news_agency_id, table.published_at),

    // ایندکس برای مرتب سازی لیست عمومی (جدیدترین ابتدا) و بازه زمانی انتشار
    index('news_published_at_idx').on(table.published_at),
  ],
);

export type News = typeof news.$inferSelect;
export type NewNews = typeof news.$inferInsert;