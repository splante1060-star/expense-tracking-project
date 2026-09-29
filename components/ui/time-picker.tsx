"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Clock3, Minus, Plus } from "lucide-react";

type TimePickerProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

type Period = "AM" | "PM";

function parseTime(value: string) {
  if (!value) {
    return {
      hour: 12,
      minute: 0,
      period: "PM" as Period,
    };
  }

  const [hourString, minuteString] = value.split(":");
  const hour24 = Number(hourString);
  const minute = Number(minuteString);

  const period: Period = hour24 >= 12 ? "PM" : "AM";
  const hour = hour24 % 12 || 12;

  return {
    hour,
    minute,
    period,
  };
}

function formatValue(hour: number, minute: number, period: Period) {
  let hour24 = hour % 12;

  if (period === "PM") {
    hour24 += 12;
  }

  return `${String(hour24).padStart(2, "0")}:${String(minute).padStart(
    2,
    "0",
  )}`;
}

function formatDisplayTime(value: string) {
  if (!value) return "Select time";

  const { hour, minute, period } = parseTime(value);

  return `${hour}:${String(minute).padStart(2, "0")} ${period}`;
}

function getCurrentTime() {
  const now = new Date();

  return `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes(),
  ).padStart(2, "0")}`;
}

export default function TimePicker({
  value,
  onChange,
  disabled = false,
}: TimePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);

  const [pickerPosition, setPickerPosition] = useState({
    top: 0,
    left: 0,
  });

  const parsedTime = parseTime(value);

  const [hour, setHour] = useState(parsedTime.hour);
  const [minute, setMinute] = useState(parsedTime.minute);
  const [period, setPeriod] = useState<Period>(parsedTime.period);

  const updatePickerPosition = () => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    const pickerWidth = 288;
    const pickerHeight = 250;
    const gap = 8;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    const openUpward = spaceBelow < pickerHeight && spaceAbove > spaceBelow;

    let left = rect.left;

    if (left + pickerWidth > window.innerWidth - 16) {
      left = window.innerWidth - pickerWidth - 16;
    }

    left = Math.max(16, left);

    setPickerPosition({
      top: openUpward ? rect.top - pickerHeight - gap : rect.bottom + gap,
      left,
    });
  };

  const togglePicker = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    const current = parseTime(value);

    setHour(current.hour);
    setMinute(current.minute);
    setPeriod(current.period);

    updatePickerPosition();
    setIsOpen(true);
  };

  const changeHour = (amount: number) => {
    setHour((current) => {
      const next = current + amount;

      if (next > 12) return 1;
      if (next < 1) return 12;

      return next;
    });
  };

  const changeMinute = (amount: number) => {
    setMinute((current) => {
      const next = current + amount;

      if (next > 59) return 0;
      if (next < 0) return 59;

      return next;
    });
  };

  const selectNow = () => {
    const now = getCurrentTime();
    const current = parseTime(now);

    setHour(current.hour);
    setMinute(current.minute);
    setPeriod(current.period);
  };

  const saveTime = () => {
    onChange(formatValue(hour, minute, period));
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickAway = (event: MouseEvent) => {
      const target = event.target as Node;

      const clickedInput = containerRef.current?.contains(target);
      const clickedPicker = pickerRef.current?.contains(target);

      if (!clickedInput && !clickedPicker) {
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

  useEffect(() => {
    if (!isOpen) return;

    const handlePositionChange = () => {
      updatePickerPosition();
    };

    window.addEventListener("resize", handlePositionChange);
    window.addEventListener("scroll", handlePositionChange, true);

    return () => {
      window.removeEventListener("resize", handlePositionChange);
      window.removeEventListener("scroll", handlePositionChange, true);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <style jsx>{`
        .pocket-time-input::-webkit-inner-spin-button,
        .pocket-time-input::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        .pocket-time-input {
          -moz-appearance: textfield;
          appearance: textfield;
        }
      `}</style>
      <button
        type="button"
        disabled={disabled}
        onClick={togglePicker}
        className={`flex h-11 w-full items-center gap-2.5 rounded-xl border px-3.5 text-left text-sm outline-none transition-colors ${
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500"
            : isOpen
              ? "border-(--pocket-blue) bg-white text-slate-900"
              : "border-slate-200 bg-white text-slate-900 hover:border-slate-300"
        }`}
      >
        <Clock3
          size={17}
          className={`shrink-0 ${
            isOpen ? "text-(--pocket-blue)" : "text-slate-400"
          }`}
        />

        <span className={value ? "" : "text-slate-400"}>
          {formatDisplayTime(value)}
        </span>
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={pickerRef}
            className="fixed z-100 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
            style={{
              top: pickerPosition.top,
              left: pickerPosition.left,
            }}
          >
            <p className="text-sm font-bold text-slate-900">Choose time</p>

            <div className="mt-4 grid grid-cols-[1fr_auto_1fr_1fr] items-center gap-2">
              {/* HOUR */}
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => changeHour(1)}
                  aria-label="Increase hour"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-(--pocket-blue-light) hover:text-(--pocket-blue)"
                >
                  <Plus size={16} />
                </button>

                <input
                  type="number"
                  min="1"
                  max="12"
                  value={String(hour).padStart(2, "0")}
                  onChange={(event) => {
                    const nextHour = Number(event.target.value);

                    if (nextHour >= 1 && nextHour <= 12) {
                      setHour(nextHour);
                    }
                  }}
                  onFocus={(event) => event.target.select()}
                  aria-label="Hour"
                  className="pocket-time-input h-12 w-14 rounded-xl border-0 bg-(--pocket-blue-light) text-center text-lg font-bold text-(--pocket-blue) outline-none transition-colors focus:ring-2 focus:ring-(--pocket-blue-soft)"
                />

                <button
                  type="button"
                  onClick={() => changeHour(-1)}
                  aria-label="Decrease hour"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-(--pocket-blue-light) hover:text-(--pocket-blue)"
                >
                  <Minus size={16} />
                </button>
              </div>

              <span className="pb-1 text-xl font-bold text-slate-400">:</span>

              {/* MINUTE */}
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => changeMinute(1)}
                  aria-label="Increase minute"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-(--pocket-blue-light) hover:text-(--pocket-blue)"
                >
                  <Plus size={16} />
                </button>

                <input
                  type="number"
                  min="0"
                  max="59"
                  value={String(minute).padStart(2, "0")}
                  onChange={(event) => {
                    const nextMinute = Number(event.target.value);

                    if (nextMinute >= 0 && nextMinute <= 59) {
                      setMinute(nextMinute);
                    }
                  }}
                  onFocus={(event) => event.target.select()}
                  aria-label="Minute"
                  className="pocket-time-input h-12 w-14 rounded-xl border-0 bg-(--pocket-blue-light) text-center text-lg font-bold text-(--pocket-blue) outline-none transition-colors focus:ring-2 focus:ring-(--pocket-blue-soft)"
                />

                <button
                  type="button"
                  onClick={() => changeMinute(-1)}
                  aria-label="Decrease minute"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-(--pocket-blue-light) hover:text-(--pocket-blue)"
                >
                  <Minus size={16} />
                </button>
              </div>

              {/* AM / PM */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setPeriod("AM")}
                  className={`h-10 rounded-xl px-3 text-xs font-bold transition-colors ${
                    period === "AM"
                      ? "bg-(--pocket-blue) text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  AM
                </button>

                <button
                  type="button"
                  onClick={() => setPeriod("PM")}
                  className={`h-10 rounded-xl px-3 text-xs font-bold transition-colors ${
                    period === "PM"
                      ? "bg-(--pocket-blue) text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  PM
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={selectNow}
                className="rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                Now
              </button>

              <button
                type="button"
                onClick={saveTime}
                className="rounded-lg bg-(--pocket-blue-light) px-3 py-1.5 text-xs font-semibold text-(--pocket-blue) transition-opacity hover:opacity-70"
              >
                Done
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
