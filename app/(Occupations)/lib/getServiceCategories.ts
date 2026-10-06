// app/(Occupations)/lib/getServiceCategories.ts
// دسته بندی های فعال خدمات - در فرم ثبت خدمت و صفحه عمومی بانک مشاغل استفاده می شود

import 'server-only'

import { db } from '@/app/db'
import { serviceCategories } from '@/app/db/schema'
import { asc, eq } from 'drizzle-orm'
import type { ServiceCategory } from '@/app/db/schema'

export async function getServiceCategories(onlyActive = true): Promise<ServiceCategory[]> {
  const rows = await db
    .select()
    .from(serviceCategories)
    .where(onlyActive ? eq(serviceCategories.is_active, true) : undefined)
    .orderBy(asc(serviceCategories.name))

  return rows
}
