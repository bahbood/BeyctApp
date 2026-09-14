// app/db/schema/users.ts
import { boolean,  pgEnum, pgTable, serial,  timestamp, varchar } from 'drizzle-orm/pg-core';

export const userRoles=pgEnum('userRoles',['admin','user']);


export const users = pgTable('users', {
  id: serial('id').primaryKey(),

  user_name: varchar('user_name', { length: 50 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(), // هش شده (مثلاً bcrypt: 60 کاراکتر)

  created_at:  timestamp('created_at').defaultNow().notNull(),
  updated_at:  timestamp('updated_at').defaultNow().notNull(),

  is_active:boolean("is_active").default(false),

   
   email:varchar('email',{length:40}),
   email_isvalid:boolean("email_isvalid").default(false),
   mobile_number:varchar('mobile_number',{length:11}).unique(),
   mobile_number_isvalid:boolean("mobile_number_isvalid").default(false),

   name:varchar('name',{ length:20}),
   family:varchar('family',{length:25}),
   avatar:varchar('avatar',{length:25}),

   role:userRoles('role').default('user'),

    store_active:boolean("store_active").default(false),
    // همیشه بصورت هش ذخیره میشود
    store_pin: varchar('store_pin', { length: 255 }),

    news_agency_active:boolean("news_agency_active").default(false),
    // همیشه بصورت هش ذخیره میشود
    news_agency_pin: varchar('news_agency_pin', { length: 255 }),

    serviceman_active:boolean("serviceman_active").default(false),
    // همیشه بصورت هش ذخیره میشود
    serviceman_pin: varchar('serviceman_pin', { length: 255 }),


});




// تایپ‌های مفید برای استفاده در برنامه
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// تایپ برای ایجاد کاربر بدون فیلدهای خودکار
export type CreateUser = Omit<NewUser, 'id' | 'created_at' | 'updated_at'>;


