// app/(Occupations)/(OccupationsManagment)/myServices/MyServicesSection.tsx

'use client'

import FlyoutLayout from '@/app/components/(Flyouts)/FlyoutLayout'
import type { ServiceCategory } from '@/app/db/schema'
import type { ServiceListItem } from '../../lib/getServicesByUserId'
import { useState } from 'react'
import ActivationForm from './ActivationForm'
import AddServiceForm from './AddServiceForm'
import DeleteServiceForm from './DeleteServiceForm'
import EditServiceForm from './EditServiceForm'
import ToggleOnAirButton from './ToggleOnAirButton'
import { formatDate, getServiceDisplayStatus } from '../lib/serviceSubscription'

type PanelKind = 'add' | 'edit' | 'delete' | 'activation'
type Panel = { kind: PanelKind; serviceId: number | null } | null

export default function MyServicesSection({
  services,
  categories,
}: {
  services: ServiceListItem[]
  categories: ServiceCategory[]
}) {
  const [panel, setPanel] = useState<Panel>(null)

  const closeMe = () => setPanel(null)

  const selectedService =
    panel?.serviceId != null ? services.find((service) => service.id === panel.serviceId) ?? null : null

  const openPanel = (kind: PanelKind, serviceId: number | null = null) => setPanel({ kind, serviceId })

  const header = (
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-bold text-gray-700">خدمات من</h2>
      <button
        type="button"
        onClick={() => openPanel('add')}
        className="bg-sky-600 hover:bg-sky-700 text-white text-xs rounded-md px-3 py-1.5 outline-0 cursor-pointer"
      >
        + افزودن خدمت جدید
      </button>
    </div>
  )

  if (services.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        {header}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col items-center gap-3 text-gray-500">
          <span className="text-4xl">🛠️</span>
          <p className="text-sm">شما هنوز خدمتی ثبت نکرده‌اید</p>
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            می توانید چند خدمت متمایز ثبت کنید. هر خدمت پس از پرداخت اشتراک سالانه و تایید مدیر سایت در بانک مشاغل
            نمایش داده می شود.
          </p>
          <button
            type="button"
            onClick={() => openPanel('add')}
            className="mt-2 bg-sky-600 hover:bg-sky-700 text-white text-xs rounded-md px-6 py-2 outline-0 cursor-pointer"
          >
            ثبت اولین خدمت
          </button>
        </div>

        <FlyoutLayout onCloseMe={closeMe} isOpen={panel?.kind === 'add'}>
          <div className="w-full h-full overflow-y-auto bg-gray-50 p-3">
            <AddServiceForm categories={categories} />
          </div>
        </FlyoutLayout>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {header}

      <p className="text-[11px] text-gray-500 leading-relaxed">
        هر خدمت فقط پس از پرداخت اشتراک سالانه و تایید مدیر سایت نمایش داده می شود. برای نمایش یا پنهان کردن یک خدمت
        فعال می توانید از کلید «نمایش در بانک مشاغل» استفاده کنید.
      </p>

      <ul className="flex flex-col gap-3">
        {services.map((service) => {
          const status = getServiceDisplayStatus(service)
          const isPending = service.service_status === 'pending'
          const isSubscriptionActive = service.service_status === 'active' && new Date(service.expired_at) > new Date()
          const needsActivation = !isPending && !isSubscriptionActive

          return (
            <li
              key={service.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col gap-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-gray-800">{service.title}</span>
                <span className={`text-[10px] font-bold border rounded px-2 py-0.5 ${status.style}`}>
                  {status.label}
                </span>
                {service.category_name && (
                  <span className="text-[10px] text-sky-700 bg-sky-50 border border-sky-200 rounded px-2 py-0.5">
                    {service.category_name}
                  </span>
                )}
              </div>

              <p className="text-[11px] text-gray-600 leading-relaxed">{service.short_desc}</p>

              <div className="grid gap-2 text-[10px] text-gray-600 sm:grid-cols-2">
                <div className="flex items-center gap-1">
                  <span className="text-gray-400">شماره تماس ۱ :</span>
                  <span dir="ltr">{service.contact1}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-400">شماره تماس ۲ :</span>
                  <span dir="ltr">{service.contact2 ?? '-'}</span>
                </div>
                <div className="sm:col-span-2 flex items-start gap-1">
                  <span className="text-gray-400 shrink-0">آدرس دفتر :</span>
                  <span>{service.office_address}</span>
                </div>
                {service.service_status === 'active' && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">پایان اشتراک :</span>
                    <span dir="ltr">{formatDate(service.expired_at)}</span>
                  </div>
                )}
                {isPending && service.activation_requested_at && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">تاریخ درخواست :</span>
                    <span dir="ltr">{formatDate(service.activation_requested_at)}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {needsActivation && (
                  <button
                    type="button"
                    onClick={() => openPanel('activation', service.id)}
                    className="text-[10px] text-green-700 border border-green-200 hover:bg-green-50 rounded px-2 py-1 cursor-pointer"
                  >
                    {service.service_status === 'active' ? 'تمدید اشتراک سالانه' : 'فعال‌سازی اشتراک سالانه'}
                  </button>
                )}

                {isPending && (
                  <button
                    type="button"
                    onClick={() => openPanel('activation', service.id)}
                    className="text-[10px] text-amber-700 border border-amber-200 hover:bg-amber-50 rounded px-2 py-1 cursor-pointer"
                  >
                    مشاهده وضعیت درخواست
                  </button>
                )}

                {isSubscriptionActive && (
                  <ToggleOnAirButton serviceId={service.id} isOnAir={service.on_air === true} />
                )}

                <button
                  type="button"
                  onClick={() => openPanel('edit', service.id)}
                  className="text-[10px] text-sky-600 border border-sky-200 hover:bg-sky-50 rounded px-2 py-1 cursor-pointer"
                >
                  ویرایش
                </button>

                <button
                  type="button"
                  onClick={() => openPanel('delete', service.id)}
                  className="text-[10px] text-red-600 border border-red-200 hover:bg-red-50 rounded px-2 py-1 cursor-pointer"
                >
                  حذف
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      <FlyoutLayout onCloseMe={closeMe} isOpen={panel?.kind === 'add'}>
        <div className="w-full h-full overflow-y-auto bg-gray-50 p-3">
          <AddServiceForm categories={categories} />
        </div>
      </FlyoutLayout>

      <FlyoutLayout onCloseMe={closeMe} isOpen={panel?.kind === 'edit' && selectedService !== null}>
        {selectedService && (
          <div className="w-full h-full overflow-y-auto bg-gray-50 p-3">
            <EditServiceForm service={selectedService} categories={categories} onDone={closeMe} />
          </div>
        )}
      </FlyoutLayout>

      <FlyoutLayout onCloseMe={closeMe} isOpen={panel?.kind === 'delete' && selectedService !== null}>
        {selectedService && (
          <div className="w-full h-full overflow-y-auto bg-gray-50 p-3">
            <DeleteServiceForm serviceId={selectedService.id} onDone={closeMe} />
          </div>
        )}
      </FlyoutLayout>

      <FlyoutLayout onCloseMe={closeMe} isOpen={panel?.kind === 'activation' && selectedService !== null}>
        {selectedService && (
          <div className="w-full h-full overflow-y-auto bg-gray-50 p-3">
            <ActivationForm service={selectedService} onDone={closeMe} />
          </div>
        )}
      </FlyoutLayout>
    </div>
  )
}
