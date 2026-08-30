"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  MoreVertical,
  Pencil,
  PiggyBank,
  Plus,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import { deleteBudget } from "@/actions/budget";
import { categoryIconMap } from "@/lib/category-icons";
import AddBudgetForm from "./add-budget-form";

type Budget = {
  id: string;
  category: string;
  amount: number;
  spent: number;
};

type BudgetPageClientProps = {
  budgets: Budget[];
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const formatCategory = (category: string) =>
  category
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const getStatus = (percent: number) => {
  if (percent > 100) {
    return {
      label: "Over budget",
      icon: X,
      iconClass: "bg-(--pocket-red-light) text-(--pocket-red-dark)",
      barClass: "bg-(--pocket-red)",
    };
  }

  if (percent >= 75) {
    return {
      label: "Getting close",
      icon: TriangleAlert,
      iconClass: "bg-(--pocket-orange-light) text-(--pocket-orange-dark)",
      barClass: "bg-(--pocket-orange)",
    };
  }

  return {
    label: "On track",
    icon: Check,
    iconClass: "bg-(--pocket-green-light) text-(--pocket-green-dark)",
    barClass: "bg-(--pocket-green)",
  };
};

export default function BudgetPageClient({ budgets }: BudgetPageClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const router = useRouter();

  const totalBudget = budgets.reduce(
    (total, budget) => total + budget.amount,
    0,
  );

  const handleDelete = async (budget: Budget) => {
    const confirmed = window.confirm(
      `Delete the ${formatCategory(budget.category)} budget?`,
    );

    if (!confirmed) return;

    await deleteBudget(budget.id);

    setOpenMenu(null);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
            Monthly Budget
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            Give every spending category a plan.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingBudget(null);
            setShowForm((current) => !current);
          }}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-(--pocket-blue) px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-(--pocket-blue-dark)"
        >
          <Plus size={16} />
          Add Budget
        </button>
      </div>

      {showForm && (
        <AddBudgetForm
          budgets={budgets}
          budget={editingBudget}
          onClose={() => {
            setShowForm(false);
            setEditingBudget(null);
          }}
        />
      )}

      {/* OVERVIEW */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Total Monthly Budget
            </p>

            <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              {formatCurrency(totalBudget)}
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-(--pocket-blue-light) text-(--pocket-blue)">
            <PiggyBank size={21} strokeWidth={1.8} />
          </div>
        </div>
      </div>

      {/* BUDGETS */}
      {budgets.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-(--pocket-blue-light) text-(--pocket-blue)">
            <PiggyBank size={22} strokeWidth={1.8} />
          </div>

          <h2 className="mt-4 text-base font-semibold text-slate-900">
            No budgets yet
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
            Create your first monthly category budget and Pocket will start
            comparing your plan with your actual spending.
          </p>

          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-(--pocket-blue) px-5 text-sm font-semibold text-white transition-colors hover:bg-(--pocket-blue-dark)"
          >
            <Plus size={16} />
            Create Your First Budget
          </button>
        </div>
      ) : (
        <>
          {openMenu && (
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpenMenu(null)}
              className="fixed inset-0 z-40 cursor-default"
            />
          )}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {budgets.map((budget) => {
              const CategoryIcon =
                categoryIconMap[budget.category] ?? PiggyBank;

              const percent =
                budget.amount > 0
                  ? Math.round((budget.spent / budget.amount) * 100)
                  : 0;

              const remaining = budget.amount - budget.spent;
              const status = getStatus(percent);
              const StatusIcon = status.icon;
              const barWidth = Math.min(percent, 100);

              return (
                <div
                  key={budget.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {formatCategory(budget.category)}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Monthly limit
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--pocket-blue-light) text-(--pocket-blue)">
                        <CategoryIcon size={18} strokeWidth={1.8} />
                      </div>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenu(
                              openMenu === budget.id ? null : budget.id,
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                          aria-label="Budget options"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {openMenu === budget.id && (
                          <div className="absolute right-0 top-9 z-50 w-36 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingBudget(budget);
                                setShowForm(true);
                                setOpenMenu(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <Pencil size={15} />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(budget)}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={15} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-2xl font-bold tracking-tight text-slate-900">
                      {formatCurrency(budget.amount)}
                    </p>

                    <div className="mt-4 flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="text-slate-500">
                            {formatCurrency(budget.spent)} spent
                          </span>

                          <div className="flex items-center gap-3">
                            <span className="font-medium text-slate-500">
                              {formatCurrency(Math.abs(remaining))}{" "}
                              {remaining >= 0 ? "remaining" : "over"}
                            </span>

                            <span className="w-8 text-right font-semibold text-slate-700">
                              {percent}%
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full transition-all ${status.barClass}`}
                            style={{
                              width: `${barWidth}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div
                        title={status.label}
                        aria-label={status.label}
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${status.iconClass}`}
                      >
                        <StatusIcon size={14} strokeWidth={2.4} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
