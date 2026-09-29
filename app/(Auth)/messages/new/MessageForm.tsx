// app/(Auth)/messages/new/MessageForm.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useEffect } from 'react'
import { sendMessage, type MessageActionState } from '../actions/messagesActions'

const MAX_SUBJECT_LENGTH = 100
const MAX_BODY_LENGTH = 5000

export default function MessageForm({
  recipients,
  fixedReceiver = false,
}: {
  recipients: { id: number; label: string }[]
  fixedReceiver?: boolean
}) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState<MessageActionState, FormData>(sendMessage, null)

  useEffect(() => {
    if (state?.success === true) {
      router.push('/messages')
      router.refresh()
    }
  }, [state, router])

  return (
    <form action={formAction} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col gap-4">
      <h3 className="text-sm font-bold text-gray-700 border-b pb-2">متن پیام</h3>

      <InputRow label="گیرنده" error={state?.errors?.receiver_id}>
        {fixedReceiver ? (
          // کاربران عادی فقط به مدیر سایت پیام می دهند
          <>
            <input type="hidden" name="receiver_id" value={recipients[0]?.id ?? ''} />
            <p className="block w-full rounded-md px-3 pt-3 pb-2 text-xs bg-gray-50 text-gray-600">
              {recipients[0]?.label}
            </p>
          </>
        ) : (
          <select
            name="receiver_id"
            required
            defaultValue={state?.values?.receiver_id ?? ''}
            className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300"
          >
            <option value="" disabled>
              کاربر مورد نظر را انتخاب کنید...
            </option>
            {recipients.map((recipient) => (
              <option key={recipient.id} value={recipient.id}>
                {recipient.label}
              </option>
            ))}
          </select>
        )}
      </InputRow>

      <InputRow label="موضوع" error={state?.errors?.subject}>
        <input
          name="subject"
          type="text"
          maxLength={MAX_SUBJECT_LENGTH}
          defaultValue={state?.values?.subject ?? ''}
          placeholder="موضوع پیام (اختیاری)"
          className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300"
        />
      </InputRow>

      <InputRow label="متن پیام" error={state?.errors?.body}>
        <textarea
          name="body"
          required
          rows={10}
          maxLength={MAX_BODY_LENGTH}
          defaultValue={state?.values?.body ?? ''}
          placeholder="متن پیام خود را بنویسید..."
          className="block w-full rounded-md px-3 pt-3 pb-2 text-xs leading-6 outline-1 outline-gray-300 resize-y"
        />
      </InputRow>

      {state?.errors?.message && (
        <pre className="text-red-700 text-[10px] text-right">{state.errors.message}</pre>
      )}

      <button
        type="submit"
        disabled={isPending || recipients.length === 0}
        className="block bg-sky-600 text-white w-full rounded-md px-3 pt-2 pb-2 text-center outline-0 disabled:opacity-50 cursor-pointer"
      >
        {isPending ? 'در حال ارسال...' : 'ارسال پیام'}
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
