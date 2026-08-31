"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CircleDollarSign,
  MoreVertical,
  Pencil,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { categoryIconMap } from "@/lib/category-icons";
import {
  deleteTransaction,
  bulkDeleteTransaction,
} from "@/actions/transaction";

type TransactionItem = {
  id: string;
  description: string | null;
  category: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  date: Date;
  createdAt: Date;
  status: string;
  isRecurring: boolean;
  recurringInterval: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | null;
  recurringTransaction: {
    id: string;
    interval: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
    isActive: boolean;
  } | null;
  account: {
    id: string;
    name: string;
    type: "DEBIT" | "CREDIT" | "SAVINGS";
  };
};

type TransactionsListProps = {
  transactions: TransactionItem[];
};

type TypeFilter = "ALL" | "INCOME" | "EXPENSE";
type RecurringFilter = "ALL" | "RECURRING" | "ONE_TIME";
type SortOption = "NEWEST" | "OLDEST" | "AMOUNT_HIGH" | "AMOUNT_LOW";

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

const formatMonth = (value: string) => {
  const [year, month] = value.split("-").map(Number);

  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

export default function TransactionsList({
  transactions,
}: TransactionsListProps) {
  const router = useRouter();

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [accountFilter, setAccountFilter] = useState("ALL");
  const [monthFilter, setMonthFilter] = useState("ALL");
  const [recurringFilter, setRecurringFilter] =
    useState<RecurringFilter>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("NEWEST");

  const categories = useMemo(
    () =>
      Array.from(
        new Set(transactions.map((transaction) => transaction.category)),
      ).sort((a, b) => formatCategory(a).localeCompare(formatCategory(b))),
    [transactions],
  );

  const accounts = useMemo(() => {
    const accountMap = new Map<string, string>();

    transactions.forEach((transaction) => {
      accountMap.set(transaction.account.id, transaction.account.name);
    });

    return Array.from(accountMap.entries())
      .map(([id, name]) => ({
        id,
        name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [transactions]);

  const months = useMemo(() => {
    const monthValues = Array.from(
      new Set(
        transactions.map((transaction) => {
          const date = new Date(transaction.date);

          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0",
          )}`;
        }),
      ),
    );

    return monthValues.sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    const filtered = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);

      const transactionMonth = `${transactionDate.getFullYear()}-${String(
        transactionDate.getMonth() + 1,
      ).padStart(2, "0")}`;

      const matchesSearch =
        normalizedSearch === "" ||
        transaction.description?.toLowerCase().includes(normalizedSearch) ||
        formatCategory(transaction.category)
          .toLowerCase()
          .includes(normalizedSearch) ||
        transaction.account.name.toLowerCase().includes(normalizedSearch);

      const matchesType =
        typeFilter === "ALL" || transaction.type === typeFilter;

      const matchesCategory =
        categoryFilter === "ALL" || transaction.category === categoryFilter;

      const matchesAccount =
        accountFilter === "ALL" || transaction.account.id === accountFilter;

      const matchesMonth =
        monthFilter === "ALL" || transactionMonth === monthFilter;

      const matchesRecurring =
        recurringFilter === "ALL" ||
        (recurringFilter === "RECURRING" && transaction.isRecurring) ||
        (recurringFilter === "ONE_TIME" && !transaction.isRecurring);

      return (
        matchesSearch &&
        matchesType &&
        matchesCategory &&
        matchesAccount &&
        matchesMonth &&
        matchesRecurring
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "AMOUNT_HIGH") {
        return b.amount - a.amount;
      }

      if (sortBy === "AMOUNT_LOW") {
        return a.amount - b.amount;
      }

      const dateDifference =
        new Date(b.date).getTime() - new Date(a.date).getTime();

      if (dateDifference !== 0) {
        return sortBy === "OLDEST" ? -dateDifference : dateDifference;
      }

      const createdDifference =
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

      return sortBy === "OLDEST" ? -createdDifference : createdDifference;
    });
  }, [
    transactions,
    searchQuery,
    typeFilter,
    categoryFilter,
    accountFilter,
    monthFilter,
    recurringFilter,
    sortBy,
  ]);

  useEffect(() => {
    const visibleIds = new Set(
      filteredTransactions.map((transaction) => transaction.id),
    );

    setSelectedIds((current) => current.filter((id) => visibleIds.has(id)));
  }, [filteredTransactions]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    typeFilter !== "ALL" ||
    categoryFilter !== "ALL" ||
    accountFilter !== "ALL" ||
    monthFilter !== "ALL" ||
    recurringFilter !== "ALL" ||
    sortBy !== "NEWEST";

  const resetFilters = () => {
    setSearchQuery("");
    setTypeFilter("ALL");
    setCategoryFilter("ALL");
    setAccountFilter("ALL");
    setMonthFilter("ALL");
    setRecurringFilter("ALL");
    setSortBy("NEWEST");
    setSelectedIds([]);
  };

  const visibleTransactionIds = filteredTransactions.map(
    (transaction) => transaction.id,
  );

  const allVisibleSelected =
    visibleTransactionIds.length > 0 &&
    visibleTransactionIds.every((id) => selectedIds.includes(id));

  const toggleTransaction = (transactionId: string) => {
    setSelectedIds((current) =>
      current.includes(transactionId)
        ? current.filter((id) => id !== transactionId)
        : [...current, transactionId],
    );
  };

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !visibleTransactionIds.includes(id)),
      );

      return;
    }

    setSelectedIds((current) => [
      ...new Set([...current, ...visibleTransactionIds]),
    ]);
  };

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

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    const confirmed = window.confirm(
      `Delete ${selectedIds.length} ${
        selectedIds.length === 1 ? "transaction" : "transactions"
      }? Account balances will be updated. This cannot be undone.`,
    );

    if (!confirmed) return;
    setIsBulkDeleting(true);

    try {
      await bulkDeleteTransaction(selectedIds);

      setSelectedIds([]);
      setOpenMenu(null);

      router.refresh();
    } finally {
      setIsBulkDeleting(false);
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
    <div className="space-y-4">
      {/* FILTERS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
              }}
              placeholder="Search transactions..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-(--pocket-blue-soft)"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value as TypeFilter);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none focus:border-(--pocket-blue-soft)"
            >
              <option value="ALL">All types</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none focus:border-(--pocket-blue-soft)"
            >
              <option value="ALL">All categories</option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {formatCategory(category)}
                </option>
              ))}
            </select>

            <select
              value={accountFilter}
              onChange={(event) => {
                setAccountFilter(event.target.value);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none focus:border-(--pocket-blue-soft)"
            >
              <option value="ALL">All accounts</option>

              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>

            <select
              value={monthFilter}
              onChange={(event) => {
                setMonthFilter(event.target.value);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none focus:border-(--pocket-blue-soft)"
            >
              <option value="ALL">All months</option>

              {months.map((month) => (
                <option key={month} value={month}>
                  {formatMonth(month)}
                </option>
              ))}
            </select>

            <select
              value={recurringFilter}
              onChange={(event) => {
                setRecurringFilter(event.target.value as RecurringFilter);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none focus:border-(--pocket-blue-soft)"
            >
              <option value="ALL">All frequency</option>
              <option value="RECURRING">Recurring</option>
              <option value="ONE_TIME">One-time</option>
            </select>

            <select
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value as SortOption);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none focus:border-(--pocket-blue-soft)"
            >
              <option value="NEWEST">Newest first</option>
              <option value="OLDEST">Oldest first</option>
              <option value="AMOUNT_HIGH">Amount: high to low</option>
              <option value="AMOUNT_LOW">Amount: low to high</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-medium text-(--pocket-blue) transition-colors hover:bg-(--pocket-blue-light)"
              >
                <RotateCcw size={14} />
                Reset
              </button>
            )}
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="mt-4 flex items-center justify-between rounded-xl bg-(--pocket-blue-light) px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium text-(--pocket-blue)">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
                <Check size={14} />
              </div>

              <span>
                {selectedIds.length}{" "}
                {selectedIds.length === 1 ? "transaction" : "transactions"}{" "}
                selected
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-xs font-medium text-slate-500 transition-opacity hover:opacity-70"
              >
                Clear
              </button>

              <button
                type="button"
                disabled={isBulkDeleting}
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 rounded-lg bg-(--pocket-red-light) px-3 py-2 text-xs font-semibold text-(--pocket-red-dark) transition-colors hover:bg-(--pocket-red) hover:text-white disabled:opacity-50"
              >
                <Trash2 size={14} />

                {isBulkDeleting ? "Deleting..." : "Delete selected"}
              </button>
            </div>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span>
            {filteredTransactions.length}{" "}
            {filteredTransactions.length === 1 ? "transaction" : "transactions"}
          </span>

          {hasActiveFilters && (
            <span>
              Showing {filteredTransactions.length} of {transactions.length}
            </span>
          )}
        </div>
      </div>

      {/* TRANSACTION TABLE */}
      <div className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-[32px_minmax(0,1.5fr)_minmax(120px,0.8fr)_120px_110px_28px] gap-4 border-b border-slate-100 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleSelectAll}
              aria-label="Select all visible transactions"
              className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-(--pocket-blue)"
            />
          </div>
          <span>Transaction</span>
          <span>Category</span>
          <span>Date</span>
          <span>Amount</span>
          <span />
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-semibold text-slate-800">
              No transactions match these filters
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or clearing a filter.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 text-sm font-medium text-(--pocket-blue) transition-opacity hover:opacity-70"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {openMenu && (
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpenMenu(null)}
                className="fixed inset-0 z-40 cursor-default"
              />
            )}

            {filteredTransactions.map((transaction) => {
              const isIncome = transaction.type === "INCOME";

              const Icon =
                categoryIconMap[transaction.category] ?? CircleDollarSign;

              return (
                <div
                  key={transaction.id}
                  className="grid grid-cols-[32px_minmax(0,1.5fr)_minmax(120px,0.8fr)_120px_100px_28px] items-center gap-4 px-5 py-4"
                >
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(transaction.id)}
                      onChange={() => toggleTransaction(transaction.id)}
                      aria-label={`Select ${
                        transaction.description || "transaction"
                      }`}
                      className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-(--pocket-blue)"
                    />
                  </div>
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

                      <p className="mt-0.5 text-xs text-(--pocket-blue-medium)">
                        {transaction.account.name}

                        {transaction.isRecurring && (
                          <>
                            <span className="mx-1.5">•</span>
                            <span>
                              Recurring
                              {transaction.recurringInterval &&
                                ` (${formatCategory(transaction.recurringInterval)})`}
                            </span>
                          </>
                        )}

                        {transaction.status !== "COMPLETED" && (
                          <>
                            <span className="mx-1.5">•</span>

                            <span
                              className={
                                transaction.status === "PENDING"
                                  ? "text-(--pocket-orange-dark)"
                                  : "text-(--pocket-red-dark)"
                              }
                            >
                              {transaction.status === "PENDING"
                                ? "Pending"
                                : "Failed"}
                            </span>
                          </>
                        )}
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
                            handleDelete(
                              transaction.id,
                              transaction.description,
                            )
                          }
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 size={15} />

                          {deletingId === transaction.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
