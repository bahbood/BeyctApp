import {  getUserFromSession } from '@/app/(Auth)/lib/session'
import { redirect } from 'next/navigation'
import AddProductForm from './AddProductForm'
export const dynamic = 'force-dynamic'

async function checkStoreExist() {
  

  const userInfo = await getUserFromSession()
  if (!userInfo) return false

 
  return !!userInfo
}

export default async function AddProductPage() {
  const StoreExist = await checkStoreExist()
  if (!StoreExist) redirect('/')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/productsList" className="text-sm text-gray-500 hover:text-gray-700">بازگشت</a>
          <h2 className="text-sm font-bold text-gray-700">افزودن محصول</h2>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-6">
        <AddProductForm />
      </main>
    </div>
  )
}
