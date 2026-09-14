// app/(Auth)/components/LogOut.tsx
'use client'

import { useActionState, useState, useEffect, useRef, useImperativeHandle, Ref } from "react"
import { useRouter } from "next/navigation"
import FlyoutLayout from "@/app/components/(Flyouts)/FlyoutLayout"
import { flyoutPageEnum, useFlyoutPage } from "@/app/components/(Flyouts)/(Provider)/FlyoutPageContextProvider"
import { logoutAction, LogOutState } from "./action/logOutAction"
import CaptchaCMP, { CaptchaHandler } from "@/app/components/(captcha)/Captcha_CMP"
import SplitInput from "@/app/components/(captcha)/Split_InputCMP"


export interface LogOutHandlerRef {
  openMe:()=>void,
  closeMe:()=>void,
  ToggleShow:()=>void
}

export default function LogOut({ ref }: { ref?: Ref<LogOutHandlerRef> }) {
  const { user, setUser ,CloseMe_and_Open ,messageBox_show} = useFlyoutPage()
  const [isOpen, setIsOpen] = useState(false)
  const captchaRef = useRef<CaptchaHandler>(null)

  useImperativeHandle(ref, () => ({
    openMe: () => { setIsOpen(true) },
    closeMe: () => { setIsOpen(false) },
    ToggleShow: () => { setIsOpen(!isOpen) }
  }))

  const [state, formAction, isPending] = useActionState<LogOutState | null, FormData>(
    logoutAction,
    null
  )

  const router = useRouter()

  useEffect(() => {
    if (state?.success === true) {
      setUser(null)
      router.refresh()
      setIsOpen(false)
    }
  }, [state, router, setUser])

  useEffect(() => {
    if (state?.success === false ) {
      captchaRef.current?.clear()
    }
  }, [state])

  const messageBoxShowRef = useRef(messageBox_show)
  useEffect(() => {
    messageBoxShowRef.current = messageBox_show
  })

  useEffect(() => {
    if (state?.success === false)  {
        let errorMessage:string[] =[];
        state.errors?.userCaptcha && ( errorMessage.push(state.errors?.userCaptcha))
        state.errors?.publicError && ( errorMessage.push(state.errors?.publicError))
     
        messageBoxShowRef.current("خطا", errorMessage, "error")
    }
  }, [state])

  return (
    <>
      <FlyoutLayout onCloseMe={() => { setIsOpen(!isOpen) }} isOpen={isOpen}>
        <div id="content" className="flex flex-col w-full h-full items-center gap-2">
          {/* بخش ویرایش پروفایل */}
          <div className="flex w-full justify-around items-center relative shrink-0">
            <h4>ویرایش پروفایل کاربری</h4>
          </div>
          <hr className="w-[99%] text-gray-200 shrink-0" />
          
          <div className="flex flex-col items-center landscape:w-xs portrait:w-full text-slate-800 gap-2">
            <div className="flex flex-col landscape:w-xs portrait:w-full min-h-0 items-center">
              <div className="text-sm">
                <label htmlFor="">کاربر :</label>
                <span>{user?.name + " " + user?.family}</span>
              </div>

              <div className="flex w-[95%] sm:w-[85%] gap-2 mt-1 text-sm">
                <button 
                  type="button" 
                  className="block bg-sky-600 hover:bg-sky-700 cursor-pointer text-white w-full rounded-md px-3 pt-2 pb-2 text-center outline-0"
                  onClick={() => {
                    CloseMe_and_Open(flyoutPageEnum.profile);
                  }}
                >
                  ویرایش پروفایل
                </button>
              </div>
            </div>
          </div>

          {/* بخش خروج از سایت */}
          <div className="flex w-full justify-around items-center relative shrink-0 mt-10">
            <h4>خروج از سایت</h4>
          </div>
          <hr className="w-[99%] text-gray-200 shrink-0" />

          <form action={formAction} className="flex flex-col items-center landscape:w-xs portrait:w-full text-slate-800 gap-2">
            {/* نمایش اطلاعات کاربر برای خروج */}
            <div className="flex flex-col w-[95%] sm:w-[85%] gap-1 mt-2">
              <div className="flex w-full justify-center">
                <span className="text-sm text-gray-600">
                  آیا می‌خواهید از حساب کاربری خود خارج شوید؟
                </span>
              </div>
            </div>

            {/* captcha ---------- */}
            <div className="flex flex-col w-[95%] sm:w-[85%] gap-1 mt-2">
              <div className="flex w-full">
                <label className="text-right text-[10px] pr-2">کد امنیتی :</label>
                {state?.errors?.userCaptcha && (
                  <label className="text-right text-[10px] pr-2 text-red-600">{state?.errors?.userCaptcha}</label>
                )}
              </div>

              <div className="flex flex-col w-full gap-2">
                <CaptchaCMP className="w-full flex" name="captchaId" ref={captchaRef} />
                <SplitInput name="userCaptchaInput" />
              </div>

            </div>

           

            {/* submit button */}
            <div className="flex w-[95%] sm:w-[85%] gap-2 mt-1 text-sm">
              <button
                type="submit"
                className="block bg-red-600 hover:bg-red-700 cursor-pointer text-white w-full rounded-md px-3 pt-2 pb-2 text-center outline-0 disabled:opacity-50"
                disabled={isPending}
              >
                {isPending ? "در حال خروج . . ." : "خروج از سایت"}
              </button>
            </div>

           
          </form>
        </div>
      </FlyoutLayout>
    </>
  )
}