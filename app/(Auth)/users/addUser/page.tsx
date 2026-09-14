// app/(Auth)/users/addUser/page.tsx
import AddUserForm from './AddUserForm'
export const dynamic = 'force-dynamic'
export default async function AddUserPage() {
 // for admin only check in proxy

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/users" className="text-sm text-gray-500 hover:text-gray-700">بازگشت</a>
          <h2 className="text-sm font-bold text-gray-700">افزودن کاربر</h2>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-6">
        <AddUserForm />
      </main>
    </div>
  )
}
