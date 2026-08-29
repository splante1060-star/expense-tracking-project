import Link from "next/link";
import { ArrowRight, CalendarDays, ReceiptText, Zap } from "lucide-react";

import { categoryIconMap } from "@/lib/category-icons";

type UpcomingBill = {
  id: string;
  name: string;
  amount: number;
  dueDate: Date | string;
  category: string;
  isAutoPay: boolean;
};

type UpcomingBillsProps = {
  bills: UpcomingBill[];
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatCategory(category: string) {
  return category
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getDaysUntil(date: Date | string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(date);
  dueDate.setHours(0, 0, 0, 0);

  return Math.ceil(
    (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
}

export default function UpcomingBills({ bills }: UpcomingBillsProps) {
  const total = bills.reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <section className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-5">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Upcoming Bills
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your next scheduled payments
          </p>
        </div>

        <Link
          href="/bills"
          className="inline-flex items-center gap-1 text-xs font-semibold text-(--pocket-orange) transition-opacity hover:opacity-70"
        >
          View all
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* Bills */}
      <div className="mt-4 flex-1 px-5">
        {bills.length === 0 ? (
          <div className="flex h-full min-h-48 flex-col items-center justify-center text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-(--pocket-orange-light) text-(--pocket-orange)">
              <CalendarDays size={20} />
            </div>

            <p className="mt-3 text-sm font-medium text-slate-700">
              No upcoming bills
            </p>

            <p className="mt-1 text-xs text-slate-400">
              You&apos;re all caught up.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {bills.map((bill) => {
              const Icon =
                categoryIconMap[
                  bill.category as keyof typeof categoryIconMap
                ] ?? ReceiptText;

              const dueDate = new Date(bill.dueDate);
              const daysUntil = getDaysUntil(bill.dueDate);

              return (
                <div
                  key={bill.id}
                  className="grid grid-cols-[48px_1fr_auto] items-center gap-3 py-3.5"
                >
                  {/* Date */}
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-(--pocket-orange)">
                      {dueDate.toLocaleDateString("en-US", {
                        month: "short",
                      })}
                    </p>

                    <p className="mt-0.5 text-lg font-bold leading-none text-slate-800">
                      {dueDate.getDate()}
                    </p>
                  </div>

                  {/* Bill */}
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-(--pocket-orange-light) text-(--pocket-orange)">
                      <Icon size={17} strokeWidth={1.8} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {bill.name}
                      </p>

                      <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                        <span>{formatCategory(bill.category)}</span>

                        {bill.isAutoPay && (
                          <>
                            <span>•</span>

                            <span className="inline-flex items-center gap-1">
                              <Zap size={10} />
                              AutoPay
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {formatCurrency(bill.amount)}
                    </p>

                    {daysUntil >= 0 && daysUntil <= 7 && (
                      <p className="mt-0.5 text-[10px] font-medium text-(--pocket-orange)">
                        {daysUntil === 0
                          ? "Due today"
                          : daysUntil === 1
                            ? "Due tomorrow"
                            : `In ${daysUntil} days`}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {bills.length > 0 && (
        <div className="mx-5 mb-5 mt-2 flex items-center justify-between rounded-xl bg-(--pocket-orange-light) px-4 py-3">
          <span className="text-xs font-medium text-(--pocket-orange-dark)">
            {bills.length} upcoming{" "}
            {bills.length === 1 ? "payment" : "payments"}
          </span>

          <div className="text-right">
            <span className="mr-1.5 text-xs text-(--pocket-orange)">Total</span>

            <span className="text-sm font-bold text-slate-900">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
