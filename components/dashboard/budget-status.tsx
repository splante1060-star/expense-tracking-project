import Link from "next/link";
import { PiggyBank } from "lucide-react";

type BudgetStatusItem = {
  id: string;
  category: string;
  budgetAmount: number;
  spent: number;
  percent: number;
  remaining: number;
};

type BudgetStatusProps = {
  budgets: BudgetStatusItem[];
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
  if (percent >= 100) {
    return {
      label: "Over budget",
      textClass: "text-(--pocket-red-dark)",
      barClass: "bg-(--pocket-red)",
    };
  }

  if (percent >= 75) {
    return {
      label: "Getting close",
      textClass: "text-(--pocket-orange-dark)",
      barClass: "bg-(--pocket-orange)",
    };
  }

  return {
    label: "On track",
    textClass: "text-(--pocket-blue)",
    barClass: "bg-(--pocket-blue)",
  };
};

export default function BudgetStatus({ budgets }: BudgetStatusProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Budget Status
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            How your spending compares to your plan.
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--pocket-blue-light) text-(--pocket-blue)">
          <PiggyBank size={19} strokeWidth={1.8} />
        </div>
      </div>

      {budgets.length === 0 ? (
        <div className="flex min-h-48 items-center justify-center text-center">
          <div>
            <p className="text-sm font-medium text-slate-600">
              No budgets to track yet.
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Add a monthly budget to see your progress here.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {budgets.slice(0, 4).map((budget) => {
            const status = getStatus(budget.percent);
            const barWidth = Math.min(budget.percent, 100);

            return (
              <div key={budget.id}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {formatCategory(budget.category)}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatCurrency(budget.spent)} of{" "}
                      {formatCurrency(budget.budgetAmount)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-800">
                      {budget.percent}%
                    </p>

                    <p
                      className={`mt-0.5 text-xs font-medium ${status.textClass}`}
                    >
                      {status.label}
                    </p>
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
            );
          })}
        </div>
      )}

      <div className="mt-5 border-t border-slate-100 pt-4">
        <Link
          href="/budgets"
          className="text-sm font-medium text-(--pocket-blue) transition-colors hover:opacity-70"
        >
          View all budgets →
        </Link>
      </div>
    </div>
  );
}
