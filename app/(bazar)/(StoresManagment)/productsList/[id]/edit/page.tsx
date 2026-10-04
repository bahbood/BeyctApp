import { db } from '@/app/db'
import { products, productImages } from '@/app/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import {  getUserFromSession } from '@/app/(Auth)/lib/session'
import { getStoreByUserId } from '../../../../lib/getStoreByUserId'
import {  redirect } from 'next/navigation'
import EditProductForm from './EditProductForm'
import { toJalaaliInput } from '@/app/lib/jalaliDate'
import { productImageUrl } from '../../../lib/productImagesDb'

async function getProduct(productId: number) {
  const userinfo=await getUserFromSession()
 
   const userId = userinfo?.id
  
   if( !userId )
   {
     return null
   }
   

  const store = await getStoreByUserId(userId)
  if (!store) return null

  const result = await db
    .select()
    .from(products)
    .where(and(eq(products.id, productId), eq(products.store_id, store.id)))
    .limit(1)

  const product = result[0] || null
  if (!product) return null

  const images = await db
    .select()
    .from(productImages)
    .where(eq(productImages.product_id, product.id))
    .orderBy(asc(productImages.position))

  return {
    ...product,
    images: images.map((image) => ({ ...image, url: productImageUrl(image.image_name) })),
  }
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProduct(Number(id))
  if (!product) redirect('/productsList')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/productsList" className="text-sm text-gray-500 hover:text-gray-700">بازگشت</a>
          <h2 className="text-sm font-bold text-gray-700">ویرایش محصول</h2>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-6">
        <EditProductForm
          product={{
            ...product,
            registered_at_input: toJalaaliInput(product.registered_at),
            archive_at_input: toJalaaliInput(product.archive_at),
          }}
        />
      </main>
    </div>
  )
}
