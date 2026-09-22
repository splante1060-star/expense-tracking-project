import { inngest } from "./client";
import { processRecurringTransactions } from "@/lib/process-recurring";
import { processAutoPayBills } from "@/lib/process-autopay-bills";

export const processRecurringTransactionsJob = inngest.createFunction(
  {
    id: "process-recurring-transactions",
    triggers: {
      cron: "0 10 * * *",
    },
  },
  async ({ step }) => {
    return await step.run("process-recurring-transactions", async () => {
      return processRecurringTransactions();
    });
  },
);

export const processAutoPayBillsJob = inngest.createFunction(
  {
    id: "process-autopay-bills",
    triggers: { cron: "5 10 * * *" },
  },
  async ({ step }) => {
    return await step.run("process.autopay-bills", async () => {
      return processAutoPayBills();
    });
  },
);
