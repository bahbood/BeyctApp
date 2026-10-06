// app/db/schema/services.ts
import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { serviceCategories } from './serviceCategories';

/**
 * وضعیت خدمت :
 * inactive = ثبت شده ولی اشتراک سالانه خریداری نشده
 * pending  = درخواست فعالسازی ثبت شده و در انتظار تایید مدیر سایت
 * active   = فعال (پس از پرداخت اشتراک سالانه و تایید مدیر)
 */
export const serviceStatuses = pgEnum('serviceStatuses', ['inactive', 'pending', 'active']);

export const services = pgTable(
  'services',
  {
    id: serial('id').primaryKey(),

    // این فیلد منحصرا برای صاحب خدمت برای دیده شدن یا نشدن خدمت در بانک مشاغل در نظر گرفته شده
    on_air: boolean('on_air').default(false),

    title: varchar('title', { length: 100 }).notNull(),
    short_desc: varchar('short_desc', { length: 200 }).notNull(),

    // شماره تماس ۱ اجباری و شماره تماس ۲ اختیاری است - پیشوند 0 ذخیره نمی شود و باید دقیقا 11 رقم باشد
    contact1: varchar('contact1', { length: 11 }).notNull(),
    contact2: varchar('contact2', { length: 11 }),

    office_address: varchar('office_address', { length: 250 }).notNull(),

    // بنر اختیاری : نام فایل ذخیره شده در public/serviceImages
    banner: varchar('banner', { length: 255 }),

    category_id: integer('category_id')
      .references(() => serviceCategories.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      })
      .notNull(),

    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),

    // is_outofaccess این فیلد مشخصا برای اعمال محدودیت و از دسترس خارج کردن خدمت توسط مدیر سایت طراحی شده
    is_outofaccess: boolean('is_outofaccess').default(false),

    // وضعیت چرخه فعالسازی خدمت
    service_status: serviceStatuses('service_status').default('inactive').notNull(),

    // تصویر رسید واریز اشتراک سالانه
    payment_receipt: varchar('payment_receipt', { length: 255 }),
    activation_requested_at: timestamp('activation_requested_at'),
    activated_at: timestamp('activated_at'),

    // خدمت فقط در بازه اشتراک خریداری شده در بانک مشاغل دیده خواهد شد
    expired_at: timestamp('expired_at').defaultNow().notNull(),

    // هر کاربر می تواند چند خدمت متمایز داشته باشد (بر خلاف فروشگاه و خبرگزاری یکی نیست)
    user_id: integer('user_id').references(() => users.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }).notNull(),
  },
  (table) => [
    check('service_contact1_format', sql`${table.contact1} ~ '^[0-9]{11}$'`),
    check('service_contact2_format', sql`${table.contact2} IS NULL OR ${table.contact2} ~ '^[0-9]{11}$'`),
    // فعال بودن خدمت بدون تایید مدیر سایت مجاز نیست
    check('service_active_requires_approval', sql`${table.service_status} <> 'active' OR ${table.activated_at} IS NOT NULL`),
    // هر کاربر نمی تواند دو خدمت با عنوان یکسان داشته باشد (خدمات متمایز)
    uniqueIndex('services_user_title_unique').on(table.user_id, table.title),
    // ایندکس برای صف تایید مدیر سایت و کوئری عمومی بانک مشاغل
    index('services_service_status_idx').on(table.service_status),
  ],
);

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
