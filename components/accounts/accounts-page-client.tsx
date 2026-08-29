"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Pencil, Plus, Trash2, WalletCards } from "lucide-react";
import AddAccountForm from "./add-account-form";
import { deleteAccount } from "@/actions/dashboard";

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
  const router = useRouter();

  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async (account: Account) => {
    const confirmed = window.confirm(`Delete the ${account.name} account?`);

    if (!confirmed) return;

    try {
      setDeleteError(null);

      await deleteAccount(account.id);

      setOpenMenu(null);
      router.refresh();
    } catch (error) {
      setOpenMenu(null);

      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete account.",
      );
    }
  };

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
          onClick={() => {
            setEditingAccount(null);
            setShowForm((current) => !current);
          }}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-(--pocket-blue) px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-(--pocket-blue-dark)"
        >
          <Plus size={16} />
          Add Account
        </button>
      </div>

      {deleteError && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {deleteError}
        </div>
      )}

      {showForm && (
        <AddAccountForm
          account={editingAccount}
          onClose={() => {
            setShowForm(false);
            setEditingAccount(null);
          }}
        />
      )}
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
        <>
          {openMenu && (
            <button
              type="button"
              aria-label="Close account menu"
              onClick={() => setOpenMenu(null)}
              className="fixed inset-0 z-40 cursor-default"
            />
          )}
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

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenu(
                            openMenu === account.id ? null : account.id,
                          )
                        }
                        aria-label="Account options"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {openMenu === account.id && (
                        <div className="absolute right-0 top-9 z-50 w-36 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAccount(account);
                              setShowForm(true);
                              setOpenMenu(null);
                              setDeleteError(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Pencil size={15} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(account)}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={15} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <p className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
                  {formatCurrency(account.balance)}
                </p>

                <p className="mt-1 text-xs text-slate-500">Current balance</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
