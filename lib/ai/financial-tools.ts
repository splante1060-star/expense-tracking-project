import "server-only";

import { CategoryType } from "../generated/prisma/enums";
import { getMonthDateRange } from "./date-utils";

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
