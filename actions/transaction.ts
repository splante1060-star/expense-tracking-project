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

function getBalanceChange(
  accountType: "DEBIT" | "CREDIT" | "SAVINGS",
  transactionType: TransactionType,
  amount: number,
) {
  if (accountType === "CREDIT") {
    return transactionType === "EXPENSE" ? amount : -amount;
  }

  return transactionType === "INCOME" ? amount : -amount;
}

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

  const balanceChange = getBalanceChange(account.type, data.type, amount);

  const transaction = await db.$transaction(async (tx) => {
    const newTransaction = await tx.transaction.create({
      data: {
        type: data.type,
        amount,
        description: data.description || null,
        date: new Date(`${data.date}T12:00:00`),
        category: data.category,
        accountId: data.accountId,
        userId: user.id,
        isRecurring: Boolean(data.isRecurring),
        recurringInterval: data.isRecurring ? data.recurringInterval : null,
      },
    });

    await tx.account.update({
      where: {
        id: account.id,
      },
      data: {
        balance: {
          increment: balanceChange,
        },
      },
    });

    return newTransaction;
  });

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/accounts");

  return {
    success: true,
    transactionId: transaction.id,
  };
}

type UpdateTransactionData = {
  transactionId: string;
  type: TransactionType;
  amount: string | number;
  description?: string;
  category: CategoryType;
  accountId: string;
  isRecurring?: boolean;
  recurringInterval?: RecurringInterval;
};

export async function updateTransaction(data: UpdateTransactionData) {
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

  const existingTransaction = await db.transaction.findFirst({
    where: {
      id: data.transactionId,
      userId: user.id,
    },
  });

  if (!existingTransaction) {
    throw new Error("Transaction not found");
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

  const oldAccount = await db.account.findFirst({
    where: {
      id: existingTransaction.accountId,
      userId: user.id,
    },
  });

  if (!oldAccount) {
    throw new Error("Original account not found");
  }

  const oldBalanceChange = getBalanceChange(
    oldAccount.type,
    existingTransaction.type,
    existingTransaction.amount.toNumber(),
  );

  const newBalanceChange = getBalanceChange(account.type, data.type, amount);

  const transaction = await db.$transaction(async (tx) => {
    await tx.account.update({
      where: {
        id: oldAccount.id,
      },
      data: {
        balance: {
          increment: -oldBalanceChange,
        },
      },
    });

    const updatedTransaction = await tx.transaction.update({
      where: {
        id: existingTransaction.id,
      },
      data: {
        type: data.type,
        amount,
        description: data.description || null,
        category: data.category,
        accountId: data.accountId,
        isRecurring: Boolean(data.isRecurring),
        recurringInterval: data.isRecurring ? data.recurringInterval : null,
      },
    });

    await tx.account.update({
      where: {
        id: account.id,
      },
      data: {
        balance: {
          increment: newBalanceChange,
        },
      },
    });

    return updatedTransaction;
  });

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/accounts");
  revalidatePath(`/transaction/${transaction.id}/edit`);

  return {
    success: true,
    transactionId: transaction.id,
  };
}

export async function deleteTransaction(transactionId: string) {
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

  const transaction = await db.transaction.findFirst({
    where: {
      id: transactionId,
      userId: user.id,
    },
  });

  if (!transaction) {
    throw new Error("Transaction not found");
  }

  const account = await db.account.findFirst({
    where: {
      id: transaction.accountId,
      userId: user.id,
    },
  });

  if (!account) {
    throw new Error("Account not found");
  }

  const balanceChange = getBalanceChange(
    account.type,
    transaction.type,
    transaction.amount.toNumber(),
  );

  await db.$transaction(async (tx) => {
    await tx.account.update({
      where: {
        id: account.id,
      },
      data: {
        balance: {
          increment: -balanceChange,
        },
      },
    });

    await tx.transaction.delete({
      where: {
        id: transaction.id,
      },
    });
  });

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/accounts");

  return {
    success: true,
  };
}
