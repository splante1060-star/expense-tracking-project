import { db } from "./prisma";
import { getNextRecurringDate } from "./recurring";

function getBalanceChange(
  accountType: "DEBIT" | "CREDIT" | "SAVINGS",
  transactionType: "INCOME" | "EXPENSE",
  amount: number,
) {
  if (accountType === "CREDIT") {
    return transactionType === "EXPENSE" ? amount : -amount;
  }

  return transactionType === "INCOME" ? amount : -amount;
}

export async function processRecurringTransactions() {
  const now = new Date();

  const dueRecurringTransactions = await db.recurringTransaction.findMany({
    where: {
      isActive: true,
      nextRecurringDate: {
        lte: now,
      },
    },
    include: {
      account: {
        select: {
          id: true,
          type: true,
        },
      },
    },
  });

  for (const recurring of dueRecurringTransactions) {
    await db.$transaction(async (tx) => {
      const scheduledDate = recurring.nextRecurringDate;
      const amount = recurring.amount.toNumber();
      const balanceChange = getBalanceChange(
        recurring.account.type,
        recurring.type,
        amount,
      );

      await tx.transaction.create({
        data: {
          type: recurring.type,
          amount: recurring.amount,
          description: recurring.description,
          date: scheduledDate,
          category: recurring.category,
          status: "COMPLETED",
          userId: recurring.userId,
          accountId: recurring.accountId,
          recurringTransactionId: recurring.id,
        },
      });

      await tx.account.update({
        where: {
          id: recurring.accountId,
        },
        data: {
          balance: {
            increment: balanceChange,
          },
        },
      });

      await tx.recurringTransaction.update({
        where: {
          id: recurring.id,
        },
        data: {
          lastProcessed: scheduledDate,
          nextRecurringDate: getNextRecurringDate(
            scheduledDate,
            recurring.interval,
          ),
        },
      });
    });
  }

  return {
    processed: dueRecurringTransactions.length,
  };
}
