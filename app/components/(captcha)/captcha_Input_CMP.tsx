// app/components/(captcha)/captcha_Input_CMP.tsx
"use client"

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent, useImperativeHandle, Ref } from 'react';

export interface InputCMPHandler {
  clear: () => void;
}

interface OtpInputProps {
  name: string;
  length?: number;
  onComplete?: (code: string) => void;
  onChange?: (code: string) => void;
  className?: string;
  disabled?: boolean;
  isExpired?: boolean;
  autoFocus?: boolean;
  ref?: Ref<InputCMPHandler>
}

export default function Captcha_InputCMP({
  name,
  length = 5,
  onComplete,
  onChange,
  className = '',
  disabled = false,
  autoFocus = true,
  isExpired = false,
  ref
}: OtpInputProps) {

  const isDisabled = disabled || isExpired
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const prevIsExpired = useRef(isExpired);

  useImperativeHandle(ref, () => ({
    clear: () => {
      const emptyOtp = Array(length).fill('');
      setOtp(emptyOtp);
      onChange?.('');
    }
  }), [length, onChange])

  // تنظیم focus روی اولین فیلد
  useEffect(() => {
    if (autoFocus && inputRefs.current[0] && !isDisabled) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus, isDisabled]);

  // خالی کردن فیلدها وقتی کپچا منقضی یا غیرفعال می‌شود
  useEffect(() => {
    // اگر وضعیت انقضا از false به true تغییر کرد
    if (isExpired && !prevIsExpired.current) {
      // خالی کردن تمام فیلدها
      const emptyOtp = Array(length).fill('');
      setOtp(emptyOtp);
      onChange?.(''); // اطلاع به والد که مقدار خالی شده
      
      // غیرفعال کردن focus روی فیلدها
      if (inputRefs.current[0]) {
        inputRefs.current[0]?.blur();
      }

    }
    
    // بروزرسانی مقدار قبلی
    prevIsExpired.current = isExpired;
  }, [isExpired, length, onChange]);

  // همچنین وقتی disabled تغییر می‌کند
  useEffect(() => {
    if (disabled && !isExpired) {
      const emptyOtp = Array(length).fill('');
      setOtp(emptyOtp);
      onChange?.('');
    }
  }, [disabled, length, onChange, isExpired]);

  

  // مدیریت تغییر مقدار
  const handleChange = (index: number, value: string) => {
    // اگر غیرفعال یا منقضی است، تغییری نده
    if (isDisabled) return;
    
    // فقط آخرین کاراکتر را نگه دار
    const newValue = value.slice(-1);
    
    const newOtp = [...otp];
    newOtp[index] = newValue;
    setOtp(newOtp);

    const codeString = newOtp.join('');
    onChange?.(codeString);

    // اگر فیلد پر شد، برو به فیلد بعدی
    if (newValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // اگر همه فیلدها پر شد
    if (codeString.length === length) {
      onComplete?.(codeString);
    }
  };

  // مدیریت کلید Backspace
  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // اگر فیلد خالی بود، برو به قبلی
        inputRefs.current[index - 1]?.focus();
      } else if (otp[index]) {
        // اگر مقدار داشت، پاک کن
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
        onChange?.(newOtp.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // مدیریت Paste (چسباندن همزمان)
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    // فقط اعداد را استخراج کن
    const numbers = pastedData.replace(/\D/g, '').split('');
    
    if (numbers.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < Math.min(length, numbers.length); i++) {
        newOtp[i] = numbers[i];
      }
      setOtp(newOtp);
      const codeString = newOtp.join('');
      onChange?.(codeString);
      
      // focus روی فیلد بعد از آخرین مقدار چسبانده شده
      const nextIndex = Math.min(numbers.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      
      if (codeString.length === length) {
        onComplete?.(codeString);
      }
    }
  };

  return (
    <div className={`${className}`}>
      <input type="hidden" name={name} value={otp.join('')} />
      <div dir='ltr' className={`flex w-full gap-3 justify-center`}>
        {otp.map((digit, index) => (
        
        <input
            key={index}
            ref={(ref) => { inputRefs.current[index] = ref; }}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={isDisabled}
            className={` w-1/4 aspect-square text-center text-2xl font-semibold align-baseline border border-gray-300 rounded-sm bg-white 
              focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none      transition-all duration-200
              ${isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'hover:border-gray-400'} `}
            aria-label={`رقم ${index + 1} از ${length}`}
          />

        ))}
        
      </div>

    </div>
  );
}