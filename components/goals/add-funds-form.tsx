"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import { addFundsToSavingsGoal } from "@/actions/savings-goal";
import useFetch from "@/hooks/use-fetch";

type Account = {
  id: string;
  name: string;
  type: "DEBIT" | "SAVINGS";
  balance: number;
};

type AddFundsFormProps = {
  goalId: string;
  goalName: string;
  accounts: Account[];
  onClose: () => void;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);

export default function AddFundsForm({
  goalId,
  goalName,
  accounts,
  onClose,
}: AddFundsFormProps) {
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [note, setNote] = useState("");

  const { fn: addFundsFn, loading, error } = useFetch(addFundsToSavingsGoal);

  const selectedAccount = accounts.find((account) => account.id === accountId);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!accountId || !amount) {
      return;
    }

    const result = await addFundsFn({
      savingsGoalId: goalId,
      accountId,
      amount,
      note,
    });

    if (result?.success) {
      router.refresh();
      onClose();
    }
  };

  return (
    <div className="rounded-2xl border border-(--pocket-green-light) bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-900">Add Funds</h3>

          <p className="mt-1 text-sm text-slate-500">
            Add money to {goalName}.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close form"
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={17} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor={`amount-${goalId}`}
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Amount
          </label>

          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              $
            </span>

            <input
              id={`amount-${goalId}`}
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="250.00"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pr-3.5 pl-8 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-(--pocket-green)"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor={`account-${goalId}`}
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            From Account
          </label>

          <div className="relative">
            <select
              id={`account-${goalId}`}
              value={accountId}
              onChange={(event) => setAccountId(event.target.value)}
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 pr-10 text-sm text-slate-900 outline-none transition-colors focus:border-(--pocket-green)"
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>

            <ChevronDown
              size={16}
              strokeWidth={1.8}
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>

          {selectedAccount && (
            <p className="mt-1.5 text-xs text-slate-400">
              Available balance: {formatCurrency(selectedAccount.balance)}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={`note-${goalId}`}
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Note
            <span className="ml-1 font-normal text-slate-400">Optional</span>
          </label>

          <input
            id={`note-${goalId}`}
            type="text"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Payday savings"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-(--pocket-green)"
          />
        </div>

        {error && (
          <div className="rounded-xl bg-(--pocket-red-light) px-4 py-3 text-sm text-(--pocket-red-dark)">
            {error.message}
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-10 rounded-full px-4 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || !accountId || !amount}
            className="inline-flex h-10 items-center justify-center rounded-full bg-(--pocket-green) px-5 text-sm font-semibold text-white transition-colors hover:bg-(--pocket-green-dark) disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Adding..." : "Add Funds"}
          </button>
        </div>
      </form>
    </div>
  );
}
