"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
import type { CategoryType } from "@/lib/generated/prisma/client";
import { success } from "zod";

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
