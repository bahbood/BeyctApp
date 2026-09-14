"use client";

import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  KeyboardEvent,
  ClipboardEvent,
  Ref,
} from "react";

export interface InputCMPHandler {
  clear: () => void;
}

interface SplitInputProps  {
  name: string;
  length?: number;
  onComplete?: (code: string) => void;
  onChange?: (code: string) => void;
  className?: string;
  disabled?: boolean;
  isExpired?: boolean;
  autoFocus?: boolean;
  ref?: Ref<InputCMPHandler>;
}

export default function SplitInput({
  name,
  length = 5,
  onComplete,
  onChange,
  className = "",
  disabled = false,
  isExpired = false,
  autoFocus = false,
  ref,
}: SplitInputProps ) {
  const isDisabled = disabled || isExpired;

 

  const [values, setValues] = useState<string[]>(
  Array(length).fill("")
);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  //----------------------------------------------------
  // پاک کردن مقدار
  //----------------------------------------------------

  function clearValues(focus = true) {
    const empty = Array(length).fill("");

    setValues(empty);
    onChange?.("");

    if (!isDisabled && focus) {
     inputRefs.current[0]?.focus();
    inputRefs.current[0]?.select();
    }
  }

  useImperativeHandle(
  ref,
  () => ({
    clear: clearValues,
  }),
  [length, isDisabled]
);

  //----------------------------------------------------
  // Auto Focus
  //----------------------------------------------------

  useEffect(() => {
    if (autoFocus && !isDisabled) {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus, isDisabled]);

  //----------------------------------------------------
  // Disabled / Expired
  //----------------------------------------------------

  useEffect(() => {
    if (isDisabled) {
      clearValues(false);
      inputRefs.current.forEach((input) => input?.blur());
    }
  }, [isDisabled]);

  //----------------------------------------------------
  // تغییر مقدار
  //----------------------------------------------------

  function handleChange(index: number, value: string) {
    if (isDisabled) return;

    const char = value.slice(-1);

    const next = [...values];
    next[index] = char;

    setValues(next);

    const code = next.join("");

    onChange?.(code);

    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (next.every((v) => v !== "")) {
      inputRefs.current[index]?.blur();
      onComplete?.(code);
    }
  }

  //----------------------------------------------------
  // Backspace
  //----------------------------------------------------

  function handleKeyDown(
  index: number,
  e: KeyboardEvent<HTMLInputElement>
) {
  if (isDisabled) return;

  if (e.key !== "Backspace") return;

  e.preventDefault();

  const next = [...values];

  // اگر خانه مقدار دارد
  if (next[index]) {
    next[index] = "";
    setValues(next);
    onChange?.(next.join(""));

    if (index > 0) {
      inputRefs.current[index - 1]?.focus();
      inputRefs.current[index - 1]?.select();
    }

    return;
  }

  // اگر خانه خالی است
  if (index > 0) {
    next[index - 1] = "";
    setValues(next);
    onChange?.(next.join(""));

    inputRefs.current[index - 1]?.focus();
    inputRefs.current[index - 1]?.select();
  }
}

  //----------------------------------------------------
  // Paste
  //----------------------------------------------------

  function handlePaste(
    e: ClipboardEvent<HTMLInputElement>
  ) {
    if (isDisabled) return;

    e.preventDefault();

    const chars = e.clipboardData
  .getData("text")
  .slice(0, length)
  .split("");

   if (!chars.length) return;

const next = Array(length).fill("");

chars.forEach((char, index) => {
  next[index] = char;
});

    setValues(next);

    const code = next.join("");

    onChange?.(code);

    if (next.every((v) => v !== "")) {
      inputRefs.current[length - 1]?.blur();
      onComplete?.(code);
    } else {
      const nextIndex = Math.min(chars.length, length - 1);
         inputRefs.current[nextIndex]?.focus();
    }
  }

  //----------------------------------------------------
  // Render
  //----------------------------------------------------
    useEffect(() => {
   clearValues(false);
  }, [length]);

  return (
    <div className={className}>
      <input
        type="hidden"
        name={name}
        value={values.join("")}
        readOnly
      />

      <div
        dir="ltr"
        className="flex w-full justify-center gap-3"
      >
        {values.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            maxLength={1}
            autoComplete= "off"
            value={digit}
            disabled={isDisabled}
            onChange={(e) =>
              handleChange(index, e.target.value)
            }
            onKeyDown={(e) =>
              handleKeyDown(index, e)
            }
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            aria-label={`کاراکتر ${index + 1} از ${length}`}
            className={`
              w-1/4
              aspect-square
              rounded-sm
              border
              border-gray-300
              bg-white
              text-center
              text-2xl
              font-semibold
              transition-all
              duration-200
              outline-none

              focus:border-blue-500
              focus:ring-2
              focus:ring-blue-200

              ${
                isDisabled
                  ? "cursor-not-allowed bg-gray-100 opacity-50"
                  : "hover:border-gray-400"
              }
            `}
          />
        ))}
      </div>
    </div>
  );
}