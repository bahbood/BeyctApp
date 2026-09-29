// app/(Auth)/messages/lib/messagesDb.ts
// لایه دسترسی به داده های پیام ها

import { db } from '@/app/db'
import { messages, users, userRoles } from '@/app/db/schema'
import { and, count, desc, eq, ilike, ne, or, type SQL } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'

export const MESSAGES_PAGE_SIZE = 10

export type MessageBox = 'inbox' | 'sent'

/** نام نمایشی کاربر (نام + نام خانوادگی) و در صورت خالی بودن نام کاربری */
export function displayName(user: { name?: string | null; family?: string | null; user_name?: string | null }): string {
  const full = [user.name, user.family].filter(Boolean).join(' ').trim()
  return full || user.user_name || ''
}

const sender = alias(users, 'sender')
const receiver = alias(users, 'receiver')

const messageColumns = {
  id: messages.id,
  subject: messages.subject,
  body: messages.body,
  is_read: messages.is_read,
  read_at: messages.read_at,
  created_at: messages.created_at,
  sender_id: messages.sender_id,
  receiver_id: messages.receiver_id,
  sender_name: sender.name,
  sender_family: sender.family,
  sender_user_name: sender.user_name,
  sender_role: sender.role,
  receiver_name: receiver.name,
  receiver_family: receiver.family,
  receiver_user_name: receiver.user_name,
  receiver_role: receiver.role,
}

/**
 * تعداد پیام های خوانده نشده کاربر - برای نمایش نشانگر پیام جدید در هدر
 */
export async function getUnreadMessagesCount(userId: number): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(messages)
    .where(and(eq(messages.receiver_id, userId), eq(messages.is_read, false)))

  return row?.total ?? 0
}

/**
 * لیست پیام های کاربر - صندوق ورودی (دریافتی) یا صندوق ارسال (ارسالی)
 */
export async function getMessagesList(
  userId: number,
  options: { box: MessageBox; search?: string; page?: number; pageSize?: number } = { box: 'inbox' }
) {
  const { box, search = '', page = 1, pageSize = MESSAGES_PAGE_SIZE } = options
  const offset = (Math.max(1, page) - 1) * pageSize

  const searchTerm = search.trim()
  const searchFilter: SQL | undefined = searchTerm
    ? or(
        ilike(messages.subject, `%${searchTerm}%`),
        ilike(messages.body, `%${searchTerm}%`),
        ilike(sender.name, `%${searchTerm}%`),
        ilike(sender.family, `%${searchTerm}%`),
        ilike(sender.user_name, `%${searchTerm}%`),
        ilike(receiver.name, `%${searchTerm}%`),
        ilike(receiver.family, `%${searchTerm}%`),
        ilike(receiver.user_name, `%${searchTerm}%`),
      )
    : undefined

  const boxFilter = eq(box === 'sent' ? messages.sender_id : messages.receiver_id, userId)
  const where = searchFilter ? and(boxFilter, searchFilter) : boxFilter

  const [{ total }] = await db
    .select({ total: count() })
    .from(messages)
    .innerJoin(sender, eq(messages.sender_id, sender.id))
    .innerJoin(receiver, eq(messages.receiver_id, receiver.id))
    .where(where)

  const rows = await db
    .select(messageColumns)
    .from(messages)
    .innerJoin(sender, eq(messages.sender_id, sender.id))
    .innerJoin(receiver, eq(messages.receiver_id, receiver.id))
    .where(where)
    .orderBy(desc(messages.created_at))
    .limit(pageSize)
    .offset(offset)

  return { rows, total: total ?? 0 }
}

/**
 * یک پیام به همراه اطلاعات فرستنده و گیرنده - فقط اگر کاربر ارسال کننده یا گیرنده باشد
 */
export async function getMessageForUser(messageId: number, userId: number) {
  const [row] = await db
    .select(messageColumns)
    .from(messages)
    .innerJoin(sender, eq(messages.sender_id, sender.id))
    .innerJoin(receiver, eq(messages.receiver_id, receiver.id))
    .where(
      and(
        eq(messages.id, messageId),
        or(eq(messages.sender_id, userId), eq(messages.receiver_id, userId)),
      )
    )
    .limit(1)

  return row ?? null
}

/**
 * فهرست کاربرانی که مدیر سایت می تواند برای آنها پیام ارسال کند (بدون خودش)
 */
export async function getMessageRecipients(currentUserId: number) {
  return await db
    .select({
      id: users.id,
      name: users.name,
      family: users.family,
      user_name: users.user_name,
      role: users.role,
      is_active: users.is_active,
    })
    .from(users)
    .where(ne(users.id, currentUserId))
    .orderBy(users.user_name)
}

/**
 * مدیر سایت - گیرنده ثابت پیام های کاربران عادی
 */
export async function getAdminUser() {
  const [admin] = await db
    .select({ id: users.id, name: users.name, family: users.family, user_name: users.user_name })
    .from(users)
    .where(eq(users.role, userRoles.enumValues[0]))
    .orderBy(users.id)
    .limit(1)

  return admin ?? null
}
