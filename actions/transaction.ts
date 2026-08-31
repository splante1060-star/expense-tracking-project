"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
import { getNextRecurringDate } from "@/lib/recurring";
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
    const transactionDate = new Date(`${data.date}T12:00:00`);

    let recurringTransactionId: string | null = null;

    if (data.isRecurring) {
      if (!data.recurringInterval) {
        throw new Error(
          "Recurring interval is required for recurring transactions",
        );
      }

      const recurringTransaction = await tx.recurringTransaction.create({
        data: {
          type: data.type,
          amount,
          description: data.description || null,
          category: data.category,
          interval: data.recurringInterval,
          nextRecurringDate: getNextRecurringDate(
            transactionDate,
            data.recurringInterval,
          ),
          userId: user.id,
          accountId: data.accountId,
        },
      });

      recurringTransactionId = recurringTransaction.id;
    }

    const newTransaction = await tx.transaction.create({
      data: {
        type: data.type,
        amount,
        description: data.description || null,
        date: transactionDate,
        category: data.category,
        accountId: data.accountId,
        userId: user.id,
        recurringTransactionId,
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
  date: string;
  isRecurring?: boolean;
  recurringInterval?: RecurringInterval;
  updateScope?: "THIS_ONLY" | "THIS_AND_FUTURE";
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
    include: {
      account: true,
      recurringTransaction: true,
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

    const transactionDate = new Date(`${data.date}T12:00:00`);

    const updatedTransaction = await tx.transaction.update({
      where: {
        id: existingTransaction.id,
      },
      data: {
        type: data.type,
        amount,
        description: data.description || null,
        date: transactionDate,
        category: data.category,
        accountId: data.accountId,
      },
    });

    if (
      data.updateScope === "THIS_AND_FUTURE" &&
      existingTransaction.recurringTransaction
    ) {
      if (!data.recurringInterval) {
        throw new Error(
          "Recurring interval is required when updating a recurring series",
        );
      }

      await tx.recurringTransaction.update({
        where: {
          id: existingTransaction.recurringTransaction.id,
        },
        data: {
          type: data.type,
          amount,
          description: data.description || null,
          category: data.category,
          accountId: data.accountId,
          interval: data.recurringInterval,
          nextRecurringDate: getNextRecurringDate(
            transactionDate,
            data.recurringInterval,
          ),
        },
      });
    }

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

export async function bulkDeleteTransaction(transactionIds: string[]) {
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

  if (transactionIds.length === 0) {
    throw new Error("No transactions selected");
  }

  const transactions = await db.transaction.findMany({
    where: {
      id: {
        in: transactionIds,
      },
      userId: user.id,
    },
    include: {
      account: true,
    },
  });

  if (transactions.length !== transactionIds.length) {
    throw new Error("One or more transactions could not be found");
  }

  await db.$transaction(async (tx) => {
    for (const transaction of transactions) {
      const balanceChange = getBalanceChange(
        transaction.account.type,
        transaction.type,
        Number(transaction.amount),
      );

      await tx.account.update({
        where: {
          id: transaction.accountId,
        },
        data: {
          balance: {
            decrement: balanceChange,
          },
        },
      });
    }

    await tx.transaction.deleteMany({
      where: {
        id: {
          in: transactionIds,
        },
        userId: user.id,
      },
    });
  });

  revalidatePath("/transactions");
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
  revalidatePath("/reports");

  return {
    success: true,
    deletedCount: transactions.length,
  };
}
