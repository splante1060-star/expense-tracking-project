"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";

import { budgetSchema } from "@/lib/schema";
import { createBudget } from "@/actions/budget";
import useFetch from "@/hooks/use-fetch";

type BudgetFormData = z.input<typeof budgetSchema>;

type Budget = {
  id: string;
  category: string;
  amount: number;
};

type AddBudgetFormProps = {
  budgets: Budget[];
  onClose: () => void;
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
  { value: "OTHER", label: "Other" },
] as const;

export default function AddBudgetForm({
  budgets,
  onClose,
}: AddBudgetFormProps) {
  const router = useRouter();

  const usedCategories = new Set(budgets.map((budget) => budget.category));

  const availableCategories = categories.filter(
    (category) => !usedCategories.has(category.value),
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category: availableCategories[0]?.value ?? "GROCERIES",
      amount: "",
    },
  });

  const { fn: createBudgetFn, loading, error } = useFetch(createBudget);

  const onSubmit = async (data: BudgetFormData) => {
    const result = await createBudgetFn(data);

    if (result?.success) {
      router.refresh();
      onClose();
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Add Budget</h2>

          <p className="mt-1 text-sm text-slate-500">
            Set a monthly spending limit for a category.
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

      {availableCategories.length === 0 ? (
        <div className="rounded-xl bg-(--pocket-blue-light) p-4">
          <p className="text-sm font-medium text-(--pocket-blue)">
            Every category has a budget!
          </p>

          <p className="mt-1 text-xs text-slate-600">
            You&apos;ve already created a monthly budget for every available
            spending category.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* CATEGORY */}
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
              {availableCategories.map((category) => (
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

          {/* AMOUNT */}
          <div>
            <label
              htmlFor="amount"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Monthly Budget
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
                placeholder="500.00"
                {...register("amount")}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pr-3.5 pl-8 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-(--pocket-blue)"
              />
            </div>

            {errors.amount && (
              <p className="mt-1.5 text-xs text-red-500">
                {errors.amount.message}
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error.message}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
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
              disabled={loading}
              className="inline-flex h-10 items-center justify-center rounded-full bg-(--pocket-blue) px-5 text-sm font-semibold text-white transition-colors hover:bg-(--pocket-blue-dark) disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Adding..." : "Add Budget"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
