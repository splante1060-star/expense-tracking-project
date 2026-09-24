"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Loader2, Repeat2 } from "lucide-react";
import DatePicker from "../ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  stopRecurringTransaction,
  updateRecurringTransaction,
} from "@/actions/recurring-transaction";

type Account = {
  id: string;
  name: string;
  type: "DEBIT" | "CREDIT" | "SAVINGS";
  balance: number;
  isDefault: boolean;
};

type RecurringPayment = {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: string;
  description: string;
  category:
    | "GROCERIES"
    | "DINING"
    | "SHOPPING"
    | "ENTERTAINMENT"
    | "TRANSPORTATION"
    | "TRAVEL"
    | "HOUSING"
    | "UTILITIES"
    | "LOANS"
    | "INSURANCE"
    | "INCOME"
    | "OTHER";
  accountId: string;
  interval: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  nextPaymentDate: string;
};

type RecurringPaymentFormProps = {
  accounts: Account[];
  recurringPayment: RecurringPayment;
};

const categories = [
  { value: "GROCERIES", label: "Groceries" },
  { value: "DINING", label: "Dining" },
  { value: "SHOPPING", label: "Shopping" },
  { value: "ENTERTAINMENT", label: "Entertainment" },
  { value: "TRANSPORTATION", label: "Transportation" },
  { value: "TRAVEL", label: "Travel" },
  { value: "HOUSING", label: "Housing" },
  { value: "UTILITIES", label: "Utilities" },
  { value: "LOANS", label: "Loans" },
  { value: "INSURANCE", label: "Insurance" },
  { value: "INCOME", label: "Income" },
  { value: "OTHER", label: "Other" },
] as const;

export default function RecurringPaymentForm({
  accounts,
  recurringPayment,
}: RecurringPaymentFormProps) {
  const router = useRouter();

  const [type, setType] = useState(recurringPayment.type);
  const [amount, setAmount] = useState(recurringPayment.amount);
  const [accountId, setAccountId] = useState(recurringPayment.accountId);
  const [category, setCategory] = useState(recurringPayment.category);
  const [nextPaymentDate, setNextPaymentDate] = useState(
    recurringPayment.nextPaymentDate,
  );
  const [description, setDescription] = useState(recurringPayment.description);
  const [interval, setInterval] = useState(recurringPayment.interval);

  const [isSaving, setIsSaving] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showStopDialog, setShowStopDialog] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      await updateRecurringTransaction({
        recurringTransactionId: recurringPayment.id,
        type,
        amount,
        description,
        category,
        accountId,
        nextPaymentDate,
        interval,
      });

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update recurring payment.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleStop = async () => {
    try {
      setIsStopping(true);
      setError(null);

      await stopRecurringTransaction(recurringPayment.id);

      setShowStopDialog(false);

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to stop recurring payment.",
      );
    } finally {
      setIsStopping(false);
    }
  };

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        await handleSave();
      }}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {/* Type */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Transaction Type
        </label>

        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setType("EXPENSE");

              if (category === "INCOME") {
                setCategory("OTHER");
              }
            }}
            className={`flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all ${
              type === "EXPENSE"
                ? "bg-white text-(--pocket-blue) shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <ArrowUpRight size={16} />
            Expense
          </button>

          <button
            type="button"
            onClick={() => {
              setType("INCOME");
              setCategory("INCOME");
            }}
            className={`flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all ${
              type === "INCOME"
                ? "bg-white text-(--pocket-green) shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <ArrowDownLeft size={16} />
            Income
          </button>
        </div>
      </div>

      {/* Amount */}
      <div className="mt-5">
        <label
          htmlFor="amount"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Amount
        </label>

        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
            $
          </span>

          <input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pr-4 pl-8 text-sm text-slate-900 outline-none transition-colors focus:border-(--pocket-blue)"
          />
        </div>
      </div>

      {/* Account + Category */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="accountId"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Account
          </label>

          <select
            id="accountId"
            value={accountId}
            onChange={(event) => setAccountId(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition-colors focus:border-(--pocket-blue)"
          >
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
                {account.isDefault ? " • Default" : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="category"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Category
          </label>

          <select
            id="category"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as RecurringPayment["category"])
            }
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition-colors focus:border-(--pocket-blue)"
          >
            {categories.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Next Payment Date */}
      <div className="mt-5">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Next Payment Date
        </label>

        <DatePicker value={nextPaymentDate} onChange={setNextPaymentDate} />
      </div>

      {/* Description */}
      <div className="mt-5">
        <label
          htmlFor="description"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Merchant / Description
          <span className="ml-1 font-normal text-slate-400">Optional</span>
        </label>

        <input
          id="description"
          type="text"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Netflix, paycheck, gym membership..."
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-(--pocket-blue)"
        />
      </div>

      {/* Repeat */}
      <div className="mt-5 rounded-xl bg-(--pocket-purple-light) p-4">
        <div className="flex items-start gap-3">
          <Repeat2
            size={18}
            className="mt-0.5 shrink-0 text-(--pocket-purple)"
          />

          <div className="w-full">
            <p className="text-sm font-medium text-slate-700">
              Recurring payment
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
              Pocket will create transactions automatically on this schedule.
            </p>

            <div className="mt-4">
              <label
                htmlFor="interval"
                className="mb-1.5 block text-xs font-medium text-slate-600"
              >
                Repeat
              </label>

              <select
                id="interval"
                value={interval}
                onChange={(event) =>
                  setInterval(
                    event.target.value as RecurringPayment["interval"],
                  )
                }
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-colors focus:border-(--pocket-blue)"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={() => setShowStopDialog(true)}
          disabled={isSaving || isStopping}
          className="h-10 rounded-full px-4 text-sm font-medium text-(--pocket-red) transition-colors hover:bg-(--pocket-red-light)"
        >
          Stop recurring payment
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="h-10 rounded-full px-4 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSaving || isStopping}
            className="inline-flex h-10 min-w-36 items-center justify-center rounded-full bg-(--pocket-blue) px-5 text-sm font-semibold text-white transition-colors hover:bg-(--pocket-blue-dark)"
          >
            {isSaving && <Loader2 size={16} className="animate-spin" />}

            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Stop Recurring Payment Dialog */}
      <Dialog open={showStopDialog} onOpenChange={setShowStopDialog}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-slate-900">
              Stop recurring payment?
            </DialogTitle>

            <DialogDescription className="text-sm leading-6 text-slate-600">
              <span className="font-semibold text-slate-800">
                {description || "This recurring payment"}
              </span>{" "}
              will no longer appear in Upcoming Payments, and Pocket will not
              create future transactions from this schedule.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl bg-(--pocket-red-light) px-4 py-3">
            <p className="text-sm text-(--pocket-red-dark)">
              Any transactions already recorded will stay in your history.
            </p>
          </div>

          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowStopDialog(false)}
              disabled={isStopping}
              className="h-10 rounded-full px-4 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
            >
              Keep recurring
            </button>

            <button
              type="button"
              onClick={handleStop}
              disabled={isStopping}
              className="inline-flex h-10 min-w-32 items-center justify-center gap-2 rounded-full bg-(--pocket-red) px-5 text-sm font-semibold text-white transition-colors hover:bg-(--pocket-red-dark) disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isStopping && <Loader2 size={15} className="animate-spin" />}

              {isStopping ? "Stopping..." : "Stop payment"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
}
