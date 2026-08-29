"use client";

import { useState } from "react";
import { Plus, WalletCards } from "lucide-react";
import AddAccountForm from "./add-account-form";

type Account = {
  id: string;
  name: string;
  type: "DEBIT" | "CREDIT" | "SAVINGS";
  balance: number;
  isDefault: boolean;
};

type AccountsPageClientProps = {
  accounts: Account[];
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);

const formatAccountType = (type: Account["type"]) => {
  switch (type) {
    case "DEBIT":
      return "Checking / Debit";
    case "CREDIT":
      return "Credit";
    case "SAVINGS":
      return "Savings";
  }
};

export default function AccountsPageClient({
  accounts,
}: AccountsPageClientProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
            Accounts
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            Keep track of the accounts connected to your Pocket.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((current) => !current)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-(--pocket-blue) px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-(--pocket-blue-dark)"
        >
          <Plus size={16} />
          Add Account
        </button>
      </div>

      {showForm && <AddAccountForm onClose={() => setShowForm(false)} />}

      {accounts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-(--pocket-blue-light) text-(--pocket-blue)">
            <WalletCards size={22} strokeWidth={1.8} />
          </div>

          <h2 className="mt-4 text-base font-semibold text-slate-900">
            No accounts yet
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
            Add your first account so Pocket can start tracking balances,
            transactions, budgets, and savings activity.
          </p>

          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-(--pocket-blue) px-5 text-sm font-semibold text-white transition-colors hover:bg-(--pocket-blue-dark)"
          >
            <Plus size={16} />
            Add Your First Account
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-slate-900">
                      {account.name}
                    </h2>

                    {account.isDefault && (
                      <span className="rounded-full bg-(--pocket-blue-light) px-2 py-0.5 text-[11px] font-semibold text-(--pocket-blue)">
                        Default
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    {formatAccountType(account.type)}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--pocket-blue-light) text-(--pocket-blue)">
                  <WalletCards size={19} strokeWidth={1.8} />
                </div>
              </div>

              <p className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
                {formatCurrency(account.balance)}
              </p>

              <p className="mt-1 text-xs text-slate-500">Current balance</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
