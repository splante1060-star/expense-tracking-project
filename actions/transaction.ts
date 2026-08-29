"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
import type {
  CategoryType,
  RecurringInterval,
  TransactionType,
} from "@/lib/generated/prisma/client";

type CreateTransactionData = {
  type: TransactionType;
  amount: string | number;
  description?: string;
  date: string;
  category: CategoryType;
  accountId: string;
  isRecurring?: boolean;
  recurringInterval?: RecurringInterval;
};

export async function createTransaction(data: CreateTransactionData) {
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

  const amount = Number(data.amount);

  if (Number.isNaN(amount) || amount <= 0) {
    throw new Error("Invalid transaction amount");
  }

  const account = await db.account.findFirst({
    where: {
      id: data.accountId,
      userId: user.id,
    },
  });

  if (!account) {
    throw new Error("Account not found");
  }

  const transaction = await db.transaction.create({
    data: {
      type: data.type,
      amount,
      description: data.description || null,
      date: new Date(data.date),
      category: data.category,
      accountId: data.accountId,
      userId: user.id,
      isRecurring: Boolean(data.isRecurring),
      recurringInterval: data.isRecurring ? data.recurringInterval : null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/transactions");

  return {
    success: true,
    transactionId: transaction.id,
  };
}
