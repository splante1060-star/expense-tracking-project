import { CategoryType } from "../generated/prisma/enums";
import { getMonthDateRange } from "./date-utils";
import type { MonthlyCategorySpendingInput } from "./financial-tools";

export function parseMonthlySpendingArguments(
  rawArguments: string,
): MonthlyCategorySpendingInput {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawArguments);
  } catch {
    throw new Error("Invalid function arguments");
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    Array.isArray(parsed) ||
    !("month" in parsed) ||
    typeof parsed.month !== "string" ||
    !("category" in parsed) ||
    !(
      parsed.category === null ||
      (typeof parsed.category === "string" &&
        Object.values(CategoryType).includes(parsed.category as CategoryType))
    ) ||
    Object.keys(parsed).some((key) => key !== "month" && key !== "category")
  ) {
    throw new Error("Invalid function arguments");
  }

  // Validate the month before accessing the database.
  getMonthDateRange(parsed.month);

  return {
    month: parsed.month,
    category: parsed.category as CategoryType | null,
  };
}
