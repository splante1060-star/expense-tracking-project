import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { db } from "@/lib/prisma";
import BillsPageClient from "@/components/bills/bills-page-client";

export default async function BillsPage() {
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
    redirect("/sign-in");
  }

  const [bills, accounts] = await Promise.all([
    db.bill.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        dueDate: "asc",
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),

    db.account.findMany({
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
      },
    }),
  ]);

  const serializedBills = bills.map((bill) => ({
    id: bill.id,
    name: bill.name,
    amount: bill.amount.toNumber(),
    dueDate: bill.dueDate,
    category: bill.category,
    isRecurring: bill.isRecurring,
    recurringInterval: bill.recurringInterval,
    isAutoPay: bill.isAutoPay,
    accountId: bill.accountId,
    account: bill.account,
  }));

  return <BillsPageClient bills={serializedBills} accounts={accounts} />;
}
