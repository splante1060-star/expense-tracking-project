"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

type DashboardHeaderProps = {
  firstName: string;
  selectedMonth: Date;
};

export default function DashboardHeader({
  firstName,
  selectedMonth,
}: DashboardHeaderProps) {
  const router = useRouter();

  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const monthLabel = selectedMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const changeMonth = (offset: number) => {
    const nextMonth = new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth() + offset,
      1,
    );

    const year = nextMonth.getFullYear();
    const month = String(nextMonth.getMonth() + 1).padStart(2, "0");

    router.push(`/dashboard?month=${year}-${month}`);
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
          {greeting}, {firstName} 👋
        </h1>

        <p className="mt-1 text-sm text-slate-600 lg:text-base">
          Here&apos;s where your money stands this month.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/transaction/create"
          className="group inline-flex h-10 items-center justify-center gap-2 rounded-full bg-(--pocket-blue) px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-(--pocket-blue-dark)"
        >
          <Plus size={16} />
          Add Transaction
        </Link>

        <div className="flex h-9 items-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => changeMonth(-1)}
            className="flex h-full w-9 items-center justify-center text-slate-500 transition-colors hover:bg-(--pocket-blue-light) hover:text-(--pocket-blue)"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex h-full min-w-34 items-center justify-center gap-2 border-x border-slate-200 px-3.5 text-sm font-medium text-slate-700">
            <CalendarDays size={15} />
            {monthLabel}
          </div>

          <button
            type="button"
            aria-label="Next month"
            onClick={() => changeMonth(1)}
            className="flex h-full w-9 items-center justify-center text-slate-500 transition-colors hover:bg-(--pocket-blue-light) hover:text-(--pocket-blue)"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
