"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
import type { CategoryType } from "@/lib/generated/prisma/client";

type CreateBudgetData = {
  category: CategoryType;
  amount: string | number;
};

export async function createBudget(data: CreateBudgetData) {
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

  const amount = Number(data.amount);

  if (Number.isNaN(amount) || amount <= 0) {
    throw new Error("Invalid budget amount");
  }

  if (data.category === "INCOME") {
    throw new Error("Income cannot be used as a spending budget");
  }

  const existingBudget = await db.budget.findUnique({
    where: {
      userId_category: {
        userId: user.id,
        category: data.category,
      },
    },
  });

  if (existingBudget) {
    throw new Error("You already have a budget for this category.");
  }

  const budget = await db.budget.create({
    data: {
      amount,
      category: data.category,
      userId: user.id,
    },
  });

  revalidatePath("/budgets");
  revalidatePath("/dashboard");

  return {
    success: true,
    budget: {
      ...budget,
      amount: budget.amount.toNumber(),
    },
  };
}

type UpdateBudgetData = {
  budgetId: string;
  amount: string | number;
  category: CategoryType;
};

export async function updateBudget(data: UpdateBudgetData) {
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

  const amount = Number(data.amount);

  if (Number.isNaN(amount) || amount <= 0) {
    throw new Error("Invalid budget amount");
  }

  const existingBudget = await db.budget.findFirst({
    where: {
      id: data.budgetId,
      userId: user.id,
    },
  });

  if (!existingBudget) {
    throw new Error("Budget not found");
  }

  const categoryConflict = await db.budget.findFirst({
    where: {
      userId: user.id,
      category: data.category,
      NOT: {
        id: data.budgetId,
      },
    },
  });

  if (categoryConflict) {
    throw new Error("A budget already exists for this category");
  }

  const budget = await db.budget.update({
    where: {
      id: existingBudget.id,
    },
    data: {
      amount,
      category: data.category,
    },
  });

  revalidatePath("/budgets");
  revalidatePath("/dashboard");

  return {
    success: true,
    budgetId: budget.id,
  };
}

export async function deleteBudget(budgetId: string) {
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

  const budget = await db.budget.findFirst({
    where: {
      id: budgetId,
      userId: user.id,
    },
  });

  if (!budget) {
    throw new Error("Budget not found");
  }

  await db.budget.delete({
    where: {
      id: budget.id,
    },
  });

  revalidatePath("/budgets");
  revalidatePath("/dashboard");

  return {
    success: true,
  };
}
