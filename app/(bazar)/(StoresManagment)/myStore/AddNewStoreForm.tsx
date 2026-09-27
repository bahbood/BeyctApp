'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { storeActivationAction, StoreActivationState } from '../action/storeActivationAction'
import CaptchaCMP, { CaptchaHandler } from '@/app/components/(captcha)/Captcha_CMP'
import Captcha_InputCMP from '@/app/components/(captcha)/captcha_Input_CMP'

export default function AddNewStoreForm() {
  const captchaRef = useRef<CaptchaHandler>(null)
  const router = useRouter()
  const [state, formAction, isPending] = useActionState<StoreActivationState, FormData>(storeActivationAction, null)

  useEffect(() => {
    if (state?.success === true) {
      router.refresh()
    }
  }, [state, router])

  useEffect(() => {
    if (state?.success === false && state?.errors?.userCaptcha) {
      captchaRef.current?.clear()
    }
  }, [state])

  return (
    <form action={formAction} className="max-w-sm flex flex-col gap-3">
      

      <div className="flex flex-col gap-2">

        
              <label className="text-right text-[10px] pr-2"> نام فروشگاه:</label>
              { state && (
                  <div className=" h-2 w-2  bg-red-600 rounded-full"></div>
              )}
          <input id="store_name" name="store_name" type="text" placeholder="نام فروشگاه" dir="rtl"
              required maxLength={30}  defaultValue={""}
              className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300"
              //   حداکثر 30 کاراکتر   --  نام فروشگاه
          />

           <label className="text-right text-[10px] pr-2"> نام و نام خانوادگی مدیر فروشگاه:</label>
              { state && (
                  <div className=" h-2 w-2  bg-red-600 rounded-full"></div>
              )}
          <input id="store_manager" name="store_manager" type="text"   placeholder="مدیریت فروشگاه" dir="rtl"
              required maxLength={150} defaultValue={ ""}
              className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300"
              //   حداکثر 150 کاراکتر   --  نام مدیر فروشگاه
          />



           <label className="text-right text-[10px] pr-2"> تعریف کوتاه فروشگاه  :</label>
              { state && (
                  <div className=" h-2 w-2  bg-red-600 rounded-full"></div>
              )}
          <input id="store_desc" name="store_desc" type="text" placeholder="تعریف کوتاه" dir="rtl"
              required maxLength={200}  defaultValue={ ""}
              className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300"
              // حروف لاتین کوچک و بزرگ و اعداد و زیرخط و @#$%^& --- حداقل 5 و حداکثر 200 کاراکتر   --  تعریف کوتاه فروشگاه:
          />

          <label className="text-right text-[10px] pr-2"> درباره فروشگاه ( اختیاری ):</label>
              { state && (
                  <div className=" h-2 w-2  bg-red-600 rounded-full"></div>
              )}
          <input id="store_about" name="store_about" type="text" placeholder="درباره فروشگاه" 
              maxLength={500}  defaultValue={""}
              className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300"
              //  حداکثر 350 کاراکتر   --   درباره فروشگاه
          />



          <label className="text-right text-[10px] pr-2"> آدرس ( اختیاری ):</label>
              { state && (
                  <div className=" h-2 w-2  bg-red-600 rounded-full"></div>
              )}
          <input id="store_address" name="store_address" type="text" placeholder=" آدرس" 
               maxLength={200} defaultValue={""}
              className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300"
          />


          <label className="text-right text-[10px] pr-2">  تلفن ( اختیاری ):</label>
              { state && (
                  <div className=" h-2 w-2  bg-red-600 rounded-full"></div>
              )}
          <input id="store_tell" name="store_tell" type="text" placeholder=" تلفن" 
               defaultValue={ ""}
              className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300"
          />


          <label className="text-right text-[10px] pr-2"> همراه ( اختیاری ) :</label>
              { state && (
                  <div className=" h-2 w-2  bg-red-600 rounded-full"></div>
              )}
          <input id="store_mobile" name="store_mobile" type="text" placeholder="همراه مدیر " 
               defaultValue={ ""}
              className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300"
          />

           



        <CaptchaCMP className="w-full flex" name="captchaId" ref={captchaRef} />
        <Captcha_InputCMP name="userCaptchaInput" />
      </div>
      {state?.errors?.userCaptcha && (
        <span className="text-[10px] text-red-600">{state.errors.userCaptcha}</span>
      )}

      {state?.errors?.message && (
        <pre className="text-red-700 text-[10px] text-right">{state.errors.message}</pre>
      )}

      {state?.success === true && (
        <span className="text-[10px] text-green-600">اشتراک شما با موفقیت تمدید شد</span>
      )}

      <button type="submit" disabled={isPending}
        className="block bg-green-600 hover:bg-green-700 text-white w-full rounded-md px-3 pt-2 pb-2 text-center outline-0 disabled:opacity-50 cursor-pointer">
        {isPending ? 'در حال پردازش...' : 'خرید اشتراک یکساله'}
      </button>
    </form>
  )
}
