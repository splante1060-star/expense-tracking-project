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
