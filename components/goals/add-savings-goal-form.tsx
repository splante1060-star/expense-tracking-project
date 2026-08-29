"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarDays, X } from "lucide-react";

import { savingsGoalSchema } from "@/lib/schema";
import { createSavingsGoal } from "@/actions/savings-goal";
import { goalIcons } from "@/lib/goal-icons";
import useFetch from "@/hooks/use-fetch";

type SavingsGoalFormData = z.input<typeof savingsGoalSchema>;

type AddSavingsGoalFormProps = {
  onClose: () => void;
};

export default function AddSavingsGoalForm({
  onClose,
}: AddSavingsGoalFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SavingsGoalFormData>({
    resolver: zodResolver(savingsGoalSchema),
    defaultValues: {
      name: "",
      targetAmount: "",
      targetDate: "",
      icon: "GEM",
    },
  });

  const selectedIcon = watch("icon");

  const {
    fn: createSavingsGoalFn,
    loading,
    error,
  } = useFetch(createSavingsGoal);

  const onSubmit = async (data: SavingsGoalFormData) => {
    const result = await createSavingsGoalFn(data);

    if (result?.success) {
      router.refresh();
      onClose();
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Add Savings Goal
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Give your savings something to work toward.
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* GOAL NAME */}
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Goal Name
          </label>

          <input
            id="name"
            type="text"
            placeholder="Emergency Fund"
            {...register("name")}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-(--pocket-blue)"
          />

          {errors.name && (
            <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* GOAL ICON */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Choose an Icon
          </label>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
            {" "}
            {goalIcons.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedIcon === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setValue("icon", option.value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  aria-label={option.label}
                  title={option.label}
                  className={`flex h-20 items-center justify-center rounded-xl border transition-all ${
                    isSelected
                      ? "border-(--pocket-blue) bg-(--pocket-blue-light) text-(--pocket-blue) ring-1 ring-(--pocket-blue)"
                      : "border-slate-200 bg-white text-slate-400 hover:border-(--pocket-blue-soft) hover:bg-slate-50 hover:text-(--pocket-blue)"
                  }`}
                >
                  <Icon size={26} strokeWidth={1.8} />
                </button>
              );
            })}
          </div>

          <p className="mt-2 text-xs text-slate-400">
            {goalIcons.find((option) => option.value === selectedIcon)?.label}
          </p>

          {errors.icon && (
            <p className="mt-1.5 text-xs text-red-500">{errors.icon.message}</p>
          )}
        </div>

        {/* TARGET AMOUNT */}
        <div>
          <label
            htmlFor="targetAmount"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Target Amount
          </label>

          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              $
            </span>

            <input
              id="targetAmount"
              type="number"
              step="0.01"
              min="0"
              placeholder="5000.00"
              {...register("targetAmount")}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pr-3.5 pl-8 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-(--pocket-blue)"
            />
          </div>

          {errors.targetAmount && (
            <p className="mt-1.5 text-xs text-red-500">
              {errors.targetAmount.message}
            </p>
          )}
        </div>

        {/* TARGET DATE */}
        <div>
          <label
            htmlFor="targetDate"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Target Date
            <span className="ml-1 font-normal text-slate-400">Optional</span>
          </label>

          <div className="relative">
            <CalendarDays
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="targetDate"
              type="date"
              {...register("targetDate")}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pr-3.5 pl-10 text-sm text-slate-900 outline-none transition-colors focus:border-(--pocket-blue)"
            />
          </div>

          {errors.targetDate && (
            <p className="mt-1.5 text-xs text-red-500">
              {errors.targetDate.message}
            </p>
          )}

          <p className="mt-1.5 text-xs text-slate-400">
            Leave this blank if you&apos;re saving without a deadline.
          </p>
        </div>

        {/* SERVER ERROR */}
        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error.message}
          </div>
        )}

        {/* ACTIONS */}
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
            {loading ? "Adding..." : "Add Goal"}
          </button>
        </div>
      </form>
    </div>
  );
}
