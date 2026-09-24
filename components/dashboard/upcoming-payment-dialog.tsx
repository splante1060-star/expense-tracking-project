"use client";

import { useRouter } from "next/navigation";
import { CalendarDays, Repeat2, X, Zap } from "lucide-react";

type UpcomingPayment = {
  id: string;
  name: string;
  amount: number;
  dueDate: Date | string;
  category: string;
  source: "BILL" | "RECURRING";
  isAutoPay: boolean;
  accountName?: string | null;
  recurringInterval?: string | null;
};

type UpcomingPaymentDialogProps = {
  payment: UpcomingPayment | null;
  isOpen: boolean;
  onClose: () => void;
};

export default function UpcomingPaymentDialog({
  payment,
  isOpen,
  onClose,
}: UpcomingPaymentDialogProps) {
  const router = useRouter();

  if (!isOpen || !payment) {
    return null;
  }

  const dueDate = new Date(payment.dueDate);

  const formattedDate = dueDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedAmount = payment.amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Upcoming payment
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {payment.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close payment details"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {payment.category}
              </p>

              <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                <CalendarDays size={15} />
                {formattedDate}
              </div>

              {payment.accountName && (
                <p className="mt-1 text-sm text-slate-500">
                  {payment.accountName}
                </p>
              )}
            </div>

            <p className="text-xl font-bold text-slate-900">
              {formattedAmount}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {payment.source === "RECURRING" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-(--pocket-purple-light) px-2.5 py-1 text-xs font-medium text-(--pocket-purple-dark)">
                <Repeat2 size={13} />
                Recurring
              </span>
            )}

            {payment.isAutoPay && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                <Zap size={13} />
                AutoPay
              </span>
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              onClose();

              if (payment.source === "RECURRING") {
                router.push(`/recurring/${payment.id}/edit`);
              } else {
                router.push("/bills");
              }
            }}
            className="rounded-xl bg-(--pocket-blue) px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            {payment.source === "RECURRING"
              ? "Edit recurring payment"
              : "Manage bill"}
          </button>
        </div>
      </div>
    </div>
  );
}
