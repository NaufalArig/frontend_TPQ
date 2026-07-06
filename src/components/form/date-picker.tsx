import { useEffect, useRef } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';
import Label from '../form/Label';
import { CalenderIcon } from '@/icons';
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: Hook | Hook[];
  defaultDate?: DateOption;
  maxDate?: DateOption;
  minDate?: DateOption;
  label?: string;
  placeholder?: string;
  useTodayDefault?: boolean;
};

export default function DatePicker({
  id,
  mode,
  onChange,
  label,
  defaultDate,
  maxDate,
  minDate,
  placeholder,
  useTodayDefault = false,
}: PropsType) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputRef.current) return;

    let flatPickr: flatpickr.Instance | null = null;

    try {
      flatPickr = flatpickr(inputRef.current, {
        mode: mode || "single",
        static: false,
        monthSelectorType: "static",

        altInput: true,
        altFormat: "d / m / Y",
        dateFormat: "Y-m-d",

        defaultDate: defaultDate || (useTodayDefault ? new Date() : undefined),
        maxDate,
        minDate,
        onChange,
      });
    } catch (error) {
      console.error("Gagal memuat kalender:", error);
    }

    return () => {
      if (flatPickr) {
        flatPickr.destroy();
      }
    };
  }, [mode, onChange, id, defaultDate, maxDate, minDate, useTodayDefault]);

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border appearance-none px-4 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20"
        />
        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2">
          <CalenderIcon className="size-6" />
        </span>
      </div>
    </div>
  );
}
