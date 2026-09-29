// app/db/schema/stores.ts
import { sql } from 'drizzle-orm';
import { boolean, check, integer, pgEnum, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { users } from './users';

// وضعیت فروشگاه : inactive = ثبت شده ولی اشتراکی خریداری نشده ، pending = درخواست فعالسازی ثبت شده و در انتظار تایید مدیر ، active = فعال
export const storeStatuses = pgEnum('storeStatuses', ['inactive', 'pending', 'active']);

// بازه اشتراک خریداری شده
export const storeSubscriptionPlans = pgEnum('storeSubscriptionPlans', ['monthly', 'yearly']);


export const stores = pgTable('stores', {
  id: serial('id').primaryKey(),

  //این فیلد منحصرا برای مدیر فروشگاه برای دیده شدن یا نشدن فروشگاه در نظر گرفته شده
  on_air:boolean('on_air').default(false),
  
  store_name:   varchar('store_name', { length: 30 }).notNull().unique(),
  store_manager:varchar('store_manager', { length: 150 }).notNull(),
  store_desc:   varchar('store_desc', { length: 200 }).notNull(),
  store_about:  text('store_about'),

  // تصاویر فروشگاه : نام فایل ذخیره شده در public/storeImages
  store_logo:         varchar('store_logo', { length: 255 }),
  store_header_banner:varchar('store_header_banner', { length: 255 }),

  store_address: varchar('store_address', { length: 250 }),
  store_tell:   varchar('store_tell', { length: 11 }),
  store_mobile: varchar('store_mobile', { length: 11 }),
  
  created_at:  timestamp('created_at').defaultNow().notNull(),
  updated_at:  timestamp('updated_at').defaultNow().notNull(),

  //store_banknumber: varchar('store_banknumber', { length: 16 }),
  // پیشوند ir ذخیره نمیشود
  store_shaba_number: varchar('store_shaba_number', { length: 22 }),

  //is_outofaccess این فیلد مشخصا برای اعمال محدودیت و از دسترس خارج کردن فروشگاه توسط مدیر سایت طراحی شده
  is_outofaccess:    boolean('is_outofaccess').default(false),

  // وضعیت چرخه تاسیس و فعالسازی فروشگاه
  store_status: storeStatuses('store_status').default('inactive').notNull(),

  // مدت اشتراک خریداری شده و تصویر رسید واریز بانکی
  subscription_plan:      storeSubscriptionPlans('subscription_plan'),
  payment_receipt:        varchar('payment_receipt', { length: 255 }),
  activation_requested_at:timestamp('activation_requested_at'),
  activated_at:           timestamp('activated_at'),

  //expired_at فروشگاه  فقط در بازه زمانی خریداری شده توسط ادمین فروشگاه دیده خواهد شد
  expired_at:timestamp('expired_at').defaultNow().notNull(),

  user_id: integer('user_id').references(() => users.id, {
    onDelete: 'cascade',
    onUpdate: 'cascade',
  })
  .notNull()
  .unique(),
 
}
, (table) => [
  check(
  'store_mobile_format',
  sql`${table.store_mobile} ~ '^[0-9]{11}$'`
),
check(
  'store_tell_format',
  sql`${table.store_tell} ~ '^[0-9]{11}$'`
),
check(
  'store_shaba_number_format',
  sql`${table.store_shaba_number} ~ '^[0-9]{22}$'`
),
]);


export type Store = typeof stores.$inferSelect;
export type NewStore = typeof stores.$inferInsert;



