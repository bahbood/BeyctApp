// app/(Auth)/users/passToHash/page.tsx
'use client'

import { useState } from 'react'
import bcrypt from 'bcryptjs'
import { useRouter } from 'next/navigation'
export const dynamic = 'force-dynamic'

export default function PassToHashPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [hashedPassword, setHashedPassword] = useState('')
 
  // for admin only - check in proxy
  
  // useEffect(() => {
  //   checkRoleAuthorisation(['admin']).then((ok) => {
  //     if (!ok) router.replace('/')
  //   })
  // }, [router])

  const handleHash = async () => {
    if (!password) return
    const hash = await bcrypt.hash(password, 10)
    setHashedPassword(hash)
  }

  return (
    <div className="flex flex-col w-full gap-4 p-4 max-w-lg">
      <h1 className="text-lg font-semibold text-gray-800">تبدیل رمز به هش</h1>

      <div className="flex flex-col gap-1">
        <label className="text-right text-[10px] pr-2">گذرواژه :</label>
        <input
          type="text"
          dir="ltr"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300"
        />
      </div>

      <button
        onClick={handleHash}
        disabled={!password}
        className="block bg-sky-600 text-white w-full rounded-md px-3 pt-2 pb-2 text-center text-sm outline-0 disabled:opacity-50 cursor-pointer"
      >
        hashed
      </button>

      <div className="flex flex-col gap-1">
        <label className="text-right text-[10px] pr-2">hasedPassword :</label>
        <input
          type="text"
          dir="ltr"
          readOnly
          value={hashedPassword}
          placeholder="هش اینجا نمایش داده می‌شود"
          className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300 bg-gray-50"
        />
      </div>
    </div>
  )
}
