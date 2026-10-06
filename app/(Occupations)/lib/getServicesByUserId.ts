// app/(Occupations)/lib/getServicesByUserId.ts
// همه خدمات ثبت شده یک کاربر - هر کاربر می تواند چند خدمت متمایز داشته باشد

import 'server-only'

import { db } from '@/app/db'
import { serviceCategories, services } from '@/app/db/schema'
import { asc, eq } from 'drizzle-orm'
import type { Service } from '@/app/db/schema'

export type ServiceListItem = Service & { category_name: string | null }

export async function getServicesByUserId(userId: number): Promise<ServiceListItem[]> {
  return db
    .select({
      id: services.id,
      on_air: services.on_air,
      title: services.title,
      short_desc: services.short_desc,
      contact1: services.contact1,
      contact2: services.contact2,
      office_address: services.office_address,
      banner: services.banner,
      category_id: services.category_id,
      category_name: serviceCategories.name,
      created_at: services.created_at,
      updated_at: services.updated_at,
      is_outofaccess: services.is_outofaccess,
      service_status: services.service_status,
      payment_receipt: services.payment_receipt,
      activation_requested_at: services.activation_requested_at,
      activated_at: services.activated_at,
      expired_at: services.expired_at,
      user_id: services.user_id,
    })
    .from(services)
    .innerJoin(serviceCategories, eq(services.category_id, serviceCategories.id))
    .where(eq(services.user_id, userId))
    .orderBy(asc(services.created_at))
}
