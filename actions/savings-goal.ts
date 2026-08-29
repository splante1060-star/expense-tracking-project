"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";

type CreateSavingsGoalData = {
  name: string;
  targetAmount: string | number;
  targetDate?: string;
  icon: string;
};

export async function createSavingsGoal(data: CreateSavingsGoalData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const targetAmount = Number(data.targetAmount);

  if (Number.isNaN(targetAmount) || targetAmount <= 0) {
    throw new Error("Invalid target amount");
  }

  const goal = await db.savingsGoal.create({
    data: {
      name: data.name.trim(),
      targetAmount,
      currentAmount: 0,
      targetDate: data.targetDate
        ? new Date(`${data.targetDate}T12:00:00`)
        : null,
      icon: data.icon,
      userId: user.id,
    },
  });

  revalidatePath("/goals");
  revalidatePath("/dashboard");

  return {
    success: true,
    goal: {
      ...goal,
      targetAmount: goal.targetAmount.toNumber(),
      currentAmount: goal.currentAmount.toNumber(),
    },
  };
}
