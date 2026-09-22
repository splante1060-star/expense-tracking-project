"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/prisma";
import { getBalanceChange } from "@/lib/account-balance";
import { getNextRecurringDate } from "@/lib/recurring";
import type {
  CategoryType,
  RecurringInterval,
} from "@/lib/generated/prisma/client";
import next from "next";
import { success } from "zod";

type CreateBillData = {
  name: string;
  amount: string | number;
  dueDate: string;
  category: CategoryType;
  isRecurring: boolean;
  recurringInterval?: RecurringInterval | null;
  isAutoPay: boolean;
  accountId?: string | null;
};

type UpdateBillData = CreateBillData & {
  billId: string;
};

function serializeBill<T extends { amount: { toNumber(): number } }>(bill: T) {
  return {
    ...bill,
    amount: bill.amount.toNumber(),
  };
}

export async function createBill(data: CreateBillData) {
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
    throw new Error("User not found.");
  }

  const amount = Number(data.amount);

  if (Number.isNaN(amount) || amount <= 0) {
    throw new Error("Enter a valid bill amount.");
  }

  if (!data.name.trim()) {
    throw new Error("Bill name is required.");
  }

  if (!data.dueDate) {
    throw new Error("Due date is required.");
  }

  if (data.isRecurring && !data.recurringInterval) {
    throw new Error("Choose how often this bill repeats.");
  }

  if (data.accountId) {
    const account = await db.account.findFirst({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });

    if (!account) {
      throw new Error("Account not found.");
    }
  }

  const dueDate = new Date(`${data.dueDate}T12:00:00`);

  const bill = await db.bill.create({
    data: {
      name: data.name.trim(),
      amount,
      dueDate,
      category: data.category,

      isRecurring: data.isRecurring,
      recurringInterval: data.isRecurring ? data.recurringInterval : null,
      anchorDay: data.isRecurring ? dueDate.getDate() : null,

      isAutoPay: data.isAutoPay,

      accountId: data.accountId || null,

      userId: user.id,
    },
  });

  revalidatePath("/bills");
  revalidatePath("/dashboard");

  return {
    success: true,
    data: serializeBill(bill),
  };
}

export async function updateBill(data: UpdateBillData) {
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
    throw new Error("User not found.");
  }

  const existingBill = await db.bill.findFirst({
    where: {
      id: data.billId,
      userId: user.id,
    },
  });

  if (!existingBill) {
    throw new Error("Bill not found.");
  }

  const amount = Number(data.amount);

  if (Number.isNaN(amount) || amount <= 0) {
    throw new Error("Enter a valid bill amount.");
  }

  if (!data.name.trim()) {
    throw new Error("Bill name is required.");
  }

  if (!data.dueDate) {
    throw new Error("Due date is required.");
  }

  if (data.isRecurring && !data.recurringInterval) {
    throw new Error("Choose how often this bill repeats.");
  }

  if (data.accountId) {
    const account = await db.account.findFirst({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });

    if (!account) {
      throw new Error("Account not found.");
    }
  }

  const dueDate = new Date(`${data.dueDate}T12:00:00`);

  const bill = await db.bill.update({
    where: {
      id: existingBill.id,
    },

    data: {
      name: data.name.trim(),
      amount,
      dueDate,
      category: data.category,

      isRecurring: data.isRecurring,
      recurringInterval: data.isRecurring ? data.recurringInterval : null,
      anchorDay: data.isRecurring ? dueDate.getDate() : null,

      isAutoPay: data.isAutoPay,

      accountId: data.accountId || null,
    },
  });

  revalidatePath("/bills");
  revalidatePath("/dashboard");

  return {
    success: true,
    data: serializeBill(bill),
  };
}

export async function deleteBill(billId: string) {
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
    throw new Error("User not found.");
  }

  const bill = await db.bill.findFirst({
    where: {
      id: billId,
      userId: user.id,
    },
  });

  if (!bill) {
    throw new Error("Bill not found.");
  }

  await db.bill.delete({
    where: {
      id: bill.id,
    },
  });

  revalidatePath("/bills");
  revalidatePath("/dashboard");

  return {
    success: true,
  };
}

export async function markBillAsPaid(billId: string, accountId: string) {
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
    throw new Error("User not found.");
  }

  const bill = await db.bill.findFirst({
    where: {
      id: billId,
      userId: user.id,
      isActive: true,
    },
  });

  if (!bill) {
    throw new Error("Bill not found.");
  }

  const account = await db.account.findFirst({
    where: {
      id: accountId,
      userId: user.id,
    },
  });

  if (!account) {
    throw new Error("Account not found.");
  }

  const amount = bill.amount.toNumber();
  const balanceChange = getBalanceChange(account.type, "EXPENSE", amount);

  await db.$transaction(async (tx) => {
    await tx.transaction.create({
      data: {
        type: "EXPENSE",
        amount: bill.amount,
        description: bill.name,
        date: new Date(),
        category: bill.category,
        status: "COMPLETED",
        userId: user.id,
        accountId: account.id,
        billId: bill.id,
      },
    });

    await tx.account.update({
      where: {
        id: account.id,
      },
      data: {
        balance: {
          increment: balanceChange,
        },
      },
    });

    if (bill.isRecurring && bill.recurringInterval) {
      const nextDueDate = getNextRecurringDate(
        bill.dueDate,
        bill.recurringInterval,
        bill.anchorDay ?? bill.dueDate.getDate(),
      );

      await tx.bill.update({
        where: {
          id: bill.id,
        },
        data: {
          dueDate: nextDueDate,
          accountId: account.id,
        },
      });
    } else {
      await tx.bill.update({
        where: {
          id: bill.id,
        },
        data: {
          isActive: false,
          accountId: account.id,
        },
      });
    }
  });

  revalidatePath("/bills");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/accounts");

  return {
    success: true,
  };
}
