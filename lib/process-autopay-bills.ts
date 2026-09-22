import { db } from "@/lib/prisma";
import { recordBillPayment } from "@/lib/record-bill-payment";

export async function processAutoPayBills() {
  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const bills = await db.bill.findMany({
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

  let billsProcessed = 0;
  let billsFailed = 0;

  for (const bill of bills) {
    if (!bill.accountId) {
      continue;
    }

    try {
      await recordBillPayment({
        billId: bill.id,
        accountId: bill.accountId,
        userId: bill.userId,
      });

      billsProcessed++;
    } catch (error) {
      billsFailed++;

      console.error(`Failed to process AutoPay bill ${bill.id}:`, error);
    }
  }

  return {
    billsProcessed,
    billsFailed,
  };
}
