import { db } from "@/lib/prisma";
import { recordBillPayment } from "@/lib/record-bill-payment";

export async function processAutoPayBills() {
  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const dueTodayBills = await db.bill.findMany({
    where: {
      isActive: true,
      isAutoPay: true,
      accountId: {
        not: null,
      },
      dueDate: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
  });

  const overdueBills = await db.bill.findMany({
    where: {
      isActive: true,
      isAutoPay: true,
      dueDate: {
        lt: startOfToday,
      },
    },
  });

  let billsProcessed = 0;
  let billsFailed = 0;
  let confirmationsCreated = 0;

  for (const bill of dueTodayBills) {
    if (!bill.accountId) {
      continue;
    }

    try {
      await recordBillPayment({
        billId: bill.id,
        accountId: bill.accountId,
        userId: bill.userId,
        source: "AUTOPAY",
      });

      billsProcessed++;
    } catch (error) {
      billsFailed++;

      console.error(`Failed to process AutoPay bill ${bill.id}:`, error);
    }
  }

  for (const bill of overdueBills) {
    try {
      const result = await db.notification.createMany({
        data: [
          {
            title: "Payment needs confirmation",
            message: `${bill.name} payment of $${bill.amount.toNumber().toFixed(2)} was due ${bill.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}. Was this payment made?`,
            type: "ACTION_REQUIRED",
            actionUrl: "/bills",
            userId: bill.userId,
            billId: bill.id,
            scheduledFor: bill.dueDate,
          },
        ],
        skipDuplicates: true,
      });

      confirmationsCreated += result.count;
    } catch (error) {
      console.error(
        `Failed to create confirmation for overdue bill ${bill.id}:`,
        error,
      );
    }
  }

  return {
    billsProcessed,
    billsFailed,
    confirmationsCreated,
  };
}
