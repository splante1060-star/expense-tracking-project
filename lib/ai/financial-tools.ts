import "server-only";

import { CategoryType } from "../generated/prisma/enums";
import { getMonthDateRange } from "./date-utils";
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
