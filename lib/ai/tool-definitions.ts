import type OpenAI from "openai";
import { CategoryType } from "../generated/prisma/enums";

const allCategories = [...Object.values(CategoryType), null];
const budgetCategories = [
  ...Object.values(CategoryType).filter(
    (category) => category !== CategoryType.INCOME,
  ),
  null,
];

export const financialTools: OpenAI.Responses.Tool[] = [
  {
    type: "function",
    name: "get_monthly_category_spending",
    description:
      "Retrieve the authenticated Pocket user's total completed expense " +
      "spending for a specified month, optionally filtered by category. " +
      "Use for complete monthly spending totals, not individual transaction history.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        month: {
          type: "string",
          description:
            "The month to calculate spending for, formatted as YYYY-MM.",
        },
        category: {
          type: ["string", "null"],
          enum: allCategories,
          description:
            "The expense category to filter by, or null for all categories.",
        },
      },
      required: ["month", "category"],
      additionalProperties: false,
    },
  },

  {
    type: "function",
    name: "get_upcoming_bills",
    description:
      "Retrieve the authenticated Pocket user's active bills, " +
      "separating overdue bills from bills due within the requested " +
      "window. Returns exact amounts, counts, dates, and totals. " +
      "Each bill is returned only once using its stored due date. " +
      "This is not a forecase of every future recurring payment.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        windowDays: {
          type: "integer",
          description:
            "Number of calendar days to look ahead, from " +
            "1 to 90. Use 45 when the user does not specify a window.",
        },
      },
      required: ["windowDays"],
      additionalProperties: false,
    },
  },

  {
    type: "function",
    name: "get_budget_status",
    description:
      "Retrieve the authenticated Pocket user's configured spending " +
      "budgets for the current month. Returns budget limits, completed " +
      "spending, remaining balances, utilization percentages, statuses, " +
      "and totals across configured budgets only. " +
      "Does not include unbudgeted spending in aggregate totals.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        category: {
          type: ["string", "null"],
          enum: budgetCategories,
          description:
            "Spending budget category, or null for all configured budgets. " +
            "Income is not a spending budget category.",
        },
      },
      required: ["category"],
      additionalProperties: false,
    },
  },

  {
    type: "function",
    name: "get_recent_account_activity",
    description:
      "Retrieve the authenticated Pocket user's recent completed " +
      "income and expense transactions. Supports date-window, type, " +
      "category, and account filtering. Returns a limited newest-first " +
      "list with a hasMore indicator. Do not use this limited list " +
      "to calculate complete monthly spending totals.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        days: {
          type: "integer",
          description:
            "Number of calendar days to include, from 1 to 365. " +
            "Use 30 if the user does not specify a period.",
        },
        limit: {
          type: "integer",
          description:
            "Maximum number of transactions to return, from 1 to 25. " +
            "Use 10 if the user does not specify a number.",
        },
        type: {
          type: ["string", "null"],
          enum: ["INCOME", "EXPENSE", null],
          description:
            "Transaction type, or null for both income and expenses.",
        },
        category: {
          type: ["string", "null"],
          enum: allCategories,
          description: "Transaction category, or null for all categories.",
        },
        accountId: {
          type: "null",
          description:
            "Use null to retrieve activity across all user-owned accounts. " +
            "Filtering by a specific account is not yet available through Pocket AI.",
        },
      },
      required: ["days", "limit", "type", "category", "accountId"],
      additionalProperties: false,
    },
  },
];
