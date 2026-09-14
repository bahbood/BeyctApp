// app/components/(captcha)/Captcha_CMP.tsx
"use client"

import { createCaptchaImageAction } from "@/app/components/(captcha)/action/createCaptchaImageAction"
import { useEffect, useState, useRef, useCallback, useImperativeHandle, Ref } from "react"

interface CaptchaData {
  captchaId: string
  image: string
}

export interface CaptchaHandler {
  clear: () => void;
}

export default function CaptchaCMP({ className, name, onCaptchaIdChange, ref }: {
  className?: string
  name: string
  onCaptchaIdChange?: (captchaId: string) => void
  ref?: Ref<CaptchaHandler>
}) {
  const [captchaData, setCaptchaData] = useState<CaptchaData>({ captchaId: '', image: '' })
  const [timeLeft, setTimeLeft] = useState(0)
  const [isExpired, setIsExpired] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [hasCaptcha, setHasCaptcha] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useImperativeHandle(ref, () => ({
    clear: () => {
      stopTimer()
      setTimeLeft(0)
      setIsExpired(true)
      setCaptchaData({ captchaId: '', image: '' })
    }
  }), [stopTimer])

  const startTimer = useCallback(() => {
    stopTimer()
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopTimer()
          setIsExpired(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [stopTimer])

  const refreshCaptcha = useCallback(async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    stopTimer()

    try {
      const newCaptcha = await createCaptchaImageAction()
      setCaptchaData(newCaptcha)
      setTimeLeft(60)
      setIsExpired(false)
      setHasCaptcha(true)
      onCaptchaIdChange?.(newCaptcha.captchaId)
      startTimer()
    } catch (error) {
      console.error("Error refreshing captcha:", error)
    } finally {
      setIsRefreshing(false)
    }
  }, [isRefreshing, onCaptchaIdChange, stopTimer, startTimer])

  const handleRefresh = () => {
    refreshCaptcha()
  }

  useEffect(() => {
    return () => {
      stopTimer()
    }
  }, [stopTimer])

  useEffect(() => {
    refreshCaptcha()
  }, [])

  

  return (
    <div className={`${className}`}>
      <input type="hidden" name={name} value={captchaData.captchaId} />
      <div className="flex flex-col w-full h-full items-center gap-1 ">
        <div dir="ltr" className="flex w-full justify-between rounded-sm">
          <button 
            className="flex w-10 aspect-square justify-evenly items-center py-1 rounded-md group bg-gray-200 hover:bg-gray-100 cursor-pointer disabled:opacity-50" 
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20mm" height="20mm" viewBox="0 0 2000 2000" 
              className={`size-6 fill-gray-600 group-hover:fill-orange-600 ${isRefreshing ? 'animate-spin' : ''}`}>
              <path d="M1568.46 1570.07c-132.25,152.4 -313.29,253.14 -513.91,284.92 -303.78,48.11 -608.55,-69.45 -801.75,-307.6l-81.91 -100.95 201.91 -163.81 81.9 100.96c134.82,166.18 347.17,248.18 559.17,214.6 151.96,-24.07 287.35,-104.51 381.07,-226.5l5.53 -7.21 -329.05 2.1 -1.65 -260.01 755.73 -4.8 4.8 755.73 -260 1.66 -1.84 -289.09z"/>
              <path d="M424.94 432.97c132.25,-152.4 313.29,-253.14 513.91,-284.92 303.78,-48.11 608.55,69.45 801.75,307.6l81.91 100.95 -201.91 163.81 -81.9 -100.96c-134.82,-166.18 -347.17,-248.18 -559.17,-214.6 -151.96,24.07 -287.35,104.51 -381.07,226.5l-5.53 7.21 329.05 -2.1 1.65 260.01 -755.73 4.8 -4.8 -755.73 260 -1.66 1.84 289.09z"/>
            </svg>
          </button>
          
          {/* نمایش پیام اگر کپچا لود نشده */}
          {!hasCaptcha && !isRefreshing && (
            <div className="w-[210px] h-10 bg-white rounded flex items-center justify-center text-xs text-gray-500">
              ← برای دریافت کد جدید کلیک کنید
            </div>
          )}
          
          {/* نمایش تصویر کپچا */}
          {hasCaptcha && captchaData.image && !isRefreshing && !isExpired && (
            <img 
              className="w-[210px] h-10 object-cover rounded" 
              src={captchaData.image} 
              alt="Captcha" 
            />
          )}
          
          {/* نمایش لودینگ */}
          {isRefreshing && ( 
         
            <div className="w-[210px] h-10 bg-gray-200 animate-pulse rounded flex items-center justify-center text-xs text-gray-500">
              در حال دریافت...
            </div>
           
           
          )}

          {isExpired && !isRefreshing && (
            <div className="w-[210px] h-10 bg-white rounded flex items-center justify-center text-xs text-gray-500">
              ← برای دریافت کد جدید کلیک کنید
            </div>
          )}
        </div>

        {/* نمایش تایمر */}
        <div id="timer" className={ `${timeLeft==0 ? "border-gray-50" : "border-gray-300" } flex w-full justify-end  border   rounded-xs`}  >
          {/* <span>اعتبار کد امنیتی   :</span>
          <span className={`${isExpired ? 'text-red-500 font-bold' : ''}`}>
            {hasCaptcha ? `${timeLeft} ثانیه` : ''}
          </span> */}
          <div  style={{width : (timeLeft*(10/6))+"%"}}  className={` h-1 bg-gray-400 rounded-xs `}  >  </div>
        </div>

      
      </div>
    </div>
  )
}