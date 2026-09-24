import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

import { db } from "@/lib/prisma";
import RecurringPaymentForm from "@/components/transactions/recurring-payment-form";

type EditRecurringPaymentPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditRecurringPaymentPage({
  params,
}: EditRecurringPaymentPageProps) {
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

  const recurringPayment = await db.recurringTransaction.findFirst({
    where: {
      id,
      userId: user.id,
      isActive: true,
    },
  });

  if (!recurringPayment) {
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

  const year = recurringPayment.nextRecurringDate.getFullYear();
  const month = String(
    recurringPayment.nextRecurringDate.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(recurringPayment.nextRecurringDate.getDate()).padStart(
    2,
    "0",
  );

  const nextPaymentDate = `${year}-${month}-${day}`;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
          Edit Recurring Payment
        </h1>

        <p className="mt-1 text-sm text-slate-600">
          Update this recurring payment schedule.
        </p>
      </div>

      <RecurringPaymentForm
        accounts={accounts.map((account) => ({
          ...account,
          balance: account.balance.toNumber(),
        }))}
        recurringPayment={{
          id: recurringPayment.id,
          type: recurringPayment.type,
          amount: recurringPayment.amount.toString(),
          description: recurringPayment.description ?? "",
          category: recurringPayment.category,
          accountId: recurringPayment.accountId,
          interval: recurringPayment.interval,
          nextPaymentDate,
        }}
      />
    </div>
  );
}
