"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";

import { accountSchema } from "@/lib/schema";
import { createAccount } from "@/actions/dashboard";
import useFetch from "@/hooks/use-fetch";

type AccountFormData = z.input<typeof accountSchema>;

type AddAccountFormProps = {
  onClose: () => void;
};

export default function AddAccountForm({ onClose }: AddAccountFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "DEBIT",
      balance: "",
      isDefault: false,
    },
  });

  const { fn: createAccountFn, loading, error } = useFetch(createAccount);

  const onSubmit = async (data: AccountFormData) => {
    const result = await createAccountFn(data);

    if (result?.success) {
      router.refresh();
      onClose();
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Add Account</h2>

          <p className="mt-1 text-sm text-slate-500">
            Add an account to start tracking your money.
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
        {/* ACCOUNT NAME */}
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Account Name
          </label>

          <input
            id="name"
            type="text"
            placeholder="Everyday Checking"
            {...register("name")}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-(--pocket-blue)"
          />

          {errors.name && (
            <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* TYPE + BALANCE */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="type"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Account Type
            </label>

            <select
              id="type"
              {...register("type")}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition-colors focus:border-(--pocket-blue)"
            >
              <option value="DEBIT">Checking / Debit</option>
              <option value="CREDIT">Credit</option>
              <option value="SAVINGS">Savings</option>
            </select>

            {errors.type && (
              <p className="mt-1.5 text-xs text-red-500">
                {errors.type.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="balance"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Current Balance
            </label>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                $
              </span>

              <input
                id="balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("balance")}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pr-3.5 pl-8 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-(--pocket-blue)"
              />
            </div>

            {errors.balance && (
              <p className="mt-1.5 text-xs text-red-500">
                {errors.balance.message}
              </p>
            )}
          </div>
        </div>

        {/* DEFAULT ACCOUNT */}
        <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-slate-50 p-4">
          <input
            type="checkbox"
            {...register("isDefault")}
            className="mt-0.5 h-4 w-4 accent-(--pocket-blue)"
          />

          <div>
            <p className="text-sm font-medium text-slate-700">
              Make this my default account
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
              Pocket will automatically select this account when adding
              transactions.
            </p>
          </div>
        </label>

        {error && <p className="text-sm text-red-500">{error.message}</p>}

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
            {loading ? "Adding..." : "Add Account"}
          </button>
        </div>
      </form>
    </div>
  );
}
