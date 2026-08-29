"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  CalendarDays,
  MoreVertical,
  Pencil,
  Plus,
  ReceiptText,
  Repeat2,
  Trash2,
  Zap,
} from "lucide-react";

import type {
  CategoryType,
  RecurringInterval,
} from "@/lib/generated/prisma/client";
import AddBillForm from "@/components/bills/add-bill-form";
import { deleteBill } from "@/actions/bill";
import { categoryIconMap } from "@/lib/category-icons";

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
  isRecurring: boolean;
  recurringInterval: RecurringInterval | null;
  isAutoPay: boolean;
  accountId: string | null;
  account: Account | null;
};

type BillsPageClientProps = {
  bills: Bill[];
  accounts: Account[];
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatCategory(category: string) {
  return category
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatInterval(interval: Bill["recurringInterval"]) {
  if (!interval) return null;

  return interval
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function BillsPageClient({
  bills,
  accounts,
}: BillsPageClientProps) {
  const router = useRouter();

  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingBill(null);
    setShowForm(true);
    setDeleteError(null);
  };

  const handleEdit = (bill: Bill) => {
    setEditingBill(bill);
    setShowForm(true);
    setOpenMenu(null);
    setDeleteError(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingBill(null);
  };

  const handleDelete = async (bill: Bill) => {
    setOpenMenu(null);
    setDeleteError(null);

    const confirmed = window.confirm(
      `Delete "${bill.name}"? This cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      await deleteBill(bill.id);
      router.refresh();
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Something went wrong deleting this bill.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Bills
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Stay ahead of upcoming payments and recurring expenses.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-(--pocket-blue) px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-(--pocket-blue-dark)"
        >
          <Plus size={16} />
          Add Bill
        </button>
      </div>

      {deleteError && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {deleteError}
        </div>
      )}

      {showForm && (
        <AddBillForm
          accounts={accounts}
          bill={editingBill}
          onClose={handleCloseForm}
        />
      )}

      {bills.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-(--pocket-blue-light) text-(--pocket-blue)">
            <ReceiptText size={22} />
          </div>

          <h2 className="mt-4 text-base font-semibold text-slate-900">
            No bills yet
          </h2>

          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            Add your regular expenses so Pocket can help you keep an eye on
            what&apos;s coming up.
          </p>

          <button
            type="button"
            onClick={handleAdd}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-(--pocket-blue) px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-(--pocket-blue-dark)"
          >
            <Plus size={16} />
            Add Your First Bill
          </button>
        </div>
      ) : (
        <div className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Upcoming Bills</h2>
          </div>

          <div className="divide-y divide-slate-100">
            {bills.map((bill) => {
              const CategoryIcon =
                categoryIconMap[bill.category] ?? ReceiptText;

              const recurringLabel = bill.isRecurring
                ? formatInterval(bill.recurringInterval)
                : null;

              return (
                <div
                  key={bill.id}
                  className="relative grid gap-4 px-5 py-4 sm:grid-cols-[minmax(0,1.5fr)_minmax(120px,0.8fr)_130px_110px_24px] sm:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--pocket-blue-light) text-(--pocket-blue)">
                      <CategoryIcon size={18} strokeWidth={1.8} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">
                        {bill.name}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
                        <span>{formatCategory(bill.category)}</span>

                        {bill.account && (
                          <>
                            <span>•</span>
                            <span>{bill.account.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays size={14} className="text-slate-400" />

                      <span>
                        {new Date(bill.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {bill.isRecurring && recurringLabel && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                        <Repeat2 size={12} />
                        {recurringLabel}
                      </span>
                    )}

                    {bill.isAutoPay && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 font-medium text-amber-700">
                        <Zap size={12} />
                        AutoPay
                      </span>
                    )}
                  </div>

                  <div className="text-left font-semibold text-slate-900 sm:text-right">
                    {formatCurrency(bill.amount)}
                  </div>

                  <div className="relative justify-self-end">
                    <button
                      type="button"
                      aria-label={`Open menu for ${bill.name}`}
                      onClick={() =>
                        setOpenMenu((current) =>
                          current === bill.id ? null : bill.id,
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      <MoreVertical size={17} />
                    </button>

                    {openMenu === bill.id && (
                      <>
                        <button
                          type="button"
                          aria-label="Close bill menu"
                          onClick={() => setOpenMenu(null)}
                          className="fixed inset-0 z-40 cursor-default"
                        />

                        <div className="absolute right-0 top-9 z-50 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                          <button
                            type="button"
                            onClick={() => handleEdit(bill)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(bill)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
