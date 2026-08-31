import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

import { db } from "@/lib/prisma";
import TransactionForm from "@/components/transactions/transaction-form";

type EditTransactionPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditTransactionPage({
  params,
}: EditTransactionPageProps) {
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

  const { id } = await params;

  const transaction = await db.transaction.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      recurringTransaction: {
        select: {
          id: true,
          interval: true,
          isActive: true,
        },
      },
    },
  });

  if (!transaction) {
    notFound();
  }

  const accounts = await db.account.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const year = transaction.date.getFullYear();
  const month = String(transaction.date.getMonth() + 1).padStart(2, "0");
  const day = String(transaction.date.getDate()).padStart(2, "0");

  const transactionDate = `${year}-${month}-${day}`;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
          Edit Transaction
        </h1>

        <p className="mt-1 text-sm text-slate-600">
          Update the details for this transaction.
        </p>
      </div>

      <TransactionForm
        accounts={accounts.map((account) => ({
          ...account,
          balance: account.balance.toNumber(),
        }))}
        transaction={{
          id: transaction.id,
          type: transaction.type,
          amount: transaction.amount.toString(),
          description: transaction.description ?? "",
          date: transactionDate,
          category: transaction.category,
          accountId: transaction.accountId,
          recurringTransaction: transaction.recurringTransaction
            ? {
                id: transaction.recurringTransaction.id,
                interval: transaction.recurringTransaction.interval,
                isActive: transaction.recurringTransaction.isActive,
              }
            : null,
        }}
      />
    </div>
  );
}
