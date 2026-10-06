// app/db/schema/newsAgencies.ts
import { sql } from 'drizzle-orm';
import { boolean, check, index, integer, pgEnum, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { users } from './users';

// وضعیت خبرگزاری : inactive = ثبت شده ولی اشتراکی خریداری نشده ، pending = درخواست فعالسازی ثبت شده و در انتظار تایید مدیر ، active = فعال
export const newsAgencyStatuses = pgEnum('newsAgencyStatuses', ['inactive', 'pending', 'active']);

// بازه اشتراک خریداری شده
export const newsAgencySubscriptionPlans = pgEnum('newsAgencySubscriptionPlans', ['monthly', 'yearly']);

export const newsAgencies = pgTable(
  'news_agencies',
  {
    id: serial('id').primaryKey(),

    // این فیلد منحصرا برای مدیر خبرگزاری برای دیده شدن یا نشدن خبرگزاری در نظر گرفته شده
    on_air: boolean('on_air').default(false),

    news_agency_name:    varchar('news_agency_name', { length: 50 }).notNull().unique(),
    news_agency_manager: varchar('news_agency_manager', { length: 150 }).notNull(),

    // توضیح کوتاه (در کارت خبرگزاری نمایش داده می شود)
    news_agency_desc: varchar('news_agency_desc', { length: 200 }).notNull(),

    // اطلاعات کلی خبرگزاری (در صفحه پروفایل نمایش داده می شود)
    news_agency_about: text('news_agency_about'),

    // تصاویر خبرگزاری : نام فایل ذخیره شده در public/newsAgencyImages
    news_agency_logo:         varchar('news_agency_logo', { length: 255 }),
    news_agency_header_banner: varchar('news_agency_header_banner', { length: 255 }),

    news_agency_address: varchar('news_agency_address', { length: 250 }),

    // پیشوند 0 ذخیره نمی شود و هر دو شماره باید دقیقا 11 رقم باشند
    news_agency_tell:   varchar('news_agency_tell', { length: 11 }),
    news_agency_mobile: varchar('news_agency_mobile', { length: 11 }),
    news_agency_email:  varchar('news_agency_email', { length: 100 }),

    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),

    // is_outofaccess این فیلد مشخصا برای اعمال محدودیت و از دسترس خارج کردن خبرگزاری توسط مدیر سایت طراحی شده
    // با خارج شدن خبرگزاری از دسترس، اخبار آن نیز از دسترس خارج خواهند شد
    is_outofaccess: boolean('is_outofaccess').default(false),

    // وضعیت چرخه تاسیس و فعالسازی خبرگزاری
    news_agency_status: newsAgencyStatuses('news_agency_status').default('inactive').notNull(),

    // مدت اشتراک خریداری شده و تصویر رسید واریز بانکی
    subscription_plan:      newsAgencySubscriptionPlans('subscription_plan'),
    payment_receipt:        varchar('payment_receipt', { length: 255 }),
    activation_requested_at: timestamp('activation_requested_at'),
    activated_at:           timestamp('activated_at'),

    // خبرگزاری فقط در بازه زمانی خریداری شده توسط ادمین خبرگزاری در بخش خبرنامه دیده خواهد شد
    expired_at: timestamp('expired_at').defaultNow().notNull(),

    user_id: integer('user_id')
      .references(() => users.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      })
      .notNull()
      .unique(),
  },
  (table) => [
    check('news_agency_mobile_format', sql`${table.news_agency_mobile} ~ '^[0-9]{11}$'`),
    check('news_agency_tell_format', sql`${table.news_agency_tell} ~ '^[0-9]{11}$'`),
    // ایمیل در صورت ثبت شدن باید ساختار معتبر داشته باشد
    check(
      'news_agency_email_format',
      sql`${table.news_agency_email} IS NULL OR ${table.news_agency_email} ~ '^[^@[:space:]]+@[^@[:space:]]+\\.[^@[:space:]]+$'`,
    ),
    // فعال بودن خبرگزاری بدون تایید مدیر سایت مجاز نیست
    check(
      'news_agency_active_requires_approval',
      sql`${table.news_agency_status} <> 'active' OR ${table.activated_at} IS NOT NULL`,
    ),

    // ایندکس برای صف تایید مدیر سایت و شرط دیده شدن خبر در کوئری عمومی
    index('news_agencies_news_agency_status_idx').on(table.news_agency_status),
  ],
);

export type NewsAgency = typeof newsAgencies.$inferSelect;
export type NewNewsAgency = typeof newsAgencies.$inferInsert;