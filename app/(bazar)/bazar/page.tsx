import { db } from '@/app/db'
import { stores, products } from '@/app/db/schema'
import { and, eq, lt, gt, sql } from 'drizzle-orm'
export const dynamic = 'force-dynamic'

async function getActiveProducts() {
  const now = new Date()
  return await db
    .select({
      id: products.id,
      product_name: products.product_name,
      product_shortdesc: products.product_shortdesc,
      price: products.price,
      off_percent: products.off_percent,
      final_price: products.final_price,
      inventory: products.inventory,
      store_id: products.store_id,
      store_name: stores.store_name,
    })
    .from(products)
    .innerJoin(stores, eq(products.store_id, stores.id))
    .where(
      and(
        eq(products.on_air, true),
        eq(products.is_outofaccess, false),
        eq(stores.on_air, true),
        eq(stores.is_outofaccess, false),
        lt(stores.expired_at, sql`NOW()`),
      )
    )
    .orderBy(products.created_at)
}

export default async function BazarPage() {
  const productList = await getActiveProducts()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">بازار</h1>
        <span className="text-sm text-gray-500">{productList.length} کالا</span>
      </div>

      {productList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <svg className="size-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          <span>در حال حاضر کالایی برای نمایش وجود ندارد</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {productList.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400 text-4xl">🛍️</span>
              </div>
              <div className="p-3 flex flex-col gap-1">
                <span className="text-xs text-orange-600 font-medium truncate">{product.store_name}</span>
                <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">{product.product_name}</h3>
                {product.product_shortdesc && (
                  <p className="text-[10px] text-gray-500 line-clamp-2">{product.product_shortdesc}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  {Number(product.off_percent) > 0 ? (
                    <>
                      <span className="text-xs line-through text-gray-400">{Number(product.price).toLocaleString()}</span>
                      <span className="bg-red-500 text-white text-[10px] px-1 rounded">{product.off_percent}%</span>
                    </>
                  ) : null}
                </div>
                <span className="text-sm font-bold text-green-700">
                  {Number(product.final_price).toLocaleString()} <span className="text-[10px] font-normal">تومان</span>
                </span>
                {product.inventory !== null && Number(product.inventory) <= 5 && Number(product.inventory) > 0 && (
                  <span className="text-[10px] text-orange-500">فقط {product.inventory} عدد باقیست</span>
                )}
                {Number(product.inventory) === 0 && (
                  <span className="text-[10px] text-red-500">ناموجود</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
