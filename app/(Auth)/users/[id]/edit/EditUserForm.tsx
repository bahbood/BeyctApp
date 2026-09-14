'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { editUserAction, UserActionState } from '../../actions/userActions'

export default function EditUserForm({ user }: { user: { id: number; user_name: string; name: string | null; family: string | null; email: string | null; mobile_number: string | null; role: string | null } }) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState<UserActionState, FormData>(editUserAction, null)

  useEffect(() => {
    if (state?.success === true) {
      router.push('/users')
      router.refresh()
    }
  }, [state, router])

  return (
    <form action={formAction} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col gap-4">
      <input type="hidden" name="user_id" value={user.id} />
      <h3 className="text-sm font-bold text-gray-700 border-b pb-2">ویرایش {user.user_name}</h3>

      <InputRow label="نام کاربری" error={state?.errors?.userName}>
        <input name="userName" type="text" required dir="ltr" defaultValue={state?.values?.userName ?? user.user_name}
          className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300" />
      </InputRow>

      <InputRow label="گذرواژه جدید" error={state?.errors?.password}>
        <input name="password" type="password" dir="ltr" autoComplete="new-password" placeholder="خالی بگذارید برای عدم تغییر"
          className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300" />
      </InputRow>

      <div className="grid grid-cols-2 gap-3">
        <InputRow label="نام" error={state?.errors?.name}>
          <input name="name" type="text" defaultValue={state?.values?.name ?? user.name ?? ''}
            className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300" />
        </InputRow>

        <InputRow label="نام خانوادگی" error={state?.errors?.family}>
          <input name="family" type="text" defaultValue={state?.values?.family ?? user.family ?? ''}
            className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300" />
        </InputRow>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <InputRow label="ایمیل" error={state?.errors?.email}>
          <input name="email" type="email" dir="ltr" defaultValue={state?.values?.email ?? user.email ?? ''}
            className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300" />
        </InputRow>

        <InputRow label="موبایل" error={state?.errors?.mobile_number}>
          <input name="mobile_number" type="tel" dir="ltr" maxLength={11} defaultValue={state?.values?.mobile_number ?? user.mobile_number ?? ''}
            className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300" />
        </InputRow>
      </div>

      <InputRow label="نقش" error={state?.errors?.role}>
        <select name="role" defaultValue={state?.values?.role ?? user.role ?? 'user'}
          className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300">
          <option value="user">کاربر</option>
          <option value="admin">مدیر</option>
        </select>
      </InputRow>

      <InputRow label="پین ادمین" error={state?.errors?.admin_pin}>
        <input name="admin_pin" type="password" required dir="ltr"
          className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300" />
      </InputRow>

      {state?.errors?.message && (
        <pre className="text-red-700 text-[10px] text-right">{state.errors.message}</pre>
      )}

      <button type="submit" disabled={isPending}
        className="block bg-sky-600 text-white w-full rounded-md px-3 pt-2 pb-2 text-center outline-0 disabled:opacity-50 cursor-pointer">
        {isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
      </button>
    </form>
  )
}

function InputRow({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex w-full">
        <label className="text-right text-[10px] pr-2">{label} :</label>
        {error && <label className="text-right text-[10px] pr-2 text-red-600">{error}</label>}
      </div>
      {children}
    </div>
  )
}
