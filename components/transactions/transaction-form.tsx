"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  Loader2,
} from "lucide-react";

import { transactionSchema } from "@/lib/schema";
import { createTransaction, updateTransaction } from "@/actions/transaction";
import useFetch from "@/hooks/use-fetch";

type TransactionFormData = z.input<typeof transactionSchema>;

type Account = {
  id: string;
  name: string;
  type: "DEBIT" | "CREDIT" | "SAVINGS";
  balance: number;
  isDefault: boolean;
};

type TransactionFormProps = {
  accounts: Account[];
  transaction?: {
    id: string;
    type: "INCOME" | "EXPENSE";
    amount: string;
    description: string;
    date: string;
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
    isRecurring: boolean;
    recurringInterval?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  };
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
  { value: "INCOME", label: "Income" },
  { value: "OTHER", label: "Other" },
] as const;

const getToday = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function TransactionForm({
  accounts,
  transaction,
}: TransactionFormProps) {
  const router = useRouter();

  const defaultAccount =
    accounts.find((account) => account.isDefault) ?? accounts[0];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: transaction?.type ?? "EXPENSE",
      amount: transaction?.amount ?? "",
      description: transaction?.description ?? "",
      date: transaction?.date ?? new Date().toISOString().slice(0, 10),
      category: transaction?.category ?? "GROCERIES",
      accountId:
        transaction?.accountId ??
        accounts.find((account) => account.isDefault)?.id ??
        accounts[0]?.id ??
        "",
      isRecurring: transaction?.isRecurring ?? false,
      recurringInterval: transaction?.recurringInterval ?? undefined,
    },
  });

  const {
    fn: createTransactionFn,
    loading,
    error,
  } = useFetch(createTransaction);

  const transactionType = watch("type");
  const category = watch("category");
  const isRecurring = watch("isRecurring");

  const onSubmit = async (data: TransactionFormData) => {
    if (transaction) {
      await updateTransaction({
        transactionId: transaction.id,
        type: data.type,
        amount: data.amount,
        description: data.description,
        category: data.category,
        accountId: data.accountId,
        isRecurring: data.isRecurring,
        recurringInterval: data.recurringInterval,
      });

      router.push("/transactions");
      router.refresh();
      return;
    }

    await createTransaction(data);

    router.push("/transactions");
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {/* TRANSACTION TYPE */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Transaction Type
        </label>

        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setValue("type", "EXPENSE");

              if (category === "INCOME") {
                setValue("category", "GROCERIES");
              }
            }}
            className={`flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all ${
              transactionType === "EXPENSE"
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
              setValue("type", "INCOME");
              setValue("category", "INCOME");
            }}
            className={`flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all ${
              transactionType === "INCOME"
                ? "bg-white text-(--pocket-green) shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <ArrowDownLeft size={16} />
            Income
          </button>
        </div>
      </div>

      {/* AMOUNT */}
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
            placeholder="0.00"
            {...register("amount")}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pr-4 pl-8 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-(--pocket-blue)"
          />
        </div>

        {errors.amount && (
          <p className="mt-1.5 text-xs text-red-500">{errors.amount.message}</p>
        )}
      </div>

      {/* ACCOUNT + CATEGORY */}
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
            {...register("accountId")}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition-colors focus:border-(--pocket-blue)"
          >
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
                {account.isDefault ? " • Default" : ""}
              </option>
            ))}
          </select>

          {errors.accountId && (
            <p className="mt-1.5 text-xs text-red-500">
              {errors.accountId.message}
            </p>
          )}
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
            {...register("category")}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition-colors focus:border-(--pocket-blue)"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>

          {errors.category && (
            <p className="mt-1.5 text-xs text-red-500">
              {errors.category.message}
            </p>
          )}
        </div>
      </div>

      {/* DATE */}
      <div className="mt-5">
        <label
          htmlFor="date"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Date
        </label>

        <div className="relative">
          <CalendarDays
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="date"
            {...register("date")}
            disabled={Boolean(transaction)}
            className={`w-full rounded-xl border py-2.5 pr-3 pl-10 text-sm outline-none ${
              transaction
                ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500"
                : "border-slate-200 bg-white text-slate-900 focus:border-(--pocket-blue)"
            }`}
          />
        </div>

        {errors.date && (
          <p className="mt-1.5 text-xs text-red-500">{errors.date.message}</p>
        )}
      </div>

      {/* DESCRIPTION */}
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
          placeholder="Weekly groceries, dinner out..."
          {...register("description")}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-(--pocket-blue)"
        />
      </div>

      {/* RECURRING */}
      <div className="mt-5 rounded-xl bg-slate-50 p-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            {...register("isRecurring")}
            className="mt-0.5 h-4 w-4 accent-(--pocket-blue)"
          />

          <div>
            <p className="text-sm font-medium text-slate-700">
              Recurring transaction
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
              Use this for repeating expenses or income.
            </p>
          </div>
        </label>

        {isRecurring && (
          <div className="mt-4">
            <label
              htmlFor="recurringInterval"
              className="mb-1.5 block text-xs font-medium text-slate-600"
            >
              Repeat
            </label>

            <select
              id="recurringInterval"
              {...register("recurringInterval")}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-colors focus:border-(--pocket-blue)"
            >
              <option value="">Choose frequency</option>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </select>

            {errors.recurringInterval && (
              <p className="mt-1.5 text-xs text-red-500">
                {errors.recurringInterval.message}
              </p>
            )}
          </div>
        )}
      </div>

      {/* SERVER ERROR */}
      {error && (
        <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error.message}
        </div>
      )}

      {/* ACTIONS */}
      <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="h-10 rounded-full px-4 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-10 min-w-36 items-center justify-center gap-2 rounded-full bg-(--pocket-blue) px-5 text-sm font-semibold text-white transition-colors hover:bg-(--pocket-blue-dark) disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}

          {loading
            ? transaction
              ? "Saving..."
              : "Adding..."
            : transaction
              ? "Save Changes"
              : "Add Transaction"}
        </button>
      </div>
    </form>
  );
}
