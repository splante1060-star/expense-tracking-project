import {
  Wallet,
  ChartNoAxesCombined,
  ReceiptText,
  PiggyBank,
} from "lucide-react";

type SummaryCardsProps = {
  availableToSpend: number;
  spentThisMonth: number;
  monthlyBudget: number;
  upcomingBills: number;
  currentSavings: number;
  savingsTarget: number;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export default function SummaryCards({
  availableToSpend,
  spentThisMonth,
  monthlyBudget,
  upcomingBills,
  currentSavings,
  savingsTarget,
}: SummaryCardsProps) {
  const budgetPercent =
    monthlyBudget > 0
      ? Math.min((spentThisMonth / monthlyBudget) * 100, 100)
      : 0;

  const savingsPercent =
    savingsTarget > 0
      ? Math.min((currentSavings / savingsTarget) * 100, 100)
      : 0;

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* AVAILABLE TO SPEND */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Available to Spend
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {formatCurrency(availableToSpend)}
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(emerald-50) text-emerald-600">
            <Wallet size={19} strokeWidth={1.8} />
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-500">Remaining this month</p>
      </div>

      {/* SPENT THIS MONTH */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Spent This Month
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {formatCurrency(spentThisMonth)}
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--pocket-purple-light) text-(--pocket-purple)">
            <ChartNoAxesCombined size={19} strokeWidth={1.8} />
          </div>
        </div>

        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              of {formatCurrency(monthlyBudget)} budget
            </span>

            <span className="font-medium text-slate-700">
              {Math.round(budgetPercent)}%
            </span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-(--pocket-purple)"
              style={{ width: `${budgetPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* UPCOMING BILLS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Upcoming Bills</p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {formatCurrency(upcomingBills)}
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--pocket-orange-light) text-(--pocket-orange)">
            {" "}
            <ReceiptText size={19} strokeWidth={1.8} />
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-500">Due in the next 14 days</p>
      </div>

      {/* SAVINGS PROGRESS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Savings Progress
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {formatCurrency(currentSavings)}
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--pocket-green-light) text-(--pocket-green)">
            {" "}
            <PiggyBank size={19} strokeWidth={1.8} />
          </div>
        </div>

        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              of {formatCurrency(savingsTarget)} goal
            </span>

            <span className="font-medium text-slate-700">
              {Math.round(savingsPercent)}%
            </span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-(--pocket-green)"
              style={{ width: `${savingsPercent}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
