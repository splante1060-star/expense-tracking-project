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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const fourteenDaysFromToday = new Date(today);
  fourteenDaysFromToday.setDate(fourteenDaysFromToday.getDate() + 14);

  const [
    expenseResult,
    budgets,
    upcomingBills,
    upcomingRecurringExpenses,
    savingsResult,
  ] = await Promise.all([
    db.transaction.aggregate({
      where: {
        userId,
        type: "EXPENSE",
        status: "COMPLETED",
        date: {
          gte: monthStart,
          lt: monthEnd,
        },
      },
      _sum: {
        amount: true,
      },
    }),

    db.budget.findMany({
      where: {
        userId,
      },
      select: {
        amount: true,
      },
    }),

    db.bill.findMany({
      where: {
        userId,
        isActive: true,
        dueDate: {
          gte: today,
          lt: fourteenDaysFromToday,
        },
      },
      select: {
        amount: true,
      },
    }),

    db.recurringTransaction.findMany({
      where: {
        userId,
        isActive: true,
        type: "EXPENSE",
        nextRecurringDate: {
          gte: today,
          lt: fourteenDaysFromToday,
        },
      },
      select: {
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

  const upcomingBillsTotal = upcomingBills.reduce(
    (total, bill) => total + bill.amount.toNumber(),
    0,
  );

  const upcomingRecurringTotal = upcomingRecurringExpenses.reduce(
    (total, recurring) => total + recurring.amount.toNumber(),
    0,
  );

  const upcomingPayments = upcomingBillsTotal + upcomingRecurringTotal;

  const currentSavings = savingsResult._sum.currentAmount?.toNumber() ?? 0;

  const savingsTarget = savingsResult._sum.targetAmount?.toNumber() ?? 0;

  const availableToSpend = Math.max(monthlyBudget - spentThisMonth, 0);

  return {
    availableToSpend,
    spentThisMonth,
    monthlyBudget,
    upcomingPayments,
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    transactions,
    bills,
    recurringExpenses,
    budgets,
    savingsGoals,
    recentTransactions,
  ] = await Promise.all([
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

    db.bill.findMany({
      where: {
        userId,
        isActive: true,
        dueDate: {
          gte: today,
        },
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

    db.recurringTransaction.findMany({
      where: {
        userId,
        isActive: true,
        type: "EXPENSE",
        nextRecurringDate: {
          gte: today,
        },
      },
      select: {
        id: true,
        description: true,
        amount: true,
        nextRecurringDate: true,
        category: true,
      },
    }),

    db.budget.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        category: true,
        amount: true,
      },
    }),

    db.savingsGoal.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),

    db.transaction.findMany({
      where: {
        userId,
        status: "COMPLETED",
      },
      orderBy: {
        date: "desc",
      },
      take: 4,
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

  const billPayments = bills.map((bill) => ({
    id: bill.id,
    name: bill.name,
    amount: bill.amount.toNumber(),
    dueDate: bill.dueDate,
    category: bill.category,
    isAutoPay: bill.isAutoPay,
    source: "BILL" as const,
  }));

  const recurringPayments = recurringExpenses.map((recurring) => ({
    id: recurring.id,
    name: recurring.description || "Recurring payment",
    amount: recurring.amount.toNumber(),
    dueDate: recurring.nextRecurringDate,
    category: recurring.category,
    isAutoPay: false,
    source: "RECURRING" as const,
  }));

  const upcomingPayments = [...billPayments, ...recurringPayments]
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 4);

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

  const savingsGoalDetails = savingsGoals.map((goal) => ({
    id: goal.id,
    name: goal.name,
    targetAmount: goal.targetAmount.toNumber(),
    currentAmount: goal.currentAmount.toNumber(),
    targetDate: goal.targetDate,
    icon: goal.icon,
  }));

  const recentTransactionDetails = recentTransactions.map((transaction) => ({
    id: transaction.id,
    description: transaction.description,
    category: transaction.category,
    type: transaction.type,
    amount: transaction.amount.toNumber(),
    date: transaction.date,
  }));

  return {
    monthlySpending,
    totalSpent,
    upcomingPayments,
    budgetStatus,
    savingsGoals: savingsGoalDetails,
    recentTransactions: recentTransactionDetails,
  };
}
