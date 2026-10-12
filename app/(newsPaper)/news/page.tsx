// app/(newsPaper)/news/page.tsx

import { getUserFromSession } from '@/app/(Auth)/lib/session'
import { getPublicNewsStreamInitialState } from '@/app/(newsPaper)/lib/publicNewsDb'
import NewsStream from './NewsStream'

export const dynamic = 'force-dynamic'

export default async function PublicNewsPage() {
  const userinfo = await getUserFromSession()
  const initialState = await getPublicNewsStreamInitialState(userinfo?.id ?? null)

  return (
    <div className="w-full">
      <main className="w-full mx-auto landscape:px-4 landscape:py-6 flex flex-col gap-4">
        <NewsStream
          initialItems={initialState.items}
          initialHasOlder={initialState.hasOlder}
          initialHasNewer={initialState.hasNewer}
          isLoggedIn={!!userinfo?.id}
        />
      </main>
    </div>
  )
}
