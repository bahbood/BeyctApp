// app/db/schema/messages.ts
// پیام های داخلی سایت - هر کاربر می تواند پیام بفرستد
// کاربران عادی فقط مجاز به ارسال پیام به مدیر سایت هستند و مدیر سایت می تواند به هر کاربری پیام بدهد.
import { sql } from 'drizzle-orm';
import { boolean, check, integer, pgEnum, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { users } from './users';

// دسته بندی انواع پیام ها
export const messageTypes = pgEnum('messageTypes', [
  'standard', // پیام های معمولی
  'store_activation_request', // درخواست فعال سازی فروشگاه
  'service_activation_request', // درخواست فعال سازی خدمات
  'news_agency_request', // درخواست آژانس خبری
]);

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),

  // ارسال کننده پیام
  sender_id: integer('sender_id')
    .references(() => users.id, {
      onDelete: 'cascade', // اگر کاربر حذف شود، پیام های او نیز حذف شوند
      onUpdate: 'cascade',
    })
    .notNull(),

  // گیرنده پیام
  receiver_id: integer('receiver_id')
    .references(() => users.id, {
      onDelete: 'cascade', // اگر کاربر حذف شود، پیام های او نیز حذف شوند
      onUpdate: 'cascade',
    })
    .notNull(),

  subject: varchar('subject', { length: 100 }),
  body: text('body').notNull(),

  // نوع پیام
  message_type: messageTypes('message_type').default('standard').notNull(),

  // وضعیت خوانده شدن پیام توسط گیرنده
  is_read: boolean('is_read').default(false).notNull(),
  read_at: timestamp('read_at'),

  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  // کاربر نمی تواند به خودش پیام بدهد
  check('messages_sender_not_receiver', sql`${table.sender_id} <> ${table.receiver_id}`),
  // متن پیام نباید خالی باشد
  check('messages_body_not_empty', sql`length(trim(${table.body})) > 0`),
]);

// تایپ‌های مفید برای استفاده در برنامه
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
