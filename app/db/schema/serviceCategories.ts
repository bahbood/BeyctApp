// app/db/schema/serviceCategories.ts
// دسته بندی خدمات : هر خدمت باید دقیقاً یک دسته بندی داشته باشد
import { boolean, pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';

export const serviceCategories = pgTable('service_categories', {
  id: serial('id').primaryKey(),

  name: varchar('name', { length: 50 }).notNull().unique(),

  // دسته بندی غیرفعال از فرم ثبت خدمت حذف می شود ولی رکوردهای موجود باقی می مانند
  is_active: boolean('is_active').default(true).notNull(),

  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type NewServiceCategory = typeof serviceCategories.$inferInsert;
