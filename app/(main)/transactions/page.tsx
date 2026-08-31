import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { db } from "@/lib/prisma";
import TransactionsList from "@/components/transactions/transactions-list";
import { RecurringInterval } from "@/lib/generated/prisma/enums";

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
            Transactions
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            View and manage your spending and income.
          </p>
        </div>

        <Link
          href="/transaction/create"
          className="inline-flex h-10 items-center justify-center rounded-full bg-(--pocket-blue) px-5 text-sm font-semibold text-white transition-colors hover:bg-(--pocket-blue-dark)"
        >
          + Add Transaction
        </Link>
      </div>

      <TransactionsList transactions={serializedTransactions} />
    </div>
  );
}
