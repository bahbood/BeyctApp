// app/db/schema/products.ts
import { sql } from 'drizzle-orm';
import { boolean, decimal, pgTable, serial, text, timestamp, varchar,check, integer } from 'drizzle-orm/pg-core';
import { stores } from './stores';

export const products = pgTable('products', {
  id: serial('id').primaryKey(),

  //is_outofaccess با حارج شدن فروشگاه از دسترس محصولات هم از دسترس خارج خواهند شد و در نتیجه جستجوی محصولات دیده نخواهند شد
  is_outofaccess:    boolean('is_outofaccess').default(false),
  
  //on_air این فیلد منحصرا در اختیار مدیر فروشگاه برای دیده شدن یا نشدن محصول در نظر گرفته شده
  on_air:boolean('on_air').default(false),
  
 // اگر مقدار داشته باشد، پس از این تاریخ محصول نمایش داده نمی‌شود.
  archive_at:  timestamp('archive_at'),

  created_at:  timestamp('created_at').defaultNow().notNull(),
  updated_at:  timestamp('updated_at').defaultNow().notNull(),


  product_name: varchar('product_name', { length: 50 }).notNull(),
  product_shortdesc: varchar('product_shortdesc', { length: 100 }),
  product_desc: text('product_desc'),
  
  inventory:integer('inventory').default(0),
 
  
  price: decimal('price', { precision: 12, scale: 2 }).notNull(),
  off_percent: decimal('off_percent', { precision: 5, scale: 2 }).default('0'),
  
  // ستون تولیدشده برای قیمت نهایی
  final_price: decimal('final_price', { precision: 12, scale: 2 })
    .generatedAlwaysAs(
      sql`ROUND("price" - ("price" * "off_percent" / 100),2)`
    ),

    // کلید خارجی برای ارتباط با فروشگاه
  store_id: integer('store_id').references(() => stores.id, {
    onDelete: 'cascade', // اگر فروشگاه حذف شود، محصولات نیز حذف شوند
    onUpdate: 'cascade',
  }).notNull(),

  
}, (table) => [
  check(
    'off_percent_range',
    sql`${table.off_percent} >= 0 AND ${table.off_percent} < 100`
),
  

]);
