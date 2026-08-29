import { db } from "@/lib/prisma";

export type PocketInsight = {
  type:
    | "SPENDING_TREND"
    | "BUDGET_WARNING"
    | "UPCOMING_BILLS"
    | "SAVINGS_PROGRESS";

  message: string;
  highlights?: string[];
  tone: "positive" | "neutral" | "warning";
  priority: number;
};

type GetPocketInsightsParams = {
  userId: string;
  selectedMonth: Date;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatCategory(category: string) {
  return category
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export async function getPocketInsights({
  userId,
  selectedMonth,
}: GetPocketInsightsParams): Promise<PocketInsight[]> {
  const monthStart = new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth(),
    1,
  );

  const monthEnd = new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth() + 1,
    1,
  );

  const previousMonthStart = new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth() - 1,
    1,
  );

  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

  const [currentTransactions, previousTransactions, budgets, bills, goals] =
    await Promise.all([
      db.transaction.findMany({
        where: {
          userId,
          type: "EXPENSE",
          status: "COMPLETED",
          date: {
            gte: monthStart,
            lt: monthEnd,
          },
        },
        select: {
          amount: true,
          category: true,
        },
      }),

      db.transaction.findMany({
        where: {
          userId,
          type: "EXPENSE",
          status: "COMPLETED",
          date: {
            gte: previousMonthStart,
            lt: monthStart,
          },
        },
        select: {
          amount: true,
          category: true,
        },
      }),

      db.budget.findMany({
        where: {
          userId,
        },
        select: {
          category: true,
          amount: true,
        },
      }),

      db.bill.findMany({
        where: {
          userId,
          dueDate: {
            gte: new Date(),
            lt: sevenDaysLater,
          },
        },
        select: {
          amount: true,
        },
      }),

      db.savingsGoal.findMany({
        where: {
          userId,
        },
        select: {
          name: true,
          currentAmount: true,
          targetAmount: true,
          targetDate: true,
        },
      }),
    ]);

  const insights: PocketInsight[] = [];

  const currentByCategory = currentTransactions.reduce<Record<string, number>>(
    (totals, transaction) => {
      totals[transaction.category] =
        (totals[transaction.category] ?? 0) + transaction.amount.toNumber();

      return totals;
    },
    {},
  );

  const previousByCategory = previousTransactions.reduce<
    Record<string, number>
  >((totals, transaction) => {
    totals[transaction.category] =
      (totals[transaction.category] ?? 0) + transaction.amount.toNumber();

    return totals;
  }, {});

  // --- BUDGET INSIGHTS ---
  for (const budget of budgets) {
    const budgetAmount = budget.amount.toNumber();
    const spent = currentByCategory[budget.category] ?? 0;

    if (budgetAmount <= 0) continue;

    const percent = (spent / budgetAmount) * 100;
    const category = formatCategory(budget.category);
    const overAmount = formatCurrency(spent - budgetAmount);
    const percentUsed = `${Math.round(percent)}%`;

    if (percent >= 100) {
      insights.push({
        type: "BUDGET_WARNING",
        message: `You've gone over your ${category.toLowerCase()} budget by ${overAmount}.`,
        highlights: [category.toLowerCase(), overAmount],
        tone: "warning",
        priority: 100,
      });
    } else if (percent >= 75) {
      insights.push({
        type: "BUDGET_WARNING",
        message: `You've used ${percentUsed} of your ${category.toLowerCase()} budget this month.`,
        highlights: [percentUsed, category.toLowerCase()],
        tone: "warning",
        priority: 90,
      });
    }
  }

  // SPENDING TREND INSIGHTS
  for (const [category, currentAmount] of Object.entries(currentByCategory)) {
    const previousAmount = previousByCategory[category] ?? 0;

    // We need real previous data before calling something a trend.
    if (previousAmount <= 0) continue;

    const difference = currentAmount - previousAmount;
    const percentChange = Math.abs(difference / previousAmount) * 100;
    const amountLess = formatCurrency(Math.abs(difference));
    const amountMore = formatCurrency(difference);

    // Ignore tiny changes.
    if (percentChange < 15) continue;

    const categoryName = formatCategory(category).toLowerCase();

    if (difference < 0) {
      insights.push({
        type: "SPENDING_TREND",
        message: `You've spent ${amountLess} less on ${categoryName} than last month.`,
        highlights: [amountLess, categoryName],
        tone: "positive",
        priority: 65,
      });
    } else {
      insights.push({
        type: "SPENDING_TREND",
        message: `You've spent ${amountMore} more on ${categoryName} than last month.`,
        highlights: [amountMore, categoryName],
        tone: "neutral",
        priority: 60,
      });
    }
  }

  // UPCOMING BILL INSIGHT
  if (bills.length > 0) {
    const billTotal = bills.reduce(
      (total, bill) => total + bill.amount.toNumber(),
      0,
    );

    const billCount = `${bills.length} ${
      bills.length === 1 ? "bill" : "bills"
    }`;

    const total = formatCurrency(billTotal);

    insights.push({
      type: "UPCOMING_BILLS",
      message: `${billCount} ${
        bills.length === 1 ? "is" : "are"
      } due in the next 7 days, totaling ${total}.`,
      highlights: [billCount, total],
      tone: "neutral",
      priority: 80,
    });
  }

  // SAVINGS INSIGHTS
  for (const goal of goals) {
    const currentAmount = goal.currentAmount.toNumber();
    const targetAmount = goal.targetAmount.toNumber();

    if (targetAmount <= 0) continue;

    const percent = (currentAmount / targetAmount) * 100;
    const progress = `${Math.round(percent)}%`;

    if (percent >= 100) {
      insights.push({
        type: "SAVINGS_PROGRESS",
        message: `You've reached your ${goal.name} savings goal!`,
        highlights: [goal.name],
        tone: "positive",
        priority: 95,
      });
    } else if (percent >= 75) {
      insights.push({
        type: "SAVINGS_PROGRESS",
        message: `You're ${progress} of the way to your ${goal.name} goal.`,
        highlights: [progress, goal.name],
        tone: "positive",
        priority: 70,
      });
    }
  }

  return insights.sort((a, b) => b.priority - a.priority).slice(0, 4);
}
