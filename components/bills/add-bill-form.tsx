"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type {
  CategoryType,
  RecurringInterval,
} from "@/lib/generated/prisma/client";
import { billSchema, type BillFormData } from "@/lib/schema";
import { createBill, updateBill } from "@/actions/bill";
import useFetch from "@/hooks/use-fetch";

type Account = {
  id: string;
  name: string;
};

type Bill = {
  id: string;
  name: string;
  amount: number;
  dueDate: Date | string;
  category: CategoryType;
  accountId: string | null;
  isRecurring: boolean;
  recurringInterval: RecurringInterval | null;
  isAutoPay: boolean;
};

type AddBillFormProps = {
  accounts: Account[];
  onClose: () => void;
  bill?: Bill | null;
};

const categories: {
  value: BillFormData["category"];
  label: string;
}[] = [
  { value: "HOUSING", label: "Housing" },
  { value: "UTILITIES", label: "Utilities" },
  { value: "LOANS", label: "Loans" },
  { value: "INSURANCE", label: "Insurance" },
  { value: "TRANSPORTATION", label: "Transportation" },
  { value: "GROCERIES", label: "Groceries" },
  { value: "DINING", label: "Dining" },
  { value: "SHOPPING", label: "Shopping" },
  { value: "ENTERTAINMENT", label: "Entertainment" },
  { value: "TRAVEL", label: "Travel" },
  { value: "OTHER", label: "Other" },
];

const billCategories = [
  "GROCERIES",
  "DINING",
  "SHOPPING",
  "ENTERTAINMENT",
  "TRANSPORTATION",
  "TRAVEL",
  "HOUSING",
  "UTILITIES",
  "LOANS",
  "INSURANCE",
  "OTHER",
] as const;

function isBillCategory(
  category: CategoryType,
): category is BillFormData["category"] {
  return billCategories.includes(category as BillFormData["category"]);
}

const intervals: {
  value: NonNullable<BillFormData["recurringInterval"]>;
  label: string;
}[] = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
];

export default function AddBillForm({
  accounts,
  onClose,
  bill,
}: AddBillFormProps) {
  const router = useRouter();

  const {
    loading: creating,
    fn: createBillFn,
    data: createResult,
  } = useFetch(createBill);

  const {
    loading: updating,
    fn: updateBillFn,
    data: updateResult,
  } = useFetch(updateBill);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<BillFormData>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      name: bill?.name ?? "",
      amount: bill ? String(bill.amount) : "",
      dueDate: bill?.dueDate
        ? new Date(bill.dueDate).toISOString().slice(0, 10)
        : "",
      category:
        bill && isBillCategory(bill.category) ? bill.category : "UTILITIES",
      accountId: bill?.accountId ?? "",
      isRecurring: bill?.isRecurring ?? false,
      recurringInterval: bill?.recurringInterval ?? null,
      isAutoPay: bill?.isAutoPay ?? false,
    },
  });

  const isRecurring = watch("isRecurring");

  const isEditing = Boolean(bill);
  const loading = creating || updating;

  useEffect(() => {
    if (createResult?.success || updateResult?.success) {
      router.refresh();
      onClose();
    }
  }, [createResult, updateResult, router, onClose]);

  const onSubmit = async (data: BillFormData) => {
    const payload = {
      ...data,
      accountId: data.accountId || null,
      recurringInterval: data.isRecurring ? data.recurringInterval : null,
    };

    if (bill) {
      await updateBillFn({
        billId: bill.id,
        ...payload,
      });

      return;
    }

    await createBillFn(payload);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {isEditing ? "Edit Bill" : "Add Bill"}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {isEditing
            ? "Update the details for this bill."
            : "Add an upcoming bill so Pocket can help you stay ahead."}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Bill name
            </label>

            <input
              {...register("name")}
              type="text"
              placeholder="Electric Bill"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-(--pocket-blue) focus:ring-2 focus:ring-(--pocket-blue-light)"
            />

            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Amount
            </label>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                $
              </span>

              <input
                {...register("amount")}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-7 pr-3.5 text-sm text-slate-900 outline-none transition focus:border-(--pocket-blue) focus:ring-2 focus:ring-(--pocket-blue-light)"
              />
            </div>

            {errors.amount && (
              <p className="mt-1 text-xs text-red-500">
                {errors.amount.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Category
            </label>

            <select
              {...register("category")}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-(--pocket-blue) focus:ring-2 focus:ring-(--pocket-blue-light)"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            {errors.category && (
              <p className="mt-1 text-xs text-red-500">
                {errors.category.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Due date
            </label>

            <input
              {...register("dueDate")}
              type="date"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-(--pocket-blue) focus:ring-2 focus:ring-(--pocket-blue-light)"
            />

            {errors.dueDate && (
              <p className="mt-1 text-xs text-red-500">
                {errors.dueDate.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Pay from account
          </label>

          <select
            {...register("accountId")}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-(--pocket-blue) focus:ring-2 focus:ring-(--pocket-blue-light)"
          >
            <option value="">No linked account</option>

            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>

          <p className="mt-1.5 text-xs text-slate-400">
            Optional — this only tracks where the bill is usually paid from.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <label className="flex cursor-pointer items-center justify-between gap-4">
            <div>
              <span className="block text-sm font-medium text-slate-800">
                Recurring bill
              </span>

              <span className="mt-0.5 block text-xs text-slate-500">
                This bill repeats on a regular schedule.
              </span>
            </div>

            <input
              {...register("isRecurring")}
              type="checkbox"
              className="h-4 w-4 accent-(--pocket-blue)"
            />
          </label>

          {isRecurring && (
            <div className="mt-4 border-t border-slate-200 pt-4">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Repeat
              </label>

              <select
                {...register("recurringInterval")}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-(--pocket-blue) focus:ring-2 focus:ring-(--pocket-blue-light)"
              >
                <option value="">Choose frequency</option>

                {intervals.map((interval) => (
                  <option key={interval.value} value={interval.value}>
                    {interval.label}
                  </option>
                ))}
              </select>

              {errors.recurringInterval && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.recurringInterval.message}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <label className="flex cursor-pointer items-center justify-between gap-4">
            <div>
              <span className="block text-sm font-medium text-slate-800">
                AutoPay
              </span>

              <span className="mt-0.5 block text-xs text-slate-500">
                Mark this bill as automatically paid.
              </span>
            </div>

            <input
              {...register("isAutoPay")}
              type="checkbox"
              className="h-4 w-4 accent-(--pocket-blue)"
            />
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-(--pocket-blue) px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-(--pocket-blue-dark) disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? isEditing
                ? "Saving..."
                : "Adding..."
              : isEditing
                ? "Save Changes"
                : "Add Bill"}
          </button>
        </div>
      </form>
    </div>
  );
}
