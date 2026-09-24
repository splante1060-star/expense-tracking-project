import { db } from "./prisma";
import { getBalanceChange } from "./account-balance";
import { getNextRecurringDate } from "./recurring";

type RecordBillPaymentArgs = {
  billId: string;
  accountId: string;
  userId: string;
  source?: "MANUAL" | "AUTOPAY";
  paymentDate?: Date;
};

export async function recordBillPayment({
  billId,
  accountId,
  userId,
  source = "MANUAL",
  paymentDate,
}: RecordBillPaymentArgs) {
  const bill = await db.bill.findFirst({
    where: {
      id: billId,
      userId,
      isActive: true,
    },
  });

  if (!bill) {
    throw new Error("Bill not found.");
  }

  const account = await db.account.findFirst({
    where: {
      id: accountId,
      userId,
    },
  });

  if (!account) {
    throw new Error("Account not found.");
  }

  const amount = bill.amount.toNumber();
  const balanceChange = getBalanceChange(account.type, "EXPENSE", amount);

  await db.$transaction(async (tx) => {
    const existingPayment = await tx.transaction.findUnique({
      where: {
        billId_scheduledFor: {
          billId: bill.id,
          scheduledFor: bill.dueDate,
        },
      },
    });

    if (existingPayment) {
      throw new Error("This bill occurrence has already been paid.");
    }

    await tx.transaction.create({
      data: {
        type: "EXPENSE",
        amount: bill.amount,
        description: bill.name,
        date: paymentDate ?? new Date(),
        scheduledFor: bill.dueDate,
        category: bill.category,
        status: "COMPLETED",
        userId,
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

    if (source === "AUTOPAY") {
      await tx.notification.create({
        data: {
          title: "AutoPay recorded",
          message: `${bill.name} payment of $${amount.toFixed(2)} was recorded from ${account.name}`,
          type: "SUCCESS",
          actionUrl: "/transactions",
          userId,
        },
      });
    }
  });

  return {
    success: true,
  };
}
