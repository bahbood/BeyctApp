// app/(Auth)/users/page.tsx

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { checkRoleAuthorisation } from '@/app/(Auth)/lib/session'
import { db } from '@/app/db'
import { users } from '@/app/db/schema'
import { desc, ilike, or, count } from 'drizzle-orm'
import SuspendButton from './SuspendButton'

export const metadata = {
  title: 'مدیریت کاربران',
}

const PAGE_SIZE = 10

export default async function UsersListPage({ searchParams }: { searchParams: Promise<{ search?: string; page?: string }> }) {
  // for admin only - check in proxy

  const { search, page: pageStr } = await searchParams
  const currentPage = Math.max(1, Number(pageStr) || 1)
  const searchTerm = search?.trim() || ''
  const offset = (currentPage - 1) * PAGE_SIZE

  const whereClause = searchTerm
    ? or(
        ilike(users.user_name, `%${searchTerm}%`),
        ilike(users.family, `%${searchTerm}%`),
      )
    : undefined

  const [{ total }] = await db
    .select({ total: count() })
    .from(users)
    .where(whereClause)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const allUsers = await db
    .select({
      id: users.id,
      user_name: users.user_name,
      name: users.name,
      family: users.family,
      email: users.email,
      mobile_number: users.mobile_number,
      role: users.role,
      is_active: users.is_active,
      created_at: users.created_at,
    })
    .from(users)
    .where(whereClause)
    .orderBy(desc(users.created_at))
    .limit(PAGE_SIZE)
    .offset(offset)

  const baseUrl = '/users'

  function pageUrl(p: number) {
    const params = new URLSearchParams()
    if (searchTerm) params.set('search', searchTerm)
    if (p > 1) params.set('page', String(p))
    const qs = params.toString()
    return qs ? `${baseUrl}?${qs}` : baseUrl
  }

  return (
    <div className="flex flex-col w-full gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800">لیست کاربران</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{total} کاربر</span>
          <Link
            href="/users/addUser"
            className="bg-sky-600 text-white rounded-md px-3 py-1.5 text-xs hover:bg-sky-500"
          >
            + افزودن کاربر
          </Link>
        </div>
      </div>

      {/* search */}
      <form action={baseUrl} method="get" className="flex items-center gap-2">
        <input
          type="text"
          name="search"
          defaultValue={searchTerm}
          placeholder="جستجو بر اساس نام کاربری یا نام خانوادگی..."
          className="flex-1 max-w-md rounded-md border border-gray-300 px-3 py-1.5 text-xs outline-none focus:border-sky-500"
        />
        <button
          type="submit"
          className="bg-gray-200 text-gray-700 rounded-md px-3 py-1.5 text-xs hover:bg-gray-300 cursor-pointer"
        >
          جستجو
        </button>
        {searchTerm && (
          <Link href={baseUrl} className="text-xs text-red-500 hover:text-red-400 px-2 py-1.5">
            پاک کردن
          </Link>
        )}
      </form>

      {allUsers.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          {searchTerm ? 'نتیجه‌ای یافت نشد.' : 'کاربری یافت نشد.'}
        </p>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-right">
                  <th className="px-3 py-2.5 font-medium text-gray-600">ردیف</th>
                  <th className="px-3 py-2.5 font-medium text-gray-600">نام کاربری</th>
                  <th className="px-3 py-2.5 font-medium text-gray-600">نام و نام خانوادگی</th>
                  <th className="px-3 py-2.5 font-medium text-gray-600">ایمیل</th>
                  <th className="px-3 py-2.5 font-medium text-gray-600">موبایل</th>
                  <th className="px-3 py-2.5 font-medium text-gray-600">نقش</th>
                  <th className="px-3 py-2.5 font-medium text-gray-600">وضعیت</th>
                  <th className="px-3 py-2.5 font-medium text-gray-600">تاریخ عضویت</th>
                  <th className="px-3 py-2.5 font-medium text-gray-600">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-3 py-2 text-gray-500">{offset + index + 1}</td>
                    <td className="px-3 py-2 font-mono text-xs" dir="ltr">{user.user_name}</td>
                    <td className="px-3 py-2">{[user.name, user.family].filter(Boolean).join(' ') || '-'}</td>
                    <td className="px-3 py-2" dir="ltr">{user.email || '-'}</td>
                    <td className="px-3 py-2" dir="ltr">{user.mobile_number || '-'}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {user.role === 'admin' ? 'مدیر' : 'کاربر'}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${
                        user.is_active ? 'bg-green-500' : 'bg-red-400'
                      }`} />
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/users/${user.id}/edit`}
                          className="text-sky-600 hover:text-sky-400 text-xs px-2 py-1 rounded hover:bg-sky-50"
                        >
                          ویرایش
                        </Link>
                        <SuspendButton userId={user.id} isActive={!!user.is_active} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-2">
          {currentPage > 1 && (
            <Link href={pageUrl(currentPage - 1)} className="px-2.5 py-1 text-xs rounded border border-gray-300 hover:bg-gray-100">
              قبلی
            </Link>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
            .reduce<(number | 'dots')[]>((acc, p, idx, arr) => {
              if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('dots')
              acc.push(p)
              return acc
            }, [])
            .map((item, idx) =>
              item === 'dots' ? (
                <span key={`dots-${idx}`} className="px-1 text-xs text-gray-400">...</span>
              ) : (
                <Link
                  key={item}
                  href={pageUrl(item)}
                  className={`px-2.5 py-1 text-xs rounded border ${
                    item === currentPage
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {item}
                </Link>
              )
            )}

          {currentPage < totalPages && (
            <Link href={pageUrl(currentPage + 1)} className="px-2.5 py-1 text-xs rounded border border-gray-300 hover:bg-gray-100">
              بعدی
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
