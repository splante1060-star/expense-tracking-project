import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import GoalsPageClient from "@/components/goals/goals-page-client";
import type { GoalIconName } from "@/lib/goal-icons";

export default async function GoalsPage() {
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

  const [goals, accounts] = await Promise.all([
    db.savingsGoal.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),

    db.account.findMany({
      where: {
        userId: user.id,
        type: {
          not: "CREDIT",
        },
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    }),
  ]);

  const serializedGoals = goals.map((goal) => ({
    id: goal.id,
    name: goal.name,
    targetAmount: goal.targetAmount.toNumber(),
    currentAmount: goal.currentAmount.toNumber(),
    targetDate: goal.targetDate,
    icon: goal.icon as GoalIconName,
  }));

  const serializedAccounts = accounts.map((account) => ({
    id: account.id,
    name: account.name,
    type: account.type as "DEBIT" | "SAVINGS",
    balance: account.balance.toNumber(),
  }));

  return (
    <GoalsPageClient goals={serializedGoals} accounts={serializedAccounts} />
  );
}
