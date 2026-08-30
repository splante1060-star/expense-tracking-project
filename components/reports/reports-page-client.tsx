"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { categoryColors } from "@/lib/category-colors";
import { categoryIconMap } from "@/lib/category-icons";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Download,
  PiggyBank,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";

type Summary = {
  income: number;
  spending: number;
  netCashFlow: number;
  averageDailySpend: number;

  previousIncome: number;
  previousSpending: number;
  previousNetCashFlow: number;
  previousAverageDailySpend: number;

  incomeChange: number;
  spendingChange: number;
  netCashFlowChange: number;
  averageDailySpendChange: number;
};

type SpendingComparisonItem = {
  category: string;
  current: number;
  previous: number;
  change: number;
};

type BudgetPerformanceItem = {
  id: string;
  category: string;
  budgetAmount: number;
  currentSpent: number;
  currentPercent: number;
  previousSpent: number;
  previousPercent: number;
  change: number;
};

type SavingsProgressItem = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  contributedThisMonth: number;
  targetDate: Date | null;
  icon: string;
};

type TopSpendingItem = {
  id: string;
  description: string | null;
  category: string;
  amount: number;
  date: Date;
};

type MonthlyTrendItem = {
  month: string;
  fullMonth: string;
  income: number;
  spending: number;
};

type ReportsPageClientProps = {
  selectedMonth: string;
  summary: Summary;
  spendingComparison: SpendingComparisonItem[];
  budgetPerformance: BudgetPerformanceItem[];
  savingsProgress: SavingsProgressItem[];
  topSpending: TopSpendingItem[];
  monthlyTrend: MonthlyTrendItem[];
};

const formatCurrency = (value: number, decimals = 2) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);

const formatGoalCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);

const formatCategory = (category: string) =>
  category
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatChange = (current: number, previous: number, change: number) => {
  if (previous === 0 && current > 0) {
    return {
      label: "NEW",
      direction: "new",
    };
  }

  if (current === 0 && previous === 0) {
    return {
      label: "—",
      direction: "neutral",
    };
  }

  if (change > 0) {
    return {
      label: `↑ ${Math.abs(change)}%`,
      direction: "up",
    };
  }

  if (change < 0) {
    return {
      label: `↓ ${Math.abs(change)}%`,
      direction: "down",
    };
  }

  return {
    label: "—",
    direction: "neutral",
  };
};

export default function ReportsPageClient({
  selectedMonth,
  summary,
  spendingComparison,
  budgetPerformance,
  savingsProgress,
  topSpending,
  monthlyTrend,
}: ReportsPageClientProps) {
  const router = useRouter();

  const selectedDate = new Date(`${selectedMonth}-01T12:00:00`);

  const monthLabel = selectedDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const previousDate = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth() - 1,
    1,
  );

  const previousMonthLabel = previousDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const selectedMonthShortLabel = selectedDate.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  const previousMonthShortLabel = previousDate.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  const changeMonth = (offset: number) => {
    const next = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + offset,
      1,
    );

    const month = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(
      2,
      "0",
    )}`;

    router.push(`/reports?month=${month}`);
  };

  const [spendingSort, setSpendingSort] = useState<"amount" | "change">(
    "amount",
  );

  const sortedSpendingComparison = [...spendingComparison].sort((a, b) => {
    if (spendingSort === "change") {
      return Math.abs(b.change) - Math.abs(a.change);
    }

    return b.current - a.current;
  });

  const [showFullBreakdown, setShowFullBreakdown] = useState(false);
  const visibleSpendingComparison = showFullBreakdown
    ? sortedSpendingComparison
    : sortedSpendingComparison.slice(0, 5);

  const [showTrend, setShowTrend] = useState(false);
  const [trendRange, setTrendRange] = useState<"6m" | "12m" | "all">("6m");

  const previewTrend = monthlyTrend.slice(-4);

  const visibleTrend =
    trendRange === "6m"
      ? monthlyTrend.slice(-6)
      : trendRange === "12m"
        ? monthlyTrend.slice(-12)
        : monthlyTrend;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
            Reports
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            See where your money went and how your plan is progressing.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          <Download size={16} />
          Export
        </button>
      </div>

      {/* MONTH CONTROLS */}
      <div className="flex items-center gap-2">
        <div className="flex h-9 items-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => changeMonth(-1)}
            className="flex h-full w-9 items-center justify-center text-slate-500 transition-colors hover:bg-(--pocket-blue-light) hover:text-(--pocket-blue)"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex h-full min-w-34 items-center justify-center gap-2 border-x border-slate-200 px-3.5 text-sm font-medium text-slate-700">
            <CalendarDays size={15} />
            {monthLabel}
          </div>

          <button
            type="button"
            aria-label="Next month"
            onClick={() => changeMonth(1)}
            className="flex h-full w-9 items-center justify-center text-slate-500 transition-colors hover:bg-(--pocket-blue-light) hover:text-(--pocket-blue)"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Income"
          value={summary.income}
          previousValue={summary.previousIncome}
          change={summary.incomeChange}
          tone="income"
          comparisonLabel={`vs ${previousMonthLabel}`}
        />

        <SummaryCard
          title="Spending"
          value={summary.spending}
          previousValue={summary.previousSpending}
          change={summary.spendingChange}
          tone="spending"
          comparisonLabel={`vs ${previousMonthLabel}`}
        />

        <SummaryCard
          title="Net Cash Flow"
          value={summary.netCashFlow}
          previousValue={summary.previousNetCashFlow}
          change={summary.netCashFlowChange}
          tone="cash"
          comparisonLabel={`vs ${previousMonthLabel}`}
        />

        <SummaryCard
          title="Average Daily Spend"
          value={summary.averageDailySpend}
          previousValue={summary.previousAverageDailySpend}
          change={summary.averageDailySpendChange}
          tone="average"
          comparisonLabel={`vs ${previousMonthLabel}`}
        />
      </div>

      {/* MONTH COMPARISONS */}
      <div className="grid gap-4 xl:grid-cols-[1fr_1.3fr]">
        {/* SPENDING BY CATEGORY */}
        <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                Spending by Category
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                This month vs last month
              </p>
            </div>

            <select
              value={spendingSort}
              onChange={(event) =>
                setSpendingSort(event.target.value as "amount" | "change")
              }
              className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none transition-colors focus:border-(--pocket-blue-soft)"
            >
              <option value="amount">By amount</option>
              <option value="change">By change</option>
            </select>
          </div>

          <div className="mt-5 flex-1">
            <div className="grid grid-cols-[minmax(0,1fr)_90px_90px_70px] gap-4 border-b border-slate-100 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              <span>Category</span>

              <span className="text-right">{selectedMonthShortLabel}</span>

              <span className="text-right">{previousMonthShortLabel}</span>

              <span className="text-right">Change</span>
            </div>

            <div className="divide-y divide-slate-100">
              {visibleSpendingComparison.map((item) => {
                const color = categoryColors[item.category] ?? "#94a3b8";

                const changeDisplay = formatChange(
                  item.current,
                  item.previous,
                  item.change,
                );

                return (
                  <div
                    key={item.category}
                    className="grid grid-cols-[minmax(0,1fr)_90px_90px_70px] items-center gap-4 py-3 text-sm"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: color,
                        }}
                      />

                      <span className="truncate font-medium text-slate-700">
                        {formatCategory(item.category)}
                      </span>
                    </div>

                    <span className="text-right font-medium text-slate-700">
                      {formatCurrency(item.current)}
                    </span>

                    <span className="text-right text-slate-400">
                      {formatCurrency(item.previous)}
                    </span>

                    <span
                      className={`text-right text-xs font-semibold ${
                        changeDisplay.direction === "up"
                          ? "text-(--pocket-red-dark)"
                          : changeDisplay.direction === "down"
                            ? "text-(--pocket-green-dark)"
                            : changeDisplay.direction === "new"
                              ? "text-(--pocket-purple)"
                              : "text-slate-400"
                      }`}
                    >
                      {changeDisplay.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setShowFullBreakdown((current) => !current)}
              className="text-xs font-medium text-(--pocket-blue) transition-opacity hover:opacity-70"
            >
              {showFullBreakdown ? "Show less ↑" : "View full breakdown →"}
            </button>
          </div>
        </div>

        {/* BUDGET PERFORMANCE */}
        <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                Budget Performance
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                This month vs last month
              </p>
            </div>

            <Link
              href="/budgets"
              className="text-xs font-medium text-(--pocket-blue) transition-opacity hover:opacity-70"
            >
              View all budgets →
            </Link>
          </div>

          <div className="mt-5 flex-1">
            <div className="grid grid-cols-[minmax(130px,1.1fr)_80px_minmax(115px,1fr)_minmax(115px,1fr)_65px] gap-4 border-b border-slate-100 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              <span>Category</span>

              <span>Budget</span>

              <span>
                {selectedMonthShortLabel}
                <br />
                Spent / %
              </span>

              <span>
                {previousMonthShortLabel}
                <br />
                Spent / %
              </span>

              <span className="text-right">Change</span>
            </div>

            <div className="divide-y divide-slate-100">
              {budgetPerformance.map((budget) => {
                const CategoryIcon =
                  categoryIconMap[budget.category] ?? PiggyBank;

                const color = categoryColors[budget.category] ?? "#94a3b8";

                return (
                  <div
                    key={budget.id}
                    className="grid grid-cols-[minmax(130px,1.1fr)_80px_minmax(115px,1fr)_minmax(115px,1fr)_65px] items-center gap-4 py-4"
                  >
                    {/* CATEGORY */}
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                        style={{
                          color,
                          backgroundColor: `${color}18`,
                        }}
                      >
                        <CategoryIcon size={17} strokeWidth={1.8} />
                      </div>

                      <span className="truncate text-sm font-semibold text-slate-800">
                        {formatCategory(budget.category)}
                      </span>
                    </div>

                    {/* BUDGET */}
                    <span className="text-xs font-medium text-slate-500">
                      {formatCurrency(budget.budgetAmount, 0)}
                    </span>

                    {/* SELECTED MONTH */}
                    <BudgetComparisonBar
                      spent={budget.currentSpent}
                      percent={budget.currentPercent}
                    />

                    {/* PREVIOUS MONTH */}
                    <BudgetComparisonBar
                      spent={budget.previousSpent}
                      percent={budget.previousPercent}
                    />

                    {/* CHANGE */}
                    <span
                      className={`text-right text-xs font-semibold ${
                        budget.change > 0
                          ? "text-(--pocket-red-dark)"
                          : budget.change < 0
                            ? "text-(--pocket-green-dark)"
                            : "text-slate-400"
                      }`}
                    >
                      {budget.change > 0 ? "↑" : budget.change < 0 ? "↓" : "—"}

                      {budget.change !== 0 && <> {Math.abs(budget.change)}%</>}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* LOWER REPORTS */}
      <div className="grid gap-4 xl:grid-cols-3">
        {/* INCOME VS SPENDING */}
        <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="font-semibold text-slate-900">
              Income vs. Spending
            </h2>

            <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-(--pocket-green)" />
                Income
              </div>

              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-(--pocket-orange)" />
                Spending
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-1 items-end gap-4">
            {previewTrend.map((item) => {
              const maxValue = Math.max(
                ...monthlyTrend.flatMap((month) => [
                  month.income,
                  month.spending,
                ]),
                1,
              );

              return (
                <div
                  key={item.month}
                  className="group flex flex-1 flex-col items-center gap-2"
                >
                  <div className="relative flex h-40 items-end gap-1.5">
                    {/* INCOME */}
                    <div className="flex h-full items-end">
                      <div
                        className="group/income relative w-3 rounded-t bg-(--pocket-green) transition-opacity hover:opacity-80"
                        style={{
                          height: `${(item.income / maxValue) * 100}%`,
                          minHeight: item.income > 0 ? "4px" : "0",
                        }}
                      >
                        {item.income > 0 && (
                          <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover/income:opacity-100">
                            Income {formatCurrency(item.income)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SPENDING */}
                    <div className="flex h-full items-end">
                      <div
                        className="group/spending relative w-3 rounded-t bg-(--pocket-orange) transition-opacity hover:opacity-80"
                        style={{
                          height: `${(item.spending / maxValue) * 100}%`,
                          minHeight: item.spending > 0 ? "4px" : "0",
                        }}
                      >
                        {item.spending > 0 && (
                          <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover/spending:opacity-100">
                            Spending {formatCurrency(item.spending)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs text-slate-400">{item.month}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setShowTrend((current) => !current)}
              className="text-xs font-medium text-(--pocket-blue) transition-opacity hover:opacity-70"
            >
              {showTrend ? "Hide trend ↑" : "View trend over time →"}
            </button>
          </div>
        </div>

        {/* SAVINGS GOALS */}
        <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                Savings Goals Progress
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Contributions this month
              </p>
            </div>

            <Link
              href="/goals"
              className="text-xs font-medium text-(--pocket-blue) transition-opacity hover:opacity-70"
            >
              View all goals →
            </Link>
          </div>

          <div className="mt-5 flex-1 space-y-6">
            {savingsProgress.map((goal) => {
              const contributionPercent =
                goal.targetAmount > 0
                  ? Math.min(
                      Math.round(
                        (goal.contributedThisMonth / goal.targetAmount) * 100,
                      ),
                      100,
                    )
                  : 0;

              return (
                <div key={goal.id}>
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {goal.name}
                  </p>

                  <div className="mt-1 flex items-center justify-between gap-4">
                    <p className="text-xs text-slate-500">
                      {formatCurrency(goal.contributedThisMonth)} this month
                    </p>

                    <p className="shrink-0 text-xs font-medium text-slate-500">
                      {formatGoalCurrency(goal.currentAmount)} /{" "}
                      {formatGoalCurrency(goal.targetAmount)} overall
                    </p>
                  </div>

                  <div className="mt-3 flex w-full items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-(--pocket-green)"
                        style={{
                          width: `${contributionPercent}%`,
                        }}
                      />
                    </div>

                    <span className="w-8 shrink-0 text-right text-xs font-semibold text-(--pocket-green-dark)">
                      {contributionPercent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TOP SPENDING */}
        <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-semibold text-slate-900">Top Spending</h2>

            <Link
              href="/transactions"
              className="text-xs font-medium text-(--pocket-blue) transition-opacity hover:opacity-70"
            >
              View all transactions →
            </Link>
          </div>

          <div className="mt-3 flex-1 divide-y divide-slate-100">
            {topSpending.map((transaction) => {
              const CategoryIcon =
                categoryIconMap[transaction.category] ?? Wallet;

              const color = categoryColors[transaction.category] ?? "#94a3b8";

              return (
                <div
                  key={transaction.id}
                  className="flex items-center gap-3 py-3"
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      color,
                      backgroundColor: `${color}18`,
                    }}
                  >
                    <CategoryIcon size={17} strokeWidth={1.8} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {transaction.description ||
                        formatCategory(transaction.category)}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                      {formatCategory(transaction.category)}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-slate-800">
                      -{formatCurrency(transaction.amount)}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                      {new Date(transaction.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showTrend && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                Income & Spending Trend
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                See how your cash flow changes over time
              </p>
            </div>

            <div className="flex rounded-xl bg-slate-100 p-1">
              {[
                { value: "6m", label: "6 months" },
                { value: "12m", label: "12 months" },
                { value: "all", label: "All time" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setTrendRange(option.value as "6m" | "12m" | "all")
                  }
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    trendRange === option.value
                      ? "bg-white font-semibold text-(--pocket-blue) shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 px-6 pb-5 pt-6">
            <div className="mb-5 flex items-center gap-5 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-(--pocket-green)" />
                Income
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-(--pocket-orange)" />
                Spending
              </div>
            </div>

            <div
              className={`grid gap-4 ${
                trendRange === "6m"
                  ? "grid-cols-6"
                  : trendRange === "12m"
                    ? "grid-cols-12"
                    : "grid-cols-6 lg:grid-cols-12"
              }`}
            >
              {visibleTrend.map((item) => {
                const netCashFlow = item.income - item.spending;

                const maxValue = Math.max(
                  ...monthlyTrend.flatMap((month) => [
                    month.income,
                    month.spending,
                  ]),
                  1,
                );

                return (
                  <div
                    key={item.month}
                    className="flex min-w-0 flex-col items-center"
                  >
                    <div className="relative flex h-48 w-full items-end justify-center gap-3">
                      {/* INCOME */}
                      <div className="flex h-full items-end">
                        <div
                          className="group/income relative w-5 rounded-t-md bg-(--pocket-green) transition-opacity hover:opacity-80"
                          style={{
                            height: `${(item.income / maxValue) * 100}%`,
                            minHeight: item.income > 0 ? "5px" : "0",
                          }}
                        >
                          {item.income > 0 && (
                            <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover/income:opacity-100">
                              Income {formatCurrency(item.income)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* SPENDING */}
                      <div className="flex h-full items-end">
                        <div
                          className="group/spending relative w-5 rounded-t-md bg-(--pocket-orange) transition-opacity hover:opacity-80"
                          style={{
                            height: `${(item.spending / maxValue) * 100}%`,
                            minHeight: item.spending > 0 ? "5px" : "0",
                          }}
                        >
                          {item.spending > 0 && (
                            <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover/spending:opacity-100">
                              Spending {formatCurrency(item.spending)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="mt-3 text-xs font-medium text-slate-500">
                      {item.month}
                    </p>

                    {(item.income > 0 || item.spending > 0) && (
                      <p
                        className={`mt-1 text-[11px] font-semibold text-center ${
                          netCashFlow >= 0
                            ? "text-(--pocket-green-dark)"
                            : "text-(--pocket-red-dark)"
                        }`}
                      >
                        {netCashFlow >= 0 ? "+" : ""}
                        {formatCurrency(netCashFlow)} net
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <p className="pb-2 text-center text-xs text-slate-400">
        Reports are based on completed transactions only.
      </p>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  previousValue,
  change,
  tone,
  comparisonLabel,
}: {
  title: string;
  value: number;
  previousValue: number;
  change: number;
  tone: "income" | "spending" | "cash" | "average";
  comparisonLabel: string;
}) {
  const positive = change >= 0;

  const toneClasses = {
    income: "bg-(--pocket-green-light) text-(--pocket-green-dark)",
    spending: "bg-(--pocket-red-light) text-(--pocket-red-dark)",
    cash: "bg-(--pocket-blue-light) text-(--pocket-blue)",
    average: "bg-(--pocket-orange-light) text-(--pocket-orange-dark)",
  };

  const icons = {
    income: CircleDollarSign,
    spending: CreditCard,
    cash: Activity,
    average: Wallet,
  };

  const Icon = icons[tone];

  const changeDisplay = formatChange(value, previousValue, change);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone]}`}
        >
          <Icon size={21} />
        </div>

        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {formatCurrency(value)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs">
        <span className="text-slate-400">{comparisonLabel}</span>

        <span
          className={`font-semibold ${
            changeDisplay.direction === "up"
              ? "text-(--pocket-green-dark)"
              : changeDisplay.direction === "down"
                ? "text-(--pocket-red-dark)"
                : changeDisplay.direction === "new"
                  ? "text-(--pocket-purple)"
                  : "text-slate-400"
          }`}
        >
          {changeDisplay.label}
        </span>
      </div>
    </div>
  );
}

function BudgetComparisonBar({
  spent,
  percent,
}: {
  spent: number;
  percent: number;
}) {
  const barClass =
    percent > 100
      ? "bg-(--pocket-red)"
      : percent >= 75
        ? "bg-(--pocket-orange)"
        : "bg-(--pocket-green)";

  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-medium text-slate-600">
          {formatCurrency(spent)}
        </span>

        <span className="font-semibold text-slate-700">{percent}%</span>
      </div>

      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${barClass}`}
          style={{
            width: `${Math.min(percent, 100)}%`,
          }}
        />
      </div>
    </div>
  );
}
