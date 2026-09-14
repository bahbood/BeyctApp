import { db } from '@/app/db'
import { products } from '@/app/db/schema'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { decryptSession } from '@/app/(Auth)/lib/session'
import { getStoreByUserId } from '../../lib/getStoreByUserId'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ToggleButton from './ToggleButton'
export const dynamic = 'force-dynamic'

async function getStoreProducts() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value
  if (!sessionCookie) return null

  const payload = await decryptSession(sessionCookie)
  if (!payload) return null

  const userId = Number(payload.userId)
  const store = await getStoreByUserId(userId)
  if (!store) return null

  const productList = await db
    .select()
    .from(products)
    .where(eq(products.store_id, store.id))
    .orderBy(products.created_at)

  return { store, products: productList }
}

export default async function ProductsListPage() {
  const data = await getStoreProducts()
  if (!data) redirect('/')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-700">مدیریت محصولات - {data.store.store_name}</h2>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">خانه</Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{data.products.length} محصول</span>
          <Link href="/productsList/addProduct"
            className="bg-sky-600 hover:bg-sky-700 text-white text-xs rounded-md px-3 py-2 outline-0">
            افزودن محصول
          </Link>
        </div>

        {data.products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <span>هنوز محصولی ثبت نکرده‌اید</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {data.products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex items-center gap-3">
                <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${product.on_air ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm font-semibold text-gray-800 truncate">{product.product_name}</span>
                    {product.is_outofaccess && (
                      <span className="text-[10px] text-red-500 border border-red-200 rounded px-1">عدم دسترسی</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-gray-500">
                    <span>قیمت: {Number(product.price).toLocaleString()} تومان</span>
                    {Number(product.off_percent) > 0 && (
                      <span>{product.off_percent}% تخفیف</span>
                    )}
                    <span>موجودی: {product.inventory}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <ToggleButton productId={product.id} isOnAir={product.on_air ?? false} />
                  <Link href={`/productsList/${product.id}/edit`}
                    className="text-[10px] text-sky-600 hover:text-sky-800 border border-sky-200 rounded px-2 py-1">
                    ویرایش
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <Link href="/storeProfile"
            className="block bg-gray-600 hover:bg-gray-700 text-white w-full rounded-md px-3 pt-2 pb-2 text-center text-xs outline-0">
            پروفایل فروشگاه
          </Link>
          <Link href="/storeActivation"
            className="block bg-green-600 hover:bg-green-700 text-white w-full rounded-md px-3 pt-2 pb-2 text-center text-xs outline-0">
            فعالسازی اشتراک
          </Link>
        </div>
      </main>
    </div>
  )
}
