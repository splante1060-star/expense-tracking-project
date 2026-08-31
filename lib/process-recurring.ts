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

  let occurrencesCreated = 0;

  for (const recurring of dueRecurringTransactions) {
    let scheduledDate = recurring.nextRecurringDate;
    let processedCount = 0;

    // Safety cap so a bad schedule can never loop forever.
    const MAX_CATCH_UP_OCCURRENCES = 100;

    while (scheduledDate <= now && processedCount < MAX_CATCH_UP_OCCURRENCES) {
      const nextDate = getNextRecurringDate(
        scheduledDate,
        recurring.interval,
        recurring.anchorDay ?? undefined,
      );

      const result = await db.$transaction(async (tx) => {
        const claimed = await tx.recurringTransaction.updateMany({
          where: {
            id: recurring.id,
            isActive: true,
            nextRecurringDate: scheduledDate,
          },
          data: {
            lastProcessed: scheduledDate,
            nextRecurringDate: nextDate,
          },
        });

        if (claimed.count === 0) {
          return false;
        }

        const created = await tx.transaction.createMany({
          data: [
            {
              type: recurring.type,
              amount: recurring.amount,
              description: recurring.description,
              date: scheduledDate,
              scheduledFor: scheduledDate,
              category: recurring.category,
              status: "COMPLETED",
              userId: recurring.userId,
              accountId: recurring.accountId,
              recurringTransactionId: recurring.id,
            },
          ],
          skipDuplicates: true,
        });

        if (created.count === 1) {
          occurrencesCreated++;

          const amount = recurring.amount.toNumber();

          const balanceChange = getBalanceChange(
            recurring.account.type,
            recurring.type,
            amount,
          );

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
        }

        return true;
      });

      if (!result) {
        break;
      }

      scheduledDate = nextDate;
      processedCount++;
    }
  }

  return {
    seriesProcessed: dueRecurringTransactions.length,
    occurrencesCreated,
  };
}
