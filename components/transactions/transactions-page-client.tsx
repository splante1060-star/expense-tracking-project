"use client";

import { useState } from "react";

import FormModal from "@/components/ui/form-modal";
import TransactionForm from "@/components/transactions/transaction-form";
import TransactionsList from "@/components/transactions/transactions-list";

type Account = {
  id: string;
  name: string;
  type: "DEBIT" | "CREDIT" | "SAVINGS";
  balance: number;
  isDefault: boolean;
};

type RecurringTransaction = {
  id: string;
  interval: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  isActive: boolean;
} | null;

type Transaction = {
  id: string;
  description: string | null;
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
  type: "INCOME" | "EXPENSE";
  amount: number;
  date: Date;
  createdAt: Date;
  status: string;
  isRecurring: boolean;
  recurringInterval: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | null;
  recurringTransaction: RecurringTransaction;
  account: {
    id: string;
    name: string;
    type: "DEBIT" | "CREDIT" | "SAVINGS";
  };
};

type TransactionsPageClientProps = {
  transactions: Transaction[];
  accounts: Account[];
};

export default function TransactionsPageClient({
  transactions,
  accounts,
}: TransactionsPageClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const handleAdd = () => {
    setEditingTransaction(null);
    setShowForm(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const formatTransactionDate = (value: Date) => {
    const date = new Date(value);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
            Transactions
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            View and manage your spending and income.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex h-10 items-center justify-center rounded-full bg-(--pocket-blue) px-5 text-sm font-semibold text-white transition-colors hover:bg-(--pocket-blue-dark)"
        >
          + Add Transaction
        </button>
      </div>

      <TransactionsList
        transactions={transactions}
        onEditTransaction={handleEdit}
      />

      <FormModal open={showForm} onClose={handleCloseForm} size="lg">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              {editingTransaction ? "Edit Transaction" : "Add Transaction"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {editingTransaction
                ? "Update the details for this transaction."
                : "Record income or spending and keep your Pocket up to date."}
            </p>
          </div>

          <TransactionForm
            accounts={accounts}
            transaction={
              editingTransaction
                ? {
                    id: editingTransaction.id,
                    type: editingTransaction.type,
                    amount: editingTransaction.amount.toString(),
                    description: editingTransaction.description ?? "",
                    date: formatTransactionDate(editingTransaction.date),
                    category: editingTransaction.category,
                    accountId: editingTransaction.account.id,
                    recurringTransaction:
                      editingTransaction.recurringTransaction,
                  }
                : undefined
            }
            onClose={handleCloseForm}
          />
        </div>
      </FormModal>
    </div>
  );
}
