import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { db } from "@/lib/prisma";
import TransactionsPageClient from "@/components/transactions/transactions-page-client";

export default async function TransactionsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    redirect("/dashboard");
  }

  const transactions = await db.transaction.findMany({
    where: {
      userId: user.id,
    },
    include: {
      account: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
      recurringTransaction: {
        select: {
          id: true,
          interval: true,
          isActive: true,
        },
      },
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  const accounts = await db.account.findMany({
    where: {
      userId: user.id,
    },
    orderBy: [
      {
        isDefault: "desc",
      },
      {
        createdAt: "asc",
      },
    ],
    select: {
      id: true,
      name: true,
      type: true,
      balance: true,
      isDefault: true,
    },
  });

  const serializedTransactions = transactions.map((transaction) => ({
    id: transaction.id,
    description: transaction.description,
    category: transaction.category,
    type: transaction.type,
    amount: transaction.amount.toNumber(),
    date: transaction.date,
    createdAt: transaction.createdAt,
    status: transaction.status,

    isRecurring: transaction.recurringTransactionId !== null,
    recurringInterval: transaction.recurringTransaction?.interval ?? null,
    recurringTransaction: transaction.recurringTransaction
      ? {
          id: transaction.recurringTransaction.id,
          interval: transaction.recurringTransaction.interval,
          isActive: transaction.recurringTransaction.isActive,
        }
      : null,
    account: {
      id: transaction.account.id,
      name: transaction.account.name,
      type: transaction.account.type,
    },
  }));

  const serializedAccounts = accounts.map((account) => ({
    ...account,
    balance: account.balance.toNumber(),
  }));

  return (
    <TransactionsPageClient
      transactions={serializedTransactions}
      accounts={serializedAccounts}
    />
  );
}
