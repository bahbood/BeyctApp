'use client';

import { useMemo } from 'react';
import { jalaaliMonthLength, toJalaali } from 'jalaali-js';

interface PersianDateCMPProps {
  className?: string;
  value?: string; // YYYY/MM/DD
  onChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  name?: string;

  /** تعداد سال قبل */
  pastYears?: number;

  /** تعداد سال بعد */
  futureYears?: number;
}

const MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

const faNumber = new Intl.NumberFormat('fa-IR');

export function PersianDateCMP({
  className = '',
  value = '',
  onChange,
  required = false,
  disabled = false,
  name = 'persian-date',
  pastYears = 20,
  futureYears = 5,
}: PersianDateCMPProps) {
  const [year = '', month = '', day = ''] = value.split('/');

  const currentYear = useMemo(() => {
    return toJalaali(new Date()).jy;
  }, []);

  const years = useMemo(() => {
    return Array.from(
      { length: pastYears + futureYears + 1 },
      (_, i) => currentYear - pastYears + i
    );
  }, [currentYear, pastYears, futureYears]);

  const maxDay = useMemo(() => {
    if (!year || !month) return 31;

    return jalaaliMonthLength(
      Number(year),
      Number(month)
    );
  }, [year, month]);

  const emit = (
    y: string,
    m: string,
    d: string
  ) => {
    if (!onChange) return;

    if (!y || !m || !d) {
      onChange('');
      return;
    }

    const max = jalaaliMonthLength(
      Number(y),
      Number(m)
    );

    if (Number(d) > max) {
      onChange('');
      return;
    }

    onChange(`${y}/${m}/${d}`);
  };

  return (
    <div className={className}>
      <input
        type="hidden"
        id={name}
        name={name}
        value={value}
        readOnly
      />

      <div className="flex items-center gap-2">

        {/* Day */}

        <select
          value={day}
          disabled={disabled}
          required={required}
          className="flex-1 rounded-md border border-gray-300 px-2 py-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) =>
            emit(year, month, e.target.value)
          }
        >
          <option value="">روز</option>

          {Array.from({ length: maxDay }).map((_, i) => {
            const val = String(i + 1).padStart(2, '0');

            return (
              <option key={val} value={val}>
                {faNumber.format(i + 1)}
              </option>
            );
          })}
        </select>

        <span>/</span>

        {/* Month */}

        <select
          value={month}
          disabled={disabled}
          required={required}
          className="flex-1 rounded-md border border-gray-300 px-2 py-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => {
            const newMonth = e.target.value;

            let newDay = day;

            if (year && newMonth && day) {
              const max = jalaaliMonthLength(
                Number(year),
                Number(newMonth)
              );

              if (Number(day) > max) {
                newDay = '';
              }
            }

            emit(year, newMonth, newDay);
          }}
        >
          <option value="">ماه</option>

          {MONTHS.map((m, index) => (
            <option
              key={m}
              value={String(index + 1).padStart(2, '0')}
            >
              {m}
            </option>
          ))}
        </select>

        <span>/</span>

        {/* Year */}

        <select
          value={year}
          disabled={disabled}
          required={required}
          className="flex-1 rounded-md border border-gray-300 px-2 py-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => {
            const newYear = e.target.value;

            let newDay = day;

            if (newYear && month && day) {
              const max = jalaaliMonthLength(
                Number(newYear),
                Number(month)
              );

              if (Number(day) > max) {
                newDay = '';
              }
            }

            emit(newYear, month, newDay);
          }}
        >
          <option value="">سال</option>

          {years.map((y) => (
            <option
              key={y}
              value={String(y)}
            >
              {faNumber.format(y)}
            </option>
          ))}
        </select>

      </div>
    </div>
  );
}