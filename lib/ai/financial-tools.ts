import "server-only";

import { CategoryType } from "../generated/prisma/enums";
import {
  getMonthDateRange,
  getEasternDateKey,
  addCalendarDays,
} from "./date-utils";
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
  const lastUpcomingDate = addCalendarDays(asOfDate, windowDays);

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

    if (dueDate > lastUpcomingDate) {
      continue;
    }

    const status: UpcomingBill["status"] =
      dueDate < asOfDate
        ? "overdue"
        : dueDate === asOfDate
          ? "today"
          : "upcoming";

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
