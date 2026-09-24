"use client";

import { CircleAlert, X } from "lucide-react";

type BillPaymentConfirmationProps = {
  isOpen: boolean;
  billName: string;
  amount: number;
  dueDate: Date;
  accountName: string;
  isProcessing?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function BillPaymentConfirmation({
  isOpen,
  billName,
  amount,
  dueDate,
  accountName,
  isProcessing = false,
  onConfirm,
  onClose,
}: BillPaymentConfirmationProps) {
  if (!isOpen) {
    return null;
  }

  const formattedAmount = amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  const formattedDueDate = new Date(dueDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/30 px-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between px-6 pt-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--pocket-orange-light) text-(--pocket-orange-dark)">
            <CircleAlert size={20} />
          </div>

          <button
            type="button"
            aria-label="Close payment confirmation"
            onClick={onClose}
            disabled={isProcessing}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={17} />
          </button>
        </div>

        <div className="px-6 pb-6 pt-4">
          <h2 className="text-xl font-semibold text-slate-900">
            Was this payment made?
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Confirm the payment before Pocket updates your account balance.
          </p>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900">{billName}</p>

                <p className="mt-1 text-sm text-slate-500">
                  Due {formattedDueDate}
                </p>

                <p className="mt-1 text-sm text-slate-500">{accountName}</p>
              </div>

              <p className="shrink-0 text-lg font-semibold text-slate-900">
                {formattedAmount}
              </p>
            </div>
          </div>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            Pocket will only record this payment. It does not send money to the
            bill provider.
          </p>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Not yet
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isProcessing}
              className="rounded-xl bg-(--pocket-blue) px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? "Recording..." : "Yes, record payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
