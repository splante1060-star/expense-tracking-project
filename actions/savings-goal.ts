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

type UpdateSavingsGoalData = {
  goalId: string;
  name: string;
  targetAmount: string | number;
  targetDate?: string;
  icon: string;
};

export async function updateSavingsGoal(data: UpdateSavingsGoalData) {
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

  const existingGoal = await db.savingsGoal.findFirst({
    where: {
      id: data.goalId,
      userId: user.id,
    },
  });

  if (!existingGoal) {
    throw new Error("Savings goal not found");
  }

  const goal = await db.savingsGoal.update({
    where: {
      id: existingGoal.id,
    },
    data: {
      name: data.name.trim(),
      targetAmount,
      targetDate: data.targetDate
        ? new Date(`${data.targetDate}T12:00:00`)
        : null,
      icon: data.icon,
    },
  });

  revalidatePath("/goals");
  revalidatePath("/dashboard");

  return {
    success: true,
    goalId: goal.id,
  };
}

export async function deleteSavingsGoal(goalId: string) {
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

  const goal = await db.savingsGoal.findFirst({
    where: {
      id: goalId,
      userId: user.id,
    },
    include: {
      _count: {
        select: {
          contributions: true,
        },
      },
    },
  });

  if (!goal) {
    throw new Error("Savings goal not found");
  }

  if (goal.currentAmount.toNumber() > 0 || goal._count.contributions > 0) {
    throw new Error(
      "Remove or withdraw saved funds before deleting this goal.",
    );
  }

  await db.savingsGoal.delete({
    where: {
      id: goal.id,
    },
  });

  revalidatePath("/goals");
  revalidatePath("/dashboard");

  return {
    success: true,
  };
}

type AddFundsToSavingsGoalData = {
  savingsGoalId: string;
  accountId: string;
  amount: string | number;
  note?: string;
};

export async function addFundsToSavingsGoal(data: AddFundsToSavingsGoalData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const amount = Number(data.amount);

  if (Number.isNaN(amount) || amount <= 0) {
    throw new Error("Invalid contribution amount");
  }

  const savingsGoal = await db.savingsGoal.findFirst({
    where: {
      id: data.savingsGoalId,
      userId: user.id,
    },
  });

  if (!savingsGoal) {
    throw new Error("Savings goal not found");
  }

  const account = await db.account.findFirst({
    where: {
      id: data.accountId,
      userId: user.id,
    },
  });

  if (!account) {
    throw new Error("Account not found");
  }

  if (account.type === "CREDIT") {
    throw new Error("Credit accounts cannot fund savings goals");
  }

  if (account.balance.toNumber() < amount) {
    throw new Error("Insufficient account balance");
  }

  await db.$transaction(async (tx) => {
    await tx.savingsContribution.create({
      data: {
        amount,
        note: data.note || null,
        userId: user.id,
        savingsGoalId: savingsGoal.id,
        accountId: account.id,
      },
    });

    await tx.savingsGoal.update({
      where: {
        id: savingsGoal.id,
      },
      data: {
        currentAmount: {
          increment: amount,
        },
      },
    });

    await tx.account.update({
      where: {
        id: account.id,
      },
      data: {
        balance: {
          decrement: amount,
        },
      },
    });
  });

  revalidatePath("/dashboard");
  revalidatePath("/goals");
  revalidatePath("/accounts");

  return {
    success: true,
  };
}
