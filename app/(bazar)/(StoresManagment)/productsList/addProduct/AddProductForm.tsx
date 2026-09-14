'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { addProductAction, ProductActionState } from '../../action/productAction'

export default function AddProductForm() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState<ProductActionState, FormData>(addProductAction, null)

  useEffect(() => {
    if (state?.success === true) {
      router.push('/productsList')
      router.refresh()
    }
  }, [state, router])

  return (
    <form action={formAction} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col gap-4">
      <h3 className="text-sm font-bold text-gray-700 border-b pb-2">اطلاعات محصول</h3>

      <InputRow label="نام محصول" error={state?.errors?.product_name}>
        <input name="product_name" type="text" required defaultValue={state?.values?.product_name ?? ''}
          className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300" />
      </InputRow>

      <InputRow label="توضیح کوتاه">
        <input name="product_shortdesc" type="text" defaultValue={state?.values?.product_shortdesc ?? ''}
          className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300" />
      </InputRow>

      <InputRow label="توضیحات">
        <textarea name="product_desc" rows={4} defaultValue={state?.values?.product_desc ?? ''}
          className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300 resize-none" />
      </InputRow>

      <div className="grid grid-cols-3 gap-3">
        <InputRow label="قیمت" error={state?.errors?.price}>
          <input name="price" type="number" required defaultValue={state?.values?.price ?? ''}
            className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300" />
        </InputRow>

        <InputRow label="تخفیف %" error={state?.errors?.off_percent}>
          <input name="off_percent" type="number" defaultValue={state?.values?.off_percent ?? '0'}
            className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300" />
        </InputRow>

        <InputRow label="موجودی" error={state?.errors?.inventory}>
          <input name="inventory" type="number" defaultValue={state?.values?.inventory ?? '0'}
            className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300" />
        </InputRow>
      </div>

      {state?.errors?.message && (
        <pre className="text-red-700 text-[10px] text-right">{state.errors.message}</pre>
      )}

      <button type="submit" disabled={isPending}
        className="block bg-sky-600 text-white w-full rounded-md px-3 pt-2 pb-2 text-center outline-0 disabled:opacity-50 cursor-pointer">
        {isPending ? 'در حال ذخیره...' : 'افزودن محصول'}
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
