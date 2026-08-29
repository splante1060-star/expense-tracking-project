import Link from "next/link";
import { CircleDollarSign } from "lucide-react";

import { categoryIconMap } from "@/lib/category-icons";

type RecentTransactionItem = {
  id: string;
  description: string | null;
  category: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  date: Date;
};

type RecentTransactionsProps = {
  transactions: RecentTransactionItem[];
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

export default function RecentTransactions({
  transactions,
}: RecentTransactionsProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">
          Recent Transactions
        </h2>

        <Link
          href="/transactions"
          className="text-xs font-semibold text-(--pocket-blue-medium) transition-colors hover:text-(--pocket-blue)"
        >
          View all →
        </Link>
      </div>

      {/* EMPTY STATE */}
      {transactions.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm font-medium text-slate-700">
            No transactions yet
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Your latest activity will show up here.
          </p>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-slate-100">
          {transactions.map((transaction) => {
            const isIncome = transaction.type === "INCOME";

            const Icon =
              categoryIconMap[transaction.category] ?? CircleDollarSign;

            return (
              <div
                key={transaction.id}
                className="grid grid-cols-[minmax(0,1.7fr)_minmax(70px,0.65fr)_auto] items-center gap-2 py-3 first:pt-1"
              >
                {/* MERCHANT / DESCRIPTION */}
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      isIncome
                        ? "bg-green-50 text-(--pocket-green)"
                        : "bg-(--pocket-blue-light) text-(--pocket-blue)"
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.8} />
                  </div>

                  <p className="truncate text-sm font-semibold text-slate-900">
                    {transaction.description ||
                      formatCategory(transaction.category)}
                  </p>
                </div>

                {/* CATEGORY */}
                <p
                  className={`truncate pl-2 text-xs ${
                    isIncome
                      ? "font-medium text-(--pocket-green)"
                      : "text-slate-500"
                  }`}
                >
                  {formatCategory(transaction.category)}
                </p>

                {/* AMOUNT */}
                <span
                  className={`shrink-0 text-right text-sm font-semibold ${
                    isIncome ? "text-(--pocket-green)" : "text-slate-900"
                  }`}
                >
                  {isIncome ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
