import { redirect } from 'next/navigation'
import { checkRoleAuthorisation } from '@/app/(Auth)/lib/session'
import { db } from '@/app/db'
import { users } from '@/app/db/schema'
import { eq } from 'drizzle-orm'
import EditUserForm from './EditUserForm'

async function getUser(userId: number) {
  const result = await db
    .select({
      id: users.id,
      user_name: users.user_name,
      name: users.name,
      family: users.family,
      email: users.email,
      mobile_number: users.mobile_number,
      role: users.role,
      is_active: users.is_active,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  return result[0] || null
}

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await checkRoleAuthorisation(['admin'])
  if (!isAdmin) redirect('/')

  const { id } = await params
  const user = await getUser(Number(id))
  if (!user) redirect('/users')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/users" className="text-sm text-gray-500 hover:text-gray-700">بازگشت</a>
          <h2 className="text-sm font-bold text-gray-700">ویرایش کاربر</h2>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-6">
        <EditUserForm user={user} />
      </main>
    </div>
  )
}
