import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["DEBIT", "CREDIT", "SAVINGS"]),
  balance: z.string().min(1, "Initial balance is required"),
  isDefault: z.boolean().default(false),
});

export const transactionSchema = z
  .object({
    type: z.enum(["INCOME", "EXPENSE"]),
    amount: z
      .string()
      .min(1, "Amount is required")
      .refine((value) => !Number.isNaN(Number(value)) && Number(value) > 0, {
        message: "Enter an amount greater than 0",
      }),
    description: z.string().optional(),
    date: z.string().min(1, "Date is required"),
    category: z.enum([
      "GROCERIES",
      "DINING",
      "SHOPPING",
      "ENTERTAINMENT",
      "TRANSPORTATION",
      "TRAVEL",
      "HOUSING",
      "UTILITIES",
      "INCOME",
      "OTHER",
    ]),
    accountId: z.string().min(1, "Account is required"),
    isRecurring: z.boolean().default(false),
    recurringInterval: z
      .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isRecurring && !data.recurringInterval) {
      ctx.addIssue({
        code: "custom",
        path: ["recurringInterval"],
        message: "Choose how often this transaction repeats",
      });
    }
  });
