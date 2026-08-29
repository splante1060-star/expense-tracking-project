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

  const budgets = await db.budget.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const serializedBudgets = budgets.map((budget) => ({
    id: budget.id,
    category: budget.category,
    amount: budget.amount.toNumber(),
  }));

  return <BudgetPageClient budgets={serializedBudgets} />;
}
