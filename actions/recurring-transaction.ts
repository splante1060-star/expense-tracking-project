"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/prisma";

type RecurringInterval = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

type Category =
  | "GROCERIES"
  | "DINING"
  | "SHOPPING"
  | "ENTERTAINMENT"
  | "TRANSPORTATION"
  | "TRAVEL"
  | "HOUSING"
  | "UTILITIES"
  | "LOANS"
  | "INSURANCE"
  | "INCOME"
  | "OTHER";

type UpdateRecurringTransactionArgs = {
  recurringTransactionId: string;
  type: "INCOME" | "EXPENSE";
  amount: string;
  description: string;
  category: Category;
  accountId: string;
  nextPaymentDate: string;
  interval: RecurringInterval;
};

async function getAuthenticatedUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function updateRecurringTransaction({
  recurringTransactionId,
  type,
  amount,
  description,
  category,
  accountId,
  nextPaymentDate,
  interval,
}: UpdateRecurringTransactionArgs) {
  const user = await getAuthenticatedUser();

  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error("Amount must be greater than zero.");
  }

  if (!nextPaymentDate) {
    throw new Error("Next payment date is required.");
  }

  const recurringTransaction = await db.recurringTransaction.findFirst({
    where: {
      id: recurringTransactionId,
      userId: user.id,
      isActive: true,
    },
  });

  if (!recurringTransaction) {
    throw new Error("Recurring payment not found.");
  }

  const account = await db.account.findFirst({
    where: {
      id: accountId,
      userId: user.id,
    },
  });

  if (!account) {
    throw new Error("Account not found.");
  }

  const date = new Date(`${nextPaymentDate}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid payment date.");
  }

  await db.recurringTransaction.update({
    where: {
      id: recurringTransaction.id,
    },
    data: {
      type,
      amount: numericAmount,
      description: description.trim() || null,
      category,
      accountId,
      interval,
      nextRecurringDate: date,
      anchorDay: date.getDate(),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/transactions");

  return {
    success: true,
  };
}

export async function stopRecurringTransaction(recurringTransactionId: string) {
  const user = await getAuthenticatedUser();

  const recurringTransaction = await db.recurringTransaction.findFirst({
    where: {
      id: recurringTransactionId,
      userId: user.id,
      isActive: true,
    },
  });

  if (!recurringTransaction) {
    throw new Error("Recurring payment not found.");
  }

  await db.recurringTransaction.update({
    where: {
      id: recurringTransaction.id,
    },
    data: {
      isActive: false,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/transactions");

  return {
    success: true,
  };
}
