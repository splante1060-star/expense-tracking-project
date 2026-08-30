import Link from "next/link";
import { Check, TriangleAlert, X } from "lucide-react";

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

export default function BudgetStatus({ budgets }: BudgetStatusProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Budget Status
          </h2>
        </div>

        <Link
          href="/budgets"
          className="text-xs font-medium text-(--pocket-blue) transition-opacity hover:opacity-70"
        >
          View all →
        </Link>
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
            const StatusIcon = status.icon;
            const barWidth = Math.min(budget.percent, 100);

            return (
              <div key={budget.id}>
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {formatCategory(budget.category)}
                      </p>

                      <div className="flex shrink-0 items-center gap-3 text-xs">
                        <span className="text-slate-500">
                          {formatCurrency(budget.spent)} /{" "}
                          {formatCurrency(budget.budgetAmount)}
                        </span>

                        <span className="w-8 text-right font-semibold text-slate-700">
                          {budget.percent}%
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
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${status.iconClass}`}
                  >
                    <StatusIcon size={13} strokeWidth={2.4} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
