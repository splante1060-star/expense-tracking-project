import Link from "next/link";
import { ArrowLeft, WalletCards } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

import TransactionForm from "@/components/transactions/transaction-form";

export default async function CreateTransactionPage() {
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

  const serializedAccounts = accounts.map((account) => ({
    ...account,
    balance: account.balance.toNumber(),
  }));

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-(--pocket-blue)"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
          Add Transaction
        </h1>

        <p className="mt-1 text-sm text-slate-600">
          Record income or spending and keep your Pocket up to date.
        </p>
      </div>

      {serializedAccounts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-(--pocket-blue-light) text-(--pocket-blue)">
            <WalletCards size={22} strokeWidth={1.8} />
          </div>

          <h2 className="mt-4 text-base font-semibold text-slate-900">
            Add an account first
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
            Transactions need an account so Pocket knows where your money is
            coming from or going to.
          </p>

          <Link
            href="/accounts"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-(--pocket-blue) px-5 text-sm font-semibold text-white transition-colors hover:bg-(--pocket-blue-dark)"
          >
            Go to Accounts
          </Link>
        </div>
      ) : (
        <TransactionForm accounts={serializedAccounts} />
      )}
    </div>
  );
}
