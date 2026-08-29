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
    revalidatePath("/accounts");
    return { success: true, data: serializedAccount };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Failed to create account");
  }
}

type UpdateAccountData = {
  accountId: string;
  name: string;
  type: Account["type"];
  balance: string | number;
  isDefault?: boolean;
};

export async function updateAccount(data: UpdateAccountData) {
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

  const account = await db.account.findFirst({
    where: {
      id: data.accountId,
      userId: user.id,
    },
  });

  if (!account) {
    throw new Error("Account not found.");
  }

  const balanceFloat = parseFloat(String(data.balance));

  if (isNaN(balanceFloat)) {
    throw new Error("Invalid balance amount");
  }

  const shouldBeDefault = Boolean(data.isDefault);

  if (!shouldBeDefault && account.isDefault) {
    const otherAccounts = await db.account.count({
      where: {
        userId: user.id,
        id: {
          not: account.id,
        },
      },
    });

    if (otherAccounts === 0) {
      throw new Error("Your only account must remain the default.");
    }
  }

  if (shouldBeDefault) {
    await db.account.updateMany({
      where: {
        userId: user.id,
        isDefault: true,
        id: { not: account.id },
      },
      data: {
        isDefault: false,
      },
    });
  }

  const updatedAccount = await db.account.update({
    where: {
      id: account.id,
    },
    data: {
      name: data.name,
      type: data.type,
      balance: balanceFloat,
      isDefault: shouldBeDefault,
    },
  });

  if (!shouldBeDefault && account.isDefault) {
    const nextAccount = await db.account.findFirst({
      where: {
        userId: user.id,
        id: {
          not: account.id,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (nextAccount) {
      await db.account.update({
        where: {
          id: nextAccount.id,
        },
        data: {
          isDefault: true,
        },
      });
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/accounts");

  return {
    success: true,
    data: serializeAccount(updatedAccount),
  };
}

export async function deleteAccount(accountId: string) {
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

  const account = await db.account.findFirst({
    where: {
      id: accountId,
      userId: user.id,
    },
    include: {
      _count: {
        select: {
          transactions: true,
        },
      },
    },
  });

  if (!account) {
    throw new Error("Account not found.");
  }

  if (account._count.transactions > 0) {
    throw new Error(
      "This account has transactions attached to it. Move or delete those transactions before deleting the account.",
    );
  }

  await db.account.delete({
    where: {
      id: account.id,
    },
  });

  if (account.isDefault) {
    const nextAccount = await db.account.findFirst({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (nextAccount) {
      await db.account.update({
        where: {
          id: nextAccount.id,
        },
        data: {
          isDefault: true,
        },
      });
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/accounts");

  return {
    success: true,
  };
}
