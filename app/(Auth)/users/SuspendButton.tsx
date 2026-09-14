'use client'

import { useRouter } from 'next/navigation'
import { suspendUserAction } from './actions/userActions'

export default function SuspendButton({ userId, isActive }: { userId: number; isActive: boolean }) {
  const router = useRouter()

  const handleToggle = async () => {
    const confirmed = confirm(isActive ? 'آیا از غیرفعال کردن این کاربر اطمینان دارید؟' : 'آیا از فعال کردن این کاربر اطمینان دارید؟')
    if (!confirmed) return
    await suspendUserAction(userId)
    router.refresh()
  }

  return (
    <button
      onClick={handleToggle}
      className={`text-xs cursor-pointer px-2 py-1 rounded ${
        isActive
          ? 'text-red-600 hover:text-red-400 hover:bg-red-50'
          : 'text-green-600 hover:text-green-400 hover:bg-green-50'
      }`}
    >
      {isActive ? 'غیرفعال' : 'فعال'}
    </button>
  )
}
