import { db } from "./prisma";

type GetDashboardSummaryParams = {
  userId: string;
  selectedMonth: Date;
};

export async function getDashboardSummary({
  userId,
  selectedMonth,
}: GetDashboardSummaryParams) {
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

  const fourteenDaysLater = new Date(monthStart);
  fourteenDaysLater.setDate(fourteenDaysLater.getDate() + 14);

  const [expenseResult, budgets, upcomingBills, savingsResult] =
    await Promise.all([
      db.transaction.aggregate({
        where: {
          userId,
          type: "EXPENSE",
          status: "COMPLETED",
          date: { gte: monthStart, lt: monthEnd },
        },
        _sum: {
          amount: true,
        },
      }),

      db.budget.findMany({ where: { userId }, select: { amount: true } }),

      db.bill.aggregate({
        where: {
          userId,
          dueDate: {
            gte: monthStart,
            lt: fourteenDaysLater,
          },
        },
        _sum: {
          amount: true,
        },
      }),

      db.savingsGoal.aggregate({
        where: {
          userId,
        },
        _sum: {
          currentAmount: true,
          targetAmount: true,
        },
      }),
    ]);

  const spentThisMonth = expenseResult._sum.amount?.toNumber() ?? 0;

  const monthlyBudget = budgets.reduce(
    (total, budget) => total + budget.amount.toNumber(),
    0,
  );

  const upcomingBillsTotal = upcomingBills._sum.amount?.toNumber() ?? 0;

  const currentSavings = savingsResult._sum.currentAmount?.toNumber() ?? 0;

  const savingsTarget = savingsResult._sum.targetAmount?.toNumber() ?? 0;

  const availableToSpend = Math.max(monthlyBudget - spentThisMonth, 0);

  return {
    availableToSpend,
    spentThisMonth,
    monthlyBudget,
    upcomingBills: upcomingBillsTotal,
    currentSavings,
    savingsTarget,
  };
}

export async function getDashboardDetails({
  userId,
  selectedMonth,
}: {
  userId: string;
  selectedMonth: Date;
}) {
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

  const [transactions, bills, budgets] = await Promise.all([
    db.transaction.findMany({
      where: {
        userId,
        type: "EXPENSE",
        status: "COMPLETED",
        date: { gte: monthStart, lt: monthEnd },
      },
      select: {
        amount: true,
        category: true,
      },
    }),

    db.bill.findMany({
      where: {
        userId,
        dueDate: {
          gte: monthStart,
          lt: monthEnd,
        },
      },
      orderBy: {
        dueDate: "asc",
      },
      select: {
        id: true,
        name: true,
        amount: true,
        dueDate: true,
        category: true,
        isAutoPay: true,
      },
    }),

    db.budget.findMany({
      where: { userId },
      select: {
        id: true,
        category: true,
        amount: true,
      },
    }),
  ]);

  const spendingByCategory = transactions.reduce<Record<string, number>>(
    (totals, transaction) => {
      const category = transaction.category;

      totals[category] =
        (totals[category] ?? 0) + transaction.amount.toNumber();

      return totals;
    },
    {},
  );

  const monthlySpending = Object.entries(spendingByCategory)
    .map(([category, amount]) => ({
      category,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);

  const totalSpent = monthlySpending.reduce(
    (total, item) => total + item.amount,
    0,
  );

  const upcomingBills = bills.map((bill) => ({
    ...bill,
    amount: bill.amount.toNumber(),
  }));

  const totalBills = upcomingBills.reduce(
    (total, bill) => total + bill.amount,
    0,
  );

  const budgetStatus = budgets
    .map((budget) => {
      const budgetAmount = budget.amount.toNumber();
      const spent = spendingByCategory[budget.category] ?? 0;

      const percent =
        budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;
      return {
        id: budget.id,
        category: budget.category,
        budgetAmount,
        spent,
        percent,
        remaining: Math.max(budgetAmount - spent, 0),
      };
    })
    .sort((a, b) => b.percent - a.percent);

  return {
    monthlySpending,
    totalSpent,
    upcomingBills,
    totalBills,
    budgetStatus,
  };
}
