import "server-only";

import { CategoryType } from "../generated/prisma/enums";
import {
  getMonthDateRange,
  getEasternDateKey,
  addCalendarDays,
  classifyBillDueDate,
  getRecentActivityDateRange,
} from "./date-utils";
import { paginateActivityResults } from "./pagination-utils";
import { Prisma } from "../generated/prisma/client";
import { db } from "../prisma";

export type MonthlyCategorySpendingInput = {
  month: string;
  category: CategoryType | null;
};

export type MonthlyCategorySpendingOutput = {
  month: string;
  category: CategoryType | null;
  total: string;
  transactionCount: number;
  timezone: string;
  startDate: string;
  endDateExclusive: string;
};

export async function getMonthlyCategorySpending(
  input: MonthlyCategorySpendingInput,
  pocketUserId: string,
): Promise<MonthlyCategorySpendingOutput> {
  if (!pocketUserId.trim()) {
    throw new Error("Pocket user ID is required");
  }

  const { month, category } = input;
  const { startDate, endDateExclusive } = getMonthDateRange(month);

  if (category !== null && !Object.values(CategoryType).includes(category)) {
    throw new Error("Invalid spending category");
  }

  const result = await db.transaction.aggregate({
    where: {
      userId: pocketUserId,
      type: "EXPENSE",
      status: "COMPLETED",
      date: {
        gte: startDate,
        lt: endDateExclusive,
      },
      ...(category !== null ? { category } : {}),
    },
    _sum: {
      amount: true,
    },
    _count: {
      _all: true,
    },
  });

  return {
    month,
    category,
    total: result._sum.amount?.toFixed(2) ?? "0.00",
    transactionCount: result._count._all,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    startDate: startDate.toISOString(),
    endDateExclusive: endDateExclusive.toISOString(),
  };
}

export type UpcomingBillsInput = {
  windowDays: number;
};

export type UpcomingBill = {
  name: string;
  amount: string;
  dueDate: string;
  category: CategoryType;
  status: "overdue" | "today" | "upcoming";
  isRecurring: boolean;
  isAutoPay: boolean;
};

export type UpcomingBillsOutput = {
  asOfDate: string;
  timezone: string;
  windowDays: number;
  overdue: UpcomingBill[];
  upcoming: UpcomingBill[];
  overdueCount: number;
  upcomingCount: number;
  overdueTotal: string;
  upcomingTotal: string;
};

export async function getUpcomingBills(
  input: UpcomingBillsInput,
  pocketUserId: string,
): Promise<UpcomingBillsOutput> {
  if (!pocketUserId.trim()) {
    throw new Error("Pocket user ID is required");
  }

  const { windowDays } = input;

  if (!Number.isInteger(windowDays) || windowDays < 1 || windowDays > 90) {
    throw new Error("Window must be between 1 and 90 days");
  }

  const asOfDate = getEasternDateKey(new Date());

  const bills = await db.bill.findMany({
    where: {
      userId: pocketUserId,
      isActive: true,
    },
    orderBy: {
      dueDate: "asc",
    },
    select: {
      name: true,
      amount: true,
      dueDate: true,
      category: true,
      isRecurring: true,
      isAutoPay: true,
    },
  });

  const overdue: UpcomingBill[] = [];
  const upcoming: UpcomingBill[] = [];

  let overdueTotal = new Prisma.Decimal(0);
  let upcomingTotal = new Prisma.Decimal(0);

  for (const bill of bills) {
    const dueDate = getEasternDateKey(bill.dueDate);

    const status = classifyBillDueDate(dueDate, asOfDate, windowDays);

    if (status === null) {
      continue;
    }

    const item: UpcomingBill = {
      name: bill.name,
      amount: bill.amount.toFixed(2),
      dueDate,
      category: bill.category,
      status,
      isRecurring: bill.isRecurring,
      isAutoPay: bill.isAutoPay,
    };

    if (status === "overdue") {
      overdue.push(item);
      overdueTotal = overdueTotal.plus(bill.amount);
    } else {
      upcoming.push(item);
      upcomingTotal = upcomingTotal.plus(bill.amount);
    }
  }

  return {
    asOfDate,
    timezone: "America/New_York",
    windowDays,
    overdue,
    upcoming,
    overdueCount: overdue.length,
    upcomingCount: upcoming.length,
    overdueTotal: overdueTotal.toFixed(2),
    upcomingTotal: upcomingTotal.toFixed(2),
  };
}

export type BudgetStatusInput = {
  category: CategoryType | null;
};

export type BudgetStatusItem = {
  category: CategoryType;
  limit: string;
  spent: string;
  remaining: string;
  percentUsed: number;
  status: "on_track" | "getting_close" | "over_budget";
};

export type BudgetStatusOutput = {
  month: string;
  category: CategoryType | null;
  budgets: BudgetStatusItem[];
  budgetCount: number;
  totalBudget: string;
  totalSpent: string;
  totalRemaining: string;
};

export async function getBudgetStatus(
  input: BudgetStatusInput,
  pocketUserId: string,
): Promise<BudgetStatusOutput> {
  if (!pocketUserId.trim()) {
    throw new Error("Pocket user ID is required");
  }

  const { category } = input;

  if (category !== null && !Object.values(CategoryType).includes(category)) {
    throw new Error("Invalid budget category");
  }

  if (category === "INCOME") {
    throw new Error("Income cannot be used as a spending budget");
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [budgets, spendingByCategory] = await Promise.all([
    db.budget.findMany({
      where: {
        userId: pocketUserId,
        ...(category !== null ? { category } : {}),
      },
      orderBy: {
        createdAt: "asc",
      },
    }),

    db.transaction.groupBy({
      by: ["category"],
      where: {
        userId: pocketUserId,
        type: "EXPENSE",
        status: "COMPLETED",
        date: {
          gte: monthStart,
          lt: monthEnd,
        },
        ...(category !== null ? { category } : {}),
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  const spendingMap = new Map(
    spendingByCategory.map((item) => [
      item.category,
      item._sum.amount ?? new Prisma.Decimal(0),
    ]),
  );

  let totalBudget = new Prisma.Decimal(0);
  let totalSpent = new Prisma.Decimal(0);

  const results: BudgetStatusItem[] = budgets.map((budget) => {
    const spent = spendingMap.get(budget.category) ?? new Prisma.Decimal(0);
    const remaining = budget.amount.minus(spent);

    const percentUsed = budget.amount.gt(0)
      ? Math.round(spent.div(budget.amount).mul(100).toNumber())
      : 0;

    const status: BudgetStatusItem["status"] =
      percentUsed > 100
        ? "over_budget"
        : percentUsed >= 75
          ? "getting_close"
          : "on_track";

    totalBudget = totalBudget.plus(budget.amount);
    totalSpent = totalSpent.plus(spent);

    return {
      category: budget.category,
      limit: budget.amount.toFixed(2),
      spent: spent.toFixed(2),
      remaining: remaining.toFixed(2),
      percentUsed,
      status,
    };
  });

  return {
    month,
    category,
    budgets: results,
    budgetCount: results.length,
    totalBudget: totalBudget.toFixed(2),
    totalSpent: totalSpent.toFixed(2),
    totalRemaining: totalBudget.minus(totalSpent).toFixed(2),
  };
}

export type RecentAccountActivityInput = {
  days: number;
  limit: number;
  type: "INCOME" | "EXPENSE" | null;
  category: CategoryType | null;
  accountId: string | null;
};

export type RecentAccountActivityItem = {
  description: string | null;
  amount: string;
  type: "INCOME" | "EXPENSE";
  category: CategoryType;
  date: string;
  accountName: string;
  isRecurring: boolean;
};

export type RecentAccountActivityOutput = {
  days: number;
  limit: number;
  returnedCount: number;
  hasMore: boolean;
  startDate: string;
  endDateExclusive: string;
  transactions: RecentAccountActivityItem[];
};

export async function getRecentAccountActivity(
  input: RecentAccountActivityInput,
  pocketUserId: string,
): Promise<RecentAccountActivityOutput> {
  if (!pocketUserId.trim()) {
    throw new Error("Pocket user ID is required");
  }

  const { days, limit, type, category, accountId } = input;

  if (!Number.isInteger(days) || days < 1 || days > 365) {
    throw new Error("Days must be between 1 and 365");
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 25) {
    throw new Error("Limit must be between 1 and 25");
  }

  if (type !== null && type !== "INCOME" && type !== "EXPENSE") {
    throw new Error("Invalid transaction type");
  }

  if (category !== null && !Object.values(CategoryType).includes(category)) {
    throw new Error("Invalid transaction category");
  }

  if (accountId !== null) {
    if (!accountId.trim()) {
      throw new Error("Invalid account ID");
    }

    const account = await db.account.findFirst({
      where: {
        id: accountId,
        userId: pocketUserId,
      },
      select: {
        id: true,
      },
    });

    if (!account) {
      throw new Error("Account not found");
    }
  }

  const { startDate, endDateExclusive } = getRecentActivityDateRange(days);

  const transactions = await db.transaction.findMany({
    where: {
      userId: pocketUserId,
      status: "COMPLETED",
      date: {
        gte: startDate,
        lt: endDateExclusive,
      },
      ...(type !== null ? { type } : {}),
      ...(category !== null ? { category } : {}),
      ...(accountId !== null ? { accountId } : {}),
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: limit + 1,
    select: {
      description: true,
      amount: true,
      type: true,
      category: true,
      date: true,
      recurringTransactionId: true,
      account: {
        select: {
          name: true,
        },
      },
    },
  });

  const {
    items: returnedTransactions,
    returnedCount,
    hasMore,
  } = paginateActivityResults(transactions, limit);

  return {
    days,
    limit,
    returnedCount,
    hasMore,
    startDate: startDate.toISOString(),
    endDateExclusive: endDateExclusive.toISOString(),
    transactions: returnedTransactions.map((transaction) => ({
      description: transaction.description,
      amount: transaction.amount.toFixed(2),
      type: transaction.type,
      category: transaction.category,
      date: transaction.date.toISOString(),
      accountName: transaction.account.name,
      isRecurring: transaction.recurringTransactionId !== null,
    })),
  };
}
