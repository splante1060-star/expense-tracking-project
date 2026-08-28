"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { Account } from "@/lib/generated/prisma/client";

type CreateAccountData = {
  name: string;
  type: Account["type"];
  balance: string | number;
  isDefault?: boolean;
};

const serializeAccount = (obj: Account) => {
  return {
    ...obj,
    balance: obj.balance.toNumber(),
  };
};

export async function createAccount(data: CreateAccountData) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    // convert balance to float before saving
    const balanceFloat = parseFloat(String(data.balance));

    if (isNaN(balanceFloat)) {
      throw new Error("Invalid balance amount");
    }

    // check if this is the user's first account
    const existingAccounts = await db.account.findMany({
      where: { userId: user.id },
    });

    const shouldBeDefault =
      existingAccounts.length === 0 ? true : Boolean(data.isDefault);

    // if this account should be default, unset other default accounts
    if (shouldBeDefault) {
      await db.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const account = await db.account.create({
      data: {
        name: data.name,
        type: data.type,
        balance: balanceFloat,
        userId: user.id,
        isDefault: shouldBeDefault,
      },
    });

    const serializedAccount = serializeAccount(account);

    revalidatePath("/dashboard");
    return { success: true, data: serializedAccount };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Failed to create account");
  }
}
