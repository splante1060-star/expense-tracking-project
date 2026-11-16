import type OpenAI from "openai";
import { describe } from "zod/v4/core";

export const financialTools: OpenAI.Responses.Tool[] = [
  {
    type: "function",
    name: "get_monthly_category_spending",
    description:
      "Retrieve the authenticated Pocket user's total completed expense spending for a specified month, optionally filtered by category. Use this tool when answering questions about actual monthly spending.",
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
          enum: [
            "GROCERIES",
            "DINING",
            "SHOPPING",
            "ENTERTAINMENT",
            "TRANSPORTATION",
            "TRAVEL",
            "HOUSING",
            "UTILITIES",
            "LOANS",
            "INSURANCE",
            "INCOME",
            "OTHER",
            null,
          ],
          description:
            "The expense category to filter by, or null for all categories.",
        },
      },
      required: ["month", "category"],
      additionalProperties: false,
    },
  },
];
