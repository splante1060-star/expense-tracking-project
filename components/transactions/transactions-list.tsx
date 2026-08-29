"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleDollarSign, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { categoryIconMap } from "@/lib/category-icons";
import { deleteTransaction } from "@/actions/transaction";

type TransactionItem = {
  id: string;
  description: string | null;
  category: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  date: Date;
  createdAt: Date;
  status: string;
};

type TransactionsListProps = {
  transactions: TransactionItem[];
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

const formatCategory = (category: string) =>
  category
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));

export default function TransactionsList({
  transactions,
}: TransactionsListProps) {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (
    transactionId: string,
    description: string | null,
  ) => {
    const confirmed = window.confirm(
      `Delete ${description || "this"} transaction? This cannot be undone.`,
    );

    if (!confirmed) return;

    setDeletingId(transactionId);

    try {
      await deleteTransaction(transactionId);
      router.refresh();
    } finally {
      setDeletingId(null);
      setOpenMenu(null);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-semibold text-slate-800">
          No transactions yet
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Add your first transaction to start tracking your money.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(120px,0.8fr)_120px_110px_28px] gap-4 border-b border-slate-100 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <span>Transaction</span>
        <span>Category</span>
        <span>Date</span>
        <span>Amount</span>
        <span />
      </div>

      <div className="divide-y divide-slate-100">
        {openMenu && (
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpenMenu(null)}
            className="fixed inset-0 z-40 cursor-default"
          />
        )}
        {transactions.map((transaction) => {
          const isIncome = transaction.type === "INCOME";

          const Icon =
            categoryIconMap[transaction.category] ?? CircleDollarSign;

          return (
            <div
              key={transaction.id}
              className="grid grid-cols-[minmax(0,1.5fr)_minmax(120px,0.8fr)_120px_100px_28px] items-center gap-4 px-5 py-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    isIncome
                      ? "bg-green-50 text-(--pocket-green)"
                      : "bg-(--pocket-blue-light) text-(--pocket-blue)"
                  }`}
                >
                  <Icon size={19} strokeWidth={1.8} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {transaction.description ||
                      formatCategory(transaction.category)}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    {transaction.status === "COMPLETED"
                      ? "Completed"
                      : transaction.status}
                  </p>
                </div>
              </div>

              <span
                className={`truncate text-sm ${
                  isIncome
                    ? "font-medium text-(--pocket-green)"
                    : "text-slate-600"
                }`}
              >
                {formatCategory(transaction.category)}
              </span>

              <div>
                <p className="text-sm text-slate-600">
                  {formatDate(transaction.date)}
                </p>

                <p className="mt-0.5 text-xs text-slate-400">
                  {formatTime(transaction.createdAt)}
                </p>
              </div>

              <span
                className={`text-sm font-semibold ${
                  isIncome ? "text-(--pocket-green)" : "text-slate-900"
                }`}
              >
                {isIncome ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </span>

              <div className="relative flex items-center justify-center">
                <button
                  type="button"
                  onClick={() =>
                    setOpenMenu(
                      openMenu === transaction.id ? null : transaction.id,
                    )
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Transaction options"
                >
                  <MoreVertical size={18} />
                </button>

                {openMenu === transaction.id && (
                  <div className="absolute right-0 top-9 z-50 w-36 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                    {" "}
                    <Link
                      href={`/transaction/${transaction.id}/edit`}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Pencil size={15} />
                      Edit
                    </Link>
                    <button
                      type="button"
                      disabled={deletingId === transaction.id}
                      onClick={() =>
                        handleDelete(transaction.id, transaction.description)
                      }
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                      {deletingId === transaction.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
