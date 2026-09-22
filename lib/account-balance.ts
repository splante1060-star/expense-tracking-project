import type { TransactionType } from "@/lib/generated/prisma/client";

export function getBalanceChange(
  accountType: "DEBIT" | "CREDIT" | "SAVINGS",
  transactionType: TransactionType,
  amount: number,
) {
  if (accountType === "CREDIT") {
    return transactionType === "EXPENSE" ? amount : -amount;
  }

  return transactionType === "INCOME" ? amount : -amount;
}
