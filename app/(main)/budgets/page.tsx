import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import BudgetPageClient from "@/components/budget/budget-page-client";

export default async function BudgetPage() {
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

  const now = new Date();

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [budgets, spendingByCategory] = await Promise.all([
    db.budget.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),

    db.transaction.groupBy({
      by: ["category"],
      where: {
        userId: user.id,
        type: "EXPENSE",
        status: "COMPLETED",
        date: {
          gte: monthStart,
          lt: monthEnd,
        },
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  const spendingMap = new Map(
    spendingByCategory.map((item) => [
      item.category,
      item._sum.amount?.toNumber() ?? 0,
    ]),
  );

  const serializedBudgets = budgets.map((budget) => ({
    id: budget.id,
    category: budget.category,
    amount: budget.amount.toNumber(),
    spent: spendingMap.get(budget.category) ?? 0,
  }));

  return <BudgetPageClient budgets={serializedBudgets} />;
}
