// app/db/schema/stores.ts
import { sql } from 'drizzle-orm';
import { boolean, pgTable, serial,  timestamp, varchar,check, integer } from 'drizzle-orm/pg-core';
import { users } from './users';


export const stores = pgTable('stores', {
  id: serial('id').primaryKey(),

  //این فیلد منحصرا برای مدیر فروشگاه برای دیده شدن یا نشدن فروشگاه در نظر گرفته شده
  on_air:boolean('on_air').default(false),
  
  store_name:   varchar('store_name', { length: 50 }).notNull().unique(),
  store_desc:   varchar('store_desc', { length: 500 }),
  store_about:  varchar('store_about'),

  store_manager:varchar('store_manager', { length: 150 }).notNull(),

  store_address: varchar('store_address', { length: 250 }),
  store_tell:   varchar('store_tell', { length: 11 }).notNull(),
  store_mobile: varchar('store_mobile', { length: 11 }).notNull(),
  
  created_at:  timestamp('created_at').defaultNow().notNull(),
  updated_at:  timestamp('updated_at').defaultNow().notNull(),

  //store_banknumber: varchar('store_banknumber', { length: 16 }),
  // پیشوند ir ذخیره نمیشود
  store_shaba_number: varchar('store_shaba_number', { length: 22 }),

  //is_outofaccess این فیلد مشخصا برای اعمال محدودیت و از دسترس خارج کردن فروشگاه توسط مدیر سایت طراحی شده
  is_outofaccess:    boolean('is_outofaccess').default(false),

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



