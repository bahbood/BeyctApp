// app/(Auth)/users/actions/userActions.ts
'use server'

import { db } from '@/app/db'
import { users } from '@/app/db/schema'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { decryptSession } from '@/app/(Auth)/lib/session'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

export type UserActionState = {
  success: boolean
  errors?: {
    userName?: string
    password?: string
    name?: string
    family?: string
    email?: string
    mobile_number?: string
    role?: string
    admin_pin?: string
    message?: string
  }
  values?: {
    userName: string
    name: string
    family: string
    email: string
    mobile_number: string
    role: string
  }
} | null

async function verifyAdmin() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value
  if (!sessionCookie) return null
  const payload = await decryptSession(sessionCookie)
  if (!payload || payload.role !== 'admin') return null
  return payload
}

export async function addUserAction(prevState: UserActionState, formData: FormData): Promise<UserActionState> {
  const userName = formData.get('userName') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const family = formData.get('family') as string
  const email = formData.get('email') as string
  const mobile_number = formData.get('mobile_number') as string
  const role = formData.get('role') as string
  const admin_pin = formData.get('admin_pin') as string

  const values = { userName, name, family, email, mobile_number, role: role || 'user' }

  const userName_validation = /^[a-zA-Z0-9@#$%^&]{1,20}$/.test(userName)
  const password_validation = /^[a-zA-Z0-9@#$%^&]{6,20}$/.test(password)

  if (!userName_validation || !password_validation) {
    return {
      success: false,
      errors: {
        userName: userName_validation ? undefined : 'نام کاربری بدرستی وارد نشده',
        password: password_validation ? undefined : 'گذرواژه بدرستی وارد نشده',
        message: 'مقادیر درخواستی بدرستی وارد نشده اند',
      },
      values,
    }
  }

  if (!admin_pin || !process.env.ADMIN_PIN || !(await bcrypt.compare(admin_pin, process.env.ADMIN_PIN))) {
    return {
      success: false,
      errors: { admin_pin: 'پین ادمین صحیح نیست', message: 'احراز هویت مدیر ناموفق بود' },
      values,
    }
  }

  const admin = await verifyAdmin()
  if (!admin) {
    return { success: false, errors: { message: 'دسترسی غیرمجاز' }, values }
  }

  try {
    const existing = await db.select().from(users).where(eq(users.user_name, userName)).limit(1)
    if (existing.length > 0) {
      return { success: false, errors: { message: 'نام کاربری تکراری است' }, values }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await db.insert(users).values({
      user_name: userName,
      password: hashedPassword,
      name: name || null,
      family: family || null,
      email: email || null,
      mobile_number: mobile_number || null,
      role: (role === 'admin' ? 'admin' : 'user') as 'admin' | 'user',
      is_active: true,
    })

    revalidatePath('/users')
    return { success: true }
  } catch (error) {
    console.error('Add user error:', error)
    return { success: false, errors: { message: 'خطا در ارتباط با سرور' }, values }
  }
}

export async function editUserAction(prevState: UserActionState, formData: FormData): Promise<UserActionState> {
  const userId = Number(formData.get('user_id'))
  const userName = formData.get('userName') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const family = formData.get('family') as string
  const email = formData.get('email') as string
  const mobile_number = formData.get('mobile_number') as string
  const role = formData.get('role') as string
  const admin_pin = formData.get('admin_pin') as string

  const values = { userName, name, family, email, mobile_number, role: role || 'user' }

  const userName_validation = /^[a-zA-Z0-9@#$%^&]{1,20}$/.test(userName)
  if (!userName_validation) {
    return {
      success: false,
      errors: { userName: 'نام کاربری بدرستی وارد نشده', message: 'مقادیر درخواستی بدرستی وارد نشده اند' },
      values,
    }
  }

  if (password && !/^[a-zA-Z0-9@#$%^&]{6,20}$/.test(password)) {
    return {
      success: false,
      errors: { password: 'گذرواژه بدرستی وارد نشده', message: 'مقادیر درخواستی بدرستی وارد نشده اند' },
      values,
    }
  }

  if (!admin_pin || !process.env.ADMIN_PIN || !(await bcrypt.compare(admin_pin, process.env.ADMIN_PIN))) {
    return {
      success: false,
      errors: { admin_pin: 'پین ادمین صحیح نیست', message: 'احراز هویت مدیر ناموفق بود' },
      values,
    }
  }

  const admin = await verifyAdmin()
  if (!admin) {
    return { success: false, errors: { message: 'دسترسی غیرمجاز' }, values }
  }

  try {
    const existing = await db.select().from(users).where(eq(users.id, userId)).limit(1)
    if (existing.length === 0) {
      return { success: false, errors: { message: 'کاربر یافت نشد' }, values }
    }

    if (existing[0].user_name !== userName) {
      const duplicate = await db.select().from(users).where(eq(users.user_name, userName)).limit(1)
      if (duplicate.length > 0) {
        return { success: false, errors: { message: 'نام کاربری تکراری است' }, values }
      }
    }

    const updateData: Record<string, unknown> = {
      user_name: userName,
      name: name || null,
      family: family || null,
      email: email || null,
      mobile_number: mobile_number || null,
      role: (role === 'admin' ? 'admin' : 'user') as 'admin' | 'user',
      updated_at: new Date(),
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    await db.update(users).set(updateData).where(eq(users.id, userId))

    revalidatePath('/users')
    return { success: true }
  } catch (error) {
    console.error('Edit user error:', error)
    return { success: false, errors: { message: 'خطا در ارتباط با سرور' }, values }
  }
}

export async function suspendUserAction(userId: number): Promise<{ success: boolean; message?: string }> {
  const admin = await verifyAdmin()
  if (!admin) return { success: false, message: 'دسترسی غیرمجاز' }

  try {
    const existing = await db.select().from(users).where(eq(users.id, userId)).limit(1)
    if (existing.length === 0) return { success: false, message: 'کاربر یافت نشد' }

    await db.update(users).set({ is_active: !existing[0].is_active, updated_at: new Date() }).where(eq(users.id, userId))

    revalidatePath('/users')
    return { success: true }
  } catch (error) {
    console.error('Suspend user error:', error)
    return { success: false, message: 'خطا در ارتباط با سرور' }
  }
}
