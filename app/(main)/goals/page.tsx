import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import GoalsPageClient from "@/components/goals/goals-page-client";

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

  const goals = await db.savingsGoal.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const serializedGoals = goals.map((goal) => ({
    id: goal.id,
    name: goal.name,
    targetAmount: goal.targetAmount.toNumber(),
    currentAmount: goal.currentAmount.toNumber(),
    targetDate: goal.targetDate,
    icon: goal.icon,
  }));

  return <GoalsPageClient goals={serializedGoals} />;
}
