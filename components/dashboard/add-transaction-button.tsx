"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import FormModal from "@/components/ui/form-modal";
import TransactionForm from "@/components/transactions/transaction-form";

type Account = {
  id: string;
  name: string;
  type: "DEBIT" | "CREDIT" | "SAVINGS";
  balance: number;
  isDefault: boolean;
};

type AddTransactionButtonProps = {
  accounts: Account[];
};

export default function AddTransactionButton({
  accounts,
}: AddTransactionButtonProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="group inline-flex h-10 items-center justify-center gap-2 rounded-full bg-(--pocket-blue) px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-(--pocket-blue-dark)"
      >
        <Plus size={16} />
        Add Transaction
      </button>

      <FormModal open={showForm} onClose={() => setShowForm(false)} size="lg">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Add Transaction
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Record income or spending and keep your Pocket up to date.
            </p>
          </div>

          <TransactionForm
            accounts={accounts}
            onClose={() => setShowForm(false)}
          />
        </div>
      </FormModal>
    </>
  );
}
