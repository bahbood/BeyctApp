// app/(Auth)/messages/actions/messagesActions.ts
// اکشن های سروری مربوط به پیام های داخلی سایت
// کاربران عادی فقط می توانند به مدیر سایت پیام بدهند و مدیر سایت می تواند به هر کاربری پیام بدهد.
'use server'

import { db } from '@/app/db'
import { messages, userRoles, users } from '@/app/db/schema'
import { and, eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { decryptSession, type SessionPayload } from '@/app/(Auth)/lib/session'
import type { MessageType } from '../lib/messagesDb'

const MAX_SUBJECT_LENGTH = 100
const MAX_BODY_LENGTH = 5000

export type MessageActionState = {
  success: boolean
  errors?: {
    receiver_id?: string
    subject?: string
    body?: string
    message?: string
  }
  values?: {
    receiver_id: string
    subject: string
    body: string
    message_type?: string
  }
} | null

/** احراز هویت کاربر جاری از روی کوکی سشن */
async function verifySession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value
  if (!sessionCookie) return null

  const payload = await decryptSession(sessionCookie)
  if (!payload || !payload.userId) return null

  return payload
}

/** مسیرهایی که پس از تغییر وضعیت پیام باید بازسازی شوند */
function revalidateMessagePaths() {
  revalidatePath('/messages')
  revalidatePath('/messages/new')
}

/**
 * ارسال پیام جدید
 * - کاربر عادی: گیرنده همیشه مدیر سایت است و مقدار ارسالی کلاینت نادیده گرفته می شود
 * - مدیر سایت: گیرنده را از بین کاربران انتخاب می کند
 */
export async function sendMessage(prevState: MessageActionState, formData: FormData): Promise<MessageActionState> {
  const session = await verifySession()
  if (!session) {
    return { success: false, errors: { message: 'نشست شما منقضی شده است، دوباره وارد شوید' } }
  }

  const isAdmin = session.role === userRoles.enumValues[0]
  const requestedReceiverId = Number(formData.get('receiver_id'))
  const subject = ((formData.get('subject') as string) || '').trim()
  const body = ((formData.get('body') as string) || '').trim()

  // پیام های ارسالی از فرم همیشه از نوع معمولی هستند.
  // پیام های سیستمی (درخواست فعالسازی و ...) فقط توسط اکشن های سمت سرور ثبت می شوند
  // تا کاربر نتواند با دستکاری فرم، پیام جعلی با نوع سیستمی بسازد.
  const messageType: MessageType = 'standard'

  const values = { receiver_id: String(requestedReceiverId || ''), subject, body, message_type: messageType }
  const errors: NonNullable<MessageActionState>['errors'] = {}

  if (subject.length > MAX_SUBJECT_LENGTH) {
    errors.subject = `موضوع پیام حداکثر ${MAX_SUBJECT_LENGTH} کاراکتر است`
  }
  if (body.length === 0) {
    errors.body = 'متن پیام را وارد کنید'
  } else if (body.length > MAX_BODY_LENGTH) {
    errors.body = `متن پیام حداکثر ${MAX_BODY_LENGTH} کاراکتر است`
  }

  // مدیر سایت می تواند به هر کاربری پیام بدهد ولی کاربر عادی فقط به مدیر سایت
  let receiverId = requestedReceiverId
  if (!isAdmin) {
    const [admin] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, userRoles.enumValues[0]))
      .orderBy(users.id)
      .limit(1)

    if (!admin) {
      return { success: false, errors: { message: 'مدیر سایت یافت نشد' }, values }
    }
    receiverId = admin.id
  } else {
    if (!requestedReceiverId || Number.isNaN(requestedReceiverId)) {
      errors.receiver_id = 'گیرنده پیام را انتخاب کنید'
    } else if (requestedReceiverId === Number(session.userId)) {
      errors.receiver_id = 'نمی توانید به خودتان پیام بدهید'
    }
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, values }
  }

  try {
    // اعتبارسنجی وجود گیرنده در سمت سرور
    const [receiverRow] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, receiverId))
      .limit(1)

    if (!receiverRow) {
      return { success: false, errors: { message: 'گیرنده پیام یافت نشد' }, values }
    }

    await db.insert(messages).values({
      sender_id: Number(session.userId),
      receiver_id: receiverId,
      subject: subject || null,
      body,
      message_type: messageType,
    })

    revalidateMessagePaths()
    return { success: true }
  } catch (error) {
    console.error('Send message error:', error)
    return { success: false, errors: { message: 'خطا در ارتباط با سرور' }, values }
  }
}

/** خوانده شدن یک پیام توسط گیرنده آن */
export async function markMessageAsRead(messageId: number): Promise<{ success: boolean }> {
  const session = await verifySession()
  if (!session) return { success: false }

  try {
    await db
      .update(messages)
      .set({ is_read: true, read_at: new Date(), updated_at: new Date() })
      .where(
        and(
          eq(messages.id, messageId),
          eq(messages.receiver_id, Number(session.userId)),
          eq(messages.is_read, false),
        )
      )

    revalidateMessagePaths()
    return { success: true }
  } catch (error) {
    console.error('Mark message as read error:', error)
    return { success: false }
  }
}

/** خوانده شدن همه پیام های دریافتی کاربر */
export async function markAllMessagesAsRead(): Promise<{ success: boolean }> {
  const session = await verifySession()
  if (!session) return { success: false }

  try {
    await db
      .update(messages)
      .set({ is_read: true, read_at: new Date(), updated_at: new Date() })
      .where(and(eq(messages.receiver_id, Number(session.userId)), eq(messages.is_read, false)))

    revalidateMessagePaths()
    return { success: true }
  } catch (error) {
    console.error('Mark all messages as read error:', error)
    return { success: false }
  }
}
