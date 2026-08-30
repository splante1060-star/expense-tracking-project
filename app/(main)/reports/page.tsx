import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import ReportsPageClient from "@/components/reports/reports-page-client";

type ReportsPageProps = {
  searchParams: Promise<{
    month?: string;
  }>;
};

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const now = new Date();

  const selectedMonth =
    params.month && /^\d{4}-\d{2}$/.test(params.month)
      ? params.month
      : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [year, month] = selectedMonth.split("-").map(Number);

  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 1);

  const previousMonthStart = new Date(year, month - 2, 1);
  const previousMonthEnd = monthStart;

  const trendStart = new Date(year, month - 6, 1);

  const [
    transactions,
    previousTransactions,
    trendTransactions,
    budgets,
    savingsGoals,
    savingsContributions,
  ] = await Promise.all([
    db.transaction.findMany({
      where: {
        userId: user.id,
        status: "COMPLETED",
        date: {
          gte: monthStart,
          lt: monthEnd,
        },
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),

    db.transaction.findMany({
      where: {
        userId: user.id,
        status: "COMPLETED",
        date: {
          gte: previousMonthStart,
          lt: previousMonthEnd,
        },
      },
    }),

    db.transaction.findMany({
      where: {
        userId: user.id,
        status: "COMPLETED",
        date: {
          lt: monthEnd,
        },
      },
      orderBy: { date: "asc" },
    }),

    db.budget.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),

    db.savingsGoal.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),

    db.savingsContribution.findMany({
      where: {
        userId: user.id,
        date: {
          gte: monthStart,
          lt: monthEnd,
        },
      },
    }),
  ]);

  const getTotals = (items: typeof transactions) => {
    const income = items
      .filter((transaction) => transaction.type === "INCOME")
      .reduce((total, transaction) => total + transaction.amount.toNumber(), 0);

    const spending = items
      .filter((transaction) => transaction.type === "EXPENSE")
      .reduce((total, transaction) => total + transaction.amount.toNumber(), 0);

    return {
      income,
      spending,
      netCashFlow: income - spending,
    };
  };

  const currentTotals = getTotals(transactions);
  const previousTotals = getTotals(previousTransactions);

  const daysInMonth = new Date(year, month, 0).getDate();

  const averageDailySpend = currentTotals.spending / daysInMonth;

  const previousDaysInMonth = new Date(year, month - 1, 0).getDate();

  const previousAverageDailySpend =
    previousTotals.spending / previousDaysInMonth;

  const getPercentChange = (current: number, previous: number) => {
    if (previous === 0) {
      return current === 0 ? 0 : 100;
    }

    return Math.round(((current - previous) / previous) * 100);
  };

  const categoryTotals = new Map<string, number>();
  const previousCategoryTotals = new Map<string, number>();

  transactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .forEach((transaction) => {
      categoryTotals.set(
        transaction.category,
        (categoryTotals.get(transaction.category) ?? 0) +
          transaction.amount.toNumber(),
      );
    });

  previousTransactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .forEach((transaction) => {
      previousCategoryTotals.set(
        transaction.category,
        (previousCategoryTotals.get(transaction.category) ?? 0) +
          transaction.amount.toNumber(),
      );
    });

  const allCategories = Array.from(
    new Set([...categoryTotals.keys(), ...previousCategoryTotals.keys()]),
  );

  const spendingComparison = allCategories
    .map((category) => {
      const current = categoryTotals.get(category) ?? 0;
      const previous = previousCategoryTotals.get(category) ?? 0;

      return {
        category,
        current,
        previous,
        change: getPercentChange(current, previous),
      };
    })
    .sort((a, b) => b.current - a.current);

  const budgetPerformance = budgets.map((budget) => {
    const amount = budget.amount.toNumber();

    const currentSpent = categoryTotals.get(budget.category) ?? 0;

    const previousSpent = previousCategoryTotals.get(budget.category) ?? 0;

    const currentPercent =
      amount > 0 ? Math.round((currentSpent / amount) * 100) : 0;

    const previousPercent =
      amount > 0 ? Math.round((previousSpent / amount) * 100) : 0;

    return {
      id: budget.id,
      category: budget.category,
      budgetAmount: amount,
      currentSpent,
      currentPercent,
      previousSpent,
      previousPercent,
      change: currentPercent - previousPercent,
    };
  });

  const savingsContributionMap = new Map<string, number>();

  savingsContributions.forEach((contribution) => {
    savingsContributionMap.set(
      contribution.savingsGoalId,
      (savingsContributionMap.get(contribution.savingsGoalId) ?? 0) +
        contribution.amount.toNumber(),
    );
  });

  const savingsProgress = savingsGoals.map((goal) => ({
    id: goal.id,
    name: goal.name,
    targetAmount: goal.targetAmount.toNumber(),
    currentAmount: goal.currentAmount.toNumber(),
    contributedThisMonth: savingsContributionMap.get(goal.id) ?? 0,
    targetDate: goal.targetDate,
    icon: goal.icon,
  }));

  const topSpending = transactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .sort((a, b) => b.amount.toNumber() - a.amount.toNumber())
    .slice(0, 5)
    .map((transaction) => ({
      id: transaction.id,
      description: transaction.description,
      category: transaction.category,
      amount: transaction.amount.toNumber(),
      date: transaction.date,
    }));

  const oldestTrendDate =
    trendTransactions[0]?.date ?? new Date(year, month, 1);

  const oldestMonth = new Date(
    oldestTrendDate.getFullYear(),
    oldestTrendDate.getMonth(),
    1,
  );

  const selectedMonthDate = new Date(year, month - 1, 1);

  const monthCount =
    (selectedMonthDate.getFullYear() - oldestMonth.getFullYear()) * 12 +
    (selectedMonthDate.getMonth() - oldestMonth.getMonth()) +
    1;

  const trendLength = Math.max(12, monthCount);

  const monthlyTrend = Array.from({ length: trendLength }, (_, index) => {
    const date = new Date(year, month - trendLength + index, 1);
    const trendYear = date.getFullYear();
    const trendMonth = date.getMonth();

    const items = trendTransactions.filter(
      (transaction) =>
        transaction.date.getFullYear() === trendYear &&
        transaction.date.getMonth() === trendMonth,
    );

    const totals = getTotals(items);

    return {
      month: date.toLocaleDateString("en-US", {
        month: "short",
      }),
      fullMonth: date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      income: totals.income,
      spending: totals.spending,
    };
  });

  return (
    <ReportsPageClient
      userName={user.name ?? "Pocket User"}
      selectedMonth={selectedMonth}
      summary={{
        income: currentTotals.income,
        spending: currentTotals.spending,
        netCashFlow: currentTotals.netCashFlow,
        averageDailySpend,

        previousIncome: previousTotals.income,
        previousSpending: previousTotals.spending,
        previousNetCashFlow: previousTotals.netCashFlow,
        previousAverageDailySpend,

        incomeChange: getPercentChange(
          currentTotals.income,
          previousTotals.income,
        ),
        spendingChange: getPercentChange(
          currentTotals.spending,
          previousTotals.spending,
        ),
        netCashFlowChange: getPercentChange(
          currentTotals.netCashFlow,
          previousTotals.netCashFlow,
        ),
        averageDailySpendChange: getPercentChange(
          averageDailySpend,
          previousAverageDailySpend,
        ),
      }}
      spendingComparison={spendingComparison}
      budgetPerformance={budgetPerformance}
      savingsProgress={savingsProgress}
      topSpending={topSpending}
      monthlyTrend={monthlyTrend}
    />
  );
}
