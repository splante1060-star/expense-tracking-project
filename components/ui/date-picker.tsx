"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

function parseDate(value: string) {
  if (!value) return new Date();

  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function formatValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value: string) {
  if (!value) return "Select date";

  return parseDate(value).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export default function DatePicker({
  value,
  onChange,
  disabled = false,
}: DatePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = parseDate(value);

  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleClickAway = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickAway);

    return () => {
      document.removeEventListener("mousedown", handleClickAway);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startDay = firstDayOfMonth.getDay();

  const calendarStart = new Date(year, month, 1 - startDay);

  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);

    return date;
  });

  const today = new Date();

  const changeMonth = (amount: number) => {
    setViewDate((current) => {
      return new Date(current.getFullYear(), current.getMonth() + amount, 1);
    });
  };

  const selectDate = (date: Date) => {
    onChange(formatValue(date));
    setViewDate(new Date(date.getFullYear(), date.getMonth(), 1));
    setIsOpen(false);
  };

  const selectToday = () => {
    selectDate(new Date());
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Input */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;

          setViewDate(
            new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
          );

          setIsOpen((current) => !current);
        }}
        className={`flex h-11 w-full items-center gap-2.5 rounded-xl border px-3.5 text-left text-sm outline-none transition-colors ${
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500"
            : isOpen
              ? "border-(--pocket-blue) bg-white text-slate-900"
              : "border-slate-200 bg-white text-slate-900 hover:border-slate-300"
        }`}
      >
        <CalendarDays
          size={17}
          className={`shrink-0 ${
            isOpen ? "text-(--pocket-blue)" : "text-slate-400"
          }`}
        />

        <span className={value ? "" : "text-slate-400"}>
          {formatDisplayDate(value)}
        </span>
      </button>

      {/* Calendar */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
          {/* MONTH HEADER */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-900">
              {monthNames[month]} {year}
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                aria-label="Previous month"
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-(--pocket-blue-light) hover:text-(--pocket-blue)"
              >
                <ChevronLeft size={17} />
              </button>

              <button
                type="button"
                onClick={() => changeMonth(1)}
                aria-label="Next month"
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-(--pocket-blue-light) hover:text-(--pocket-blue)"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>

          {/* Week Days */}
          <div className="mt-4 grid grid-cols-7">
            {weekDays.map((day, index) => (
              <div
                key={`${day}-${index}`}
                className="flex h-8 items-center justify-center text-[11px] font-semibold text-slate-400"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7">
            {days.map((date) => {
              const inCurrentMonth = date.getMonth() === month;
              const selected = Boolean(value) && isSameDay(date, selectedDate);
              const isToday = isSameDay(date, today);

              return (
                <div
                  key={formatValue(date)}
                  className="flex h-9 items-center justify-center"
                >
                  <button
                    type="button"
                    onClick={() => selectDate(date)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                      selected
                        ? "bg-(--pocket-blue) font-bold text-white shadow-sm"
                        : isToday
                          ? "bg-(--pocket-blue-light) font-semibold text-(--pocket-blue)"
                          : inCurrentMonth
                            ? "text-slate-700 hover:bg-slate-100"
                            : "text-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {date.getDate()}
                  </button>
                </div>
              );
            })}
          </div>

          {/* FOOTER */}
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
              className="rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={selectToday}
              className="rounded-lg bg-(--pocket-blue-light) px-3 py-1.5 text-xs font-semibold text-(--pocket-blue) transition-opacity hover:opacity-70"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
