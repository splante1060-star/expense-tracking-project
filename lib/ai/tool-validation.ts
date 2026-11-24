import { CategoryType } from "../generated/prisma/enums";
import { getMonthDateRange } from "./date-utils";
import type {
  MonthlyCategorySpendingInput,
  UpcomingBillsInput,
  BudgetStatusInput,
  RecentAccountActivityInput,
} from "./financial-tools";

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

  // validate the month before accessing the database
  getMonthDateRange(parsed.month);

  return {
    month: parsed.month,
    category: parsed.category as CategoryType | null,
  };
}

// ensure model arguments are a plain JSON object with only the properties explicitly approved for the requested tool
function parseToolObject(
  rawArguments: string,
  expectedKeys: string[],
): Record<string, unknown> {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawArguments);
  } catch {
    throw new Error("Invalid function arguments");
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("Invalid function arguments");
  }

  const record = parsed as Record<string, unknown>;
  const actualKeys = Object.keys(record);

  if (
    actualKeys.length !== expectedKeys.length ||
    actualKeys.some((key) => !expectedKeys.includes(key)) ||
    expectedKeys.some((key) => !Object.hasOwn(record, key))
  ) {
    throw new Error("Invalid function arguments");
  }

  return record;
}

// validate categories using Pocket's generated Prisma enum
function isCategoryOrNull(value: unknown): value is CategoryType | null {
  return (
    value === null ||
    (typeof value === "string" &&
      Object.values(CategoryType).includes(value as CategoryType))
  );
}

export function parseUpcomingBillsArguments(
  rawArguments: string,
): UpcomingBillsInput {
  const args = parseToolObject(rawArguments, ["windowDays"]);

  if (
    typeof args.windowDays !== "number" ||
    !Number.isInteger(args.windowDays) ||
    args.windowDays < 1 ||
    args.windowDays > 90
  ) {
    throw new Error("Invalid function arguments");
  }

  return {
    windowDays: args.windowDays,
  };
}

export function parseBudgetStatusArguments(
  rawArguments: string,
): BudgetStatusInput {
  const args = parseToolObject(rawArguments, ["category"]);

  if (
    !isCategoryOrNull(args.category) ||
    args.category === CategoryType.INCOME
  ) {
    throw new Error("Invalid function arguments");
  }

  return {
    category: args.category,
  };
}

export function parseRecentActivityArguments(
  rawArguments: string,
): RecentAccountActivityInput {
  const args = parseToolObject(rawArguments, [
    "days",
    "limit",
    "type",
    "category",
    "accountId",
  ]);

  if (
    typeof args.days !== "number" ||
    !Number.isInteger(args.days) ||
    args.days < 1 ||
    args.days > 365
  ) {
    throw new Error("Invalid function arguments");
  }

  if (
    typeof args.limit !== "number" ||
    !Number.isInteger(args.limit) ||
    args.limit < 1 ||
    args.limit > 25
  ) {
    throw new Error("Invalid function arguments");
  }

  if (args.type !== null && args.type !== "INCOME" && args.type !== "EXPENSE") {
    throw new Error("Invalid function arguments");
  }

  if (!isCategoryOrNull(args.category)) {
    throw new Error("Invalid function arguments");
  }

  // account-name resolution is not yet supported in the AI interface, so model-generated account IDs are disallowed
  if (args.accountId !== null) {
    throw new Error("Invalid function arguments");
  }

  return {
    days: args.days,
    limit: args.limit,
    type: args.type,
    category: args.category,
    accountId: null,
  };
}
